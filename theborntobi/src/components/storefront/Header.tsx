"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5">
        <div className="max-w-screen-xl mx-auto px-4 flex justify-between items-center">
          <div className="flex-1 mr-8 hidden md:block overflow-hidden">
            <div className="inline-block whitespace-nowrap animate-ticker">
              &nbsp;&nbsp;&nbsp;&nbsp;전자담배 전문 쇼핑몰 더본투비 &nbsp;|&nbsp; 당일 오후 2시 이전 결제 시 당일 발송 &nbsp;|&nbsp; 우체국택배 &nbsp;|&nbsp; 배송비 2,500원 (50,000원 이상 무료) &nbsp;|&nbsp; 고객센터 010-8514-2001 &nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/mypage" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              마이페이지
            </Link>
            <Link href="/cart" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              장바구니
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
              더본투비<br />
              <span className="text-xs font-bold text-gray-400 tracking-widest">DHLUX</span>
            </span>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto hidden sm:block">
            <div className="flex border-2 border-gray-900 rounded overflow-hidden">
              <input
                type="text"
                placeholder="상품명을 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white outline-none"
              />
              <button
                type="submit"
                className="bg-gray-900 text-white px-4 py-2 hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto flex-shrink-0">
            {/* Delivery badge */}
            <div className="border-2 border-red-700 rounded flex items-center gap-1.5 px-2 py-1 hidden md:flex">
              <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="text-xs leading-tight">
                <div className="font-bold text-red-700">우체국</div>
                <div className="text-gray-600">택배발송</div>
              </div>
            </div>

            {/* Cart icon */}
            <Link href="/cart" className="relative p-1">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="메뉴 열기"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex border border-gray-300 rounded overflow-hidden">
            <input
              type="text"
              placeholder="상품을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-white outline-none"
            />
            <button type="submit" className="bg-gray-900 text-white px-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <ul className="py-2">
              <li><Link href="/" className="block px-6 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>HOME</Link></li>
              <li><Link href="/products" className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>전체 상품</Link></li>
              <li><Link href="/cart" className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>장바구니</Link></li>
              <li><Link href="/mypage" className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>마이페이지</Link></li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
