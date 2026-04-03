# 아임웹 → 더본투비 데이터 마이그레이션 스펙

> **작성일:** 2026-04-03
> **데드라인:** 2026-04-20
> **실행자:** Codex (OpenAI)
> **검증자:** Claude Code

---

## 0. 실행 전 필독

### 프레임워크 주의사항
- **Next.js 16**: 기존 버전과 다름. 코드 작성 전 반드시 `node_modules/next/dist/docs/` 참고
- **Prisma 7**: PrismaPg adapter 사용. `prisma/prisma.config.ts` 참고
- **middleware.ts에 RBAC 넣지 말 것** — 쿠키 존재 확인만
- **isRestricted로 쿼리 필터링 금지** — `isActive`만 사용

### 서버 액션 패턴 (반드시 준수)
```typescript
"use server";
import { db } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function doSomething(data: FormData) {
  await requirePermission("resource", "action");
  const result = await db.model.create({ data: { ... } });
  revalidatePath("/admin/something");
  return result;
}
```

### DB 연결
```typescript
// src/lib/db.ts — Prisma 싱글턴 (이미 존재)
import { db } from "@/lib/db";
```

---

## 1. 스키마 변경 (Phase 1 — 최우선)

### 1-1. CustomerGrade 확장

**파일:** `prisma/schema.prisma`

현재:
```prisma
model CustomerGrade {
  id              String     @id @default(cuid())
  name            String
  minOrderAmount  Int        @default(0)
  discountRate    Float      @default(0)
  customers       Customer[]
}
```

변경 후:
```prisma
model CustomerGrade {
  id                  String     @id @default(cuid())
  name                String     @unique
  minOrderAmount      Int        @default(0)
  discountRate        Float      @default(0)
  pointRate           Float      @default(0)
  minPurchaseForPoint Int        @default(1000)
  maxPointPerOrder    Int        @default(0)
  freeShipping        Boolean    @default(false)
  sortOrder           Int        @default(0)
  isDefault           Boolean    @default(false)
  customers           Customer[]
}
```

**등급 시드 데이터 (seed.ts에 반영):**

| name | minOrderAmount | pointRate | minPurchaseForPoint | maxPointPerOrder | sortOrder | isDefault |
|------|---------------|-----------|---------------------|-----------------|-----------|-----------|
| BRONZE | 0 | 0.02 | 1000 | 20000 | 0 | true |
| SILVER | 100000 | 0.025 | 1000 | 25000 | 1 | false |
| GOLD | 300000 | 0.03 | 1000 | 30000 | 2 | false |
| PLATINUM | 500000 | 0.04 | 1000 | 40000 | 3 | false |
| MASTER | 1000000 | 0.05 | 1000 | 50000 | 4 | false |

### 1-2. Customer 모델 확장

**추가 필드:**
```prisma
model Customer {
  // === 기존 필드 유지 ===
  id                  String          @id @default(cuid())
  username            String?         @unique
  passwordHash        String?
  email               String          @unique
  name                String
  phone               String?
  provider            String?
  providerId          String?
  ageVerified         Boolean         @default(false)
  ageVerifiedAt       DateTime?
  ageVerifyMethod     String?
  ageVerifyCI         String?
  ageVerifyExpiresAt  DateTime?
  gradeId             String?
  grade               CustomerGrade?  @relation(fields: [gradeId], references: [id])

  // === 새로 추가 ===
  gender              String?           // "M" | "F"
  birthday            DateTime?
  referralCode        String?           @unique
  referredBy          String?
  memberGroup         String?           // "운영진" | null
  loginCount          Int               @default(0)
  lastLoginIp         String?
  adminMemo           String?           @db.Text
  imwebMemberCode     String?           @unique  // 아임웹 고유키 (마이그레이션 추적)
  totalPurchaseAmount Int               @default(0)
  totalPurchaseCount  Int               @default(0)
  points              Int               @default(0)  // 현재 보유 포인트
  forcePasswordChange Boolean           @default(false)  // 임시 비밀번호 변경 강제

  // === 기존 관계 유지 ===
  orders              Order[]
  addresses           Address[]
  cart                Cart?
  reviews             Review[]
  qnas                QnA[]
  productRequests     ProductRequest[]
  couponUsages        CouponUsage[]

  // === 새 관계 ===
  pointTransactions   PointTransaction[]

  deletedAt           DateTime?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@unique([provider, providerId])
}
```

