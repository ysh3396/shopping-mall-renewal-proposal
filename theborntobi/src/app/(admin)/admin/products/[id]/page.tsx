import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProduct, getCategories } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="상품 수정"
        description={product.name}
        actions={
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
          </Link>
        }
      />
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
