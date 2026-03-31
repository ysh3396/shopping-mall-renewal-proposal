import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: ReactNode;
  iconBg: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  iconBg,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
            iconBg
          )}
        >
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        <span
          className={cn(
            "text-xs font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-slate-400">{changeLabel}</span>
      </div>
    </div>
  );
}
