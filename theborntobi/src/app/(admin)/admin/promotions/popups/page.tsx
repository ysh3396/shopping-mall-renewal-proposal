import { PageHeader } from "@/components/admin/PageHeader";
import { getPopups } from "./actions";
import { PopupClient } from "./popup-client";

export const dynamic = "force-dynamic";

export default async function PopupsPage() {
  const { popups, total } = await getPopups();

  return (
    <div>
      <PageHeader
        title="팝업 관리"
        description={`총 ${total}개의 팝업`}
      />
      <PopupClient popups={popups} />
    </div>
  );
}
