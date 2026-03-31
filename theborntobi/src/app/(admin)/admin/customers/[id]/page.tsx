import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Star,
  Calendar,
  Phone,
  Mail,
  Shield,
} from "lucide-react";
import { getCustomer, getCustomerGrades, updateCustomerGrade } from "../actions";
import { GradeChangeSelect } from "./grade-change-select";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function GradeBadge({ name }: { name: string }) {
  const colorMap: Record<string, string> = {
    일반: "bg-slate-100 text-slate-600 border-slate-200",
    Silver: "bg-blue-50 text-blue-700 border-blue-200",
    Gold: "bg-amber-50 text-amber-700 border-amber-200",
    VIP: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const cls = colorMap[name] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${cls}`}>
      {name}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: string | null }) {
  if (!provider || provider === "local") return null;
  const colorMap: Record<string, string> = {
    kakao: "bg-yellow-100 text-yellow-800 border-yellow-200",
    naver: "bg-green-100 text-green-800 border-green-200",
    google: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const cls = colorMap[provider] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const labelMap: Record<string, string> = { kakao: "카카오", naver: "네이버", google: "구글" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {labelMap[provider] ?? provider}
    </span>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, grades] = await Promise.all([
    getCustomer(id),
    getCustomerGrades(),
  ]);

  if (!customer) notFound();

  const paidOrderCount = customer.orders.filter((o) =>
    ["PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status)
  ).length;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          고객 목록으로
        </Link>
      </div>

      <PageHeader
        title={customer.name}
        description={customer.email}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile + Addresses */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">고객 정보</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>가입일: {formatDate(customer.createdAt)}</span>
              </div>
              {customer.provider && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">가입경로</span>
                  <ProviderBadge provider={customer.provider} />
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">등급</span>
                {customer.grade && <GradeBadge name={customer.grade.name} />}
              </div>
              <GradeChangeSelect
                customerId={customer.id}
                currentGradeId={customer.gradeId ?? ""}
                grades={grades}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">성인인증</span>
                {customer.ageVerified ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                    인증완료
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                    미인증
                  </span>
                )}
              </div>
              {customer.ageVerifiedAt && (
                <p className="text-xs text-slate-400 mt-1 ml-6">
                  인증일: {formatDate(customer.ageVerifiedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              배송지 목록
            </h2>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-slate-400">등록된 배송지가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3 rounded-lg border text-sm ${addr.isDefault ? "border-blue-200 bg-blue-50/40" : "border-slate-100 bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-800">{addr.recipient}</span>
                      {addr.isDefault && (
                        <span className="text-xs text-blue-600 font-medium">기본</span>
                      )}
                      {addr.label && (
                        <span className="text-xs text-slate-400">{addr.label}</span>
                      )}
                    </div>
                    <div className="text-slate-500">{addr.phone}</div>
                    <div className="text-slate-600 mt-0.5">
                      [{addr.zipCode}] {addr.address1}
                      {addr.address2 && ` ${addr.address2}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Stats + Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">총 주문수</div>
              <div className="text-2xl font-bold text-slate-900">{customer.orders.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">건</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">총 구매액</div>
              <div className="text-xl font-bold text-slate-900">{formatPrice(customer.totalSpent)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">평균 주문액</div>
              <div className="text-xl font-bold text-slate-900">{formatPrice(customer.averageOrderValue)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">최근 주문일</div>
              <div className="text-base font-bold text-slate-900">
                {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "-"}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                최근 주문 내역
              </h2>
              <Link
                href={`/admin/orders?customerId=${customer.id}`}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                전체 주문 보기 →
              </Link>
            </div>
            {customer.orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                주문 내역이 없습니다.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문번호</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">상품</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">금액</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">상태</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-sm text-blue-600 hover:text-blue-700"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {order.items[0]?.productName ?? "-"}
                        {order.items.length > 1 && (
                          <span className="text-xs text-slate-400 ml-1">
                            외 {order.items.length - 1}건
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums text-slate-700">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