### 1-3. PointTransaction 모델 (신규)

```prisma
model PointTransaction {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  amount      Int      // 양수 = 적립, 음수 = 사용
  type        String   // "SIGNUP" | "PURCHASE" | "REVIEW" | "ADMIN" | "USE" | "EXPIRE" | "MIGRATION"
  description String?
  orderId     String?
  balance     Int      // 이 트랜잭션 후 잔액
  createdAt   DateTime @default(now())

  @@index([customerId])
}
```

### 1-4. Product 모델 확장

**추가 필드:**
```prisma
model Product {
  // 기존 필드 유지...
  imwebProductId    Int?        @unique  // 아임웹 상품번호 (마이그레이션 추적)
  weight            Float?      // 무게 (kg)
  origin            String?     // 원산지
  manufacturer      String?     // 제조사
  brand             String?     // 브랜드
  taxType           String?     // "과세상품" | "면세상품" | "영세율"
  // 기존 관계 유지...
}
```

### 1-5. Order 모델 확장

**추가 필드:**
```prisma
model Order {
  // 기존 필드 유지...
  imwebOrderNumber  String?     @unique  // 아임웹 주문번호 (마이그레이션 추적)
  pointUsed         Int         @default(0)   // 포인트 사용액
  couponDiscount    Int         @default(0)   // 쿠폰 할인액
  // 기존 관계 유지...
}
```

### 1-6. 마이그레이션 실행

```bash
npx prisma migrate dev --name imweb_migration_schema
```

---

## 2. 회원 이관 (Phase 2)

### 소스 파일
`/Users/Mac/Downloads/회원2026_04_03_1(전체).xlsx`

### 데이터 통계
- **총 회원:** 18,764명
- **등급 분포:** BRONZE, SILVER, GOLD, PLATINUM, MASTER, test
- **연락처 있음:** 18,762명 / **없음:** 2명
- **Naver OAuth:** 10,070명 / **Kakao OAuth:** 7,595명
- **이메일 중복:** 15건 (username으로 구분하여 모두 이관)

### 엑셀 컬럼 → Prisma 매핑

| 엑셀 컬럼 (인덱스) | Prisma 필드 | 변환 로직 |
|-------------------|-------------|-----------|
| 고유키 (1) | `imwebMemberCode` | 그대로 |
| 이메일 (2) | `email` | trim, lowercase |
| 아이디 (3) | — | 사용 안 함 |
| 회원 그룹 (4) | `memberGroup` | null이면 null |
| 회원 등급 (5) | `gradeId` | 이름으로 CustomerGrade 매칭. "test" → BRONZE |
| 추천인 코드 (6) | `referralCode` | null이면 null |
| 추천인 (7) | `referredBy` | null이면 null |
| 이름 (8) | `name` | trim |
| 성별 (9) | `gender` | "M" / "F" / null |
| 연락처 (10) | `phone` + `username` | 공백 제거, 하이픈 제거. **username = phone (없으면 email)** |
| 생년월일 (12) | `birthday` | "0000-00-00" → null, 그 외 Date 파싱 |
| 우편번호 (13) | Address.zipCode | 있으면 Address 생성 |
| 주소 (14) | Address.address1 | |
| 상세주소 (15) | Address.address2 | |
| 가입 포인트 (18) | — | 히스토리용 |
| 적립 포인트 (19) | — | 히스토리용 |
| 사용 포인트 (20) | — | 히스토리용 |
| 보유 포인트 (21) | `points` | parseInt |
| 가입일 (22) | `createdAt` | Date 파싱 |
| 로그인 횟수 (27) | `loginCount` | parseInt |
| 마지막 로그인 (28) | 참고용 | |
| 최종 로그인 IP (29) | `lastLoginIp` | |
| 구매횟수(KRW) (30) | `totalPurchaseCount` | parseInt |
| 구매금액(KRW) (31) | `totalPurchaseAmount` | parseInt |
| NAVER ID (32) | `provider="naver"`, `providerId` | 있으면 설정 |
| KAKAO ID (33) | `provider="kakao"`, `providerId` | 있으면 설정 (NAVER가 우선) |
| GOOGLE ID (34) | `provider="google"`, `providerId` | 3순위 |
| 관리자 메모 (38) | `adminMemo` | null이면 null |

