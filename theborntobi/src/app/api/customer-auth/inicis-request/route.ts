import { NextResponse } from "next/server";
import {
  generateMTxId,
  buildAuthRequestParams,
  isInicisTestMode,
  INICIS_AUTH_URL,
} from "@/lib/inicis-auth";

// STEP 1: 클라이언트가 팝업 열기 전에 호출 — auth params 생성
export async function POST() {
  if (isInicisTestMode) {
    return NextResponse.json({ mock: true });
  }

  const mTxId = generateMTxId();
  const params = buildAuthRequestParams(mTxId);

  return NextResponse.json({
    mock: false,
    actionUrl: INICIS_AUTH_URL,
    params,
  });
}
