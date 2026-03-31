import { getSiteConfig } from "./actions";
import { SettingsClient } from "./settings-client";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await getSiteConfig();

  return (
    <div>
      <PageHeader title="쇼핑몰 설정" description="사이트 기본 정보 및 운영 설정" />
      <SettingsClient config={config} />
    </div>
  );
}
