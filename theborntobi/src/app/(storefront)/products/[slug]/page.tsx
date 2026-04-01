import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
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
  // isRestricted는 성인인증 UI용 플래그 — 스토어프론트 접근 차단에 사용하지 않음
  if (product.deletedAt) notFound();

  // Sanitize detailHtml server-side to prevent XSS
  const sanitizedProduct = {
    ...product,
    detailHtml: product.detailHtml ? sanitizeHtml(product.detailHtml) : null,
  };

  return <ProductDetailClient product={sanitizedProduct} />;
}
