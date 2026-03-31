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
  UserCog,
} from "lucide-react";
import {
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
} from "./actions";

interface Role {
  id: string;
  name: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  role: Role;
}

interface Props {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
  roles: Role[];
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  super_admin: { label: "슈퍼관리자", className: "bg-purple-50 text-purple-700 border-purple-200" },
  manager: { label: "매니저", className: "bg-blue-50 text-blue-700 border-blue-200" },
  staff: { label: "스태프", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  isActive: true,
};

function formatDate(d: Date | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}

export function AdminUsersClient({
  users,
  total,
  page,
  totalPages,
  limit,
  initialSearch,
  roles,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
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
        router.push(`/admin/users${sp.toString() ? `?${sp}` : ""}`);
      });
    }, 300);
  }

  function navigate(p: number) {
    const sp = new URLSearchParams();
    if (initialSearch) sp.set("search", initialSearch);
    if (p > 1) sp.set("page", String(p));
    startTransition(() => {
      router.push(`/admin/users${sp.toString() ? `?${sp}` : ""}`);
    });
  }

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, roleId: roles[0]?.id ?? "" });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(u: AdminUser) {
    setEditTarget(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      roleId: u.role.id,
      isActive: u.isActive,
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim() || !form.roleId) {
      setError("이름, 이메일, 역할은 필수입니다.");
      return;
    }
    if (!editTarget && !form.password.trim()) {
      setError("비밀번호는 필수입니다.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editTarget) {
        await updateAdminUser(editTarget.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          roleId: form.roleId,
          isActive: form.isActive,
        });
      } else {
        await createAdminUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          roleId: form.roleId,
          isActive: form.isActive,
        });
      }
      setDialogOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleAdminUserStatus(id, !current);
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
            placeholder="이름 또는 이메일 검색..."
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
            관리자 추가
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">이름</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">이메일</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">역할</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">마지막 로그인</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">상태</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const roleConfig = ROLE_CONFIG[u.role.name] ?? {
                label: u.role.name,
                className: "bg-slate-50 text-slate-600 border-slate-200",
              };
              return (
                <TableRow key={u.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-sm text-slate-900">{u.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{u.email}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleConfig.className}`}>
                      {roleConfig.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(u.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggle(u.id, u.isActive)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                        u.isActive
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {u.isActive ? "활성" : "비활성"}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                  <UserCog className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  관리자가 없습니다.
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "관리자 수정" : "관리자 추가"}</DialogTitle>
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
                placeholder="홍길동"
              />
            </div>

            <div className="space-y-1.5">
              <Label>이메일</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>

            {!editTarget && (
              <div className="space-y-1.5">
                <Label>비밀번호</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>역할</Label>
              <Select
                value={form.roleId}
                onValueChange={(v) => setForm({ ...form, roleId: (v ?? "") as string })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => {
                    const cfg = ROLE_CONFIG[r.name];
                    return (
                      <SelectItem key={r.id} value={r.id}>
                        {cfg?.label ?? r.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
