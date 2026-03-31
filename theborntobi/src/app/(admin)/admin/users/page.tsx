import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminUsers, getRoles } from "./actions";
import { AdminUsersClient } from "./admin-users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Number(params.page) || 1;

  const [data, roles] = await Promise.all([
    getAdminUsers({ search, page, limit: 20 }),
    getRoles(),
  ]);

  return (
    <div>
      <PageHeader
        title="관리자 관리"
        description={`총 ${data.total}명의 관리자`}
      />
      <AdminUsersClient
        users={data.items}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        limit={data.limit}
        initialSearch={search}
        roles={roles}
      />
    </div>
  );
}
