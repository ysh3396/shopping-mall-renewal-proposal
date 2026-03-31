"use client";

import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface RecentOrderRow {
  [key: string]: unknown;
  id: string;
  orderNumber: string;
  customerName: string;
  productSummary: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const orderColumns: Column<RecentOrderRow>[] = [
  { key: "orderNumber", label: "주문번호" },
  { key: "customerName", label: "고객" },
  { key: "productSummary", label: "상품" },
  {
    key: "totalAmount",
    label: "금액",
    render: (value) => `₩${(value as number).toLocaleString("ko-KR")}`,
  },
  {
    key: "status",
    label: "상태",
    render: (value) => <StatusBadge status={value as string} />,
  },
  {
    key: "createdAt",
    label: "날짜",
    render: (value) =>
      new Date(value as string).toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      }),
  },
];

export function DashboardOrders({ orders }: { orders: RecentOrderRow[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">최근 주문</h3>
        <a
          href="/admin/orders"
          className="text-xs text-blue-500 hover:text-blue-600 font-medium"
        >
          전체 보기
        </a>
      </div>
      <DataTable<RecentOrderRow> columns={orderColumns} data={orders} />
    </div>
  );
}
