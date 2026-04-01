"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategories(params: {
  search?: string;
  parentId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { search, parentId, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (parentId === "root") {
    where.parentId = null;
  } else if (parentId) {
    where.parentId = parentId;
  }

  const [categories, total] = await Promise.all([
    db.category.findMany({
      where,
      include: { parent: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.category.count({ where }),
  ]);

  return {
    items: categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCategory(id: string) {
  return db.category.findUnique({
    where: { id },
    include: { parent: true, children: true },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  isRestricted: boolean;
}) {
  await db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      isRestricted: data.isRestricted,
    },
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    parentId?: string | null;
    sortOrder: number;
    isActive: boolean;
    isRestricted: boolean;
  }
) {
  await db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      isRestricted: data.isRestricted,
    },
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const category = await db.category.findUnique({
    where: { id },
    include: {
      _count: { select: { children: true, products: true } },
    },
  });

  if (!category) {
    throw new Error("카테고리를 찾을 수 없습니다.");
  }
  if (category._count.children > 0) {
    throw new Error(
      `하위 카테고리가 ${category._count.children}개 있어 삭제할 수 없습니다.`
    );
  }
  if (category._count.products > 0) {
    throw new Error(
      `연결된 상품이 ${category._count.products}개 있어 삭제할 수 없습니다.`
    );
  }

  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
  await db.category.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/categories");
}

export async function getAllParentCategories() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
