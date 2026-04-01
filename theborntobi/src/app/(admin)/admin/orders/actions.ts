"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/generated/prisma/client";
import { requireAuth, requirePermission } from "@/lib/rbac";

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["AWAITING_DEPOSIT", "CANCELLED"],
  AWAITING_DEPOSIT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
  RETURN_REQUESTED: ["RETURNED", "CANCELLED"],
  EXCHANGE_REQUESTED: ["EXCHANGED", "CANCELLED"],
};


export async function getOrders(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAuth();
  const { search, status, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status as OrderStatus;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customer: { name: { contains: search } } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: {
          take: 1,
          include: { product: { select: { name: true } } },
        },
        payment: { select: { method: true, status: true, amount: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  const items = orders.map((o) => ({
    ...o,
    firstItemName: o.items[0]?.product?.name ?? o.items[0]?.productName ?? "",
    itemCount: o._count.items,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOrder(id: string) {
  await requireAuth();
  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
          variant: {
            include: {
              optionValues: {
                include: { optionValue: { include: { option: true } } },
              },
            },
          },
        },
      },
      payment: true,
      shipment: true,
      refund: true,
      returnRequest: true,
      exchangeRequest: true,
    },
  });

  if (!order) return null;

  // Fetch audit log timeline for this order
  const auditLogs = await db.auditLog.findMany({
    where: { resource: "order", resourceId: id },
    include: { adminUser: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return { ...order, auditLogs };
}

export async function updateOrderStatus(id: string, status: string) {
  const adminUser = await requirePermission("orders", "update");
  const order = await db.order.findUnique({ where: { id } });
  if (!order) throw new Error("주문을 찾을 수 없습니다.");

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new Error(
      `${order.status} 상태에서 ${status}로 변경할 수 없습니다.`
    );
  }

  await db.order.update({ where: { id }, data: { status: status as OrderStatus } });

  await db.auditLog.create({
    data: {
      adminUserId: adminUser.id,
      action: "UPDATE_STATUS",
      resource: "order",
      resourceId: id,
      details: JSON.stringify({ from: order.status, to: status }),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function confirmDeposit(orderId: string) {
  const adminUser = await requirePermission("orders", "update");
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) throw new Error("주문을 찾을 수 없습니다.");
  if (!order.payment) throw new Error("결제 정보가 없습니다.");

  const now = new Date();

  await db.payment.update({
    where: { orderId },
    data: {
      depositConfirmedAt: now,
      depositConfirmedBy: adminUser.id,
      status: "COMPLETED",
      paidAt: now,
    },
  });

  await db.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });

  await db.auditLog.create({
    data: {
      adminUserId: adminUser.id,
      action: "CONFIRM_DEPOSIT",
      resource: "order",
      resourceId: orderId,
      details: JSON.stringify({ confirmedAt: now.toISOString() }),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function addOrderNote(orderId: string, note: string) {
  const adminUser = await requirePermission("orders", "update");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("주문을 찾을 수 없습니다.");

  await db.order.update({
    where: { id: orderId },
    data: { note },
  });

  await db.auditLog.create({
    data: {
      adminUserId: adminUser.id,
      action: "ADD_NOTE",
      resource: "order",
      resourceId: orderId,
      details: JSON.stringify({ note }),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function getOrderStats() {
  await requireAuth();
  const statuses = [
    "PENDING",
    "AWAITING_DEPOSIT",
    "PAID",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const counts = await Promise.all(
    statuses.map((status) => db.order.count({ where: { status: status as OrderStatus } }))
  );

  const total = await db.order.count();

  const result: Record<string, number> = { total };
  statuses.forEach((s, i) => {
    result[s] = counts[i];
  });

  return result;
}
