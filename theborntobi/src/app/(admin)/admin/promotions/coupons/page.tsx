import { PageHeader } from "@/components/admin/PageHeader";
import { getCoupons } from "./actions";
import { CouponClient } from "./coupon-client";

export const dynamic = "force-dynamic";

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Number(params.page) || 1;

  const data = await getCoupons({ search, page, limit: 20 });

  return (
    <div>
      <PageHeader
        title="쿠폰 관리"
        description={`총 ${data.total}개의 쿠폰`}
      />
      <CouponClient
        coupons={data.items}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        limit={data.limit}
        initialSearch={search}
      />
    </div>
  );
}
