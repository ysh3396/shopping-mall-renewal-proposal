"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RestrictionMode } from "@/generated/prisma/client";
import { requireAuth, requirePermission } from "@/lib/rbac";

export async function getDashboardStats() {
  await requireAuth();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenue, monthlyOrderCount, newCustomerCount, activeProductCount] =
    await Promise.all([
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] },
        },
      }),
      db.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      db.customer.count({
        where: { createdAt: { gte: startOfMonth }, deletedAt: null },
      }),
      db.product.count({
        where: { isActive: true, deletedAt: null },
      }),
    ]);

  return {
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    monthlyOrderCount,
    newCustomerCount,
    activeProductCount,
  };
}

export async function getRecentOrders(limit: number = 10) {
  await requireAuth();
  const orders = await db.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      items: { take: 1, select: { productName: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    productSummary: order.items[0]?.productName ?? "-",
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));
}

export async function getTopProducts(limit: number = 5) {
  await requireAuth();
  const items = await db.orderItem.groupBy({
    by: ["productId", "productName"],
    _count: { id: true },
    _sum: { subtotal: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { category: { select: { name: true } } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => {
    const product = productMap.get(item.productId);
    return {
      productId: item.productId,
      productName: item.productName,
      categoryName: product?.category?.name ?? "-",
      orderCount: item._count.id,
      revenue: item._sum.subtotal ?? 0,
    };
  });
}

export async function getCategories() {
  await requireAuth();
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      isRestricted: true,
    },
  });
}

export async function getSiteConfig() {
  await requireAuth();
  return db.siteConfig.findFirst({
    select: { id: true, restrictionMode: true },
  });
}

export async function getLast7DaysSalesData() {
  await requireAuth();
  const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
  const now = new Date();

  // Build date buckets for the last 7 days (oldest first)
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const since = buckets[0];
  const until = new Date(now);
  until.setHours(23, 59, 59, 999);

  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: since, lte: until },
      status: { not: "CANCELLED" },
    },
    select: { createdAt: true, totalAmount: true },
  });

  return buckets.map((bucketStart) => {
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setHours(23, 59, 59, 999);

    const amount = orders
      .filter((o) => o.createdAt >= bucketStart && o.createdAt <= bucketEnd)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      label: DAY_LABELS[bucketStart.getDay()],
      amount,
    };
  });
}

export async function toggleCategoryRestriction(
  categoryId: string,
  restricted: boolean
) {
  await requirePermission("settings", "update");
  await db.category.update({
    where: { id: categoryId },
    data: { isRestricted: restricted },
  });
  revalidatePath("/admin");
}

export async function updateRestrictionMode(mode: string) {
  await requirePermission("settings", "update");
  const config = await db.siteConfig.findFirst({ select: { id: true } });
  if (!config) return;
  await db.siteConfig.update({
    where: { id: config.id },
    data: { restrictionMode: mode as RestrictionMode },
  });
  revalidatePath("/admin");
}
