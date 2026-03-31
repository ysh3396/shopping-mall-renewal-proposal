"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Tag,
  Image,
  BarChart3,
  Settings,
  Shield,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "메인 메뉴",
    items: [
      {
        label: "대시보드",
        href: "/admin",
        icon: <LayoutDashboard className="size-4" />,
      },
      {
        label: "상품 관리",
        href: "/admin/products",
        icon: <Package className="size-4" />,
      },
      {
        label: "주문 관리",
        href: "/admin/orders",
        icon: <ShoppingCart className="size-4" />,
        badge: 12,
      },
      {
        label: "배송 관리",
        href: "/admin/shipping",
        icon: <Truck className="size-4" />,
      },
    ],
  },
  {
    title: "운영",
    items: [
      {
        label: "고객 관리",
        href: "/admin/customers",
        icon: <Users className="size-4" />,
      },
      {
        label: "프로모션",
        href: "/admin/promotions/coupons",
        icon: <Tag className="size-4" />,
      },
      {
        label: "배너/팝업",
        href: "/admin/promotions/banners",
        icon: <Image className="size-4" />,
      },
    ],
  },
  {
    title: "설정",
    items: [
      {
        label: "매출/리포트",
        href: "/admin/reports",
        icon: <BarChart3 className="size-4" />,
      },
      {
        label: "샵 설정",
        href: "/admin/settings",
        icon: <Settings className="size-4" />,
      },
      {
        label: "관리자",
        href: "/admin/users",
        icon: <Shield className="size-4" />,
      },
      {
        label: "감사 로그",
        href: "/admin/audit-logs",
        icon: <FileText className="size-4" />,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 bg-slate-800 flex flex-col shrink-0 shadow-xl">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            DB
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              더본투비
            </div>
            <div className="text-[10px] text-slate-400 leading-tight tracking-wide uppercase">
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 mt-4 first:mt-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                {section.title}
              </span>
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
            관
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              관리자
            </div>
            <div className="text-xs text-slate-400 truncate">
              admin@theborntobi.com
            </div>
          </div>
          <button
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
