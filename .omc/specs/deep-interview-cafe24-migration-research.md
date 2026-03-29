# Deep Interview Spec: Cafe24/아임웹 → 자사몰 이관 트렌드 리서치 (전자담배몰 중심)

## Metadata
- Interview ID: di-cafe24-migration-research
- Rounds: 10
- Final Ambiguity Score: 20%
- Type: brownfield
- Generated: 2026-03-29
- Threshold: 0.2
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.35 | 0.298 |
| Constraint Clarity | 0.80 | 0.25 | 0.200 |
| Success Criteria | 0.75 | 0.25 | 0.188 |
| Context Clarity | 0.80 | 0.15 | 0.120 |
| **Total Clarity** | | | **0.805** |
| **Ambiguity** | | | **0.195** |

## Goal
한국 전자담배 쇼핑몰 시장에서 Cafe24/아임웹 등 SaaS 플랫폼에서 자사몰(독립 쇼핑몰)로 이관하는 트렌드가 실제로 존재하는지 검증하고, 존재한다면 그 원인을 규제 환경 변화 중심으로 분석한다. 리서치 결과는 영업 전략 수립과 시장 이해 양쪽에 활용한다.

### 2단계 구조
1. **가설 검증**: "전자담배몰에서 SaaS → 자사몰 이관이 증가하고 있다"는 가설이 사실인지 데이터/사례/커뮤니티 의견으로 검증
2. **원인 분석**: 검증된 경우, 주요 원인을 규제 환경 변화 중심으로 전방위 분석 (플랫폼 한계, 비즈니스 요인 포함)

## Constraints
- **지역**: 한국 시장만 (해외 사례 제외)
- **규제 범위**: 특정 규제 중심 (담배사업법, 청소년보호법, 전자상거래법, 국민건강증진법 등)
- **플랫폼**: Cafe24, 아임웹이 주요 분석 대상 (Shopify 등은 보조)
- **리서치 소스**: 웹 리서치 (뉴스, 법령, 커뮤니티, 업계 블로그, 공식 문서)
- **결과물 형태**: 상세 마크다운 리포트 + 요약 HTML 프레젠테이션
- **기존 제안서와의 관계**: 독립 리서치 자료 (presentation.html, meeting-checklist.html과 분리)
- **실행 구성**: 1 Planner / 10 Workers / 10 Reviewers

## Non-Goals
- 해외 시장 규제 비교 분석
- 기존 제안서(presentation.html) 직접 수정
- 특정 고객사를 위한 맞춤 제안서 작성
- 기술 스택 비교 (Next.js vs Cafe24 등)
- 이관 실행 가이드 또는 기술 매뉴얼

## Acceptance Criteria
- [ ] 가설 검증: "전자담배몰 SaaS→자사몰 이관 증가" 트렌드가 사실인지 판단할 수 있는 복합 근거 확보
- [ ] 규제-이관 인과관계가 명확한 사례 최소 3건 이상 발굴
- [ ] Cafe24/아임웹이 전자담배 규제를 기술적으로 대응할 수 없다는 구체적 증거 확보
- [ ] 업계 전문가/커뮤니티에서 이 트렌드를 확인하는 의견 수집
- [ ] 상세 마크다운 리포트 작성 (.omc/research/ 폴더)
- [ ] 핵심 인사이트 요약 HTML 프레젠테이션 작성
- [ ] 영업 전략에 활용 가능한 수준의 데이터 기반 인사이트 포함

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 전자담배몰에서 이관이 특히 많다 | Contrarian: 실제 데이터가 있는지, 체감인지? | **가설(추측)** — 리서치의 1단계에서 검증 필요 |
| 규제가 이관의 주 원인이다 | Simplifier: 3가지 요인 중 1순위만 고르면? | **규제 환경 변화가 1순위** — 나머지는 보조 분석 |
| 한국만 조사하면 충분하다 | Ontologist: 해외 사례 비교가 필요한지? | **한국만, 특정 규제 중심** — 해외는 스코프 밖 |
| 더본투비 경험이 가설의 근거다 | 가설 출처 확인 | **복합적** — 더본투비 경험 + 업계 전반 관찰 |
| 리서치가 제안서에 반영되어야 한다 | 기존 자료와의 관계는? | **독립 자료** — 영업 상담 시 근거로 활용 |

