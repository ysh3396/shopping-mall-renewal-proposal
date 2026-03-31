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
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface GradeInfo {
  id: string;
  name: string;
}

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  provider: string | null;
  ageVerified: boolean;
  createdAt: Date;
  grade: GradeInfo | null;
  orderCount: number;
  totalSpent: number;
}

interface Props {
  customers: CustomerItem[];
  grades: GradeInfo[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
  initialGradeId: string;
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function formatDate(date: Date) {
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {name}
    </span>
  );
}

export function CustomerListClient({
  customers,
  grades,
  total,
  page,
  totalPages,
  limit,
  initialSearch,
  initialGradeId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let searchTimeout: ReturnType<typeof setTimeout>;

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.gradeId) sp.set("gradeId", params.gradeId);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    const qs = sp.toString();
    return `/admin/customers${qs ? `?${qs}` : ""}`;
  }

  function navigate(overrides: Record<string, string>) {
    const merged = {
      search: initialSearch,
      gradeId: initialGradeId,
      page: "1",
      ...overrides,
    };
    startTransition(() => {
      router.push(buildUrl(merged));
    });
  }

  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => navigate({ search: value, page: "1" }), 300);
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 연락처 검색..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <select
          value={initialGradeId}
          onChange={(e) => navigate({ gradeId: e.target.value })}
          className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 등급</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">고객명</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">이메일</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">연락처</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">등급</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">주문수</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">총구매액</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">가입일</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">인증상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {customer.name}
                  </Link>
                  {customer.provider && (
                    <div className="text-xs text-slate-400 mt-0.5 capitalize">{customer.provider}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-600">{customer.email}</TableCell>
                <TableCell className="text-sm text-slate-600">{customer.phone ?? "-"}</TableCell>
                <TableCell>
                  {customer.grade ? (
                    <GradeBadge name={customer.grade.name} />
                  ) : (
                    <span className="text-xs text-slate-400">미지정</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-slate-700">
                  {customer.orderCount}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums font-medium text-slate-700">
                  {formatPrice(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-sm text-slate-500">{formatDate(customer.createdAt)}</TableCell>
                <TableCell>
                  {customer.ageVerified ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                      인증완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                      미인증
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  고객이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-sm text-slate-500">
              {total}건 중 {(page - 1) * limit + 1}–{Math.min(page * limit, total)}건
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
              <span className="text-sm text-slate-600 px-2">{page} / {totalPages}</span>
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
