import { connection } from "next/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { SalesChart } from "@/components/admin/SalesChart";
import { RestrictionPanel } from "@/components/admin/RestrictionPanel";
import { DashboardOrders } from "./dashboard-orders";
import {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
  getCategories,
  getSiteConfig,
  getLast7DaysSalesData,
} from "./actions";

export default async function AdminDashboard() {
  await connection();
  const [stats, recentOrders, topProducts, categories, siteConfig, salesData] =
    await Promise.all([
      getDashboardStats(),
      getRecentOrders(10),
      getTopProducts(5),
      getCategories(),
      getSiteConfig(),
      getLast7DaysSalesData(),
    ]);
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <PageHeader title="대시보드" description={today} />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="총 매출"
          value={`₩${stats.totalRevenue.toLocaleString("ko-KR")}`}
          change={0}
          changeLabel="누적"
          icon={<span>💰</span>}
          iconBg="bg-blue-50 text-blue-500"
        />
        <StatCard
          label="이번달 주문"
          value={`${stats.monthlyOrderCount}건`}
          change={0}
          changeLabel="이번달"
          icon={<span>🛒</span>}
          iconBg="bg-green-50 text-green-500"
        />
        <StatCard
          label="신규 회원"
          value={`${stats.newCustomerCount}명`}
          change={0}
          changeLabel="이번달"
          icon={<span>✨</span>}
          iconBg="bg-purple-50 text-purple-500"
        />
        <StatCard
          label="활성 상품"
          value={`${stats.activeProductCount}개`}
          change={0}
          changeLabel="현재"
          icon={<span>📦</span>}
          iconBg="bg-cyan-50 text-cyan-500"
        />
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <SalesChart data={salesData} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">인기 상품 TOP 5</h3>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div
                key={product.productId}
                className="flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {product.productName}
                  </p>
                  <p className="text-xs text-slate-400">{product.categoryName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-700">
                    {product.orderCount}건
                  </p>
                  <p className="text-xs text-slate-400">
                    ₩{product.revenue.toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-slate-400">주문 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Restriction Panel */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <DashboardOrders orders={recentOrders as { [key: string]: unknown; id: string; orderNumber: string; customerName: string; productSummary: string; totalAmount: number; status: string; createdAt: string }[]} />
        </div>
        <div>
          <RestrictionPanel
            restrictionMode={siteConfig?.restrictionMode ?? "NONE"}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
