"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import {
  approveReturn,
  rejectReturn,
  approveExchange,
  rejectExchange,
  completeRefund,
} from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
}

interface OrderInfo {
  id: string;
  orderNumber: string;
  totalAmount: number;
  customer: CustomerInfo;
}

interface ReturnRequestRow {
  id: string;
  orderId: string;
  reason: string;
  detailReason: string | null;
  status: string;
  createdAt: Date;
  order: OrderInfo;
}

interface ExchangeRequestRow {
  id: string;
  orderId: string;
  reason: string;
  newVariantId: string | null;
  status: string;
  createdAt: Date;
  order: OrderInfo;
}

interface RefundRow {
  id: string;
  orderId: string;
  amount: number;
  reason: string | null;
  refundMethod: string | null;
  refundAccount: string | null;
  status: string;
  processedAt: Date | null;
  createdAt: Date;
  order: OrderInfo;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  returnData: PaginatedResult<ReturnRequestRow>;
  exchangeData: PaginatedResult<ExchangeRequestRow>;
  refundData: PaginatedResult<RefundRow>;
  stats: { pendingReturns: number; pendingExchanges: number; pendingRefunds: number };
  initialTab: string;
  initialStatus: string;
  initialSearch: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "전체" },
  { value: "REQUESTED", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "거절" },
  { value: "COMPLETED", label: "완료" },
];

const REFUND_STATUS_FILTER_OPTIONS = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "COMPLETED", label: "완료" },
  { value: "REJECTED", label: "거절" },
];

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel,
  confirmClassName,
  isPending,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  confirmClassName?: string;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            취소
          </Button>
          <Button
            className={confirmClassName}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "처리중..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Return Row ───────────────────────────────────────────────────────────────

