import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";

// KG이니시스 간편인증 MID & API Key
const INICIS_MID = process.env.INICIS_MID || "CICbornto0";
const INICIS_API_KEY = process.env.INICIS_API_KEY || "a3d5835c992dcc657e8671336eefe836";
const MOCK_MODE = process.env.INICIS_MOCK_MODE === "true";

const AUTH_SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "theborntobi-dev-secret"
);

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

// Mock verification for development
async function mockVerification(): Promise<VerificationResult> {
  console.warn("⚠️ [MOCK] KG이니시스 본인인증 MOCK 모드 — 프로덕션에서 사용 금지");
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
export async function createVerificationToken(result: VerificationResult): Promise<string> {
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

// Get KG이니시스 popup request config
export function getInicisAuthConfig() {
  if (MOCK_MODE) {
    return { mock: true, mid: INICIS_MID };
  }

  return {
    mock: false,
    mid: INICIS_MID,
    apiKey: INICIS_API_KEY,
    popupUrl: "https://cert.inicis.com/pub/v3/auth.jsp",
    returnUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/customer-auth/verify-callback`,
  };
}

// Process verification callback from KG이니시스
export async function processVerification(callbackData: Record<string, string>): Promise<VerificationResult> {
  if (MOCK_MODE) {
    return mockVerification();
  }

  // KG이니시스 간편인증 응답 처리
  // 실제 인증 결과에서 CI, 이름, 생년월일, 전화번호 추출
  const ci = callbackData.CI || callbackData.ci || "";
  const name = callbackData.userName || callbackData.name || "";
  const birthday = callbackData.userBirthday || callbackData.birthday || "";
  const phone = callbackData.userPhone || callbackData.phone || "";

  if (!ci || !name || !birthday) {
    return {
      success: false,
      name: "",
      birthday: "",
      phone: "",
      ciHash: "",
      isAdult: false,
    };
  }

  const age = calculateKoreanAge(birthday);

  return {
    success: true,
    name,
    birthday,
    phone,
    ciHash: hashCI(ci),
    isAdult: age >= 19,
  };
}

export { MOCK_MODE as isInicisTestMode };