### 비밀번호 생성 규칙
```typescript
// 임시 비밀번호: 전화번호 뒤 4자리 + "!" + 랜덤 4자리
// 예: 9732!a3k9
// 전화번호 없으면: "born" + 랜덤 6자리 + "!"
function generateTempPassword(phone: string | null): string {
  const suffix = crypto.randomBytes(2).toString('hex');
  if (phone) {
    const last4 = phone.replace(/\D/g, '').slice(-4);
    return `${last4}!${suffix}`;
  }
  return `born${crypto.randomBytes(3).toString('hex')}!`;
}
```

- **bcrypt** 해싱 (기존 auth에서 사용하는 것과 동일)
- `forcePasswordChange: true` 설정

### 이메일 중복 처리
- 같은 이메일이 여러 row: **첫 번째 row만 email 사용, 나머지는 email 뒤에 `+N` 추가**
- 예: `korwhb@nate.com`, `korwhb@nate.com+2`
- 모든 회원의 `username`은 전화번호 (중복 시 뒤에 `-N` 추가)

### 성인인증 처리
- **모든 이관 회원:** `ageVerified: true`, `ageVerifiedAt: new Date()`, `ageVerifyMethod: "migration"`

### 포인트 이관
- 보유 포인트 → `points` 필드에 직접 설정
- PointTransaction 1건 생성: `type: "MIGRATION"`, `amount: 보유포인트`, `balance: 보유포인트`

### 주소 이관
- 우편번호 + 주소가 있는 회원만 Address 생성
- `isDefault: true`, `label: "기본 배송지"`, `recipient: 이름`, `phone: 연락처`

### 스크립트 파일
**생성:** `scripts/migrate-members.ts`

```typescript
// 실행: npx tsx scripts/migrate-members.ts
// 의존성: openpyxl 대신 xlsx (npm install xlsx)
// 또는 Python: python3 scripts/migrate-members.py

// 1. Excel 읽기
// 2. CustomerGrade 조회 (BRONZE~MASTER)
// 3. 이메일 중복 체크 + username 충돌 체크
// 4. Customer upsert (imwebMemberCode 기준)
// 5. Address 생성 (주소 있는 경우)
// 6. PointTransaction 생성 (포인트 있는 경우)
// 7. 결과 리포트 출력
```

**수락 기준:**
- [ ] 18,764명 전원 이관 완료
- [ ] 각 회원의 username = 전화번호 (없으면 이메일)
- [ ] 임시 비밀번호 bcrypt 해싱 완료
- [ ] forcePasswordChange = true
- [ ] ageVerified = true (전원)
- [ ] 보유 포인트 정확히 이관
- [ ] 등급 매칭 완료 (BRONZE~MASTER)
- [ ] 주소 데이터 이관 (해당자만)
- [ ] OAuth provider/providerId 설정 (해당자만)
- [ ] imwebMemberCode로 중복 방지 (멱등성)

---

## 3. 상품 이관 (Phase 3)

### 소스 파일
`/Users/Mac/Downloads/상품_전체_2026_04_03_KR.xlsx`

