"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCart, type CartItem } from "@/lib/cart";
import { createOrder, validateCoupon } from "./actions";

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

type Props = {
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
};

type CouponState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "applied"; discount: number; code: string; message: string }
  | { status: "error"; message: string };

export default function CheckoutClient({
  bankName,
  bankAccount,
  bankHolder,
  freeShippingThreshold,
  defaultShippingFee,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  // Form state
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<CouponState>({ status: "idle" });

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const cart = getCart();
    setItems(cart);
    setMounted(true);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
  const discount = couponState.status === "applied" ? couponState.discount : 0;
  const total = subtotal + shippingFee - discount;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponState({ status: "loading" });
    const result = await validateCoupon(couponCode.trim(), subtotal);
    if (result.valid) {
      setCouponState({
        status: "applied",
        discount: result.discount,
        code: couponCode.trim(),
        message: `쿠폰이 적용되었습니다. (${formatPrice(result.discount)} 할인)`,
      });
    } else {
      setCouponState({ status: "error", message: result.reason });
    }
  }

  function handleRemoveCoupon() {
    setCouponState({ status: "idle" });
    setCouponCode("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (items.length === 0) {
      setSubmitError("장바구니가 비어있습니다.");
      return;
    }
    if (!agreed) {
      setSubmitError("주문 내용 확인 및 결제 동의가 필요합니다.");
      return;
    }

    setSubmitting(true);

    const result = await createOrder({
      items,
      shippingAddress: {
        recipient,
        phone,
        zipCode,
        address1,
        address2: address2 || undefined,
        note: shippingNote || undefined,
      },
      depositorName,
      note: shippingNote || undefined,
      couponCode:
        couponState.status === "applied" ? couponState.code : undefined,
    });

    setSubmitting(false);

    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    router.push(`/checkout/complete?orderId=${result.orderId}`);
  }

  if (!mounted) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-12 text-center text-gray-400">
        결제 페이지를 불러오는 중...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-20 text-center">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          장바구니가 비어있습니다.
        </p>
        <a
          href="/products"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          쇼핑 계속하기
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">주문하기</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Section 1: 주문 상품 확인 */}
            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900">주문 상품 확인</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 p-4">
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={item.image || "/placeholder-product.png"}
                        alt={item.productName}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        수량: {item.quantity}개
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: 배송지 정보 */}
            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900">배송지 정보</h2>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수령인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="수령인 이름"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우편번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="우편번호"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      주소 검색
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기본주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="기본 주소"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세주소
                  </label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="상세 주소 (동, 호수 등)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    배송 메모
                  </label>
                  <textarea
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    placeholder="배송 시 요청사항을 입력해 주세요."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: 쿠폰 적용 */}
            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900">쿠폰 적용</h2>
              </div>
              <div className="p-5">
                {couponState.status === "applied" ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        {couponState.code}
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {couponState.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-4"
                    >
                      제거
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="쿠폰 코드 입력"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponState.status === "loading"}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {couponState.status === "loading" ? "확인 중..." : "적용"}
                    </button>
                  </div>
                )}
                {couponState.status === "error" && (
                  <p className="text-xs text-red-500 mt-2">{couponState.message}</p>
                )}
              </div>
            </section>
          </div>

          {/* Right column: 결제 정보 */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden sticky top-24">
              {/* Order summary */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900">결제 정보</h2>
              </div>

              <div className="p-5 flex flex-col gap-5">
                {/* Price breakdown */}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>상품 합계</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>배송비</span>
                    <span>
                      {shippingFee === 0 ? "무료" : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>할인</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
                    <span className="font-bold text-gray-900">총 결제금액</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    결제 방법
                  </p>
                  <div className="flex items-center gap-2 border border-gray-900 rounded-lg px-4 py-3 bg-gray-50">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-900" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      무통장입금
                    </span>
                  </div>
                </div>

                {/* Bank info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wide">
                    입금 계좌 정보
                  </p>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">은행</span>
                      <span className="text-blue-900 font-semibold">
                        {bankName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">계좌번호</span>
                      <span className="text-blue-900 font-semibold tracking-wide">
                        {bankAccount || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">예금주</span>
                      <span className="text-blue-900 font-semibold">
                        {bankHolder || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Depositor name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    입금자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    placeholder="실제 입금하실 분의 이름"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                {/* Deposit deadline notice */}
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    주문 후 <strong>24시간 이내</strong> 입금해 주세요. 미입금 시
                    주문이 자동 취소됩니다.
                  </span>
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-gray-900"
                  />
                  <span className="text-sm text-gray-700">
                    주문 내용을 확인했으며, 결제에 동의합니다.
                  </span>
                </label>

                {submitError && (
                  <p className="text-sm text-red-500 text-center">
                    {submitError}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-base hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "주문 처리 중..." : "주문하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
