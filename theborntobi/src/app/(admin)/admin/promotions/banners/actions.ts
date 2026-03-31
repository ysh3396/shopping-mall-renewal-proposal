"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BannerPosition } from "@/generated/prisma/client";

export async function getBanners() {
  const banners = await db.banner.findMany({
    orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
  });
  return banners;
}

export async function createBanner(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}) {
  await db.banner.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl ?? null,
      position: data.position as BannerPosition,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/promotions/banners");
}

export async function updateBanner(
  id: string,
  data: {
    title: string;
    imageUrl: string;
    linkUrl?: string | null;
    position: string;
    sortOrder: number;
    isActive: boolean;
    startsAt?: string | null;
    expiresAt?: string | null;
  }
) {
  await db.banner.update({
    where: { id },
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl ?? null,
      position: data.position as BannerPosition,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/promotions/banners");
}

export async function deleteBanner(id: string) {
  await db.banner.delete({ where: { id } });
  revalidatePath("/admin/promotions/banners");
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  await db.banner.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/promotions/banners");
}
