# OpenClaw Agent Home Repo — 메모리 시스템 설계서

> **대상:** OpenClaw (Codex CLI 기반 범용 AI 에이전트, Mac Mini, Telegram 소통)
> **작성일:** 2026-04-02
> **산출물:** 설계 문서 (구조, 포맷, 워크플로우, 정책)

---

## 1. 전체 디렉토리 구조

```
openclaw-home/
├── AGENTS.md                 # Codex 시스템 프롬프트 (진입점)
├── SOUL.md                   # 에이전트 성격/가치관 (자동 생성)
├── IDENTITY.md               # 에이전트 정체성 (자동 생성)
├── USER.md                   # 사용자 프로필 (자동 생성)
├── TOOLS.md                  # 사용 가능 도구 목록 (자동 생성)
├── HEARTBEAT.md              # 에이전트 상태/건강 (자동 생성)
│
├── MEMORY.md                 # [신규] 메모리 인덱스 — 에이전트가 매 세션 읽는 핵심 파일
│
└── memory/                   # [신규] 메모리 저장소
    ├── daily/                # 일별 작업 로그
    │   ├── 2026-04-01.md
    │   ├── 2026-04-02.md
    │   └── ...
    ├── projects/             # 프로젝트별 컨텍스트
    │   ├── project-alpha.md
    │   ├── project-beta.md
    │   └── ...
    ├── feedback/             # 사용자 피드백 기록
    │   ├── coding-style.md
    │   ├── communication.md
    │   └── ...
    └── learnings/            # 학습/실수 축적
        ├── framework-gotchas.md
        ├── db-patterns.md
        └── ...
```

---

## 2. MEMORY.md — 메모리 인덱스

MEMORY.md는 **에이전트가 매 세션마다 읽는 유일한 메모리 파일**이다. 전체 메모리를 담지 않고, 각 메모리 파일을 한 줄로 요약한 인덱스 역할을 한다.

### 포맷

```markdown
# Memory Index

> Last updated: 2026-04-02
> Active projects: 3 | Total memories: 47 | Recent: 7 days

## Active Projects (항상 읽을 것)
- [project-alpha](memory/projects/project-alpha.md) — 웹앱 리뉴얼, 4/20 데드라인
- [project-beta](memory/projects/project-beta.md) — CRM 시스템, GitHub Pages 배포 완료

## Recent Daily Logs (최근 7일)
- [2026-04-02](memory/daily/2026-04-02.md) — API 연동 완료, 버그 수정 3건
- [2026-04-01](memory/daily/2026-04-01.md) — QA 수정, 이미지 마이그레이션

## Key Feedback (활성)
- [coding-style](memory/feedback/coding-style.md) — 커밋 컨벤션, 코드 패턴 지침
- [communication](memory/feedback/communication.md) — 간결한 응답, 불필요한 요약 금지

## Key Learnings (최근 추가)
- [framework-gotchas](memory/learnings/framework-gotchas.md) — 프레임워크 주의사항, breaking changes
- [db-patterns](memory/learnings/db-patterns.md) — ORM adapter 패턴, 마이그레이션 주의점
```

### 규칙
- **200줄 이하 유지** — 에이전트가 컨텍스트 윈도우에서 효율적으로 읽을 수 있도록
- **Active Projects는 항상 표시** — status가 `active`인 프로젝트만
- **Recent Daily Logs는 최근 7일만** — 오래된 건 자동 제거 (파일은 보존)
- **Feedback/Learnings는 해결되지 않은 것만** — resolved된 건 제거
- 각 항목은 한 줄, 150자 이내

---

## 3. 메모리 파일 포맷

모든 메모리 파일은 YAML frontmatter + Markdown body 구조를 따른다.

### 3-1. Daily Log (`memory/daily/YYYY-MM-DD.md`)

매 세션 종료 시 자동 작성되는 일별 작업 기록.

```markdown
---
date: 2026-04-02
type: daily
projects: [shopping-mall, cosmetic-crm]
sessions: 3
---

## Tasks Completed
- project-alpha: 사용자 인증 모듈 구현 및 테스트
- project-alpha: 보안 취약점 수정 (XSS 방지)
- project-beta: API 엔드포인트 3개 추가

## Decisions Made
- 인증: JWT + refresh token 방식 채택 (세션 기반 대비 확장성 우수)
- 보안: DOMPurify 라이브러리 선택 (SSR 호환 필요)

## Blockers / Open Questions
- project-alpha: 디자인 시안 미수령 — 클라이언트에게 재요청 필요
- project-beta: 외부 API Key 대기 중

## Tomorrow's Priority
- project-alpha: 결제 연동 착수
- project-beta: 대시보드 UI 구현 시작
```

### 3-2. Project Memory (`memory/projects/{slug}.md`)

프로젝트별 지속 컨텍스트. 프로젝트가 시작될 때 생성, 완료 시 archived로 변경.

### 3-3. Feedback (`memory/feedback/{topic}.md`)

사용자가 준 피드백과 작업 방식 지침.

### 3-4. Learnings (`memory/learnings/{topic}.md`)

기술적 발견, 실수에서 배운 것, TIL(Today I Learned).

---

## 4. 메모리 소비 전략

### Layer 1: Always Load (매 세션 필수)
```
AGENTS.md → @MEMORY.md 참조
```

### Layer 2: On-Demand Load (필요 시 참조)
- 프로젝트 관련 작업 시: 해당 `memory/projects/*.md`
- 코드 작성 시: 관련 `memory/learnings/*.md`
- 사용자 소통 시: `memory/feedback/*.md`

### Layer 3: Never Auto-Load (수동 요청 시만)
- `memory/daily/` 오래된 로그
- archived 프로젝트
- resolved feedback

---

## 5. 메모리 쓰기 워크플로우

### 5-1. 자동 쓰기 (세션 종료)
- daily log 생성/append
- project memory 업데이트
- 새 learning/feedback 생성
- MEMORY.md 인덱스 갱신

### 5-2. 수동 쓰기 (텔레그램 명령)
- "오늘 한 일 정리해"
- "이거 기억해둬: {내용}"
- "{프로젝트명} 상태 업데이트해"
- "메모리 정리해"
- "지난주 뭐했어?"

---

## 6. 메모리 정리/아카이브 정책
- Daily Logs: 최근 7일만 MEMORY.md에 표시
- completed 프로젝트는 30일 후 archived
- resolved feedback은 인덱스에서 제거
- learnings는 영구 보존

---

## 7. 메모리 타입별 요약

| 타입 | 디렉토리 | 생성 트리거 | 보존 기간 | MEMORY.md 표시 |
|------|----------|------------|----------|---------------|
| Daily Log | `memory/daily/` | 세션 종료 (자동) | 90일 → archive | 최근 7일 |
| Project | `memory/projects/` | 프로젝트 시작 | completed+30일 → archive | active만 |
| Feedback | `memory/feedback/` | 사용자 피드백 | resolved 전까지 | unresolved만 |
| Learning | `memory/learnings/` | 기술적 발견 | 영구 | 최근 추가 5개 |

---

## 8. 초기 세팅 체크리스트

1. [ ] `memory/` 디렉토리 구조 생성
2. [ ] `MEMORY.md` 초기 파일 생성
3. [ ] `AGENTS.md`에 Memory System 섹션 추가
4. [ ] 현재 진행 중인 프로젝트의 project memory 생성
5. [ ] 기존 학습 내용을 `learnings/`로 마이그레이션
6. [ ] 기존 피드백을 `feedback/`로 마이그레이션
7. [ ] 첫 daily log 수동 생성으로 동작 확인
