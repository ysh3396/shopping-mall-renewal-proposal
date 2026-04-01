import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// 역할별 권한 매핑 (하드코딩 — DB 조회 대비 성능 우선)
const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  super_admin: { "*": ["*"] },
  manager: {
    products: ["create", "read", "update", "delete"],
    orders: ["create", "read", "update", "delete"],
    customers: ["read", "update"],
    shipping: ["create", "read", "update"],
    promotions: ["create", "read", "update", "delete"],
    reports: ["read"],
  },
  staff: {
    products: ["read"],
    orders: ["read"],
    customers: ["read"],
    shipping: ["read"],
    promotions: ["read"],
  },
};

export function hasPermission(
  role: string,
  resource: string,
  action: string
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // super_admin: 전체 접근
  if (perms["*"]?.includes("*")) return true;

  const allowed = perms[resource];
  if (!allowed) return false;

  return allowed.includes(action) || allowed.includes("*");
}

export async function requireAuth(): Promise<{ id: string; role: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const role = (session.user as { role?: string }).role ?? "";

  return { id: session.user.id, role };
}

export async function requirePermission(
  resource: string,
  action: string
): Promise<{ id: string; role: string }> {
  const adminUser = await requireAuth();

  if (!hasPermission(adminUser.role, resource, action)) {
    throw new Error("권한이 없습니다.");
  }

  return adminUser;
}
