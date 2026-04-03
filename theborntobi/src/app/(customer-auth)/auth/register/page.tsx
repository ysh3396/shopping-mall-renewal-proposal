"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  registerAction,
  checkUsernameAction,
  checkEmailAction,
  processVerificationAction,
} from "../actions";

type Step = 1 | 2 | 3;

// 이용약관 전문
const TERMS_OF_SERVICE = `제1조 목적

본 이용약관은 "더본투비"의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.

제2조 용어의 정의

본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.

1. 회원 : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.
2. 이용계약 : 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.
3. 회원 아이디(이하 "ID") : 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다.
4. 비밀번호 : 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.
5. 운영자 : 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다.
6. 해지 : 회원이 이용계약을 해약하는 것을 말합니다.

제3조 약관 외 준칙

운영자는 필요한 경우 별도로 운영정책을 공지 안내할 수 있으며, 본 약관과 운영정책이 중첩될 경우 운영정책이 우선 적용됩니다.

제4조 이용계약 체결

1. 이용계약은 회원으로 등록하여 사이트를 이용하려는 자의 본 약관 내용에 대한 동의와 가입신청에 대하여 운영자의 이용승낙으로 성립합니다.
2. 회원으로 등록하여 서비스를 이용하려는 자는 사이트 가입신청 시 본 약관을 읽고 아래에 있는 "동의합니다"를 선택하는 것으로 본 약관에 대한 동의 의사 표시를 합니다.

제5조 서비스 이용 신청

1. 회원으로 등록하여 사이트를 이용하려는 이용자는 사이트에서 요청하는 제반정보(이용자ID,비밀번호, 닉네임 등)를 제공해야 합니다.
2. 타인의 정보를 도용하거나 허위의 정보를 등록하는 등 본인의 진정한 정보를 등록하지 않은 회원은 사이트 이용과 관련하여 아무런 권리를 주장할 수 없으며, 관계 법령에 따라 처벌받을 수 있습니다.

제6조 개인정보처리방침

사이트 및 운영자는 회원가입 시 제공한 개인정보 중 비밀번호를 가지고 있지 않으며 이와 관련된 부분은 사이트의 개인정보처리방침을 따릅니다.

제7조 운영자의 의무

1. 운영자는 이용회원으로부터 제기되는 의견이나 불만이 정당하다고 인정할 경우에는 가급적 빨리 처리하여야 합니다.
2. 운영자는 계속적이고 안정적인 사이트 제공을 위하여 설비에 장애가 생기거나 유실된 때에는 이를 지체 없이 수리 또는 복구할 수 있도록 사이트에 요구할 수 있습니다.

제8조 회원의 의무

1. 회원은 본 약관에서 규정하는 사항과 운영자가 정한 제반 규정, 공지사항 및 운영정책 등 사이트가 공지하는 사항 및 관계 법령을 준수하여야 합니다.
2. 회원은 사이트의 명시적 동의가 없는 한 서비스의 이용 권한, 기타 이용계약상 지위를 타인에게 양도, 증여할 수 없으며, 이를 담보로 제공할 수 없습니다.

제9조 서비스 이용 시간

서비스 이용 시간은 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴 1일 24시간을 원칙으로 합니다.

제10조 서비스 이용 해지

회원이 사이트와의 이용계약을 해지하고자 하는 경우에는 회원 본인이 온라인을 통하여 등록해지 신청을 하여야 합니다.

제11조 서비스 이용 제한

회원은 다음 각호에 해당하는 행위를 하여서는 아니 되며 해당 행위를 한 경우에 사이트는 회원의 서비스 이용 제한 및 적법한 조치를 할 수 있습니다.
1. 회원 가입시 혹은 가입 후 정보 변경 시 허위 내용을 등록하는 행위
2. 타인의 사이트 이용을 방해하거나 정보를 도용하는 행위
3. 사이트의 운영진, 직원 또는 관계자를 사칭하는 행위

제15조 손해배상

본 사이트의 발생한 모든 민, 형법상 책임은 회원 본인에게 1차적으로 있습니다.

제16조 면책

운영자는 회원이 사이트의 서비스 제공으로부터 기대되는 이익을 얻지 못하였거나 서비스 자료에 대한 취사선택 또는 이용으로 발생하는 손해 등에 대해서는 책임이 면제됩니다.

부칙

이 약관은 사이트 개설일부터 시행합니다.`;

