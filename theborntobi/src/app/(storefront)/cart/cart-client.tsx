"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  type CartItem,
} from "@/lib/cart";

const FREE_SHIPPING_THRESHOLD = 50000;
const DEFAULT_SHIPPING_FEE = 2500;

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  function handleQuantityChange(variantId: string, newQty: number) {
    updateCartQuantity(variantId, newQty);
    setItems(getCart());
  }

  function handleRemove(variantId: string) {
    removeFromCart(variantId);
    setItems(getCart());
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal === 0 ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  if (!mounted) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-12 text-center text-gray-400">
        장바구니를 불러오는 중...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-20 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-2">
          장바구니가 비어있습니다
        </p>
        <p className="text-sm text-gray-400 mb-6">
          원하는 상품을 장바구니에 담아보세요.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">장바구니</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items list */}
        <div className="flex-1">
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 p-4">
                {/* Image */}
                <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                  <Image
                    src={item.image || "/placeholder-product.png"}
                    alt={item.productName}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.variantName}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Quantity + subtotal + remove */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.variantId, item.quantity - 1)
                      }
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.variantId, item.quantity + 1)
                      }
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.variantId)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/products"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← 쇼핑 계속하기
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              주문 요약
            </h2>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span>
                  {shippingFee === 0
                    ? subtotal === 0
                      ? formatPrice(0)
                      : "무료"
                    : formatPrice(shippingFee)}
                </span>
              </div>
              {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-gray-400">
                  {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} 더 담으면
                  무료배송!
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-base">
              <span>합계</span>
              <span className="text-gray-900">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-4 block w-full text-center py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition-colors"
            >
              주문하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
