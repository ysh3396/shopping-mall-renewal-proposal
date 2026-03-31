"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addToCart } from "@/lib/cart";

type OptionValue = {
  id: string;
  value: string;
  sortOrder: number;
};

type Option = {
  id: string;
  name: string;
  sortOrder: number;
  values: OptionValue[];
};

type Variant = {
  id: string;
  price: number;
  stock: number;
  isActive: boolean;
  optionValues: {
    optionValue: {
      id: string;
      value: string;
      optionId: string;
    };
  }[];
};

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  detailHtml: string | null;
  basePrice: number;
  comparePrice: number | null;
  badges: string | null;
  category: { name: string } | null;
  images: ProductImage[];
  options: Option[];
  variants: Variant[];
};

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function calcDiscount(base: number, compare: number) {
  return Math.round(((compare - base) / compare) * 100);
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();

  const sortedImages = [...product.images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const [mainImage, setMainImage] = useState(
    sortedImages[0]?.url ?? "/placeholder-product.png"
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"detail" | "review" | "qna">(
    "detail"
  );

  const badgeList = product.badges
    ? product.badges.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  const allOptionsSelected =
    product.options.length > 0 &&
    product.options.every((opt) => !!selectedOptions[opt.id]);

  const matchedVariant = allOptionsSelected
    ? product.variants.find((v) =>
        product.options.every((opt) => {
          const selectedValueId = selectedOptions[opt.id];
          return v.optionValues.some(
            (ov) => ov.optionValue.id === selectedValueId
          );
        })
      ) ?? null
    : null;

  const displayPrice = matchedVariant
    ? matchedVariant.price
    : product.basePrice;
  const displayStock = matchedVariant ? matchedVariant.stock : null;
  const isOutOfStock = matchedVariant
    ? matchedVariant.stock <= 0 || !matchedVariant.isActive
    : false;

  // Check if a specific option value combo leads to any in-stock variant
  const isValueUnavailable = useCallback(
    (optionId: string, valueId: string) => {
      const hypothetical = { ...selectedOptions, [optionId]: valueId };
      const filledOptions = product.options.filter(
        (opt) => hypothetical[opt.id]
      );
      if (filledOptions.length < product.options.length) return false;
      const variant = product.variants.find((v) =>
        product.options.every((opt) => {
          const vid = hypothetical[opt.id];
          return v.optionValues.some((ov) => ov.optionValue.id === vid);
        })
      );
      return !variant || variant.stock <= 0 || !variant.isActive;
    },
    [selectedOptions, product.options, product.variants]
  );

  function selectOption(optionId: string, valueId: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
    setQuantity(1);
  }

  function buildCartItem() {
    const variantName = product.options
      .map((opt) => {
        const vid = selectedOptions[opt.id];
        const val = opt.values.find((v) => v.id === vid);
        return val ? `${opt.name}: ${val.value}` : "";
      })
      .filter(Boolean)
      .join(" / ");

    return {
      productId: product.id,
      variantId: matchedVariant?.id ?? product.id,
      productName: product.name,
      variantName: variantName || product.name,
      price: displayPrice,
      quantity,
      image: mainImage,
    };
  }

  function handleAddToCart() {
    if (product.options.length > 0 && !allOptionsSelected) {
      alert("옵션을 선택해주세요.");
      return;
    }
    if (isOutOfStock) return;
    addToCart(buildCartItem());
    alert("장바구니에 담았습니다.");
  }

  function handleBuyNow() {
    if (product.options.length > 0 && !allOptionsSelected) {
      alert("옵션을 선택해주세요.");
      return;
    }
    if (isOutOfStock) return;
    addToCart(buildCartItem());
    router.push("/checkout");
  }

  const maxQty = displayStock ?? 99;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Product section */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Image gallery */}
        <div className="md:w-1/2 flex flex-col gap-3">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          {sortedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.url)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    mainImage === img.url
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="md:w-1/2 flex flex-col gap-4">
          {/* Category + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {product.category.name}
              </span>
            )}
            {badgeList.map((badge) => (
              <span
                key={badge}
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  badge === "SALE"
                    ? "bg-red-100 text-red-700"
                    : badge === "BEST"
                    ? "bg-yellow-100 text-yellow-700"
                    : badge === "HOT"
                    ? "bg-orange-100 text-orange-700"
                    : badge === "NEW"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Product name */}
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="flex items-end gap-3">
            {product.comparePrice && product.comparePrice > product.basePrice ? (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                  {calcDiscount(product.basePrice, product.comparePrice)}% OFF
                </span>
                <span className="text-2xl font-extrabold text-gray-900">
                  {formatPrice(displayPrice)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          {/* Option selectors */}
          {product.options.length > 0 && (
            <div className="flex flex-col gap-4 pt-2 border-t border-gray-100">
              {product.options
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((option) => (
                  <div key={option.id} className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((val) => {
                          const isSelected =
                            selectedOptions[option.id] === val.id;
                          const unavailable = isValueUnavailable(
                            option.id,
                            val.id
                          );
                          return (
                            <button
                              key={val.id}
                              onClick={() =>
                                !unavailable && selectOption(option.id, val.id)
                              }
                              disabled={unavailable}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                isSelected
                                  ? "bg-gray-900 text-white border-gray-900"
                                  : unavailable
                                  ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-600"
                              }`}
                            >
                              {val.value}
                              {unavailable && (
                                <span className="ml-1 text-xs text-gray-400">
                                  품절
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Stock status */}
          {matchedVariant && (
            <div className="text-sm">
              {isOutOfStock ? (
                <span className="text-red-600 font-semibold">품절</span>
              ) : (
                <span className="text-green-700">
                  재고: {matchedVariant.stock}개
                </span>
              )}
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Quantity selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">수량</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                >
                  −
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQty, q + 1))
                  }
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 rounded-xl border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                장바구니 담기
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                바로 구매
              </button>
            </div>
          </div>

          {/* Shipping info */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p>50,000원 이상 무료배송 / 기본 배송비 2,500원</p>
            <p className="mt-0.5">당일 오후 2시 이전 결제 시 당일 발송 (우체국 택배)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 border-t border-gray-200">
        <div className="flex border-b border-gray-200">
          {(
            [
              { key: "detail", label: "상품 상세" },
              { key: "review", label: "리뷰" },
              { key: "qna", label: "Q&A" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "detail" && (
            <div>
              {product.description && (
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}
              {product.detailHtml ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.detailHtml }}
                />
              ) : (
                !product.description && (
                  <p className="text-gray-400 text-center py-12">
                    상품 상세 정보가 없습니다.
                  </p>
                )
              )}
            </div>
          )}
          {(activeTab === "review" || activeTab === "qna") && (
            <p className="text-gray-400 text-center py-12">준비 중입니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
