"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPopups({
  search,
  page = 1,
  limit = 20,
}: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const where = search
    ? { title: { contains: search, mode: "insensitive" as const } }
    : undefined;

  const [popups, total] = await Promise.all([
    db.popup.findMany({
      where,
      orderBy: { startsAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.popup.count({ where }),
  ]);

  return { popups, total, page, limit };
}

export async function getPopup(id: string) {
  return db.popup.findUnique({ where: { id } });
}

export async function createPopup(data: {
  title: string;
  imageUrl?: string | null;
  contentHtml?: string | null;
  linkUrl?: string | null;
  showOnce: boolean;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}) {
  await db.popup.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl ?? null,
      contentHtml: data.contentHtml ?? null,
      linkUrl: data.linkUrl ?? null,
      showOnce: data.showOnce,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/promotions/popups");
}

export async function updatePopup(
  id: string,
  data: {
    title: string;
    imageUrl?: string | null;
    contentHtml?: string | null;
    linkUrl?: string | null;
    showOnce: boolean;
    isActive: boolean;
    startsAt?: string | null;
    expiresAt?: string | null;
  }
) {
  await db.popup.update({
    where: { id },
    data: {
      title: data.title,
      imageUrl: data.imageUrl ?? null,
      contentHtml: data.contentHtml ?? null,
      linkUrl: data.linkUrl ?? null,
      showOnce: data.showOnce,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/promotions/popups");
}

export async function deletePopup(id: string) {
  await db.popup.delete({ where: { id } });
  revalidatePath("/admin/promotions/popups");
}

export async function togglePopupStatus(id: string, isActive: boolean) {
  await db.popup.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/promotions/popups");
}
