import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { getProductsPageData } from "@/lib/storefront-db";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, category } = await searchParams;

  const { products, categories } = await getProductsPageData({ q, category });

  return (
    <section className="py-10 bg-white min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            {q ? `"${q}" 검색결과` : "전체 상품"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">총 {products.length}개 상품</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            <Link
              href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                !category
                  ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                  : "bg-white text-slate-500 border-gray-200 hover:border-slate-400 hover:text-slate-800"
              }`}
            >
              전체
            </Link>
            {categories.map((cat) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              params.set("category", cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/products?${params.toString()}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                    category === cat.slug
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "bg-white text-slate-500 border-gray-200 hover:border-slate-400 hover:text-slate-800"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            {q ? `"${q}"에 해당하는 상품이 없습니다.` : "상품이 없습니다."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => {
              const firstImage = product.images[0];
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  basePrice={product.basePrice}
                  comparePrice={product.comparePrice}
                  badges={product.badges}
                  imageUrl={firstImage?.url ?? null}
                  imageAlt={firstImage?.alt ?? null}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
