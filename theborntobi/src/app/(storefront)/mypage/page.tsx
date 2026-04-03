import Link from "next/link";
import { getMyCoupons, getMyOrders, getMyProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const [profile, orders, coupons] = await Promise.all([
    getMyProfile(),
    getMyOrders(1, 5),
    getMyCoupons(),
  ]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">마이페이지</h1>
          <p className="mt-2 text-sm text-gray-500">
            안녕하세요, <span className="font-semibold text-gray-900">{profile?.name ?? "회원"}</span>님.
          </p>
        </div>
        <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
          회원등급: <span className="font-semibold text-gray-900">{profile?.grade?.name ?? "일반"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <SummaryCard title="총 주문" value={`${orders.total}건`} href="/mypage/orders" />
        <SummaryCard title="보유 쿠폰" value={`${coupons.length}개`} href="/mypage/coupons" />
        <SummaryCard title="배송지 관리" value="바로가기" href="/mypage/addresses" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">최근 주문</h2>
            <Link href="/mypage/orders" className="text-sm font-semibold text-gray-700 hover:underline">전체보기</Link>
          </div>

          {orders.items.length === 0 ? (
            <p className="text-sm text-gray-500">아직 주문 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {orders.items.map((order) => (
                <div key={order.id} className="rounded-xl border border-gray-100 px-4 py-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("ko-KR")}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{order.status}</div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {order.items[0]?.productName ?? "상품 정보 없음"}
                    {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 메뉴</h2>
          <div className="grid gap-3">
            <QuickLink href="/mypage/profile" title="회원정보 수정" description="이름, 연락처, 비밀번호 변경" />
            <QuickLink href="/mypage/addresses" title="배송지 관리" description="기본 배송지와 주소록 관리" />
            <QuickLink href="/mypage/coupons" title="쿠폰 목록" description="보유 쿠폰과 사용 내역 확인" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
    </Link>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-xl border border-gray-100 px-4 py-4 hover:bg-gray-50 transition-colors">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  );
}
