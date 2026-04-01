"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

export async function getAuditLogs(params: {
  action?: string;
  resource?: string;
  adminUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  await requireAuth();
  const {
    action = "",
    resource = "",
    adminUserId = "",
    dateFrom = "",
    dateTo = "",
    page = 1,
    limit = 50,
  } = params;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (adminUserId) where.adminUserId = adminUserId;
  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    where.createdAt = dateFilter;
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        adminUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    items: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAuditLogFilterOptions() {
  await requireAuth();
  const [actions, resources, adminUsers] = await Promise.all([
    db.auditLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    }),
    db.auditLog.findMany({
      select: { resource: true },
      distinct: ["resource"],
      orderBy: { resource: "asc" },
    }),
    db.adminUser.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    actions: actions.map((a) => a.action),
    resources: resources.map((r) => r.resource),
    adminUsers,
  };
}
