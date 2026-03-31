"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

interface FilterToolbarProps {
  children?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function FilterToolbar({
  children,
  searchPlaceholder = "검색...",
  onSearch,
}: FilterToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>
      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
