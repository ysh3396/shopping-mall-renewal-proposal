"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  ReturnStatus,
  ExchangeStatus,
  RefundStatus,
} from "@/generated/prisma/client";

async function getAdminUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  // Fallback to system admin
  let admin = await db.adminUser.findFirst({
    where: { email: "system@theborntobi.com" },
  });
  if (!admin) {
    let role = await db.role.findFirst({ where: { name: "super_admin" } });
    if (!role) {
      role = await db.role.create({ data: { name: "super_admin" } });
    }
    admin = await db.adminUser.create({
      data: {
        email: "system@theborntobi.com",
        name: "시스템",
        passwordHash: "!SYSTEM_ACCOUNT_NO_LOGIN!",
        roleId: role.id,
        isActive: false,
      },
    });
  }
  return admin.id;
}

// ─── Return Requests ────────────────────────────────────────────────────────

export async function getReturnRequests(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, search, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status as ReturnStatus;
  }

  if (search) {
    where.OR = [
      { order: { orderNumber: { contains: search } } },
      { order: { customer: { name: { contains: search } } } },
    ];
  }

  const [items, total] = await Promise.all([
    db.returnRequest.findMany({
      where,
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.returnRequest.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Exchange Requests ───────────────────────────────────────────────────────

export async function getExchangeRequests(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, search, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status as ExchangeStatus;
  }

  if (search) {
    where.OR = [
      { order: { orderNumber: { contains: search } } },
      { order: { customer: { name: { contains: search } } } },
    ];
  }

  const [items, total] = await Promise.all([
    db.exchangeRequest.findMany({
      where,
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.exchangeRequest.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Return Actions ──────────────────────────────────────────────────────────

export async function approveReturn(requestId: string) {
  const adminUserId = await getAdminUserId();

  const returnRequest = await db.returnRequest.findUnique({
    where: { id: requestId },
    include: { order: true },
  });
  if (!returnRequest) throw new Error("반품 요청을 찾을 수 없습니다.");

  await db.$transaction(async (tx) => {
    // Approve the return request
    await tx.returnRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" as ReturnStatus },
    });

    // Update order status to RETURNED
    await tx.order.update({
      where: { id: returnRequest.orderId },
      data: { status: "RETURNED" },
    });

    // Auto-create Refund if one doesn't exist
    const existing = await tx.refund.findUnique({
      where: { orderId: returnRequest.orderId },
    });
    if (!existing) {
      await tx.refund.create({
        data: {
          orderId: returnRequest.orderId,
          amount: returnRequest.order.totalAmount,
          reason: returnRequest.reason,
          refundMethod: "계좌이체",
          status: "PENDING" as RefundStatus,
        },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        adminUserId,
        action: "APPROVE_RETURN",
        resource: "returnRequest",
        resourceId: requestId,
        details: JSON.stringify({ orderId: returnRequest.orderId }),
      },
    });
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/orders/${returnRequest.orderId}`);
}

export async function rejectReturn(requestId: string, reason?: string) {
  const adminUserId = await getAdminUserId();

  const returnRequest = await db.returnRequest.findUnique({
    where: { id: requestId },
  });
  if (!returnRequest) throw new Error("반품 요청을 찾을 수 없습니다.");

  await db.returnRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" as ReturnStatus },
  });

  await db.auditLog.create({
    data: {
      adminUserId,
      action: "REJECT_RETURN",
      resource: "returnRequest",
      resourceId: requestId,
      details: JSON.stringify({ reason: reason ?? "" }),
    },
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/orders/${returnRequest.orderId}`);
}

// ─── Exchange Actions ────────────────────────────────────────────────────────

export async function approveExchange(requestId: string) {
  const adminUserId = await getAdminUserId();

  const exchangeRequest = await db.exchangeRequest.findUnique({
    where: { id: requestId },
  });
  if (!exchangeRequest) throw new Error("교환 요청을 찾을 수 없습니다.");

  await db.$transaction(async (tx) => {
    await tx.exchangeRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" as ExchangeStatus },
    });

    await tx.order.update({
      where: { id: exchangeRequest.orderId },
      data: { status: "EXCHANGED" },
    });

    await tx.auditLog.create({
      data: {
        adminUserId,
        action: "APPROVE_EXCHANGE",
        resource: "exchangeRequest",
        resourceId: requestId,
        details: JSON.stringify({ orderId: exchangeRequest.orderId }),
      },
    });
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/orders/${exchangeRequest.orderId}`);
}

export async function rejectExchange(requestId: string, reason?: string) {
  const adminUserId = await getAdminUserId();

  const exchangeRequest = await db.exchangeRequest.findUnique({
    where: { id: requestId },
  });
  if (!exchangeRequest) throw new Error("교환 요청을 찾을 수 없습니다.");

  await db.exchangeRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" as ExchangeStatus },
  });

  await db.auditLog.create({
    data: {
      adminUserId,
      action: "REJECT_EXCHANGE",
      resource: "exchangeRequest",
      resourceId: requestId,
      details: JSON.stringify({ reason: reason ?? "" }),
    },
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/orders/${exchangeRequest.orderId}`);
}

// ─── Refund Actions ──────────────────────────────────────────────────────────

export async function getRefunds(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, search, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status as RefundStatus;
  }

  if (search) {
    where.OR = [
      { order: { orderNumber: { contains: search } } },
      { order: { customer: { name: { contains: search } } } },
    ];
  }

  const [items, total] = await Promise.all([
    db.refund.findMany({
      where,
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.refund.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function completeRefund(refundId: string) {
  const adminUserId = await getAdminUserId();

  const refund = await db.refund.findUnique({ where: { id: refundId } });
  if (!refund) throw new Error("환불 정보를 찾을 수 없습니다.");

  const now = new Date();

  await db.refund.update({
    where: { id: refundId },
    data: {
      status: "COMPLETED" as RefundStatus,
      processedAt: now,
    },
  });

  await db.auditLog.create({
    data: {
      adminUserId,
      action: "COMPLETE_REFUND",
      resource: "refund",
      resourceId: refundId,
      details: JSON.stringify({ processedAt: now.toISOString() }),
    },
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/orders/${refund.orderId}`);
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getReturnStats() {
  const [pendingReturns, pendingExchanges, pendingRefunds] = await Promise.all([
    db.returnRequest.count({ where: { status: "REQUESTED" } }),
    db.exchangeRequest.count({ where: { status: "REQUESTED" } }),
    db.refund.count({ where: { status: "PENDING" } }),
  ]);

  return { pendingReturns, pendingExchanges, pendingRefunds };
}
