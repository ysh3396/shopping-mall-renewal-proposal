@AGENTS.md

## Project Notes

### RBAC Pattern (Next.js 16)
- middleware.ts는 쿠키 존재 확인만 (RBAC 넣지 말 것 — Next.js 16에서 deprecated)
- 권한 체크는 반드시 server actions 레벨: `requireAuth()` / `requirePermission(resource, action)`
- 파일: `src/lib/rbac.ts`

### isRestricted 필드 주의
- Category/Product의 `isRestricted`는 성인인증 UI 표시용 플래그
- **스토어프론트 쿼리에서 isRestricted로 필터링하지 말 것** — 카테고리가 숨겨지는 버그 발생
- 쿼리 필터는 `isActive`만 사용

### 시스템 계정
- `system@theborntobi.com` (isActive: false) — audit log 전용, 로그인 불가
- 의도적 설계이므로 isActive를 true로 변경하지 말 것

### sanitize.ts
- regex 기반 HTML sanitizer — MVP용
- 프로덕션 배포 전 `isomorphic-dompurify`로 교체 필요

### images.unoptimized (next.config.ts)
- `images.unoptimized: true`는 로컬 NAT64 환경에서 private IP 차단 우회용
- **프로덕션 배포 시 반드시 제거** — Next.js 이미지 최적화 활성화 필요
- `remotePatterns`에 Supabase 호스트네임 설정 완료

### DB 재시드 (이미지 URL 변경 시)
- `prisma/seed-data/products.json`이나 `prisma/seed.ts`의 이미지 URL 변경 시 반드시 DB 재시드
- 명령: `npx prisma db seed`
- 재시드 없이 URL만 교체하면 DB와 소스 파일 불일치

### 택배사
- 원본 사이트 기준 우체국택배 사용

## Supabase Storage

- Bucket: `images` (public)
- 폴더: `products/`, `banners/`, `details/`
- Public URL: `{SUPABASE_URL}/storage/v1/object/public/images/{folder}/{filename}`
- 유틸리티: `src/lib/supabase.ts` — `getSupabaseAdmin()`, `STORAGE_BUCKET`, `getPublicUrl(path)`

### 어드민 이미지 업로드
- Server action: `src/app/(admin)/admin/products/upload-action.ts`
- 허용: JPG, PNG, WebP, GIF / 최대 10MB
- `requireAuth()` 가드 적용

### 마이그레이션 스크립트
- `scripts/download-cdn-images.mjs` — CDN → 로컬 다운로드 + URL 교체
- `scripts/upload-to-supabase.mjs` — 로컬 → Supabase Storage 업로드 + URL 교체
