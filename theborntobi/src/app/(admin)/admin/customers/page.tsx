import { PageHeader } from "@/components/admin/PageHeader";
import { getCustomers, getCustomerGrades } from "./actions";
import { CustomerListClient } from "./customer-list-client";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    gradeId?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const gradeId = params.gradeId || "";
  const page = Number(params.page) || 1;

  const [customersData, grades] = await Promise.all([
    getCustomers({ search, gradeId, page, limit: 20 }),
    getCustomerGrades(),
  ]);

  return (
    <div>
      <PageHeader
        title="고객 관리"
        description={`총 ${customersData.total}명의 고객`}
      />
      <CustomerListClient
        customers={customersData.items}
        grades={grades}
        total={customersData.total}
        page={customersData.page}
        totalPages={customersData.totalPages}
        limit={customersData.limit}
        initialSearch={search}
        initialGradeId={gradeId}
      />
    </div>
  );
}
