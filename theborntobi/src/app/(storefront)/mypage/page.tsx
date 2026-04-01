import Link from "next/link";

export default function MyPage() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
      <div className="mb-6">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">마이페이지</h1>
        <p className="text-gray-500 text-base mb-1">마이페이지는 준비 중입니다.</p>
        <p className="text-gray-500 text-sm">
          주문 조회가 필요하시면 고객센터{" "}
          <a
            href="tel:010-8514-2001"
            className="font-semibold text-gray-900 hover:underline"
          >
            010-8514-2001
          </a>
          로 연락해 주세요.
        </p>
      </div>
      <Link
        href="/"
        className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
