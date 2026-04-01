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
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "./actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  sortOrder: number;
  isActive: boolean;
  isRestricted: boolean;
}

interface Props {
  categories: Category[];
  parentCategories: { id: string; name: string; slug: string }[];
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  parentId: "",
  sortOrder: "0",
  isActive: true,
  isRestricted: false,
};

export function CategoryClient({ categories, parentCategories }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const filtered = categories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(c: Category) {
    setEditTarget(c);
    setForm({
      name: c.name,
      slug: c.slug,
      parentId: c.parentId ?? "",
      sortOrder: String(c.sortOrder),
      isActive: c.isActive,
      isRestricted: c.isRestricted,
    });
    setError("");
    setDialogOpen(true);
  }

  function openDelete(c: Category) {
    setDeleteTarget(c);
    setError("");
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) {
      setError("이름과 슬러그는 필수입니다.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        parentId: form.parentId || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        isRestricted: form.isRestricted,
      };
      if (editTarget) {
        await updateCategory(editTarget.id, payload);
      } else {
        await createCategory(payload);
      }
      setDialogOpen(false);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteDialogOpen(false);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleCategoryStatus(id, !current);
    router.refresh();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="이름 또는 슬러그 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="ml-auto">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4 mr-1" />
            카테고리 추가
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
          <FolderTree className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          카테고리가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  이름
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  슬러그
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  부모 카테고리
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">
                  순서
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">
                  상태
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">
                  제한
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {c.parent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                        {c.parent.name}
                      </span>
                    ) : (
                      <span className="text-slate-300">최상위</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {c.sortOrder}
                  </td>
                  <td className="px-4 py-3 text-center">
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
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.isRestricted ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        제한
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                        onClick={() => openDelete(c)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "카테고리 수정" : "카테고리 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>이름</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="전자담배"
              />
            </div>

            <div className="space-y-1.5">
              <Label>슬러그</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e-cigarette"
              />
            </div>

            <div className="space-y-1.5">
              <Label>부모 카테고리 (선택)</Label>
              <Select
                value={form.parentId || "__none__"}
                onValueChange={(v) =>
                  setForm({ ...form, parentId: !v || v === "__none__" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="최상위 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">최상위 (없음)</SelectItem>
                  {parentCategories
                    .filter((p) => p.id !== editTarget?.id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>정렬 순서</Label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label className="cursor-pointer">활성화</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isRestricted}
                onCheckedChange={(v) => setForm({ ...form, isRestricted: v })}
              />
              <Label className="cursor-pointer">성인/제한 카테고리</Label>
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

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {deleteTarget?.name}
              </span>{" "}
              카테고리를 삭제하시겠습니까?
            </p>
            <p className="text-xs text-slate-400">
              하위 카테고리나 상품이 연결된 경우 삭제할 수 없습니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
