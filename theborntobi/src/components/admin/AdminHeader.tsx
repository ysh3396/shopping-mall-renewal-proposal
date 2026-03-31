"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="상품, 주문, 회원 검색..."
            className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            관
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-700 leading-tight">
              관리자
            </div>
            <div className="text-xs text-slate-400 leading-tight">
              최고 관리자
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
