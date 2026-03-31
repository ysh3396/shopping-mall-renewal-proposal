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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  RefreshCw,
  Tag,
} from "lucide-react";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "./actions";

interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

interface Props {
  coupons: Coupon[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
}

const EMPTY_FORM = {
  code: "",
  name: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function formatDate(d: Date | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function formatPrice(n: number) {
  return `₩${n.toLocaleString("ko-KR")}`;
}

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function CouponClient({
  coupons,
  total,
  page,
  totalPages,
  limit,
  initialSearch,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  let searchTimeout: ReturnType<typeof setTimeout>;

  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const sp = new URLSearchParams();
      if (value) sp.set("search", value);
      startTransition(() => {
        router.push(`/admin/promotions/coupons${sp.toString() ? `?${sp}` : ""}`);
      });
    }, 300);
  }

  function navigate(p: number) {
    const sp = new URLSearchParams();
    if (initialSearch) sp.set("search", initialSearch);
    if (p > 1) sp.set("page", String(p));
    startTransition(() => {
      router.push(`/admin/promotions/coupons${sp.toString() ? `?${sp}` : ""}`);
    });
  }

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, code: generateCode() });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditTarget(c);
    setForm({
      code: c.code,
      name: c.name,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      startsAt: c.startsAt ? formatDate(c.startsAt) : "",
      expiresAt: c.expiresAt ? formatDate(c.expiresAt) : "",
      isActive: c.isActive,
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim() || !form.discountValue) {
      setError("쿠폰 코드, 쿠폰명, 할인값은 필수입니다.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };
      if (editTarget) {
        await updateCoupon(editTarget.id, payload);
      } else {
        await createCoupon(payload);
      }
      setDialogOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 쿠폰을 삭제하시겠습니까?")) return;
    await deleteCoupon(id);
    router.refresh();
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleCouponStatus(id, !current);
    router.refresh();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="쿠폰 코드 또는 쿠폰명 검색..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div className="ml-auto">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4 mr-1" />
            쿠폰 생성
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">코드</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">쿠폰명</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">할인</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">최소주문</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">사용현황</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">기간</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">상태</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <span className="font-mono text-sm font-semibold text-slate-800">{c.code}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-700">{c.name}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    c.discountType === "PERCENTAGE"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}%`
                      : formatPrice(c.discountValue)}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm text-slate-600">
                  {c.minOrderAmount ? formatPrice(c.minOrderAmount) : "-"}
                </TableCell>
                <TableCell className="text-center text-sm text-slate-600">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </TableCell>
                <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                  {formatDate(c.startsAt)} ~ {formatDate(c.expiresAt)}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleToggle(c.id, c.isActive)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                      c.isActive
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {c.isActive ? "활성" : "비활성"}
                  </button>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  쿠폰이 없습니다.
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "쿠폰 수정" : "쿠폰 생성"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Code */}
            <div className="space-y-1.5">
              <Label>쿠폰 코드</Label>
              <div className="flex gap-2">
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setForm({ ...form, code: generateCode() })}
                  title="자동생성"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label>쿠폰명</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="여름 할인 쿠폰"
              />
            </div>

            {/* Discount type + value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>할인 유형</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => setForm({ ...form, discountType: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">정률할인 (%)</SelectItem>
                    <SelectItem value="FIXED">정액할인 (₩)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  할인값{" "}
                  {form.discountType === "PERCENTAGE" ? "(%)" : "(₩)"}
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "PERCENTAGE" ? "10" : "5000"}
                />
              </div>
            </div>

            {/* Min order + max discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>최소주문금액 (₩)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  placeholder="30000"
                />
              </div>
              {form.discountType === "PERCENTAGE" && (
                <div className="space-y-1.5">
                  <Label>최대할인금액 (₩)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="10000"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>사용제한 (회)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="무제한"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label className="cursor-pointer">활성화</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
