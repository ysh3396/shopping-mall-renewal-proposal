import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

// KG이니시스 간편인증
const INICIS_MID = process.env.INICIS_MID || "CICbornto0";
const INICIS_API_KEY =
  process.env.INICIS_API_KEY || "a3d5835c992dcc657e8671336eefe836";
const MOCK_MODE = process.env.INICIS_MOCK_MODE === "true";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

const AUTH_SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "theborntobi-dev-secret"
);

// 이니시스 간편인증 API endpoint (test & production 동일)
const INICIS_AUTH_URL = "https://sa.inicis.com/auth";

export interface VerificationResult {
  success: boolean;
  name: string;
  birthday: string;
  phone: string;
  ciHash: string;
  isAdult: boolean;
}

export function hashCI(ci: string): string {
  return createHash("sha256").update(ci).digest("hex");
}

function calculateKoreanAge(birthday: string): number {
  const birthYear = parseInt(birthday.substring(0, 4), 10);
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

// Generate unique transaction ID (max 20 bytes)
export function generateMTxId(): string {
  return randomBytes(10).toString("hex").slice(0, 20);
}

// authHash = SHA256(mid + mTxId + apiKey)
export function generateAuthHash(mTxId: string): string {
  return createHash("sha256")
    .update(INICIS_MID + mTxId + INICIS_API_KEY)
    .digest("hex");
}

// STEP 1: Generate auth request params for client-side form POST
export function buildAuthRequestParams(mTxId: string) {
  return {
    mid: INICIS_MID,
    reqSvcCd: "01", // 간편인증
    mTxId,
    successUrl: `${BASE_URL}/api/customer-auth/inicis-success`,
    failUrl: `${BASE_URL}/api/customer-auth/inicis-fail`,
    authHash: generateAuthHash(mTxId),
    flgFixedUser: "N", // 특정 사용자 지정 안 함 (누구나 인증 가능)
    reservedMsg: "",
  };
}

// STEP 3: Server-to-server — exchange txId for user data
export async function fetchInicisUserData(
  authRequestUrl: string,
  txId: string
): Promise<VerificationResult> {
  const res = await fetch(authRequestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify({ mid: INICIS_MID, txId }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    console.error("[INICIS] authRequestUrl fetch failed:", res.status);
    return failResult();
  }

  const data = await res.json();
  console.log("[INICIS] Server-to-server response:", JSON.stringify(data, null, 2));

  if (data.resultCode !== "0000") {
    console.error("[INICIS] resultCode:", data.resultCode, data.resultMsg);
    return failResult();
  }

  const userName = decodeField(data.userName);
  const userPhone = decodeField(data.userPhone);
  const userBirthday = decodeField(data.userBirthday);
  const userCi = decodeField(data.userCi);

  console.log("[INICIS] Decoded — name:", userName, "birthday:", userBirthday, "ci length:", userCi?.length);

  if (!userCi || !userName || !userBirthday) {
    return failResult();
  }

  const age = calculateKoreanAge(userBirthday);

  return {
    success: true,
    name: userName,
    birthday: userBirthday,
    phone: userPhone,
    ciHash: hashCI(userCi),
    isAdult: age >= 19,
  };
}

// Decode field — handles plain text, URL-encoded, or Base64
function decodeField(value: string | undefined): string {
  if (!value) return "";
  try {
    // Try URL decode first
    const decoded = decodeURIComponent(value);
    return decoded;
  } catch {
    // Try Base64
    try {
      return Buffer.from(value, "base64").toString("utf-8");
    } catch {
      return value;
    }
  }
}

function failResult(): VerificationResult {
  return {
    success: false,
    name: "",
    birthday: "",
    phone: "",
    ciHash: "",
    isAdult: false,
  };
}

// Mock verification for development
async function mockVerification(): Promise<VerificationResult> {
  console.warn(
    "⚠️ [MOCK] KG이니시스 본인인증 MOCK 모드 — 프로덕션에서 사용 금지"
  );
  return {
    success: true,
    name: "테스트",
    birthday: "19900101",
    phone: "01012345678",
    ciHash: hashCI("MOCK_CI_TEST_" + Date.now()),
    isAdult: true,
  };
}

// Create signed verification token (jose JWT, 10min expiry)
export async function createVerificationToken(
  result: VerificationResult
): Promise<string> {
  return new SignJWT({
    name: result.name,
    phone: result.phone,
    isAdult: result.isAdult,
    ciHash: result.ciHash,
    purpose: "registration",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .setIssuedAt()
    .sign(AUTH_SECRET_KEY);
}

// Verify signed verification token
export async function verifyVerificationToken(token: string): Promise<{
  name: string;
  phone: string;
  isAdult: boolean;
  ciHash: string;
  purpose: string;
}> {
  const { payload } = await jwtVerify(token, AUTH_SECRET_KEY);
  return payload as {
    name: string;
    phone: string;
    isAdult: boolean;
    ciHash: string;
    purpose: string;
  };
}

// Process verification — mock or real callback
export async function processVerification(
  callbackData: Record<string, string>
): Promise<VerificationResult> {
  if (MOCK_MODE) {
    return mockVerification();
  }

  // Real 이니시스 콜백 처리: authRequestUrl로 서버간 통신
  const authRequestUrl = callbackData.authRequestUrl;
  const txId = callbackData.txId;

  if (!authRequestUrl || !txId) {
    return failResult();
  }

  return fetchInicisUserData(authRequestUrl, txId);
}

export { MOCK_MODE as isInicisTestMode, INICIS_AUTH_URL };
