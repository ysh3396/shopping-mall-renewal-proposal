import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { getProducts, getCategories } from "./actions";
import { ProductListClient } from "./product-list-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const categoryId = params.category || "";
  const status = params.status || "";
  const page = Number(params.page) || 1;

  const [productsData, categories] = await Promise.all([
    getProducts({ search, categoryId, status, page, limit: 20 }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="상품 관리"
        description={`총 ${productsData.total}개의 상품`}
        actions={
          <Link href="/admin/products/new">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4" />
              상품 등록
            </Button>
          </Link>
        }
      />

      <ProductListClient
        products={productsData.items}
        categories={categories}
        total={productsData.total}
        page={productsData.page}
        totalPages={productsData.totalPages}
        limit={productsData.limit}
        initialSearch={search}
        initialCategory={categoryId}
        initialStatus={status}
      />
    </div>
  );
}
