# 더본투비 쇼핑몰 — 남은 개발 백로그

> **데드라인:** 2026-04-20 (D-18)
> **현재일:** 2026-04-02
> **프레임워크:** Next.js 16 + Prisma 7 + Supabase (PostgreSQL + Storage)
> **중요:** Next.js 16은 기존 버전과 다름. 코드 작성 전 `node_modules/next/dist/docs/` 참고

---

## 프로젝트 구조 요약

```
theborntobi/
├── prisma/schema.prisma          # DB 스키마 (39 모델, 13 enum)
├── prisma/seed.ts                # 시드 스크립트
├── src/
│   ├── app/(storefront)/         # 고객 페이지 (홈, 상품, 장바구니, 결제, 마이페이지)
│   ├── app/(admin)/admin/        # 어드민 (대시보드, 상품, 주문, 고객, 배송, 반품, 프로모션, 설정)
│   ├── app/(admin-auth)/         # 어드민 로그인 (인증 불필요)
│   ├── app/api/auth/             # NextAuth 핸들러
│   ├── components/admin/         # 어드민 컴포넌트 (10개)
│   ├── components/storefront/    # 스토어프론트 컴포넌트 (7개)
│   ├── components/ui/            # Shadcn UI (21개)
│   ├── lib/auth.ts               # NextAuth 설정
│   ├── lib/db.ts                 # Prisma 싱글턴
│   ├── lib/rbac.ts               # RBAC (requireAuth, requirePermission)
│   ├── lib/cart.ts               # 클라이언트 localStorage 장바구니
│   ├── lib/supabase.ts           # Supabase 스토리지 헬퍼
│   ├── lib/sanitize.ts           # DOMPurify HTML 새니타이저
│   ├── lib/utils.ts              # cn() 유틸
│   └── middleware.ts             # 쿠키 기반 인증 체크 (RBAC 넣지 말 것)
└── scripts/                      # 이미지 마이그레이션 스크립트
```

## 기술 스택 & 버전

| 패키지 | 버전 | 비고 |
|--------|------|------|
| next | 16.2.1 | **breaking changes 있음** — `node_modules/next/dist/docs/` 필독 |
| react | 19.2.4 | |
| @prisma/client | 7.6.0 | PrismaPg adapter 사용 |
| next-auth | 5.0.0-beta.30 | Credentials provider (어드민 전용) |
| @supabase/supabase-js | 2.101.1 | Storage + PostgreSQL |
| tailwindcss | 4 | |
| shadcn | 4.1.1 | |
| zod | 4.3.6 | |

## 필수 규칙 (반드시 준수)

1. **middleware.ts에 RBAC 넣지 말 것** — 쿠키 존재 확인만. 권한 체크는 서버 액션에서 `requireAuth()` / `requirePermission(resource, action)` 사용
2. **isRestricted로 쿼리 필터링 금지** — 성인인증 UI 플래그일 뿐, 필터링하면 카테고리가 숨겨지는 버그 발생. `isActive`만 사용
3. **system@theborntobi.com** — audit log 전용 시스템 계정 (isActive: false). 절대 변경 금지
4. **images.unoptimized: true** — 로컬 개발용. 프로덕션 배포 시 제거 필요
5. **서버 액션 패턴** — `"use server"` → `requireAuth()`/`requirePermission()` → Prisma 쿼리 → `revalidatePath()`

---

## TASK 0: 아임웹 데이터 이관 (최우선)

**우선순위:** 최고 | **난이도:** 중 | **선행조건:** 아임웹 관리자 로그인 정보

### 현재 상태
- 상품 128개 + 이미지 685개는 이미 클로닝 완료 (CDN → Supabase Storage)
- 회원/주문/포인트/등급/위시리스트 데이터는 미이관

### 이관 범위
1. **회원/상품/주문 데이터** — 아임웹 자동 추출 → 새 시스템으로 이관
2. **상품 사진** — 자동 다운로드 → Supabase Storage 이관 (해지 전 먼저 수집)
3. **비밀번호** — 이전 불가 → 임시 비밀번호 발급 + 재설정 안내 세팅
4. **포인트/등급/위시리스트** — 자동 추출하여 이관

