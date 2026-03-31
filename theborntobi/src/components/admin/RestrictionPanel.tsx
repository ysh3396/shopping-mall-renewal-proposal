"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleCategoryRestriction, updateRestrictionMode } from "@/app/(admin)/admin/actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isRestricted: boolean;
}

interface RestrictionPanelProps {
  restrictionMode: string;
  categories: Category[];
}

const modeConfig = {
  NONE: {
    label: "정상 운영",
    indicator: "bg-green-500",
    indicatorText: "text-green-700",
    indicatorBg: "bg-green-50 border-green-200",
    description: "모든 카테고리 정상 운영 중",
  },
  RESTRICTED: {
    label: "제한 운영",
    indicator: "bg-yellow-500",
    indicatorText: "text-yellow-700",
    indicatorBg: "bg-yellow-50 border-yellow-200",
    description: "일부 카테고리 접근 제한 중",
  },
  MAINTENANCE: {
    label: "점검 모드",
    indicator: "bg-red-500",
    indicatorText: "text-red-700",
    indicatorBg: "bg-red-50 border-red-200",
    description: "사이트 전체 점검 중 (고객 접근 차단)",
  },
};

export function RestrictionPanel({ restrictionMode, categories }: RestrictionPanelProps) {
  const [currentMode, setCurrentMode] = useState(restrictionMode);
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.id, c.isRestricted]))
  );
  const [isPending, startTransition] = useTransition();

  const config = modeConfig[currentMode as keyof typeof modeConfig] ?? modeConfig.NONE;

  function handleModeChange(mode: string) {
    setCurrentMode(mode);
    startTransition(async () => {
      await updateRestrictionMode(mode);
    });
  }

  function handleCategoryToggle(categoryId: string, checked: boolean) {
    setCategoryStates((prev) => ({ ...prev, [categoryId]: checked }));
    startTransition(async () => {
      await toggleCategoryRestriction(categoryId, checked);
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">규제 킬스위치</h3>
        {isPending && (
          <span className="text-xs text-slate-400 animate-pulse">저장 중...</span>
        )}
      </div>

      {/* Current mode indicator */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border mb-4 ${config.indicatorBg}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${config.indicator} flex-shrink-0`} />
        <div>
          <p className={`text-sm font-semibold ${config.indicatorText}`}>{config.label}</p>
          <p className={`text-xs ${config.indicatorText} opacity-70`}>{config.description}</p>
        </div>
      </div>

      {/* Mode buttons */}
      <div className="flex gap-2 mb-5">
        {(["NONE", "RESTRICTED", "MAINTENANCE"] as const).map((mode) => {
          const mc = modeConfig[mode];
          const isActive = currentMode === mode;
          return (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              disabled={isPending}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${
                isActive
                  ? `${mc.indicatorBg} ${mc.indicatorText} border-current`
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {mc.label}
            </button>
          );
        })}
      </div>

      {/* Category toggles */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase mb-3">카테고리별 제한</p>
        <div className="space-y-2">
          {categories.map((category) => {
            const isRestricted = categoryStates[category.id] ?? false;
            return (
              <div
                key={category.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">{category.name}</span>
                  {isRestricted && (
                    <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
                      제한됨
                    </span>
                  )}
                </div>
                <Switch
                  checked={isRestricted}
                  onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                  disabled={isPending}
                />
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-slate-400 py-2">카테고리가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