### 데이터 통계
- **총 상품:** 1,754개
- **판매중:** 1,347 / **숨김:** 188 / **품절:** 219
- **카테고리 조합:** 302종 (멀티 카테고리, 콤마 구분)
- **기존 시드 상품:** 128개 (이미 DB에 존재)

### 엑셀 컬럼 → Prisma 매핑 (핵심만)

| 엑셀 컬럼 | Prisma 필드 | 변환 로직 |
|-----------|-------------|-----------|
| 상품번호 (0) | `imwebProductId` | Int |
| 상품명 (1) | `name` | trim |
| 자체 상품코드 (2) | ProductVariant.sku | |
| 카테고리ID (3) | `categoryId` | 첫 번째 CATE만 사용, 매핑 테이블 필요 |
| 판매상태 (4) | `isActive` | "판매중" → true, "숨김"/"품절" → false |
| 판매가 (7) | `basePrice` | Int |
| 무게 (8) | `weight` | Float (kg) |
| 정가 (9) | `comparePrice` | null이면 null |
| 원가 (10) | `costPrice` | "0" → 0 |
| 상품상세정보 (14) | `detailHtml` | HTML (DOMPurify 처리 필요) |
| 상품URL (15) | 참고용 | slug 생성에 활용 |
| 세금 (16) | `taxType` | |
| 미성년자 구매 (17) | `isAdult` | "N" → true (성인전용), "Y" → false |
| 원산지 (19) | `origin` | |
| 제조사 (20) | `manufacturer` | |
| 브랜드 (21) | `brand` | |
| 필수옵션명 (68) | ProductOption.name | 콤마 구분 |
| 필수옵션값 (69) | ProductOptionValue | 파이프/콤마 구분 (복잡한 파싱 필요) |
| 재고수량합계 (70) | ProductVariant.stock | |

### 카테고리 매핑 전략

아임웹 CATE ID → 우리 카테고리 slug 매핑이 필요합니다.

**접근법:**
1. 아임웹 API 리버스 엔지니어링으로 CATE ID → 카테고리명 매핑 확보 (별도 진행)
2. 매핑이 없으면: 첫 번째 CATE ID 기준으로 가장 빈번한 조합을 수동 매핑
3. 현재 시스템 카테고리: HOME, 기기&악세사리, 팟/카트리지, 무니코틴, 입호흡액상, 폐호흡액상, 코일/소모품, 일회용, 니코틴베이스/첨가제, csv추출용, 신상품, 베스트, 이벤트/특가, 묶음할인, 브랜드관

**카테고리 매핑 파일:** `scripts/category-mapping.json` (리버스 엔지니어링 후 생성)

### 옵션 파싱 규칙

아임웹 옵션 포맷:
```
필수옵션명: "개인결제"  (단일 옵션)
필수옵션값: "100개"

필수옵션명: "과즙액상 입호흡 100ml"  (다중)
필수옵션값: "파인레몬|블루베리|딸기|포도" (파이프 구분)
```

→ ProductOption + ProductOptionValue + ProductVariant 생성

### 이미지 처리
- `detailHtml`에 포함된 `cdn.imweb.me` URL → Supabase Storage 이관 필요
- 기존 `scripts/download-cdn-images.mjs` + `scripts/upload-to-supabase.mjs` 활용
- 상품 썸네일은 별도 크롤링 필요 (엑셀에 미포함)

### 기존 128개 상품과의 충돌
- `imwebProductId`로 기존 상품 매칭
- 이미 존재하면 update, 없으면 create (upsert)

### 스크립트 파일
**생성:** `scripts/migrate-products.ts`

**수락 기준:**
- [ ] 1,754개 상품 전원 이관 (또는 판매중 1,347개 우선)
- [ ] 옵션/변형 파싱 완료
- [ ] 카테고리 매핑 완료
- [ ] 가격/재고 정확히 이관
- [ ] imwebProductId로 멱등성 보장
- [ ] detailHtml 내 이미지 URL Supabase 이관

---

## 4. 주문 이관 (Phase 4)

### 소스 파일
`/Users/Mac/Downloads/기본_양식_20260403165305.xlsx`