### 클라이언트에게 필요한 것
- [ ] 아임웹 관리자 로그인 정보 공유
- [ ] 추가 이관 데이터 확인 (포인트, 쿠폰, 구매평 등 필요한지)
- [ ] 아임웹 해지 시점 안내 (오픈 후 1~2주 유지 권장)
- [ ] 회원 수 / 상품 수 (이관 규모 파악)
- [ ] 비밀번호 재설정 안내 방법 (카카오 알림톡 vs 이메일 vs SMS)

### 구현 계획

#### 0-1. 아임웹 데이터 추출 스크립트
**파일:**
- `scripts/imweb-export-members.ts` — 새로 생성: 회원 데이터 추출
- `scripts/imweb-export-orders.ts` — 새로 생성: 주문 데이터 추출
- `scripts/imweb-export-points.ts` — 새로 생성: 포인트/등급 추출

**방법:** 아임웹 관리자 API 또는 관리자 페이지 크롤링으로 데이터 추출

#### 0-2. 데이터 변환 + DB 시드
**파일:**
- `scripts/transform-imweb-data.ts` — 새로 생성: 아임웹 포맷 → Prisma 모델 변환
- `prisma/seed-data/members.json` — 새로 생성: 변환된 회원 데이터
- `prisma/seed-data/orders.json` — 새로 생성: 변환된 주문 데이터
- `prisma/seed.ts` — 수정: 회원/주문 시드 추가

#### 0-3. 비밀번호 재설정 플로우
- 기존 회원에게 임시 비밀번호 발급
- 첫 로그인 시 비밀번호 변경 강제
- 안내 발송: 카카오 알림톡 or 이메일 or SMS (클라이언트 결정 대기)

---

## TASK 0.5: 고객 인증 잔여 작업

**우선순위:** 높음 | **난이도:** 중 | **선행조건:** 없음

### 완료된 항목 (2026-04-03)
- ✅ 연령제한 게이트 (`/auth/gate`) — 청소년 유해매체물 경고
- ✅ 로그인 (`/auth/login`) — 아이디/비밀번호, 상태유지
- ✅ 회원가입 (`/auth/register`) — 3단계 (약관→본인인증→폼)
- ✅ KG이니시스 간편인증 — 실제 API 연동 (MID: CICbornto0)
- ✅ Dual NextAuth (admin/customer 분리), 2중 방어, CI 해싱

### 남은 작업
1. **드림시큐리티 휴대폰 인증 (SMS 문자) 구현** — CP ID: kowhb. 현재 간편인증(인증서 기반)만 구현됨. 원래 사이트는 SMS 문자 인증 사용.
2. **아이디 찾기 페이지** (`/auth/find-id`) — 현재 placeholder 링크만 존재
3. **비밀번호 찾기 페이지** (`/auth/find-password`) — 현재 placeholder 링크만 존재
4. **프로덕션 배포 시 console.log 디버그 로그 제거** — `inicis-auth.ts`의 `[INICIS]` 로그

---

## TASK 1: 마이페이지 구현

**우선순위:** 높음 | **난이도:** 중 | **선행조건:** 없음

### 현재 상태
- `src/app/(storefront)/mypage/page.tsx` — 플레이스홀더만 존재 ("준비 중입니다")
- ✅ 고객 인증 시스템 구현 완료 (Dual NextAuth, `customer-auth.ts`)

### 필요한 기능
1. **고객 로그인/회원가입** (이메일 + 비밀번호 또는 소셜)
2. **주문 내역 조회** — Order 목록 + 상세
3. **배송 추적** — Shipment 정보 표시
4. **회원정보 수정** — 이름, 전화번호, 비밀번호 변경
5. **배송지 관리** — Address CRUD (기본 배송지 설정)
6. **쿠폰 목록** — CouponUsage 기반 보유 쿠폰

