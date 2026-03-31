export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      {/* Info strip */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="flex justify-center mb-2">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-bold">빠른 배송</p>
            <p className="text-xs text-gray-400 mt-0.5">오후 2시 이전 결제 시 당일 발송</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-sm font-bold">정품 보장</p>
            <p className="text-xs text-gray-400 mt-0.5">100% 정품만 판매합니다</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <p className="text-sm font-bold">쉬운 교환/반품</p>
            <p className="text-xs text-gray-400 mt-0.5">반품배송비 편도 3,000원</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm font-bold">1:1 고객상담</p>
            <p className="text-xs text-gray-400 mt-0.5">카카오톡 채널 운영</p>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Customer Center */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
              CUSTOMER CENTER
            </h4>
            <p className="text-2xl font-black text-gray-900 mb-1">010-8514-2001</p>
            <div className="text-xs text-gray-500 space-y-0.5 mt-2">
              <p>상담시간 <span className="text-gray-700 font-medium">오전 11:00 ~ 오후 6:00</span></p>
              <p>점심시간 <span className="text-gray-700 font-medium">오후 12:00 ~ 오후 1:00</span></p>
              <p className="text-red-500 font-medium">토/일/공휴일 휴무</p>
            </div>
            <a
              href="https://pf.kakao.com/_xlxkxmb"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded font-bold text-sm bg-[#FEE500] text-[#3A1D1D] hover:brightness-90 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.76 1.63 5.198 4.1 6.67-.18.67-.65 2.43-.74 2.8-.1.44.16.44.34.32.14-.09 2.24-1.52 3.14-2.14.37.05.74.08 1.16.08 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
              </svg>
              카카오톡 1:1 채팅
            </a>
          </div>

          {/* Account Info */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
              ACCOUNT INFO
            </h4>
            <p className="text-sm font-bold text-gray-800">신한은행 140-014-056636</p>
            <p className="text-sm text-gray-600 mt-1">
              예금주: <span className="font-semibold">(주)더본투비</span>
            </p>
            <div className="mt-4">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                DELIVERY
              </h4>
              <p className="text-sm text-gray-700">우체국 택배</p>
              <p className="text-xs text-gray-500 mt-1">
                2,500원 (50,000원 이상 무료) · 제주/도서 +1,000원
              </p>
            </div>
          </div>

          {/* Return / Exchange */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
              RETURN / EXCHANGE
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                반품배송비 <span className="font-semibold text-gray-800">편도 3,000원</span>
              </p>
              <p className="text-xs leading-relaxed text-gray-500 mt-2">
                보내실곳:<br />
                경기도 양평군 양평읍 십리길 19, 201호
              </p>
            </div>

            {/* Links */}
            <div className="mt-5 flex items-center gap-3 text-xs text-gray-500">
              <a href="/terms" className="hover:text-gray-800 transition-colors">이용약관</a>
              <span>|</span>
              <a href="/privacy" className="hover:text-gray-800 transition-colors font-semibold">개인정보처리방침</a>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-gray-300 pt-6 text-xs text-gray-400">
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <span>상호: 주식회사 더본투비</span>
            <span>대표: 왕한빈</span>
            <span>사업자등록번호: 000-00-00000</span>
            <span>통신판매업신고: 제0000-경기양평-0000호</span>
          </div>
          <p className="text-gray-400">주소: 경기도 양평군 양평읍 십리길 19, 201호</p>
          <p className="mt-2 text-gray-500">
            &copy; 2024 주식회사 더본투비 DHLUX. All rights reserved.
          </p>
        </div>
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a
          href="https://pf.kakao.com/_xlxkxmb"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-[#FEE500] text-[#3A1D1D] hover:brightness-90 transition-all"
          title="카카오톡 문의"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.76 1.63 5.198 4.1 6.67-.18.67-.65 2.43-.74 2.8-.1.44.16.44.34.32.14-.09 2.24-1.52 3.14-2.14.37.05.74.08 1.16.08 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
