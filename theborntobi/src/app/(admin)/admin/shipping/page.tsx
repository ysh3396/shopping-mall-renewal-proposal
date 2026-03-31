import { PageHeader } from "@/components/admin/PageHeader";
import { getShippingOrders, getShippingStats } from "./actions";
import { ShippingClient } from "./shipping-client";

export const dynamic = "force-dynamic";

export default async function ShippingPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Number(params.page) || 1;

  const [ordersData, stats] = await Promise.all([
    getShippingOrders({ search, page, limit: 50 }),
    getShippingStats(),
  ]);

  const preparingOrders = ordersData.items.filter((o) => o.status === "PREPARING");
  const shippedOrders = ordersData.items.filter((o) => o.status === "SHIPPED");

  return (
    <div>
      <PageHeader
        title="배송 관리"
        description={`배송대기 ${stats.pending}건 · 배송중 ${stats.inTransit}건 · 오늘 배달완료 ${stats.deliveredToday}건`}
      />
      <ShippingClient
        preparingOrders={preparingOrders}
        shippedOrders={shippedOrders}
        total={ordersData.total}
        page={ordersData.page}
        totalPages={ordersData.totalPages}
        limit={ordersData.limit}
        initialSearch={search}
      />
    </div>
  );
}