### 관련 Prisma 모델
```prisma
# 이미 존재하는 모델들:
model Customer       # email, name, phone, provider, gradeId (⚠️ passwordHash/deletedAt 없음 — 마이그레이션 필요)
model Address        # customerId, name, phone, zipCode, address1, address2, isDefault
model Order          # customerId, orderNumber, status, totalAmount, shippingAddress(JSON)
model OrderItem      # orderId, productName, variantName, price, quantity
model Payment        # orderId, method, amount, status
model Shipment       # orderId, carrier, trackingNumber, status
model CustomerGrade  # name, discountRate (Normal/Silver/Gold)
model CouponUsage    # couponId, customerId, orderId
```

### 구현 계획

#### 1-1. 고객 인증 시스템
**파일:**
- `src/lib/auth.ts` — 수정: Customer용 Credentials provider 추가 (현재 AdminUser만)
- `src/app/(storefront)/login/page.tsx` — 새로 생성
- `src/app/(storefront)/register/page.tsx` — 새로 생성
- `src/app/(storefront)/login/actions.ts` — 새로 생성: `loginCustomer()`, `registerCustomer()`

**주의:**
- 어드민 인증과 고객 인증을 분리해야 함 (같은 NextAuth에서 provider 구분 또는 별도 세션)
- ⚠️ Customer 모델에 `passwordHash` 필드 없음 — 마이그레이션 필요: `passwordHash String?`, `deletedAt DateTime?` 추가 후 `npx prisma migrate dev --name add-customer-password`
- 현재 middleware.ts는 `/admin/*`만 체크 → `/mypage/*`에 대한 체크 추가 필요

#### 1-2. 마이페이지 레이아웃 & 라우트
**파일:**
- `src/app/(storefront)/mypage/page.tsx` — 수정: 대시보드 (최근 주문, 등급, 쿠폰 요약)
- `src/app/(storefront)/mypage/orders/page.tsx` — 새로 생성: 주문 목록
- `src/app/(storefront)/mypage/orders/[id]/page.tsx` — 새로 생성: 주문 상세
- `src/app/(storefront)/mypage/addresses/page.tsx` — 새로 생성: 배송지 관리
- `src/app/(storefront)/mypage/profile/page.tsx` — 새로 생성: 회원정보 수정
- `src/app/(storefront)/mypage/coupons/page.tsx` — 새로 생성: 쿠폰 목록
- `src/app/(storefront)/mypage/actions.ts` — 새로 생성: 서버 액션 모음

**서버 액션 (mypage/actions.ts):**
```typescript
"use server"
// 고객 인증 헬퍼 필요 (어드민의 requireAuth와 별도)
export async function getMyOrders(page, limit) { ... }
export async function getMyOrderDetail(orderId) { ... }
export async function getMyAddresses() { ... }
export async function createAddress(data) { ... }
export async function updateAddress(id, data) { ... }
export async function deleteAddress(id) { ... }
export async function setDefaultAddress(id) { ... }
export async function updateMyProfile(data) { ... }
export async function changePassword(oldPassword, newPassword) { ... }
export async function getMyCoupons() { ... }
```

#### 1-3. Header 연동
**파일:**
- `src/components/storefront/Header.tsx` — 수정: 로그인 상태에 따라 "로그인/회원가입" 또는 "마이페이지" 링크 표시

---

## TASK 2: 위시리스트

**우선순위:** 높음 | **난이도:** 낮 | **선행조건:** TASK 1 (고객 인증)

### 현재 상태
- 스키마 없음, 코드 없음

### 구현 계획

#### 2-1. Prisma 스키마 추가
**파일:** `prisma/schema.prisma`
```prisma
model Wishlist {
  id         String         @id @default(cuid())
  customerId String
  customer   Customer       @relation(fields: [customerId], references: [id])
  productId  String
  product    Product        @relation(fields: [productId], references: [id])
  createdAt  DateTime       @default(now())

  @@unique([customerId, productId])
}
```
**마이그레이션:** `npx prisma migrate dev --name add-wishlist`

**Customer, Product 모델에 관계 추가:**
```prisma
model Customer {
  // 기존 필드...
  wishlists  Wishlist[]
}
model Product {
  // 기존 필드...
  wishlists  Wishlist[]
}
```

