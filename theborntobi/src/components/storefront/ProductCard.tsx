import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice: number | null;
  badges: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

const BADGE_STYLES: Record<string, string> = {
  SALE: "bg-red-600",
  BEST: "bg-yellow-600",
  HOT: "bg-orange-500",
  NEW: "bg-green-600",
};

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function calcDiscount(base: number, compare: number) {
  return Math.round(((compare - base) / compare) * 100);
}

export default function ProductCard({
  name,
  slug,
  basePrice,
  comparePrice,
  badges,
  imageUrl,
  imageAlt,
}: ProductCardProps) {
  const badgeList = badges
    ? badges.split(",").map((b) => b.trim()).filter(Boolean)
    : [];
  const discountPct =
    comparePrice && comparePrice > basePrice
      ? calcDiscount(basePrice, comparePrice)
      : null;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.13)]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-300 text-xs">이미지 없음</span>
          </div>
        )}

        {/* Add to cart overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          <span className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full">
            장바구니 담기
          </span>
        </div>

        {/* Discount badge */}
        {discountPct && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Badge pills */}
        {badgeList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {badgeList.map((badge) => (
              <span
                key={badge}
                className={`${BADGE_STYLES[badge] ?? "bg-gray-500"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2">
          {name}
        </p>

        {/* Prices */}
        <div className="flex flex-col gap-0.5">
          {comparePrice && comparePrice > basePrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
          <span className="text-base font-black text-gray-900">
            {formatPrice(basePrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
