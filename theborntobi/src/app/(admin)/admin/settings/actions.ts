"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RestrictionMode } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/rbac";

export async function getSiteConfig() {
  await requirePermission("settings", "read");
  const config = await db.siteConfig.findFirst({
    orderBy: { createdAt: "asc" },
  });
  return config;
}

export async function updateSiteConfig(data: {
  siteName?: string;
  domain?: string | null;
  businessName?: string | null;
  businessNumber?: string | null;
  ceoName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
  defaultShippingFee?: number;
  freeShippingThreshold?: number;
  returnShippingFee?: number;
  restrictionMode?: string;
}) {
  await requirePermission("settings", "update");
  const existing = await db.siteConfig.findFirst({
    orderBy: { createdAt: "asc" },
  });

  const { restrictionMode, ...rest } = data;
  const prismaData = restrictionMode !== undefined
    ? { ...rest, restrictionMode: restrictionMode as RestrictionMode }
    : rest;

  if (existing) {
    await db.siteConfig.update({
      where: { id: existing.id },
      data: prismaData,
    });
  } else {
    await db.siteConfig.create({
      data: {
        siteName: data.siteName ?? "더본투비",
        ...prismaData,
      },
    });
  }

  revalidatePath("/admin/settings");
}