#### 2-2. 서버 액션
**파일:** `src/app/(storefront)/mypage/actions.ts` — 추가
```typescript
export async function getMyWishlist() { ... }
export async function addToWishlist(productId: string) { ... }
export async function removeFromWishlist(productId: string) { ... }
```

#### 2-3. UI
**파일:**
- `src/app/(storefront)/mypage/wishlist/page.tsx` — 새로 생성: 위시리스트 페이지 (ProductGrid 재활용)
- `src/components/storefront/ProductCard.tsx` — 수정: 하트 아이콘 (위시리스트 토글) 추가
- `src/app/(storefront)/products/[slug]/product-detail-client.tsx` — 수정: 위시리스트 버튼 추가

---

## TASK 3: 우체국택배 API 연동

**우선순위:** 높음 | **난이도:** 중 | **선행조건:** 없음

### 현재 상태
- 어드민에서 수동 운송장 입력만 가능
- `Shipment` 모델에 carrier, trackingNumber, status, rawTracking(JSON) 필드 존재
- `src/app/(admin)/admin/orders/actions.ts` — `createShipment()` 존재

### 구현 계획

#### 3-1. 배송 추적 API 모듈
**파일:** `src/lib/shipping.ts` — 새로 생성

우체국택배 실시간 추적 API:
- **API:** 우체국 EMS 조회 또는 스마트택배(sweet-tracker) API
- **추천:** 스마트택배(Sweet Tracker) — 우체국 포함 국내 택배사 통합 API
  - 가입: https://tracking.sweettracker.co.kr
  - API Key 필요 (클라이언트에게 요청)
  - REST API: `GET /api/v1/trackingInfo?t_key={key}&t_code=01&t_invoice={운송장번호}`
  - t_code=01 → 우체국택배

```typescript
// src/lib/shipping.ts
export async function getTrackingInfo(carrier: string, trackingNumber: string) {
  // Sweet Tracker API 호출
  // 응답 파싱 → { status, steps: [{ time, location, description }] }
}
export async function syncShipmentStatus(shipmentId: string) {
  // DB의 Shipment.rawTracking 업데이트
  // status 자동 갱신 (IN_TRANSIT → DELIVERED 등)
}
```

#### 3-2. API 라우트
**파일:** `src/app/api/shipping/track/route.ts` — 새로 생성 (또는 기존 placeholder 교체)
```typescript
// GET /api/shipping/track?carrier=01&trackingNumber=1234567890
// 스토어프론트에서 클라이언트 폴링용
```

#### 3-3. 어드민 연동
**파일:**
- `src/app/(admin)/admin/orders/[id]/order-detail-client.tsx` — 수정: 배송 추적 정보 표시 (타임라인 UI)
- `src/app/(admin)/admin/orders/actions.ts` — 수정: `syncShipmentTracking()` 액션 추가

#### 3-4. 스토어프론트 연동
**파일:**
- `src/app/(storefront)/mypage/orders/[id]/page.tsx` — 수정: 배송 추적 타임라인 UI

#### 3-5. 환경 변수
**파일:** `.env` — 추가
```
SWEET_TRACKER_API_KEY=클라이언트에게_요청
```

---

## TASK 4: PG 결제 연동

**우선순위:** 중 | **난이도:** 높 | **선행조건:** 토스페이먼츠 API Key

### 현재 상태
- 무통장입금만 가능
- `Payment` 모델에 method(BANK_TRANSFER/KAKAOPAY/TOSSPAY/CARD), pgProvider, pgTransactionId 필드 존재
- `src/app/(storefront)/checkout/actions.ts` — `createOrder()` 존재
- `src/app/(storefront)/checkout/checkout-client.tsx` — 결제 수단 선택 UI 존재

### 구현 계획

#### 4-1. PG사 선정
- **1순위: 토스페이먼츠** — 카카오페이 + 토스페이 + 카드 결제 모두 지원
  - SDK: `@tosspayments/tosspayments-sdk`
  - 가입: https://developers.tosspayments.com
  - **클라이언트 키 + 시크릿 키** 필요 (사업자등록증으로 가입)