### 데이터 통계
- **총 주문 line items:** 84,933건
- **유니크 주문:** 44,544건
- **거래개시 (진행중):** 1,648건
- **거래종료 (완료):** 83,285건

### 엑셀 컬럼 → Prisma 매핑

| 엑셀 컬럼 | Prisma 필드 | 변환 로직 |
|-----------|-------------|-----------|
| 주문번호 (1) | `imwebOrderNumber` | String |
| 주문상태 (2) | `status` | "거래개시" → PAID, "거래종료" → DELIVERED |
| 총 품목합계금액 (3) | `subtotal` | Int |
| 총 합계 할인금액 (4) | `discountAmount` | Int |
| 총 합계 배송비 (5) | `shippingFee` | Int |
| 총 합계 포인트 사용액 (6) | `pointUsed` | Int |
| 최종주문금액 (7) | `totalAmount` | Int |
| 주문자 이름 (8) | 주문자 정보 | Customer 매칭 (이메일 기준) |
| 주문자 이메일 (9) | `customerId` | Customer.email로 매칭 |
| 주문자 번호 (10) | 참고용 | |
| 배송송장번호 (13) | Shipment.trackingNumber | |
| 구매수량 (16) | OrderItem.quantity | |
| 상품명 (17) | OrderItem.productName | |
| 옵션명 (18) | OrderItem.variantName | |
| 판매가 (19) | OrderItem.price | |
| 수령자명 (24) | shippingAddress.recipient | |
| 수령자 전화번호 (25) | shippingAddress.phone | |
| 배송지 우편번호 (27) | shippingAddress.zipCode | |
| 주소 (28) | shippingAddress.address1 | |
| 상세주소 (29) | shippingAddress.address2 | |
| 배송메모 (30) | shippingAddress.memo | |
| 택배사명 (31) | Shipment.carrier | |
| 주문일 (36) | `createdAt` | Date 파싱 |
| 상품고유번호 (37) | OrderItem.productId | imwebProductId로 Product 매칭 |

### 주문 생성 로직

같은 주문번호의 여러 row → 1개 Order + N개 OrderItem:

```
1. 주문번호별로 그룹핑
2. 첫 row에서 Order 생성 (금액, 배송지, 상태)
3. 각 row에서 OrderItem 생성 (상품, 옵션, 수량, 가격)
4. 거래종료 → Payment (status: COMPLETED, method: BANK_TRANSFER)
5. 송장번호 있으면 → Shipment (status: DELIVERED)
6. 포인트 사용액 > 0 → PointTransaction (type: "USE", amount: -포인트사용액)
```

### 고객 매칭
- 주문자 이메일 → Customer.email로 매칭
- 매칭 실패 시: 주문자 번호 → Customer.phone으로 매칭
- 그래도 없으면: 스킵하고 로그 남기기

### 스크립트 파일
**생성:** `scripts/migrate-orders.ts`

**수락 기준:**
- [ ] 44,544건 주문 이관 완료
- [ ] 각 주문의 OrderItem 정확히 생성
- [ ] 고객 매칭률 95% 이상
- [ ] 금액 합계 검증 (subtotal + shippingFee - discountAmount - pointUsed = totalAmount)
- [ ] 거래종료 → Payment + Shipment 생성
- [ ] imwebOrderNumber로 멱등성 보장

---

## 5. 시드 데이터 업데이트 (Phase 5)

### 파일: `prisma/seed.ts`

기존 CustomerGrade 시드 교체:

