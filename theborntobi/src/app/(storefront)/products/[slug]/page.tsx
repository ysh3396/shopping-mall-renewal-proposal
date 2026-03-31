import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductDetailClient from "./product-detail-client";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { name: true, isRestricted: true } },
      options: {
        orderBy: { sortOrder: "asc" },
        include: {
          values: { orderBy: { sortOrder: "asc" } },
        },
      },
      variants: {
        where: { isActive: true },
        include: {
          optionValues: {
            include: {
              optionValue: {
                select: { id: true, value: true, optionId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!product) notFound();
  if (!product.isActive) notFound();
  if (product.isRestricted) notFound();
  if (product.deletedAt) notFound();

  return <ProductDetailClient product={product} />;
}
