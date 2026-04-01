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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, MonitorPlay, ExternalLink } from "lucide-react";
import {
  createPopup,
  updatePopup,
  deletePopup,
  togglePopupStatus,
} from "./actions";

interface Popup {
  id: string;
  title: string;
  imageUrl: string | null;
  contentHtml: string | null;
  linkUrl: string | null;
  showOnce: boolean;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
}

interface Props {
  popups: Popup[];
}

const EMPTY_FORM = {
  title: "",
  imageUrl: "",
  contentHtml: "",
  linkUrl: "",
  showOnce: false,
  isActive: true,
  startsAt: "",
  expiresAt: "",
};

function formatDate(d: Date | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function PopupClient({ popups }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Popup | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(p: Popup) {
    setEditTarget(p);
    setForm({
      title: p.title,
      imageUrl: p.imageUrl ?? "",
      contentHtml: p.contentHtml ?? "",
      linkUrl: p.linkUrl ?? "",
      showOnce: p.showOnce,
      isActive: p.isActive,
      startsAt: p.startsAt ? formatDate(p.startsAt) : "",
      expiresAt: p.expiresAt ? formatDate(p.expiresAt) : "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("제목은 필수입니다.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim() || null,
        contentHtml: form.contentHtml.trim() || null,
        linkUrl: form.linkUrl.trim() || null,
        showOnce: form.showOnce,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      };
      if (editTarget) {
        await updatePopup(editTarget.id, payload);
      } else {
        await createPopup(payload);
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
    if (!confirm("이 팝업을 삭제하시겠습니까?")) return;
    await deletePopup(id);
    router.refresh();
  }

  async function handleToggle(id: string, current: boolean) {
    await togglePopupStatus(id, !current);
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
          팝업 추가
        </Button>
      </div>

      {/* Popup list */}
      {popups.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
          <MonitorPlay className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          팝업이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {popups.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 flex items-center gap-4 p-4"
            >
              {/* Thumbnail */}
              <div className="w-24 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <MonitorPlay className="w-6 h-6 text-slate-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm truncate">
                    {p.title}
                  </span>
                  {p.showOnce && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 flex-shrink-0">
                      하루 1회
                    </span>
                  )}
                </div>
                {p.linkUrl && (
                  <a
                    href={p.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 truncate w-fit"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {p.linkUrl}
                  </a>
                )}
                <div className="text-xs text-slate-400 mt-1">
                  {formatDate(p.startsAt)} ~ {formatDate(p.expiresAt)}
                </div>
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(p.id, p.isActive)}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                    p.isActive
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p.isActive ? "활성" : "비활성"}
                </button>
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "팝업 수정" : "팝업 추가"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>제목 *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="이벤트 팝업"
              />
            </div>

            <div className="space-y-1.5">
              <Label>이미지 URL (선택)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/popup.jpg"
              />
            </div>

            <div className="space-y-1.5">
              <Label>내용 HTML (선택)</Label>
              <textarea
                value={form.contentHtml}
                onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                placeholder="<p>팝업 내용을 입력하세요</p>"
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label>링크 URL (선택)</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://example.com/event"
              />
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
                checked={form.showOnce}
                onCheckedChange={(v) => setForm({ ...form, showOnce: v })}
              />
              <Label className="cursor-pointer">하루에 한번만 표시</Label>
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