- **백업: 폴라(Phola)** — 국내 PG 거절 시 해외 결제 대안

#### 4-2. 결제 모듈
**파일:** `src/lib/payment.ts` — 새로 생성
```typescript
// 토스페이먼츠 서버 사이드
export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  // POST https://api.tosspayments.com/v1/payments/confirm
  // Basic auth with secretKey
}
export async function cancelPayment(paymentKey: string, cancelReason: string) { ... }
export async function getPayment(paymentKey: string) { ... }
```

#### 4-3. 결제 플로우 (토스페이먼츠 표준)
```
1. 클라이언트: TossPayments SDK 초기화 → requestPayment() 호출
2. 토스 결제창 → 사용자 결제 완료
3. 리다이렉트: /checkout/complete?paymentKey=xxx&orderId=xxx&amount=xxx
4. 서버: confirmPayment() → 결제 승인 → Order/Payment 상태 업데이트
5. 클라이언트: 주문 완료 페이지 표시
```

#### 4-4. 파일 수정/생성
**파일:**
- `src/app/(storefront)/checkout/checkout-client.tsx` — 수정: 토스페이먼츠 SDK 연동, 결제 수단별 분기
- `src/app/(storefront)/checkout/actions.ts` — 수정: `confirmPayment()` 서버 액션 추가
- `src/app/(storefront)/checkout/complete/complete-client.tsx` — 수정: paymentKey 파라미터 처리
- `src/app/api/payments/confirm/route.ts` — 새로 생성: 토스 결제 승인 API (또는 서버 액션으로 처리)
- `src/app/api/payments/webhook/route.ts` — 새로 생성: 토스 웹훅 (가상계좌 입금 확인 등)
- `src/lib/payment.ts` — 새로 생성: 토스페이먼츠 API 래퍼

#### 4-5. 어드민 연동
**파일:**
- `src/app/(admin)/admin/orders/[id]/order-detail-client.tsx` — 수정: PG 결제 정보 표시 (pgProvider, pgTransactionId)
- `src/app/(admin)/admin/orders/actions.ts` — 수정: 결제 취소 액션 (`cancelPayment()`)

#### 4-6. 환경 변수
**파일:** `.env` — 추가
```
TOSS_CLIENT_KEY=클라이언트에게_요청
TOSS_SECRET_KEY=클라이언트에게_요청
```

---

## TASK 5: 상품 옵션/변형 데이터

**우선순위:** 높음 | **난이도:** 낮 | **선행조건:** 클라이언트 CSV

### 현재 상태
- 128개 상품 모두 단일 variant만 존재
- Prisma에 `ProductOption`, `ProductOptionValue`, `ProductVariant`, `VariantOptionValue` 모델 존재
- 어드민 `ProductForm.tsx`에 옵션/변형 입력 UI 일부 존재

### 구현 계획

#### 5-1. CSV 파싱 스크립트
**파일:** `scripts/import-product-options.ts` — 새로 생성
```typescript
// CSV 포맷 예시: productName, optionName, optionValue, sku, price, stock
// 1. CSV 읽기 (csv-parse)
// 2. Product slug 매칭
// 3. ProductOption 생성 (맛, 용량, 니코틴함량 등)
// 4. ProductOptionValue 생성
// 5. ProductVariant 생성 (sku, price, stock)
// 6. VariantOptionValue 연결
```

#### 5-2. 스토어프론트 옵션 선택 UI
**파일:**
- `src/app/(storefront)/products/[slug]/product-detail-client.tsx` — 수정: 옵션 선택 드롭다운/버튼, 선택에 따라 가격/재고 변경

---

## TASK 6: 상품 설명 텍스트

**우선순위:** 높음 | **난이도:** 낮 | **선행조건:** 클라이언트 CSV

### 현재 상태
- 128개 상품 모두 `description=null`

### 구현 계획
**파일:** `scripts/import-descriptions.ts` — 새로 생성
```typescript
// CSV 포맷: productName (또는 slug), description
// Product.description 필드 업데이트
```

