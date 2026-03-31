"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  customer: { id: string; name: string; email: string };
  firstItemName: string;
  itemCount: number;
  payment: { method: string; status: string; amount: number } | null;
}

interface Props {
  orders: OrderItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
  initialStatus: string;
  stats: Record<string, number>;
}

const STATUS_TABS = [
  { value: "", label: "전체" },
  { value: "AWAITING_DEPOSIT", label: "입금대기" },
  { value: "PAID", label: "결제완료" },
  { value: "PREPARING", label: "배송준비" },
  { value: "SHIPPED", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CANCELLED", label: "취소" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "무통장입금",
  KAKAOPAY: "카카오페이",
  TOSSPAY: "토스페이",
  CARD: "카드",
};

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function OrderListClient({
  orders,
  total,
  page,
  totalPages,
  limit,
  initialSearch,
  initialStatus,
  stats,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.status) sp.set("status", params.status);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    const qs = sp.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  function navigate(overrides: Record<string, string>) {
    const merged = {
      search: initialSearch,
      status: initialStatus,
      page: "1",
      ...overrides,
    };
    startTransition(() => {
      router.push(buildUrl(merged));
    });
  }

  let searchTimeout: ReturnType<typeof setTimeout>;

  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      navigate({ search: value, page: "1" });
    }, 300);
  }

  return (
    <div>
      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
        {STATUS_TABS.map((tab) => {
          const count = tab.value ? (stats[tab.value] ?? 0) : (stats.total ?? 0);
          const isActive = initialStatus === tab.value;
          const isAwaitingDeposit = tab.value === "AWAITING_DEPOSIT";

          return (
            <button
              key={tab.value}
              onClick={() => navigate({ status: tab.value })}
              className={`
                relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? isAwaitingDeposit
                    ? "text-amber-600 border-b-2 border-amber-500 -mb-px"
                    : "text-blue-600 border-b-2 border-blue-500 -mb-px"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              {tab.label}
              <span
                className={`
                  inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-semibold
                  ${isActive
                    ? isAwaitingDeposit
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                    : isAwaitingDeposit && count > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="주문번호 또는 고객명 검색..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                주문번호
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                고객
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                상품
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">
                결제금액
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">
                결제방법
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">
                상태
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                주문일
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-slate-900">
                    {order.customer.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {order.customer.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-700">
                    {order.firstItemName}
                    {order.itemCount > 1 && (
                      <span className="text-xs text-slate-400 ml-1">
                        외 {order.itemCount - 1}건
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-slate-900">
                  {formatPrice(order.totalAmount)}
                </TableCell>
                <TableCell className="text-center">
                  {order.payment ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        order.payment.method === "BANK_TRANSFER"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-slate-400 py-12"
                >
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  주문이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-sm text-slate-500">
              {total}건 중 {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)}건
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === 1}
                onClick={() => navigate({ page: String(page - 1) })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === totalPages}
                onClick={() => navigate({ page: String(page + 1) })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
