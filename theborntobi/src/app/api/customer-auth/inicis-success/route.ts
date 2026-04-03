import { NextRequest } from "next/server";
import {
  processVerification,
  createVerificationToken,
} from "@/lib/inicis-auth";
import { db } from "@/lib/db";

// STEP 2: 이니시스 간편인증 성공 콜백 (POST from 이니시스 popup)
// 이니시스가 이 URL로 resultCode, authRequestUrl, txId, token을 POST함
// 이 페이지는 팝업 내에서 렌더되며, window.opener에게 결과를 전달 후 팝업 닫기
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const resultCode = formData.get("resultCode") as string;
  const authRequestUrl = formData.get("authRequestUrl") as string;
  const txId = formData.get("txId") as string;

  if (resultCode !== "0000") {
    const resultMsg = formData.get("resultMsg") as string;
    return new Response(renderPopupResult(false, "", decodeURIComponent(resultMsg || "인증에 실패했습니다")), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // STEP 3: Server-to-server — 이니시스에서 사용자 정보 조회
  const result = await processVerification({ authRequestUrl, txId });

  if (!result.success) {
    return new Response(renderPopupResult(false, "", "본인인증 정보를 가져오지 못했습니다"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!result.isAdult) {
    return new Response(renderPopupResult(false, "", "19세 미만은 가입할 수 없습니다"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // CI 중복 체크
  const existingCustomer = await db.customer.findFirst({
    where: { ageVerifyCI: result.ciHash },
    select: { id: true },
  });

  if (existingCustomer) {
    return new Response(renderPopupResult(false, "", "이미 가입된 본인인증 정보입니다"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // 인증 토큰 생성
  const verificationToken = await createVerificationToken(result);

  return new Response(
    renderPopupResult(true, verificationToken, "", result.name, result.phone),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// 팝업 내에서 렌더되는 HTML — opener에게 postMessage로 결과 전달 후 닫기
function renderPopupResult(
  success: boolean,
  token: string,
  error: string,
  name?: string,
  phone?: string
) {
  const data = JSON.stringify({ success, token, error, name, phone });
  return `<!DOCTYPE html>
<html>
<head><title>본인인증 결과</title></head>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage(${JSON.stringify(data)}, "${process.env.NEXTAUTH_URL || "http://localhost:3000"}");
  }
  window.close();
</script>
<p>인증 처리 중... 창이 자동으로 닫히지 않으면 닫아주세요.</p>
</body>
</html>`;
}
