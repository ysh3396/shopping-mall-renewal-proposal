import { PageHeader } from "@/components/admin/PageHeader";
import {
  getReturnRequests,
  getExchangeRequests,
  getRefunds,
  getReturnStats,
} from "./actions";
import { ReturnsClient } from "./returns-client";

export const dynamic = "force-dynamic";

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const tab = params.tab || "returns";
  const status = params.status || "";
  const search = params.search || "";
  const page = Number(params.page) || 1;

  const [returnData, exchangeData, refundData, stats] = await Promise.all([
    getReturnRequests({ status, search, page, limit: 20 }),
    getExchangeRequests({ status, search, page, limit: 20 }),
    getRefunds({ status, search, page, limit: 20 }),
    getReturnStats(),
  ]);

  return (
    <div>
      <PageHeader
        title="반품/교환 관리"
        description={`반품 대기 ${stats.pendingReturns}건 · 교환 대기 ${stats.pendingExchanges}건 · 환불 대기 ${stats.pendingRefunds}건`}
      />
      <ReturnsClient
        returnData={returnData}
        exchangeData={exchangeData}
        refundData={refundData}
        stats={stats}
        initialTab={tab}
        initialStatus={status}
        initialSearch={search}
      />
    </div>
  );
}
