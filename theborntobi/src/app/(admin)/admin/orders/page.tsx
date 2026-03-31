import { PageHeader } from "@/components/admin/PageHeader";
import { getOrders, getOrderStats } from "./actions";
import { OrderListClient } from "./order-list-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = Number(params.page) || 1;

  const [ordersData, stats] = await Promise.all([
    getOrders({ search, status, page, limit: 20 }),
    getOrderStats(),
  ]);

  return (
    <div>
      <PageHeader
        title="주문 관리"
        description={`총 ${ordersData.total}건의 주문`}
      />

      <OrderListClient
        orders={ordersData.items}
        total={ordersData.total}
        page={ordersData.page}
        totalPages={ordersData.totalPages}
        limit={ordersData.limit}
        initialSearch={search}
        initialStatus={status}
        stats={stats}
      />
    </div>
  );
}
