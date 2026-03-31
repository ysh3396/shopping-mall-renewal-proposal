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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronDown, ClipboardList } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
  adminUser: AdminUser;
}

interface FilterOptions {
  actions: string[];
  resources: string[];
  adminUsers: AdminUser[];
}

interface Props {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  filterOptions: FilterOptions;
  initialAction: string;
  initialResource: string;
  initialAdminUserId: string;
  initialDateFrom: string;
  initialDateTo: string;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "생성",
  UPDATE: "수정",
  DELETE: "삭제",
  UPDATE_STATUS: "상태변경",
  CONFIRM_DEPOSIT: "입금확인",
  ADD_NOTE: "메모추가",
  LOGIN: "로그인",
  LOGOUT: "로그아웃",
};

const RESOURCE_LABELS: Record<string, string> = {
  order: "주문",
  product: "상품",
  coupon: "쿠폰",
  banner: "배너",
  user: "사용자",
  settings: "설정",
};

function formatRelative(date: Date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const dt = new Date(date);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function formatFull(date: Date) {
  const dt = new Date(date);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}:${String(dt.getSeconds()).padStart(2, "0")}`;
}

export function AuditLogClient({
  logs,
  total,
  page,
  totalPages,
  limit,
  filterOptions,
  initialAction,
  initialResource,
  initialAdminUserId,
  initialDateFrom,
  initialDateTo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    action: initialAction,
    resource: initialResource,
    adminUserId: initialAdminUserId,
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
  });

  function buildUrl(overrides: Partial<typeof filters> & { page?: number }) {
    const merged = { ...filters, ...overrides };
    const sp = new URLSearchParams();
    if (merged.action) sp.set("action", merged.action);
    if (merged.resource) sp.set("resource", merged.resource);
    if (merged.adminUserId) sp.set("adminUserId", merged.adminUserId);
    if (merged.dateFrom) sp.set("dateFrom", merged.dateFrom);
    if (merged.dateTo) sp.set("dateTo", merged.dateTo);
    if (overrides.page && overrides.page > 1) sp.set("page", String(overrides.page));
    const qs = sp.toString();
    return `/admin/audit-logs${qs ? `?${qs}` : ""}`;
  }

  function applyFilters(overrides: Partial<typeof filters>) {
    const next = { ...filters, ...overrides };
    setFilters(next);
    startTransition(() => {
      router.push(buildUrl({ ...next, page: 1 }));
    });
  }

  function navigate(p: number) {
    startTransition(() => {
      router.push(buildUrl({ page: p }));
    });
  }

  function resetFilters() {
    const empty = { action: "", resource: "", adminUserId: "", dateFrom: "", dateTo: "" };
    setFilters(empty);
    startTransition(() => router.push("/admin/audit-logs"));
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Action */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">액션</label>
            <Select
              value={filters.action || "all"}
              onValueChange={(v) => applyFilters({ action: (v ?? "") === "all" ? "" : (v ?? "") })}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {filterOptions.actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {ACTION_LABELS[a] ?? a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">리소스</label>
            <Select
              value={filters.resource || "all"}
              onValueChange={(v) => applyFilters({ resource: (v ?? "") === "all" ? "" : (v ?? "") })}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {filterOptions.resources.map((r) => (
                  <SelectItem key={r} value={r}>
                    {RESOURCE_LABELS[r] ?? r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin user */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">관리자</label>
            <Select
              value={filters.adminUserId || "all"}
              onValueChange={(v) => applyFilters({ adminUserId: (v ?? "") === "all" ? "" : (v ?? "") })}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {filterOptions.adminUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">시작일</label>
            <Input
              type="date"
              className="h-8 text-sm w-36"
              value={filters.dateFrom}
              onChange={(e) => applyFilters({ dateFrom: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">종료일</label>
            <Input
              type="date"
              className="h-8 text-sm w-36"
              value={filters.dateTo}
              onChange={(e) => applyFilters({ dateTo: e.target.value })}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            onClick={resetFilters}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase w-32">시각</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">관리자</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">액션</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">리소스</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">리소스 ID</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">IP</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <>
                <TableRow
                  key={log.id}
                  className="hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <TableCell>
                    <div
                      className="text-xs text-slate-700 font-medium"
                      title={formatFull(log.createdAt)}
                    >
                      {formatRelative(log.createdAt)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatFull(log.createdAt).split(" ")[1]}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-800">{log.adminUser.name}</div>
                    <div className="text-xs text-slate-400">{log.adminUser.email}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                      {RESOURCE_LABELS[log.resource] ?? log.resource}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {log.resourceId ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {log.ipAddress ?? "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {log.details && (
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === log.id ? "rotate-180" : ""}`}
                      />
                    )}
                  </TableCell>
                </TableRow>
                {expandedId === log.id && log.details && (
                  <TableRow key={`${log.id}-detail`} className="bg-slate-50">
                    <TableCell colSpan={7} className="py-3 px-6">
                      <pre className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(log.details!), null, 2);
                          } catch {
                            return log.details;
                          }
                        })()}
                      </pre>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-12">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  감사 로그가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-sm text-slate-500">
              총 {total}건 중 {(page - 1) * limit + 1}–{Math.min(page * limit, total)}건
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => navigate(page - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">{page} / {totalPages}</span>
              <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => navigate(page + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
