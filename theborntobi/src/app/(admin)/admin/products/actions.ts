"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProducts(params: {
  search?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search, categoryId, status, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.name = { contains: search };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  const items = products.map((p) => ({
    ...p,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    thumbnailUrl: p.images[0]?.url ?? null,
    variantCount: p._count.variants,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      options: {
        orderBy: { sortOrder: "asc" },
        include: {
          values: { orderBy: { sortOrder: "asc" } },
        },
      },
      variants: {
        include: {
          optionValues: {
            include: {
              optionValue: {
                include: { option: true },
              },
            },
          },
        },
      },
    },
  });

  return product;
}

export async function getCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createProduct(payload: string) {
  const data = JSON.parse(payload) as {
    name: string;
    slug: string;
    description?: string;
    detailHtml?: string;
    categoryId?: string;
    basePrice: number;
    comparePrice?: number;
    costPrice?: number;
    badges?: string;
    isActive: boolean;
    isAdult: boolean;
    images: { url: string; alt?: string; sortOrder: number }[];
    options: {
      name: string;
      sortOrder: number;
      values: { value: string; sortOrder: number }[];
    }[];
    variants: {
      sku?: string;
      price: number;
      stock: number;
      isActive: boolean;
      optionValueIndices: number[];
    }[];
  };

  const product = await db.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      detailHtml: data.detailHtml || null,
      categoryId: data.categoryId || null,
      basePrice: data.basePrice,
      comparePrice: data.comparePrice ?? null,
      costPrice: data.costPrice ?? null,
      badges: data.badges || null,
      isActive: data.isActive,
      isAdult: data.isAdult,
    },
  });

  // Create images
  if (data.images.length > 0) {
    await db.productImage.createMany({
      data: data.images.map((img) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt || null,
        sortOrder: img.sortOrder,
      })),
    });
  }

  // Create options and collect value IDs for variant linking
  const valueIdMap: string[] = [];

  for (const opt of data.options) {
    const option = await db.productOption.create({
      data: {
        productId: product.id,
        name: opt.name,
        sortOrder: opt.sortOrder,
      },
    });

    for (const val of opt.values) {
      const optionValue = await db.productOptionValue.create({
        data: {
          optionId: option.id,
          value: val.value,
          sortOrder: val.sortOrder,
        },
      });
      valueIdMap.push(optionValue.id);
    }
  }

  // Create variants with option value links
  for (const v of data.variants) {
    const variant = await db.productVariant.create({
      data: {
        productId: product.id,
        sku: v.sku || null,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
      },
    });

    // Link variant to option values using indices into the flat valueIdMap
    for (const idx of v.optionValueIndices) {
      if (valueIdMap[idx]) {
        await db.variantOptionValue.create({
          data: {
            variantId: variant.id,
            optionValueId: valueIdMap[idx],
          },
        });
      }
    }
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, payload: string) {
  const data = JSON.parse(payload) as {
    name: string;
    slug: string;
    description?: string;
    detailHtml?: string;
    categoryId?: string;
    basePrice: number;
    comparePrice?: number;
    costPrice?: number;
    badges?: string;
    isActive: boolean;
    isAdult: boolean;
    images: { url: string; alt?: string; sortOrder: number }[];
    options: {
      name: string;
      sortOrder: number;
      values: { value: string; sortOrder: number }[];
    }[];
    variants: {
      sku?: string;
      price: number;
      stock: number;
      isActive: boolean;
      optionValueIndices: number[];
    }[];
  };

  // Update product basic info
  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      detailHtml: data.detailHtml || null,
      categoryId: data.categoryId || null,
      basePrice: data.basePrice,
      comparePrice: data.comparePrice ?? null,
      costPrice: data.costPrice ?? null,
      badges: data.badges || null,
      isActive: data.isActive,
      isAdult: data.isAdult,
    },
  });

  // Delete old related records (cascade handles nested)
  await db.productImage.deleteMany({ where: { productId: id } });
  await db.productVariant.deleteMany({ where: { productId: id } });
  await db.productOption.deleteMany({ where: { productId: id } });

  // Re-create images
  if (data.images.length > 0) {
    await db.productImage.createMany({
      data: data.images.map((img) => ({
        productId: id,
        url: img.url,
        alt: img.alt || null,
        sortOrder: img.sortOrder,
      })),
    });
  }

  // Re-create options and collect value IDs
  const valueIdMap: string[] = [];

  for (const opt of data.options) {
    const option = await db.productOption.create({
      data: {
        productId: id,
        name: opt.name,
        sortOrder: opt.sortOrder,
      },
    });

    for (const val of opt.values) {
      const optionValue = await db.productOptionValue.create({
        data: {
          optionId: option.id,
          value: val.value,
          sortOrder: val.sortOrder,
        },
      });
      valueIdMap.push(optionValue.id);
    }
  }

  // Re-create variants
  for (const v of data.variants) {
    const variant = await db.productVariant.create({
      data: {
        productId: id,
        sku: v.sku || null,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
      },
    });

    for (const idx of v.optionValueIndices) {
      if (valueIdMap[idx]) {
        await db.variantOptionValue.create({
          data: {
            variantId: variant.id,
            optionValueId: valueIdMap[idx],
          },
        });
      }
    }
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await db.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/admin/products");
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  await db.product.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/products");
}
