import { PageHeader } from "@/components/admin/PageHeader";
import { getAuditLogs, getAuditLogFilterOptions } from "./actions";
import { AuditLogClient } from "./audit-log-client";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    resource?: string;
    adminUserId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const action = params.action || "";
  const resource = params.resource || "";
  const adminUserId = params.adminUserId || "";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";
  const page = Number(params.page) || 1;

  const [logsData, filterOptions] = await Promise.all([
    getAuditLogs({ action, resource, adminUserId, dateFrom, dateTo, page, limit: 50 }),
    getAuditLogFilterOptions(),
  ]);

  return (
    <div>
      <PageHeader
        title="감사 로그"
        description={`총 ${logsData.total}건의 활동 기록`}
      />
      <AuditLogClient
        logs={logsData.items}
        total={logsData.total}
        page={logsData.page}
        totalPages={logsData.totalPages}
        limit={logsData.limit}
        filterOptions={filterOptions}
        initialAction={action}
        initialResource={resource}
        initialAdminUserId={adminUserId}
        initialDateFrom={dateFrom}
        initialDateTo={dateTo}
      />
    </div>
  );
}
