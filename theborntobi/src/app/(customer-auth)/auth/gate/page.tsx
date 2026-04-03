import Link from "next/link";

export const metadata = {
  title: "성인인증 - 더본투비",
};

export default function AgeGatePage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-6 py-8 text-center">
          <div className="text-5xl font-bold text-white mb-2">19</div>
          <p className="text-red-100 text-sm font-medium">
            청소년 유해매체물
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              본 사이트는{" "}
              <strong className="text-red-600">청소년 유해매체물</strong>로서{" "}
              「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및{" "}
              「청소년 보호법」의 규정에 의하여{" "}
              <strong className="text-red-600">
                19세 미만의 청소년은 이용할 수 없습니다.
              </strong>
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center mb-6">
            본 사이트의 상품은 전자담배 관련 기기 및 액상으로,
            <br />
            「담배사업법」에 의해 19세 미만에게 판매가 금지되어 있습니다.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/register"
              className="block w-full bg-white text-gray-900 text-center py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              회원가입
            </Link>
            <a
              href="https://www.google.com"
              className="block w-full text-center py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              19세 미만 나가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
