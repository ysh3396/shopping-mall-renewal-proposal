import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "../actions";
import CompleteClient from "./complete-client";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export default async function OrderCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) notFound();

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const payment = order.payment;
  const depositDeadline = payment?.depositDeadline
    ? formatDateTime(payment.depositDeadline)
    : "주문 후 24시간 이내";

  return (
    <>
      <CompleteClient />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            주문이 접수되었습니다!
          </h1>
          <p className="text-sm text-gray-500">
            아래 계좌로 입금해 주시면 주문이 확정됩니다.
          </p>
        </div>

        {/* Order info */}
        <div className="border border-gray-200 rounded-xl mb-6 overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">주문 정보</h2>
          </div>
          <div className="p-5 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">주문번호</span>
              <span className="font-semibold text-gray-900">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">주문일시</span>
              <span className="text-gray-700">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">주문 상태</span>
              <span className="font-semibold text-amber-600">입금 대기중</span>
            </div>
          </div>
        </div>

        {/* Bank transfer info - PROMINENT */}
        <div className="border-2 border-blue-400 rounded-xl mb-6 overflow-hidden">
          <div className="px-5 py-4 bg-blue-600 text-white">
            <h2 className="font-bold text-lg">입금 안내</h2>
            <p className="text-blue-100 text-sm mt-0.5">
              아래 계좌로 정확한 금액을 입금해 주세요
            </p>
          </div>
          <div className="p-5 bg-blue-50 flex flex-col gap-4">
            {/* Transfer details grid */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-blue-700 font-medium">은행</span>
                <span className="font-bold text-blue-900 text-base">
                  {payment?.bankName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-blue-700 font-medium">계좌번호</span>
                <span className="font-bold text-blue-900 text-base tracking-wider">
                  {payment?.accountNumber || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-blue-700 font-medium">예금주</span>
                <span className="font-bold text-blue-900 text-base">
                  {/* fallback to bankHolder from config */}
                  주식회사 더본투비
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-blue-700 font-medium">입금액</span>
                <span className="font-extrabold text-blue-600 text-xl">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-blue-700 font-medium">입금기한</span>
                <span className="font-bold text-red-600">
                  {depositDeadline}까지
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-blue-700 font-medium">입금자명</span>
                <span className="font-bold text-blue-900 text-base">
                  {payment?.depositorName || "—"}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>
                <strong>입금 기한 내 미입금 시 주문이 자동 취소됩니다.</strong>
                <br />
                입금자명을 정확히 입력해 주세요. 타인 명의 입금 시 확인이
                지연될 수 있습니다.
              </span>
            </div>
          </div>
        </div>

        {/* Order items summary */}
        {order.items.length > 0 && (
          <div className="border border-gray-200 rounded-xl mb-8 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">주문 상품</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between p-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      수량: {item.quantity}개
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-600">
                배송비: {order.shippingFee === 0 ? "무료" : formatPrice(order.shippingFee)}
              </span>
              <span className="font-bold text-gray-900">
                총 {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 text-center py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            주문 내역 보기
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </>
  );
}
