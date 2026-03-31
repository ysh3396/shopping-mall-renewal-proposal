"use client";

interface DayData {
  label: string;
  amount: number;
}

interface SalesChartProps {
  data: DayData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;
  const peak = data.reduce(
    (best, d) => (d.amount > best.amount ? d : best),
    data[0] ?? { label: "-", amount: 0 }
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">최근 7일 매출</h3>
        <span className="text-xs text-slate-400">단위: 원</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-36">
        {data.map((day, i) => {
          const heightPct = max > 0 ? (day.amount / max) * 100 : 0;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <span className="text-[10px] text-slate-400">
                {day.amount > 0
                  ? `${(day.amount / 1000).toFixed(0)}K`
                  : ""}
              </span>
              <div className="w-full flex items-end" style={{ height: "96px" }}>
                <div
                  className="w-full rounded-t bg-blue-500 transition-all"
                  style={{ height: `${Math.max(heightPct, day.amount > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{day.label}</span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
        <div>
          <span className="text-xs text-slate-400">일 평균</span>
          <p className="text-sm font-semibold text-slate-700">
            ₩{avg.toLocaleString("ko-KR")}
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-400">최고 매출일</span>
          <p className="text-sm font-semibold text-slate-700">
            {peak.label} (₩{peak.amount.toLocaleString("ko-KR")})
          </p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-slate-400">7일 합계</span>
          <p className="text-sm font-semibold text-blue-600">
            ₩{total.toLocaleString("ko-KR")}
          </p>
        </div>
      </div>
    </div>
  );
}
