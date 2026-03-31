import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getOrder } from "../actions";
import { OrderDetailClient } from "./order-detail-client";
import {
  User,
  Package,
  CreditCard,
  Truck,
  Clock,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "무통장입금",
  KAKAOPAY: "카카오페이",
  TOSSPAY: "토스페이",
  CARD: "카드결제",
};

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-slate-400">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-800 flex-1">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const shippingAddress = (() => {
    try {
      const raw = order.shippingAddress;
      const parsed =
        typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed as {
        recipient?: string;
        phone?: string;
        zipCode?: string;
        address1?: string;
        address2?: string;
      };
    } catch {
      return null;
    }
  })();

  const ACTION_LABELS: Record<string, string> = {
    UPDATE_STATUS: "상태 변경",
    CONFIRM_DEPOSIT: "입금 확인",
    ADD_NOTE: "메모 추가",
    CREATE: "주문 생성",
  };

  return (
    <div>
      <PageHeader
        title={`주문 ${order.orderNumber}`}
        description={`${formatDateTime(order.createdAt)} 주문`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              주문 목록
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <StatusBadge status={order.status} />
          </div>
        }
      />

      {/* Status action buttons + note form (client) */}
      <OrderDetailClient
        orderId={order.id}
        orderStatus={order.status}
        hasPayment={!!order.payment}
        paymentMethod={order.payment?.method ?? null}
        existingNote={order.note ?? null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Left column: Items + Shipping address */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ordered Items */}
          <SectionCard
            title="주문 상품"
            icon={<Package className="w-4 h-4" />}
          >
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => {
                const thumbnail = item.product.images[0]?.url;
                const variantLabel = item.variant?.optionValues
                  .map((ov) => ov.optionValue.value)
                  .join(" / ");

                return (
                  <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnail}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {item.productName}
                      </div>
                      {(variantLabel || item.variantName) && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {variantLabel || item.variantName}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 text-right">
                      <div>{formatPrice(item.price)} × {item.quantity}</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order totals */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>상품 소계</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>배송비</span>
                <span>
                  {order.shippingFee === 0
                    ? "무료"
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>할인</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                <span>합계</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Shipping Address */}
          {shippingAddress && (
            <SectionCard
              title="배송지 정보"
              icon={<Truck className="w-4 h-4" />}
            >
              <InfoRow label="수령인" value={shippingAddress.recipient ?? "-"} />
              <InfoRow label="연락처" value={shippingAddress.phone ?? "-"} />
              <InfoRow
                label="주소"
                value={
                  shippingAddress.address1
                    ? `(${shippingAddress.zipCode}) ${shippingAddress.address1} ${shippingAddress.address2 ?? ""}`
                    : "-"
                }
              />
            </SectionCard>
          )}

          {/* Shipment Info */}
          {order.shipment && (
            <SectionCard
              title="배송 정보"
              icon={<Truck className="w-4 h-4" />}
            >
              <InfoRow label="택배사" value={order.shipment.carrier} />
              <InfoRow
                label="운송장번호"
                value={
                  order.shipment.trackingNumber ? (
                    <span className="font-mono">
                      {order.shipment.trackingNumber}
                    </span>
                  ) : (
                    "-"
                  )
                }
              />
              <InfoRow
                label="배송상태"
                value={<StatusBadge status={order.shipment.status} />}
              />
              {order.shipment.shippedAt && (
                <InfoRow
                  label="출고일"
                  value={formatDateTime(order.shipment.shippedAt)}
                />
              )}
              {order.shipment.deliveredAt && (
                <InfoRow
                  label="배송완료일"
                  value={formatDateTime(order.shipment.deliveredAt)}
                />
              )}
            </SectionCard>
          )}

          {/* Status Timeline */}
          <SectionCard
            title="처리 이력"
            icon={<Clock className="w-4 h-4" />}
          >
            {order.auditLogs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                처리 이력이 없습니다.
              </p>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-100" />
                <div className="space-y-4">
                  {order.auditLogs.map((log) => {
                    const details = (() => {
                      try {
                        return log.details
                          ? (JSON.parse(log.details) as Record<string, string>)
                          : null;
                      } catch {
                        return null;
                      }
                    })();

                    return (
                      <div key={log.id} className="flex items-start gap-3 pl-8 relative">
                        <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-blue-400 border-2 border-white ring-1 ring-blue-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">
                              {ACTION_LABELS[log.action] ?? log.action}
                            </span>
                            {details?.from && details.to && (
                              <span className="text-xs text-slate-400">
                                {details.from} → {details.to}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {log.adminUser.name} · {formatDateTime(log.createdAt)}
                          </div>
                          {details?.note && (
                            <div className="text-xs text-slate-500 mt-1 bg-slate-50 rounded px-2 py-1">
                              {details.note}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right column: Customer + Payment */}
        <div className="space-y-4">
          {/* Customer Info */}
          <SectionCard
            title="고객 정보"
            icon={<User className="w-4 h-4" />}
          >
            <InfoRow label="이름" value={order.customer.name} />
            <InfoRow label="이메일" value={order.customer.email} />
            {order.customer.phone && (
              <InfoRow label="연락처" value={order.customer.phone} />
            )}
            <div className="mt-3">
              <Link
                href={`/admin/customers/${order.customer.id}`}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                고객 상세 보기 →
              </Link>
            </div>
          </SectionCard>

          {/* Payment Info */}
          {order.payment && (
            <SectionCard
              title="결제 정보"
              icon={<CreditCard className="w-4 h-4" />}
            >
              <InfoRow
                label="결제수단"
                value={
                  PAYMENT_METHOD_LABELS[order.payment.method] ??
                  order.payment.method
                }
              />
              <InfoRow
                label="결제금액"
                value={
                  <span className="font-semibold">
                    {formatPrice(order.payment.amount)}
                  </span>
                }
              />
              <InfoRow
                label="결제상태"
                value={<StatusBadge status={order.payment.status} />}
              />

              {order.payment.method === "BANK_TRANSFER" && (
                <>
                  {order.payment.bankName && (
                    <InfoRow label="은행" value={order.payment.bankName} />
                  )}
                  {order.payment.accountNumber && (
                    <InfoRow
                      label="계좌번호"
                      value={
                        <span className="font-mono">
                          {order.payment.accountNumber}
                        </span>
                      }
                    />
                  )}
                  {order.payment.depositorName && (
                    <InfoRow
                      label="입금자명"
                      value={order.payment.depositorName}
                    />
                  )}
                  {order.payment.depositDeadline && (
                    <InfoRow
                      label="입금기한"
                      value={
                        <span
                          className={
                            new Date(order.payment.depositDeadline) < new Date()
                              ? "text-red-500"
                              : "text-slate-800"
                          }
                        >
                          {formatDate(order.payment.depositDeadline)}
                        </span>
                      }
                    />
                  )}
                  {order.payment.depositConfirmedAt && (
                    <InfoRow
                      label="입금확인"
                      value={
                        <span className="text-green-600">
                          {formatDateTime(order.payment.depositConfirmedAt)}
                        </span>
                      }
                    />
                  )}
                </>
              )}

              {order.payment.paidAt && (
                <InfoRow
                  label="결제일시"
                  value={formatDateTime(order.payment.paidAt)}
                />
              )}
            </SectionCard>
          )}

          {/* Return/Exchange requests */}
          {order.returnRequest && (
            <SectionCard
              title="반품 요청"
              icon={<Package className="w-4 h-4" />}
            >
              <InfoRow
                label="상태"
                value={<StatusBadge status={order.returnRequest.status} />}
              />
              <InfoRow label="사유" value={order.returnRequest.reason} />
              {order.returnRequest.detailReason && (
                <InfoRow
                  label="상세사유"
                  value={order.returnRequest.detailReason}
                />
              )}
              <InfoRow
                label="요청일"
                value={formatDate(order.returnRequest.createdAt)}
              />
            </SectionCard>
          )}

          {order.exchangeRequest && (
            <SectionCard
              title="교환 요청"
              icon={<Package className="w-4 h-4" />}
            >
              <InfoRow
                label="상태"
                value={<StatusBadge status={order.exchangeRequest.status} />}
              />
              <InfoRow label="사유" value={order.exchangeRequest.reason} />
              <InfoRow
                label="요청일"
                value={formatDate(order.exchangeRequest.createdAt)}
              />
            </SectionCard>
          )}

          {/* Refund info */}
          {order.refund && (
            <SectionCard
              title="환불 정보"
              icon={<CreditCard className="w-4 h-4" />}
            >
              <InfoRow
                label="상태"
                value={<StatusBadge status={order.refund.status} />}
              />
              <InfoRow
                label="환불금액"
                value={formatPrice(order.refund.amount)}
              />
              {order.refund.reason && (
                <InfoRow label="사유" value={order.refund.reason} />
              )}
              {order.refund.processedAt && (
                <InfoRow
                  label="처리일"
                  value={formatDate(order.refund.processedAt)}
                />
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