const PRIVACY_POLICY = `본투비베이퍼(이하 '더본투비'라 한다)는 개인정보 보호법 제30조에 따라 정보 주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리지침을 수립, 공개합니다.

제1조 (개인정보의 처리목적)

회사는 다음의 목적을 위하여 개인정보를 처리합니다.

1. 홈페이지 회원 가입 및 관리 - 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별/인증, 회원자격 유지/관리, 서비스 부정 이용 방지, 각종 고지/통지, 고충 처리 등을 목적으로 개인정보를 처리합니다.
2. 재화 또는 서비스 제공 - 물품 배송, 서비스 제공, 계약서 및 청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금 결제 및 정산 등을 목적으로 개인정보를 처리합니다.
3. 고충 처리 - 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락/통지, 처리 결과 통보 등의 목적으로 개인정보를 처리합니다.

제2조 (개인정보의 처리 및 보유기간)

1. 회사는 법령에 따른 개인정보 보유, 이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유, 이용 기간 내에서 개인정보를 처리, 보유합니다.
2. 홈페이지 회원 가입 및 관리 : 탈퇴 시까지
3. 재화 또는 서비스 제공 : 공급완료 및 요금결제/정산 완료 시까지 (전자상거래법에 따라 표시/광고 기록 6월, 계약/청약철회/대금결제/재화공급기록 5년, 소비자 불만/분쟁처리 기록 3년)

제3조 (개인정보의 제3자 제공)

회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.

제5조 (이용자 및 법정대리인의 권리와 그 행사 방법)

정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다: 개인정보 열람 요구, 오류 등이 있을 경우 정정 요구, 삭제요구, 처리정지 요구

제6조 (처리하는 개인정보 항목)

회사는 다음의 개인정보 항목을 처리하고 있습니다.
1. 회원 가입 및 관리 - 필수항목: 성명, 생년월일, 아이디, 비밀번호, 주소, 전화번호, 이메일주소
2. 재화 또는 서비스 제공 - 필수항목: 성명, 아이디, 비밀번호, 주소, 전화번호, 이메일주소
3. 인터넷 서비스 이용과정에서 자동 수집되는 항목: IP주소, 쿠키, 서비스 이용기록, 방문기록

제7조 (개인정보의 파기)

회사는 개인정보 보유 기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.

제8조 (개인정보의 안전성 확보조치)

회사는 개인정보의 안전성 확보를 위해 관리적 조치(내부관리계획 수립), 기술적 조치(접근 권한 관리, 암호화, 보안프로그램 설치), 물리적 조치(접근통제)를 하고 있습니다.

제12조 (권익침해 구제 방법)

정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.
- 개인정보 침해신고센터 (한국인터넷진흥원) - privacy.kisa.or.kr / 전화 118
- 개인정보 분쟁조정위원회 - www.kopico.go.kr / 전화 1833-6972

이 개인정보 처리방침은 2026년 4월 3일부터 적용됩니다.`;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Terms
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // Step 2: Verification
  const [verificationToken, setVerificationToken] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verified, setVerified] = useState(false);

  // Step 3: Form validation
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const allTermsAgreed = termsAgreed && privacyAgreed;

  function handleAllAgree(checked: boolean) {
    setTermsAgreed(checked);
    setPrivacyAgreed(checked);
  }

  // Debounced username check
  const checkUsername = useCallback(
    debounce(async (value: string) => {
      if (value.length < 4) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus("checking");
      const result = await checkUsernameAction(value);
      setUsernameStatus(result.available ? "available" : "taken");
    }, 500),
    []
  );

  // Debounced email check
  const checkEmail = useCallback(
    debounce(async (value: string) => {
      if (!value.includes("@")) {
        setEmailStatus("idle");
        return;
      }
      setEmailStatus("checking");
      const result = await checkEmailAction(value);
      setEmailStatus(result.available ? "available" : "taken");
    }, 500),
    []
  );

  async function handleVerification() {
    setLoading(true);
    setError("");

    try {
      // In mock mode, simulate verification
      const result = await processVerificationAction({
        mock: "true",
      });

      if ("error" in result && result.error) {
        setError(result.error);
      } else if ("success" in result && result.success) {
        setVerificationToken(result.token!);
        setVerifiedName(result.name!);
        setVerifiedPhone(result.phone || "");
        setVerified(true);
      }
    } catch {
      setError("본인인증 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("verificationToken", verificationToken);
    formData.set("name", verifiedName);
    formData.set("phone", verifiedPhone);

    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.loginRequired) {
      router.push("/auth/login");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step > s ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {step === 1 && "약관 동의"}
            {step === 2 && "본인 인증"}
            {step === 3 && "정보 입력"}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        {/* Step 1: Terms */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={allTermsAgreed}
                onChange={(e) => handleAllAgree(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="font-medium text-gray-900">전체 동의</span>
            </label>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <label className="flex items-center gap-3 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">
                  이용약관 동의 <span className="text-red-500">(필수)</span>
                </span>
              </label>
              <div className="mx-3 mb-3 max-h-40 overflow-y-auto bg-gray-50 rounded p-3 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {TERMS_OF_SERVICE}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <label className="flex items-center gap-3 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">
                  개인정보 수집 및 이용 동의{" "}
                  <span className="text-red-500">(필수)</span>
                </span>
              </label>
              <div className="mx-3 mb-3 max-h-40 overflow-y-auto bg-gray-50 rounded p-3 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {PRIVACY_POLICY}
              </div>
            </div>

            <button
              onClick={() => {
                if (allTermsAgreed) {
                  setError("");
                  setStep(2);
                } else {
                  setError("모든 약관에 동의해주세요.");
                }
              }}
              disabled={!allTermsAgreed}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: Identity Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              {verified ? (
                <div>
                  <p className="text-green-600 font-medium mb-1">
                    본인인증이 완료되었습니다
                  </p>
                  <p className="text-sm text-gray-500">
                    인증 이름: {verifiedName}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium mb-1">
                    본인인증을 진행해주세요
                  </p>
                  <p className="text-sm text-gray-500">
                    KG이니시스 간편인증으로 본인확인을 진행합니다
                  </p>
                </div>
              )}
            </div>

            {!verified && (
              <button
                onClick={handleVerification}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "인증 진행 중..." : "본인인증하기"}
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                onClick={() => {
                  if (verified) {
                    setError("");
                    setStep(3);
                  } else {
                    setError("본인인증을 완료해주세요.");
                  }
                }}
                disabled={!verified}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Registration Form */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                아이디 <span className="text-red-500">*</span>
              </label>
              <input
                name="username"
                type="text"
                required
                minLength={4}
                maxLength={20}
                pattern="[a-zA-Z0-9]+"
                autoComplete="username"
                onChange={(e) => checkUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="4~20자 영문, 숫자"
              />
              {usernameStatus === "checking" && (
                <p className="text-xs text-gray-500 mt-1">확인 중...</p>
              )}
              {usernameStatus === "available" && (
                <p className="text-xs text-green-600 mt-1">사용 가능한 아이디입니다</p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-xs text-red-600 mt-1">이미 사용중인 아이디입니다</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="8자 이상, 영문+숫자 포함"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                name="passwordConfirm"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                onChange={(e) => checkEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="example@email.com"
              />
              {emailStatus === "checking" && (
                <p className="text-xs text-gray-500 mt-1">확인 중...</p>
              )}
              {emailStatus === "available" && (
                <p className="text-xs text-green-600 mt-1">사용 가능한 이메일입니다</p>
              )}
              {emailStatus === "taken" && (
                <p className="text-xs text-red-600 mt-1">이미 사용중인 이메일입니다</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                name="name"
                type="text"
                value={verifiedName}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">본인인증 정보가 자동 입력됩니다</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                name="address1"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="주소"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상세주소 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                name="address2"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="상세주소"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추천인코드 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                name="referralCode"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="추천인코드가 있다면 입력하세요"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading || usernameStatus === "taken" || emailStatus === "taken"}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "가입 중..." : "회원가입 완료"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/auth/gate"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple debounce utility
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}