```typescript
// 기존 Normal/Silver/Gold 삭제 → BRONZE~MASTER로 교체
const grades = [
  { name: "BRONZE", minOrderAmount: 0, discountRate: 0, pointRate: 0.02, minPurchaseForPoint: 1000, maxPointPerOrder: 20000, sortOrder: 0, isDefault: true },
  { name: "SILVER", minOrderAmount: 100000, discountRate: 0, pointRate: 0.025, minPurchaseForPoint: 1000, maxPointPerOrder: 25000, sortOrder: 1, isDefault: false },
  { name: "GOLD", minOrderAmount: 300000, discountRate: 0, pointRate: 0.03, minPurchaseForPoint: 1000, maxPointPerOrder: 30000, sortOrder: 2, isDefault: false },
  { name: "PLATINUM", minOrderAmount: 500000, discountRate: 0, pointRate: 0.04, minPurchaseForPoint: 1000, maxPointPerOrder: 40000, sortOrder: 3, isDefault: false },
  { name: "MASTER", minOrderAmount: 1000000, discountRate: 0, pointRate: 0.05, minPurchaseForPoint: 1000, maxPointPerOrder: 50000, sortOrder: 4, isDefault: false },
];

for (const grade of grades) {
  await db.customerGrade.upsert({
    where: { name: grade.name },
    update: grade,
    create: grade,
  });
}
```

---

## 6. 등급 자동 갱신 로직 (Phase 6)

### 아임웹 설정 (이미지 기반)
- **조건:** 총 구매금액에 따른 등급
- **갱신 주기:** 주 단위 (매 주 월요일 갱신)

### 구현

**파일:** `src/lib/grade-update.ts` — 새로 생성

```typescript
export async function updateCustomerGrades() {
  const grades = await db.customerGrade.findMany({ orderBy: { minOrderAmount: "desc" } });
  const customers = await db.customer.findMany({
    select: { id: true, totalPurchaseAmount: true, gradeId: true },
  });

  for (const customer of customers) {
    const newGrade = grades.find(g => customer.totalPurchaseAmount >= g.minOrderAmount);
    if (newGrade && newGrade.id !== customer.gradeId) {
      await db.customer.update({
        where: { id: customer.id },
        data: { gradeId: newGrade.id },
      });
    }
  }
}
```

**파일:** `src/app/api/cron/grade-update/route.ts` — 새로 생성 (Vercel Cron)
```typescript
// vercel.json에 cron 설정: 매주 월요일 00:00 KST
// GET /api/cron/grade-update
// Authorization: Bearer CRON_SECRET
```

**파일:** `vercel.json` — cron 추가
```json
{
  "crons": [
    {
      "path": "/api/cron/grade-update",
      "schedule": "0 15 * * 0"
    }
  ]
}
```
(UTC 15:00 일요일 = KST 00:00 월요일)

---

## 7. 포인트 적립 로직 (Phase 7)

### 구매 시 자동 적립

**파일:** `src/app/(storefront)/checkout/actions.ts` — 수정

주문 완료 시:
```typescript
// 1. 고객의 등급 조회
// 2. 주문 금액이 minPurchaseForPoint 이상인지 확인
// 3. 적립금 = Math.min(주문금액 * pointRate, maxPointPerOrder)
// 4. PointTransaction 생성 (type: "PURCHASE")
// 5. Customer.points += 적립금
```

### 포인트 사용

**파일:** `src/app/(storefront)/checkout/actions.ts` — 수정

결제 시 포인트 차감:
```typescript
// 1. 사용할 포인트 <= Customer.points 확인
// 2. PointTransaction 생성 (type: "USE", amount: -포인트사용액)
// 3. Customer.points -= 사용액
// 4. Order.pointUsed = 사용액
```

---

## 8. 마이그레이션 실행 순서

```
Step 1: 스키마 변경 + 마이그레이션 (Section 1)
  npx prisma migrate dev --name imweb_migration_schema

Step 2: 시드 업데이트 (Section 5)
  npx prisma db seed

Step 3: 회원 이관 (Section 2)
  npx tsx scripts/migrate-members.ts

Step 4: 상품 이관 (Section 3)
  npx tsx scripts/migrate-products.ts

Step 5: 주문 이관 (Section 4)
  npx tsx scripts/migrate-orders.ts

Step 6: 검증
  npx tsx scripts/verify-migration.ts
```

---

## 9. 검증 스크립트

