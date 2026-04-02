import HeroSlider from "@/components/storefront/HeroSlider";
import ProductGrid from "@/components/storefront/ProductGrid";
import ProductRequestForm from "./ProductRequestForm";
import { getHomePageData } from "@/lib/storefront-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let banners: { id: string; title: string; imageUrl: string; linkUrl: string | null; sortOrder: number }[] = [];
  let categories: { id: string; name: string; slug: string; sortOrder: number }[] = [];
  let products: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    comparePrice: number | null;
    badges: string | null;
    sortOrder: number;
    createdAt: Date;
    images: { url: string; alt: string | null; sortOrder: number }[];
    category: { id: string; name: string; slug: string } | null;
  }[] = [];

  try {
    ({ banners, categories, products } = await getHomePageData());
  } catch (error) {
    console.error("[storefront/home] failed to load data", error);
  }

  return (
    <>
      <HeroSlider banners={banners} />

      {/* Guide image map — matches original site's 더본투비 액상 가이드라인 section */}
      <section className="max-w-screen-lg mx-auto px-4 py-8">
        <a href="/products" className="block">
          <img
            src="https://chetppkxjsekjecnzbpp.supabase.co/storage/v1/object/public/images/products/e31a6d88c6862.png"
            alt="더본투비 액상 가이드라인"
            className="w-full rounded-lg"
          />
        </a>
      </section>

      {/* Product request CTA */}
      <section className="bg-gray-900 text-white py-8">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left flex-shrink-0">
              <p className="text-base font-semibold leading-snug text-gray-100">
                찾으시는 상품을 요청해주세요.
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                연락처로 가능 여부 알려드리겠습니다!
              </p>
            </div>
            <ProductRequestForm />
          </div>
        </div>
      </section>

      {/* Notice banner */}
      <section className="bg-amber-50 border-y border-amber-200 py-5">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex-shrink-0 bg-amber-400 text-amber-900 font-bold text-xs px-3 py-1.5 rounded">
            NOTICE
          </div>
          <p className="text-sm text-amber-800">
            전자담배는{" "}
            <strong>성인(만 19세 이상)</strong>만 구매 가능합니다. 미성년자 판매 금지 &nbsp;|&nbsp;
            본 사이트는 성인 인증 후 이용 가능합니다.
          </p>
        </div>
      </section>

      <ProductGrid products={products} categories={categories} />
    </>
  );
}
