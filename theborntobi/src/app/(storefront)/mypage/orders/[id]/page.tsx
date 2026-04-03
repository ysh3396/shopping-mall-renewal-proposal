import { notFound } from "next/navigation";
import Link from "next/link";
import { getMyOrderDetail } from "../../actions";

export const dynamic = "force-dynamic";

export default async function MyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getMyOrderDetail(id);

  if (!order) notFound();

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">주문 상세</h1>
          <p className="mt-2 text-sm text-gray-500">주문번호 {order.orderNumber}</p>
        </div>
        <Link href="/mypage/orders" className="text-sm font-semibold text-gray-700 hover:underline">
          주문 목록으로
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <InfoCard title="주문 정보">
          <InfoRow label="주문상태" value={order.status} />
          <InfoRow label="주문일시" value={new Date(order.createdAt).toLocaleString("ko-KR")} />
          <InfoRow label="결제수단" value={order.payment?.method ?? "-"} />
          <InfoRow label="결제상태" value={order.payment?.status ?? "-"} />
        </InfoCard>

        <InfoCard title="배송 정보">
          <InfoRow label="택배사" value={order.shipment?.carrier ?? "-"} />
          <InfoRow label="운송장번호" value={order.shipment?.trackingNumber ?? "-"} />
          <InfoRow label="배송상태" value={order.shipment?.status ?? "-"} />
          <InfoRow label="배송지" value={formatAddress(order.shippingAddress)} />
        </InfoCard>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">주문 상품</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 px-4 py-4">
              <div>
                <p className="font-semibold text-gray-900">{item.productName}</p>
                <p className="mt-1 text-sm text-gray-500">{item.variantName ?? "기본 옵션"}</p>
              </div>
              <div className="text-right text-sm text-gray-700">
                <p>{item.quantity}개</p>
                <p className="mt-1 font-semibold">₩{item.subtotal.toLocaleString("ko-KR")}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 text-right">
          <p className="text-sm text-gray-500">총 결제금액</p>
          <p className="text-2xl font-black text-gray-900">₩{order.totalAmount.toLocaleString("ko-KR")}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right text-gray-900">{value}</span>
    </div>
  );
}

function formatAddress(address: unknown) {
  if (!address || typeof address !== "object") return "-";
  const a = address as Record<string, string | undefined>;
  return [a.recipient, a.phone, a.zipCode, a.address1, a.address2].filter(Boolean).join(" / ");
}
