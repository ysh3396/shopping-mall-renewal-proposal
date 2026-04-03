import Link from "next/link";
import { getMyOrders } from "../actions";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const orders = await getMyOrders(1, 50);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">주문 내역</h1>
          <p className="mt-2 text-sm text-gray-500">총 {orders.total}건의 주문이 있습니다.</p>
        </div>
        <Link href="/mypage" className="text-sm font-semibold text-gray-700 hover:underline">
          마이페이지로 돌아가기
        </Link>
      </div>

      {orders.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center text-sm text-gray-500">
          아직 주문 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.items.map((order) => (
            <Link
              key={order.id}
              href={`/mypage/orders/${order.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("ko-KR")}</p>
                </div>
                <div className="text-sm font-semibold text-gray-700">{order.status}</div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                <div>상품: {order.items[0]?.productName ?? "-"}{order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
                <div>결제상태: {order.payment?.status ?? "-"}</div>
                <div>결제금액: ₩{order.totalAmount.toLocaleString("ko-KR")}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
