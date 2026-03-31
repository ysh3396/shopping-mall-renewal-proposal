"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice: number | null;
  badges: string | null;
  sortOrder: number;
  createdAt: Date;
  images: ProductImage[];
  category: Category | null;
}

interface ProductGridProps {
  products: Product[];
  categories: Category[];
}

type SortKey = "recommend" | "low" | "high" | "new";

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("recommend");

  const filtered =
    activeCategory === "ALL"
      ? products
      : products.filter((p) => p.category?.slug === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "low") return a.basePrice - b.basePrice;
    if (sortKey === "high") return b.basePrice - a.basePrice;
    if (sortKey === "new")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.sortOrder - b.sortOrder;
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "recommend", label: "추천순" },
    { key: "low", label: "낮은가격순" },
    { key: "high", label: "높은가격순" },
    { key: "new", label: "최신순" },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
            Best Sellers
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            더본투비 인기 상품
          </h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px bg-gray-200 w-16" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <div className="h-px bg-gray-200 w-16" />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max justify-center">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                activeCategory === "ALL"
                  ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                  : "bg-white text-slate-500 border-gray-200 hover:border-slate-400 hover:text-slate-800"
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  activeCategory === cat.slug
                    ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                    : "bg-white text-slate-500 border-gray-200 hover:border-slate-400 hover:text-slate-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Count Row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">총 {sorted.length}개 상품</p>
          <div className="flex items-center gap-3">
            {sortOptions.map((opt, i) => (
              <span key={opt.key} className="flex items-center gap-3">
                {i > 0 && <span className="text-gray-200">|</span>}
                <button
                  onClick={() => setSortKey(opt.key)}
                  className={`text-xs transition-colors border-none bg-transparent p-0 cursor-pointer ${
                    sortKey === opt.key
                      ? "text-slate-800 font-bold"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            상품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sorted.map((product) => {
              const firstImage = product.images.sort(
                (a, b) => a.sortOrder - b.sortOrder
              )[0];
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