---

## TASK 7: 본인인증 (카카오 알림톡 OTP)

**우선순위:** 높음 | **난이도:** 중 | **선행조건:** 카카오비즈니스 채널 + 알림톡 대행사 API Key

### 클라이언트 요청 사항
1. 카카오톡 채널 개설 (business.kakao.com, 사업자등록증 필요)
2. 알림톡 대행사 가입 (알리고 또는 NHN Cloud 추천, 건당 ~9원)
3. 대행사 API Key 공유
4. 알림톡 발신 프로필 등록 + 인증 템플릿 심사 (1~3영업일)

### 구현 계획

#### 7-1. Prisma 스키마
**파일:** `prisma/schema.prisma` — 추가
```prisma
model PhoneVerification {
  id        String   @id @default(cuid())
  phone     String
  code      String
  expiresAt DateTime
  attempts  Int      @default(0)
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([phone, code])
}
```

#### 7-2. 알림톡 API 모듈
**파일:** `src/lib/alimtalk.ts` — 새로 생성
```typescript
// 알리고 API 예시
export async function sendAlimtalk(phone: string, templateCode: string, variables: Record<string, string>) {
  // POST https://kakaoapi.aligo.in/akv10/alimtalk/send/
  // apikey, userid, senderkey, tpl_code, receiver_1, subject_1, message_1
}
export async function sendOTP(phone: string) {
  // 6자리 OTP 생성 → DB 저장 (3분 만료) → 알림톡 발송
}
export async function verifyOTP(phone: string, code: string) {
  // DB 조회 → 만료/시도횟수 체크 → verified 업데이트
}
```

#### 7-3. 서버 액션
**파일:** `src/app/(storefront)/login/actions.ts` 또는 별도 `src/app/(storefront)/verify/actions.ts`
```typescript
"use server"
export async function requestPhoneVerification(phone: string) { ... }
export async function confirmPhoneVerification(phone: string, code: string) { ... }
```

#### 7-4. UI
**파일:** 회원가입/주문 페이지에 인증 컴포넌트 삽입
- `src/components/storefront/PhoneVerification.tsx` — 새로 생성: 전화번호 입력 → 인증번호 요청 → 타이머(3분) → 인증번호 입력 → 확인

#### 7-5. 환경 변수
**파일:** `.env` — 추가
```
ALIGO_API_KEY=클라이언트에게_요청
ALIGO_USER_ID=클라이언트에게_요청
ALIGO_SENDER_KEY=클라이언트에게_요청
```

---

## TASK 8: 리뷰/QnA 시스템 UI

**우선순위:** 중 | **난이도:** 중 | **선행조건:** TASK 1 (고객 인증)

### 현재 상태
- `Review`, `QnA` 모델 존재 (rating, content, isApproved / question, answer, isPublic)
- UI 없음

### 구현 계획
**파일:**
- `src/app/(storefront)/products/[slug]/product-detail-client.tsx` — 수정: 리뷰/QnA 탭 추가
- `src/components/storefront/ReviewList.tsx` — 새로 생성
- `src/components/storefront/ReviewForm.tsx` — 새로 생성
- `src/components/storefront/QnAList.tsx` — 새로 생성
- `src/components/storefront/QnAForm.tsx` — 새로 생성
- `src/app/(storefront)/products/[slug]/actions.ts` — 새로 생성: `getReviews()`, `createReview()`, `getQnAs()`, `createQuestion()`
- `src/app/(admin)/admin/reviews/page.tsx` — 새로 생성: 리뷰 승인/삭제 관리
- `src/app/(admin)/admin/reviews/actions.ts` — 새로 생성
- `src/app/(admin)/admin/qna/page.tsx` — 새로 생성: QnA 답변 관리
- `src/app/(admin)/admin/qna/actions.ts` — 새로 생성

---

## TASK 9: 알림 시스템 UI

**우선순위:** 중 | **난이도:** 낮 | **선행조건:** 없음

### 현재 상태
- `Notification` 모델 존재 (type, title, message, isRead, referenceType/Id)
- UI 없음

