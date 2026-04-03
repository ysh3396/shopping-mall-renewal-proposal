import Link from "next/link";
import { getMyCoupons } from "../actions";

export const dynamic = "force-dynamic";

export default async function MyCouponsPage() {
  const coupons = await getMyCoupons();

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">보유 쿠폰</h1>
          <p className="mt-2 text-sm text-gray-500">사용 가능한 쿠폰과 사용 이력을 확인하세요.</p>
        </div>
        <Link href="/mypage" className="text-sm font-semibold text-gray-700 hover:underline">마이페이지로</Link>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center text-sm text-gray-500">
          아직 보유한 쿠폰이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((usage) => (
            <div key={usage.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{usage.coupon.name}</p>
                  <p className="mt-1 text-sm text-gray-500">쿠폰 코드: {usage.coupon.code}</p>
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {usage.orderId ? "사용 완료" : "보유중"}
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                <div>할인 방식: {usage.coupon.discountType}</div>
                <div>할인 값: {usage.coupon.discountValue}</div>
                <div>발급일: {new Date(usage.usedAt).toLocaleDateString("ko-KR")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
