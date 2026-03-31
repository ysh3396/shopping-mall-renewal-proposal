"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers(params: {
  search?: string;
  gradeId?: string;
  page?: number;
  limit?: number;
}) {
  const { search, gradeId, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (gradeId) {
    where.gradeId = gradeId;
  }

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: {
        grade: true,
        orders: {
          where: { status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] } },
          select: { totalAmount: true },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.customer.count({ where }),
  ]);

  const items = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    provider: c.provider,
    ageVerified: c.ageVerified,
    createdAt: c.createdAt,
    grade: c.grade,
    orderCount: c._count.orders,
    totalSpent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCustomer(id: string) {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      grade: true,
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: { take: 1, select: { productName: true, quantity: true } },
          payment: { select: { method: true, status: true } },
        },
      },
    },
  });

  if (!customer) return null;

  const totalSpent = customer.orders
    .filter((o) =>
      ["PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status)
    )
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const paidOrders = customer.orders.filter((o) =>
    ["PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status)
  );

  return {
    ...customer,
    totalSpent,
    averageOrderValue: paidOrders.length > 0 ? Math.round(totalSpent / paidOrders.length) : 0,
    lastOrderAt: customer.orders[0]?.createdAt ?? null,
  };
}

export async function getCustomerGrades() {
  return db.customerGrade.findMany({ orderBy: { minOrderAmount: "asc" } });
}

export async function updateCustomerGrade(customerId: string, gradeId: string) {
  await db.customer.update({
    where: { id: customerId },
    data: { gradeId },
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function getCustomerStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, newThisMonth, byGrade] = await Promise.all([
    db.customer.count({ where: { deletedAt: null } }),
    db.customer.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
    db.customer.groupBy({
      by: ["gradeId"],
      where: { deletedAt: null },
      _count: { id: true },
    }),
  ]);

  return { total, newThisMonth, byGrade };
}
