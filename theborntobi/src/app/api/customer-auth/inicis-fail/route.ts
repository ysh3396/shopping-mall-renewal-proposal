import { NextRequest } from "next/server";

// 이니시스 간편인증 실패 콜백
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const resultMsg = formData.get("resultMsg") as string;
  const error = resultMsg
    ? decodeURIComponent(resultMsg)
    : "본인인증이 취소되었습니다";

  const data = JSON.stringify({ success: false, token: "", error, name: "", phone: "" });

  return new Response(
    `<!DOCTYPE html>
<html>
<head><title>본인인증 실패</title></head>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage(${JSON.stringify(data)}, "${process.env.NEXTAUTH_URL || "http://localhost:3000"}");
  }
  window.close();
</script>
<p>${error}. 창이 자동으로 닫히지 않으면 닫아주세요.</p>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