**생성:** `scripts/verify-migration.ts`

```typescript
// 1. Customer 수 검증: 18,764명
// 2. 등급별 분포 확인
// 3. 포인트 합계 검증
// 4. Product 수 검증: 1,754개
// 5. Order 수 검증: 44,544건
// 6. OrderItem 수 검증: 84,933건
// 7. 고객-주문 매칭률 확인
// 8. 금액 무결성 검증 (주문별 subtotal 계산)
```

---

## 10. 추가 백로그 (이관 후)

### 10-1. 무통장입금 확인 API
- 어드민에서 수동 입금 확인 → Order/Payment 상태 자동 업데이트
- `src/app/(admin)/admin/orders/actions.ts`에 `confirmDeposit()` 추가
- Payment.depositConfirmedAt, depositConfirmedBy 업데이트

### 10-2. 어드민 개선
- 고객 목록에 등급/포인트/구매금액 표시
- 고객 상세에 포인트 이력, 주문 이력 탭
- 등급 관리 페이지 (CRUD)
- 포인트 수동 지급/차감 기능

### 10-3. 우체국 택배 배송 API
- 스마트택배(Sweet Tracker) API 연동
- 배송 추적 타임라인 UI (어드민 + 스토어프론트)
- 자동 배송 상태 갱신

### 10-4. 첫 로그인 비밀번호 변경 플로우
- `forcePasswordChange: true`인 고객 → 로그인 후 비밀번호 변경 페이지로 리다이렉트
- middleware.ts에서 체크 (쿠키 기반)
- `src/app/(storefront)/change-password/page.tsx` 신규 생성

### 10-5. 아임웹 API 리버스 엔지니어링 — 무결 데이터 보강
- **목표:** 엑셀 내보내기에 포함되지 않은 데이터를 아임웹 내부 API에서 직접 추출
- **방법:** Proxyman MCP 또는 브라우저 DevTools Network 탭으로 XHR 캡처
- **아임웹 내부 API 패턴:** `POST /admin/ajax/*.cm` (JWT 5분 만료, 브라우저 세션 필요)
- **사이트 코드:** `S2022030712d611422a02a` / `u202203076225aebe365d7`

#### 확보 필요 데이터:
1. **카테고리 매핑 (CATE ID → 카테고리명)**
   - 엑셀 상품의 카테고리는 `CATE10,CATE13,...` 형태의 ID만 존재
   - 아임웹 어드민 쇼핑 > 카테고리 페이지에서 트리 구조 + CATE ID 매핑 캡처
   - 캡처 후 `scripts/category-mapping.json` 생성
2. **상품 썸네일 URL**
   - 엑셀에 상품 썸네일 이미지 URL 미포함
   - `/admin/ajax/shopping/product/get_product.cm` 또는 유사 엔드포인트에서 추출
   - 추출 후 Supabase Storage로 이관
3. **회원 추가 데이터**
   - 엑셀에 없는 필드: 위시리스트, 장바구니 내역, 쿠폰 보유 현황
   - `/admin/ajax/member/get_member.cm` 등에서 개별 회원 상세 조회
4. **주문 결제 상세**
   - PG 결제 정보 (결제수단 상세, 카드사, 승인번호 등)
   - 엑셀에는 "선결제" 같은 기본 정보만 존재

#### 확보된 API 엔드포인트 (member.js 분석):
```
/admin/ajax/member/get_member.cm       — 회원 상세
/admin/ajax/member/get_group.cm        — 회원 그룹
/admin/ajax/member/get_total_count.cm  — 총 회원 수
/admin/ajax/member/get_group_count.cm  — 그룹별 회원 수
/admin/ajax/member/request_excel_member_list.cm  — 엑셀 내보내기
```

---

## 리버스 엔지니어링 결과 (추후 추가)

> 위 10-5 항목의 실행 결과를 여기에 추가 예정.
> Proxyman MCP 또는 브라우저 캡처로 확보한 JSON 응답 기반.
