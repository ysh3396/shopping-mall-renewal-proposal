import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <PageHeader
        title="상품 등록"
        description="새 상품 정보를 입력하세요"
        actions={
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
          </Link>
        }
      />
      <ProductForm categories={categories} />
    </div>
  );
}
