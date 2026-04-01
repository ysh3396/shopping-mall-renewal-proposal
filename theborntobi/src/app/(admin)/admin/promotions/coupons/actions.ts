"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DiscountType } from "@/generated/prisma/client";
import { requireAuth, requirePermission } from "@/lib/rbac";

export async function getCoupons(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAuth();
  const { search = "", page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } },
    ];
  }

  const [coupons, total] = await Promise.all([
    db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.coupon.count({ where }),
  ]);

  return {
    items: coupons,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createCoupon(data: {
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
}) {
  await requirePermission("promotions", "create");
  await db.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      name: data.name,
      discountType: data.discountType as DiscountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount ?? null,
      maxDiscount: data.maxDiscount ?? null,
      usageLimit: data.usageLimit ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/promotions/coupons");
}

export async function updateCoupon(
  id: string,
  data: {
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number | null;
    maxDiscount?: number | null;
    usageLimit?: number | null;
    startsAt?: string | null;
    expiresAt?: string | null;
    isActive: boolean;
  }
) {
  await requirePermission("promotions", "update");
  await db.coupon.update({
    where: { id },
    data: {
      code: data.code.toUpperCase(),
      name: data.name,
      discountType: data.discountType as DiscountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount ?? null,
      maxDiscount: data.maxDiscount ?? null,
      usageLimit: data.usageLimit ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/promotions/coupons");
}

export async function deleteCoupon(id: string) {
  await requirePermission("promotions", "delete");
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/promotions/coupons");
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  await requirePermission("promotions", "update");
  await db.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/promotions/coupons");
}
