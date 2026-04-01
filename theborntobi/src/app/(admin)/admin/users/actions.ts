"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth, requirePermission } from "@/lib/rbac";

export async function getAdminUsers(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requirePermission("users", "read");
  const { search = "", page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    db.adminUser.findMany({
      where,
      include: { role: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.adminUser.count({ where }),
  ]);

  return {
    items: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRoles() {
  await requirePermission("users", "read");
  return db.role.findMany({ orderBy: { name: "asc" } });
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive: boolean;
}) {
  await requirePermission("users", "create");
  // Simple hash placeholder — in production use bcrypt
  const passwordHash = Buffer.from(data.password).toString("base64");

  await db.adminUser.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      roleId: data.roleId,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/users");
}

export async function updateAdminUser(
  id: string,
  data: {
    name: string;
    email: string;
    roleId: string;
    isActive: boolean;
  }
) {
  await requirePermission("users", "update");
  await db.adminUser.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      roleId: data.roleId,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/users");
}

export async function toggleAdminUserStatus(id: string, isActive: boolean) {
  await requirePermission("users", "update");
  await db.adminUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}