## Technical Context
### Brownfield — 기존 프로젝트 구조
- `presentation.html`: 16슬라이드 쇼핑몰 이관 제안서 (Cafe24/아임웹 → 자사몰)
- `meeting-checklist.html`: 9슬라이드 미팅 체크리스트
- `clone-demo.html`: 더본투비 전자담배몰 클론 데모 (19+ 연령인증 포함)
- `admin-demo.html`: 어드민 대시보드 데모
- `.firecrawl/theborntobi-main.md`: 더본투비 크롤링 데이터

### 리서치 결과물 저장 위치
- 상세 리포트: `.omc/research/cafe24-migration/`
- 요약 프레젠테이션: 프로젝트 루트 (HTML)

## Research Topics for Workers (10명 분배)

### Axis 1: 규제 환경 변화 (4 Workers)
1. **W1**: 한국 전자담배 규제 현황 총정리 (담배사업법, 청소년보호법, 국민건강증진법, 전자상거래법)
2. **W2**: 최근 2-3년 전자담배 규제 변화 타임라인 (법 개정, 시행령 변경, 판례)
3. **W3**: 전자담배 온라인 판매 관련 규제 (연령인증, 광고 제한, 성분표시, 결제 제한)
4. **W4**: Cafe24/아임웹에서 전자담배 관련 정책 (카테고리 제한, 심사 기준, 계정 정지 사례)

### Axis 2: 플랫폼 한계 (3 Workers)
5. **W5**: Cafe24 전자담배몰 운영 한계 (기능 제한, 커스터마이징 불가 항목)
6. **W6**: 아임웹 전자담배몰 운영 한계 (동일 분석)
7. **W7**: SaaS → 자사몰 이관 사례 수집 (전자담배몰뿐 아니라 규제 업종 전반)

### Axis 3: 비즈니스/시장 (3 Workers)
8. **W8**: 한국 전자담배 시장 규모 및 성장 추이 (정량 데이터)
9. **W9**: 전자담배 커뮤니티/포럼에서 쇼핑몰 이관 관련 논의 수집
10. **W10**: 전자담배몰 경쟁 환경 분석 (주요 플레이어, 자사몰 vs SaaS 비율)

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Cafe24 | external platform | SaaS 쇼핑몰 빌더, 카테고리 정책, 심사 기준 | 이관 출발점 |
| 아임웹 | external platform | SaaS 쇼핑몰 빌더, 템플릿 기반 | 이관 출발점 |
| 자사몰 | core domain | 독립 커스텀 쇼핑몰, 완전 통제권 | 이관 도착점 |
| 전자담배몰 | core domain (niche) | 전자담배 특화 쇼핑몰, 규제 대상 | 자사몰의 하위 카테고리 |
| 이관 | process | 플랫폼 변경 프로세스 | Cafe24/아임웹 → 자사몰 |
| 담배사업법 | regulation | 담배 제조/판매 규제 | 전자담배몰에 직접 적용 |
| 청소년보호법 | regulation | 연령인증 의무, 판매 제한 | 전자담배몰 19+ 인증 요구 |
| 국민건강증진법 | regulation | 광고 제한, 성분 표시 | 전자담배 마케팅 제약 |
| 전자상거래법 | regulation | 온라인 판매 일반 규정 | 전자담배몰 운영 기반 |
| 한국 전자담배 시장 | market | 시장 규모, 성장률, 경쟁 구도 | 이관 트렌드의 배경 |
| 플랫폼 한계 | research axis | 기술 제약, 정책 제한 | 이관 원인 후보 |
| 규제 환경 변화 | research axis (primary) | 법 개정, 시행령, 판례 | 이관 원인 1순위 |
| 비즈니스 요인 | research axis | 브랜딩, 데이터 소유, 비용 | 이관 원인 보조 |
| 가설 검증 | process | 트렌드 존재 여부 확인 | 리서치 1단계 |
| 복합 검증 기준 | success criteria | 사례 3건+ / 플랫폼 증거 / 커뮤니티 의견 | Reviewer 판단 기준 |
| 듀얼 아웃풋 | output | 마크다운 리포트 + HTML 프레젠테이션 | 리서치 결과물 형태 |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 6 | 6 | - | - | N/A |
| 2 | 9 | 3 | 0 | 6 | 67% |
| 3 | 12 | 3 | 0 | 9 | 75% |
| 4 | 13 | 1 | 0 | 12 | 92% |
| 5 | 13 | 0 | 0 | 13 | 100% |
| 6 | 13 | 0 | 0 | 13 | 100% |
| 7 | 14 | 1 | 0 | 13 | 93% |
| 8 | 15 | 1 | 0 | 14 | 93% |
| 9 | 16 | 1 | 0 | 15 | 94% |
| 10 | 16 | 0 | 0 | 16 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (10 rounds)</summary>

