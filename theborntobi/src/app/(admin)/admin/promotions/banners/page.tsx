import { PageHeader } from "@/components/admin/PageHeader";
import { getBanners } from "./actions";
import { BannerClient } from "./banner-client";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await getBanners();

  return (
    <div>
      <PageHeader
        title="배너 관리"
        description={`총 ${banners.length}개의 배너`}
      />
      <BannerClient banners={banners} />
    </div>
  );
}
