"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "./actions";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
}

interface Props {
  banners: Banner[];
}

const POSITION_CONFIG: Record<string, { label: string; className: string }> = {
  HERO: { label: "히어로", className: "bg-purple-50 text-purple-700 border-purple-200" },
  MIDDLE: { label: "중단", className: "bg-blue-50 text-blue-700 border-blue-200" },
  SIDEBAR: { label: "사이드바", className: "bg-teal-50 text-teal-700 border-teal-200" },
};

const EMPTY_FORM = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  position: "HERO",
  sortOrder: "0",
  isActive: true,
  startsAt: "",
  expiresAt: "",
};

function formatDate(d: Date | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function BannerClient({ banners }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(b: Banner) {
    setEditTarget(b);
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "",
      position: b.position,
      sortOrder: String(b.sortOrder),
      isActive: b.isActive,
      startsAt: b.startsAt ? formatDate(b.startsAt) : "",
      expiresAt: b.expiresAt ? formatDate(b.expiresAt) : "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      setError("제목과 이미지 URL은 필수입니다.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim() || null,
        position: form.position,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      };
      if (editTarget) {
        await updateBanner(editTarget.id, payload);
      } else {
        await createBanner(payload);
      }
      setDialogOpen(false);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 배너를 삭제하시겠습니까?")) return;
    await deleteBanner(id);
    router.refresh();
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleBannerStatus(id, !current);
    router.refresh();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-1" />
          배너 추가
        </Button>
      </div>

      {/* Banner grid */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          배너가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {banners.map((b) => {
            const posConfig = POSITION_CONFIG[b.position] ?? {
              label: b.position,
              className: "bg-slate-50 text-slate-600 border-slate-200",
            };
            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 flex items-center gap-4 p-4"
              >
                {/* Thumbnail */}
                <div className="w-24 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 text-sm truncate">
                      {b.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${posConfig.className}`}
                    >
                      {posConfig.label}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      순서: {b.sortOrder}
                    </span>
                  </div>
                  {b.linkUrl && (
                    <a
                      href={b.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 truncate w-fit"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {b.linkUrl}
                    </a>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {formatDate(b.startsAt)} ~ {formatDate(b.expiresAt)}
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(b.id, b.isActive)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                      b.isActive
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {b.isActive ? "활성" : "비활성"}
                  </button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(b)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(b.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "배너 수정" : "배너 추가"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>제목</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="여름 세일 배너"
              />
            </div>

            <div className="space-y-1.5">
              <Label>이미지 URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div className="space-y-1.5">
              <Label>링크 URL (선택)</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://example.com/sale"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>위치</Label>
                <Select
                  value={form.position}
                  onValueChange={(v) => setForm({ ...form, position: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HERO">히어로</SelectItem>
                    <SelectItem value="MIDDLE">중단</SelectItem>
                    <SelectItem value="SIDEBAR">사이드바</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>정렬 순서</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>

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