function ReturnRow({ item }: { item: ReturnRequestRow }) {
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  function handleApprove() {
    startTransition(async () => {
      await approveReturn(item.id);
      setDialog(null);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectReturn(item.id);
      setDialog(null);
    });
  }

  const canAct = item.status === "REQUESTED";

  return (
    <>
      <TableRow className="hover:bg-slate-50/50">
        <TableCell className="font-mono text-sm text-slate-700">
          {item.order.orderNumber}
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium text-slate-900">{item.order.customer.name}</div>
          <div className="text-xs text-slate-400">{item.order.customer.email}</div>
        </TableCell>
        <TableCell>
          <div className="text-sm text-slate-700">{item.reason}</div>
          {item.detailReason && (
            <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{item.detailReason}</div>
          )}
        </TableCell>
        <TableCell className="text-center">
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
          {formatDate(item.createdAt)}
        </TableCell>
        <TableCell>
          {canAct && (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white"
                disabled={isPending}
                onClick={() => setDialog("approve")}
              >
                승인
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                disabled={isPending}
                onClick={() => setDialog("reject")}
              >
                거절
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

      {dialog === "approve" && (
        <ConfirmDialog
          title="반품 승인"
          description="반품을 승인하고 환불을 자동 생성합니다."
          confirmLabel="승인"
          confirmClassName="bg-green-500 hover:bg-green-600 text-white"
          onConfirm={handleApprove}
          onCancel={() => setDialog(null)}
          isPending={isPending}
        />
      )}
      {dialog === "reject" && (
        <ConfirmDialog
          title="반품 거절"
          description="반품 요청을 거절합니다."
          confirmLabel="거절"
          confirmClassName="bg-red-500 hover:bg-red-600 text-white"
          onConfirm={handleReject}
          onCancel={() => setDialog(null)}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ─── Exchange Row ─────────────────────────────────────────────────────────────

function ExchangeRow({ item }: { item: ExchangeRequestRow }) {
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  function handleApprove() {
    startTransition(async () => {
      await approveExchange(item.id);
      setDialog(null);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectExchange(item.id);
      setDialog(null);
    });
  }

  const canAct = item.status === "REQUESTED";

  return (
    <>
      <TableRow className="hover:bg-slate-50/50">
        <TableCell className="font-mono text-sm text-slate-700">
          {item.order.orderNumber}
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium text-slate-900">{item.order.customer.name}</div>
          <div className="text-xs text-slate-400">{item.order.customer.email}</div>
        </TableCell>
        <TableCell className="text-sm text-slate-700">{item.reason}</TableCell>
        <TableCell className="text-center">
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
          {formatDate(item.createdAt)}
        </TableCell>
        <TableCell>
          {canAct && (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white"
                disabled={isPending}
                onClick={() => setDialog("approve")}
              >
                승인
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                disabled={isPending}
                onClick={() => setDialog("reject")}
              >
                거절
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

      {dialog === "approve" && (
        <ConfirmDialog
          title="교환 승인"
          description="교환 요청을 승인하고 주문 상태를 교환완료로 변경합니다."
          confirmLabel="승인"
          confirmClassName="bg-green-500 hover:bg-green-600 text-white"
          onConfirm={handleApprove}
          onCancel={() => setDialog(null)}
          isPending={isPending}
        />
      )}
      {dialog === "reject" && (
        <ConfirmDialog
          title="교환 거절"
          description="교환 요청을 거절합니다."
          confirmLabel="거절"
          confirmClassName="bg-red-500 hover:bg-red-600 text-white"
          onConfirm={handleReject}
          onCancel={() => setDialog(null)}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ─── Refund Row ───────────────────────────────────────────────────────────────

function RefundRow({ item }: { item: RefundRow }) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);

  function handleComplete() {
    startTransition(async () => {
      await completeRefund(item.id);
      setShowDialog(false);
    });
  }

  const canComplete = item.status === "PENDING";

  return (
    <>
      <TableRow className="hover:bg-slate-50/50">
        <TableCell className="font-mono text-sm text-slate-700">
          {item.order.orderNumber}
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium text-slate-900">{item.order.customer.name}</div>
          <div className="text-xs text-slate-400">{item.order.customer.email}</div>
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums text-slate-900">
          {formatPrice(item.amount)}
        </TableCell>
        <TableCell className="text-sm text-slate-500">
          {item.refundMethod ?? "-"}
        </TableCell>
        <TableCell className="text-center">
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
          {formatDate(item.createdAt)}
        </TableCell>
        <TableCell>
          {canComplete && (
            <Button
              size="sm"
              className="h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isPending}
              onClick={() => setShowDialog(true)}
            >
              환불완료 처리
            </Button>
          )}
          {item.processedAt && (
            <div className="text-xs text-slate-400">{formatDate(item.processedAt)}</div>
          )}
        </TableCell>
      </TableRow>

      {showDialog && (
        <ConfirmDialog
          title="환불 완료 처리"
          description="환불이 실제로 처리되었음을 확인합니다."
          confirmLabel="환불완료"
          confirmClassName="bg-blue-500 hover:bg-blue-600 text-white"
          onConfirm={handleComplete}
          onCancel={() => setShowDialog(false)}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onNavigate,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onNavigate: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <span className="text-sm text-slate-500">
        {total}건 중 {(page - 1) * limit + 1}–{Math.min(page * limit, total)}건
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === 1}
          onClick={() => onNavigate(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-slate-600 px-2">{page} / {totalPages}</span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === totalPages}
          onClick={() => onNavigate(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function ReturnsClient({
  returnData,
  exchangeData,
  refundData,
  stats,
  initialTab,
  initialStatus,
  initialSearch,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let searchTimeout: ReturnType<typeof setTimeout>;

  const activeTab = initialTab || "returns";

  function buildUrl(overrides: Record<string, string>) {
    const merged = {
      tab: activeTab,
      status: initialStatus,
      search: initialSearch,
      page: "1",
      ...overrides,
    };
    const sp = new URLSearchParams();
    if (merged.tab && merged.tab !== "returns") sp.set("tab", merged.tab);
    if (merged.status) sp.set("status", merged.status);
    if (merged.search) sp.set("search", merged.search);
    if (merged.page && merged.page !== "1") sp.set("page", merged.page);
    const qs = sp.toString();
    return `/admin/returns${qs ? `?${qs}` : ""}`;
  }

  function navigate(overrides: Record<string, string>) {
    startTransition(() => {
      router.push(buildUrl(overrides));
    });
  }

  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => navigate({ search: value, page: "1" }), 300);
  }

  const TABS = [
    {
      value: "returns",
      label: "반품 요청",
      badge: stats.pendingReturns,
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      value: "exchanges",
      label: "교환 요청",
      badge: stats.pendingExchanges,
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      value: "refunds",
      label: "환불 처리",
      badge: stats.pendingRefunds,
      badgeColor: "bg-blue-100 text-blue-700",
    },
  ];

  const statusFilterOptions =
    activeTab === "refunds" ? REFUND_STATUS_FILTER_OPTIONS : STATUS_FILTER_OPTIONS;

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => navigate({ tab: tab.value, status: "", page: "1" })}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-500 -mb-px"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-semibold ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="주문번호 또는 고객명 검색..."
            defaultValue={initialSearch}
            key={activeTab}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1">
          {statusFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => navigate({ status: opt.value, page: "1" })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                initialStatus === opt.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Return Requests Tab */}
      {activeTab === "returns" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문번호</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">고객</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">사유</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">상태</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">요청일</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnData.items.map((item) => (
                <ReturnRow key={item.id} item={item} />
              ))}
              {returnData.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    반품 요청이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={returnData.page}
            totalPages={returnData.totalPages}
            total={returnData.total}
            limit={returnData.limit}
            onNavigate={(p) => navigate({ page: String(p) })}
          />
        </div>
      )}

      {/* Exchange Requests Tab */}
      {activeTab === "exchanges" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문번호</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">고객</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">사유</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">상태</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">요청일</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeData.items.map((item) => (
                <ExchangeRow key={item.id} item={item} />
              ))}
              {exchangeData.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    교환 요청이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={exchangeData.page}
            totalPages={exchangeData.totalPages}
            total={exchangeData.total}
            limit={exchangeData.limit}
            onNavigate={(p) => navigate({ page: String(p) })}
          />
        </div>
      )}

      {/* Refunds Tab */}
      {activeTab === "refunds" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문번호</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">고객</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">환불금액</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">환불방법</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">상태</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">요청일</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase">처리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refundData.items.map((item) => (
                <RefundRow key={item.id} item={item} />
              ))}
              {refundData.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-12">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    환불 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={refundData.page}
            totalPages={refundData.totalPages}
            total={refundData.total}
            limit={refundData.limit}
            onNavigate={(p) => navigate({ page: String(p) })}
          />
        </div>
      )}
    </div>
  );
}