### Round 1
**Q:** 이 리서치의 최종 아웃풋은 무엇이 되어야 하나요? 즉, 리서치 결과물을 어디에 어떻게 활용할 계획인가요?
**A:** 영업 전략 수립, 경쟁사/시장 이해
**Ambiguity:** 70% (Goal: 0.50, Constraints: 0.10, Criteria: 0.15, Context: 0.40)

### Round 2
**Q:** 리서치 범위를 정해보겠습니다. 전자담배몰에서 이관 건이 많아지는 이유를 조사할 때, 어느 범위까지 파고들어야 하나요?
**A:** 전방위 조사 (플랫폼 한계 + 규제 환경 + 비즈니스 요인)
**Ambiguity:** 64% (Goal: 0.50, Constraints: 0.35, Criteria: 0.15, Context: 0.40)

### Round 3
**Q:** 리서치가 완료되었을 때, 어떤 것이 나와야 '성공적인 리서치'라고 할 수 있나요?
**A:** 이관 근거 자료 + 시장 트렌드 이해 + 데이터 기반 인사이트
**Ambiguity:** 49% (Goal: 0.65, Constraints: 0.35, Criteria: 0.55, Context: 0.40)

### Round 4 [Contrarian Mode]
**Q:** '전자담배몰에서 특히 이관이 많다'는 것은 어디서 나온 인사이트인가요? 실제 데이터가 있는건지, 체감적으로 느낀 것인지에 따라 리서치 방향이 달라집니다.
**A:** 추측/가설 (아직 검증되지 않음)
**Ambiguity:** 44% (Goal: 0.70, Constraints: 0.45, Criteria: 0.55, Context: 0.40)
**핵심 발견:** 리서치의 1단계는 가설 검증이어야 함

### Round 5
**Q:** '전자담배몰 이관 증가' 가설은 더본투비 같은 구체적인 고객 경험에서 나온 것인가요, 아니면 더 넓은 업계 상황에서 느낀 것인가요?
**A:** 복합적 (더본투비 경험 + 업계 전반 관찰)
**Ambiguity:** 42% (Goal: 0.70, Constraints: 0.45, Criteria: 0.55, Context: 0.55)

### Round 6 [Simplifier Mode]
**Q:** 10명의 Workers가 웹 리서치를 수행합니다. 만약 리서치 주제를 3개만 골라야 한다면, 어떤 것이 가장 가치 있는 인사이트를 줄까요?
**A:** 규제 환경 변화 (1순위)
**Ambiguity:** 38% (Goal: 0.70, Constraints: 0.60, Criteria: 0.55, Context: 0.55)

### Round 7
**Q:** 리서치 결과를 Reviewers가 평가할 때, '이 정도면 가설이 검증됐다'고 판단할 기준이 필요합니다. 어떤 근거가 모이면 충분하다고 보시나요?
**A:** 복합 근거 (사례 3건+ / 플랫폼 증거 / 커뮤니티 의견 모두 필요)
**Ambiguity:** 34% (Goal: 0.70, Constraints: 0.60, Criteria: 0.75, Context: 0.55)

### Round 8
**Q:** 리서치 결과물은 어떤 형태로 만들어야 하나요?
**A:** 마크다운 리포트 + 요약 프레젠테이션 (듀얼 아웃풋)
**Ambiguity:** 28% (Goal: 0.85, Constraints: 0.60, Criteria: 0.75, Context: 0.55)

### Round 9 [Ontologist Mode]
**Q:** '전자담배 규제 환경 변화'라는 것은 한국 시장만의 이야기인가요? 특정 규제를 염두에 두고 계신 건지?
**A:** 한국만, 특정 규제 중심 (담배사업법, 청소년보호법 등)
**Ambiguity:** 23% (Goal: 0.85, Constraints: 0.80, Criteria: 0.75, Context: 0.55)

### Round 10
**Q:** 리서치 결과물이 기존 제안서(presentation.html, meeting-checklist.html)와 어떻게 연결되어야 하나요?
**A:** 독립 리서치 자료 (기존 제안서와 분리, 영업 상담 시 근거로 활용)
**Ambiguity:** 20% (Goal: 0.85, Constraints: 0.80, Criteria: 0.75, Context: 0.80)

</details>