### 구현 계획
**파일:**
- `src/components/admin/AdminHeader.tsx` — 수정: 알림 벨 아이콘 + 드롭다운
- `src/components/admin/NotificationDropdown.tsx` — 새로 생성
- `src/app/(admin)/admin/notifications/page.tsx` — 새로 생성: 알림 전체 목록
- `src/app/(admin)/admin/notifications/actions.ts` — 새로 생성: `getNotifications()`, `markAsRead()`, `markAllAsRead()`

---

## TASK 10: 컬렉션/CMS 어드민 UI

**우선순위:** 중 | **난이도:** 낮 | **선행조건:** 없음

### 현재 상태
- `Collection`, `PageContent` 모델 존재
- 어드민 UI 없음

### 구현 계획
**파일:**
- `src/app/(admin)/admin/collections/page.tsx` — 새로 생성
- `src/app/(admin)/admin/collections/actions.ts` — 새로 생성: CRUD
- `src/app/(admin)/admin/collections/collection-client.tsx` — 새로 생성
- `src/app/(admin)/admin/pages/page.tsx` — 새로 생성: 정적 페이지 관리
- `src/app/(admin)/admin/pages/actions.ts` — 새로 생성: CRUD
- `src/app/(admin)/admin/pages/page-client.tsx` — 새로 생성
- `src/components/admin/Sidebar.tsx` — 수정: "컬렉션", "페이지" 메뉴 추가

---

## 작업 순서 권장

```
Week 1 (4/2 ~ 4/8):
  ├── TASK 0: 아임웹 데이터 이관 (최우선 — 로그인 정보 받는 즉시)
  ├── TASK 1: 마이페이지 + 고객인증 (가장 큰 작업, 병렬 착수)
  └── TASK 3: 우체국택배 API (병렬 가능)

Week 2 (4/9 ~ 4/15):
  ├── TASK 2: 위시리스트 (TASK 1 완료 후, 1일)
  ├── TASK 5+6: 상품 옵션/설명 (CSV 도착 시)
  └── TASK 4: PG 결제 연동 (API Key 확보 후)

Week 3 (4/16 ~ 4/20):
  ├── TASK 7: 본인인증 (카카오 채널 심사 완료 후)
  ├── TASK 8: 리뷰/QnA (여유 시)
  ├── TASK 9: 알림 시스템 (여유 시)
  └── QA + 버그 수정
```

## 클라이언트에게 필요한 것 (선행조건)

| 항목 | 용도 | 긴급도 |
|------|------|--------|
| **아임웹 관리자 로그인 정보** | TASK 0 (데이터 이관) | **즉시 요청 (최우선)** |
| **회원수/상품수/이관 범위 확인** | TASK 0 (데이터 이관) | **즉시 요청** |
| **비밀번호 재설정 안내 방법** | TASK 0 (알림톡/이메일/SMS) | **즉시 요청** |
| 상품 옵션 CSV | TASK 5 | 즉시 요청 |
| 상품 설명 CSV | TASK 6 | 즉시 요청 |
| 스마트택배 API Key | TASK 3 (배송 추적) | 즉시 요청 |
| 토스페이먼츠 API Key | TASK 4 (PG 결제) | 이번 주 내 |
| 카카오톡 채널 + 알리고 API Key | TASK 7 (본인인증) | 이번 주 내 |
| 사업자등록증 사본 | 토스/카카오/알리고 가입용 | 즉시 요청 |

---

## 서버 액션 작성 패턴 (참고용)

```typescript
"use server";

import { db } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createSomething(data: FormData) {
  await requirePermission("resource", "create");

  const result = await db.model.create({
    data: { ... },
  });

  revalidatePath("/admin/something");
  return result;
}
```

## 스토어프론트 고객 인증 패턴 (구현 필요)

```typescript
// src/lib/customer-auth.ts — 새로 생성
// 어드민의 requireAuth()와 별도로 고객 세션 검증
// NextAuth의 session에서 customerId 추출
// 또는 별도 JWT 기반 인증
```
