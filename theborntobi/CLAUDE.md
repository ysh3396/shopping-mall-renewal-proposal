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

### 택배사
- 원본 사이트 기준 우체국택배 사용
