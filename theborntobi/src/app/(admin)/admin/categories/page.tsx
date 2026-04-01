import { PageHeader } from "@/components/admin/PageHeader";
import { getCategories, getAllParentCategories } from "./actions";
import { CategoryClient } from "./category-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [{ items: categories, total }, parentCategories] = await Promise.all([
    getCategories({ limit: 100 }),
    getAllParentCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="카테고리 관리"
        description={`총 ${total}개의 카테고리`}
      />
      <CategoryClient
        categories={categories}
        parentCategories={parentCategories}
      />
    </div>
  );
}
