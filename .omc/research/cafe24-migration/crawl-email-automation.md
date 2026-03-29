# 전자담배 쇼핑몰 사업자정보 자동 수집 및 이메일 발송 리서치

> 작성일: 2026-03-29

---

## 1. 한국 전자상거래법상 사업자정보 표시 의무

### 1.1 법적 근거

- **전자상거래 등에서의 소비자보호에 관한 법률** (전자상거래법)
- **통신판매업 신고** 의무 (정부24 통해 신고)

### 1.2 필수 공개 항목

전자상거래법에 따라 인터넷 쇼핑몰 운영자는 **초기 화면(또는 초기 화면에서 연결된 사업자정보 공개페이지)** 에 다음 정보를 반드시 표시해야 한다:

| # | 항목 | 비고 |
|---|------|------|
| 1 | **상호(법인명)** | 사업자등록증 기준 |
| 2 | **대표자 성명** | |
| 3 | **영업소 소재지 주소** | 소비자 불만 처리 가능 주소 포함 |
| 4 | **전화번호** | 고객 연락 가능 번호 |
| 5 | **전자우편주소(이메일)** | |
| 6 | **사업자등록번호** | |
| 7 | **통신판매업 신고번호** | 관할 지자체 신고 |
| 8 | **인터넷쇼핑몰 이용약관** | |
| 9 | **개인정보처리방침** | |
| 10 | **구매안전서비스(에스크로)** | 결제대금예치 표시 |
| 11 | **호스팅서비스 제공자 상호** | |

### 1.3 위반 시 제재

- **과태료**: 최대 500만원 (1차 100만원, 2차 200만원, 3차 500만원)
- **시정조치 명령 불이행**: 영업정지 또는 과징금 부과

### 1.4 크롤링 관점에서의 의미

> 전화번호와 이메일은 법적 필수 공개 항목이므로, 대부분의 정상 운영 쇼핑몰에서 수집 가능하다.
> 이 정보는 쇼핑몰 하단(footer) 또는 별도 "사업자정보" 페이지에 위치한다.

---

## 2. 사업자정보 추출 자동화 도구/방법

### 2.1 Python requests + BeautifulSoup (정적 페이지)

가장 가볍고 빠른 방식. JS 렌더링이 불필요한 정적 HTML 페이지에 적합하다.

#### 장점
- 설치 간단 (`pip install requests beautifulsoup4`)
- 속도 빠름 (브라우저 불필요)
- 리소스 소모 최소

#### 단점
- JavaScript 렌더링 불가 (SPA, 동적 로딩 콘텐츠 수집 불가)
- 봇 차단 우회 어려움

#### 코드 예시

```python
import requests
from bs4 import BeautifulSoup
import re

def scrape_business_info(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                       'AppleWebKit/537.36 (KHTML, like Gecko) '
                       'Chrome/120.0.0.0 Safari/537.36'
    }
    response = requests.get(url, headers=headers, timeout=10)
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')

    # footer 영역에서 사업자정보 추출
    footer = soup.find('footer') or soup.find('div', class_=re.compile(r'footer|bottom'))

    # 이메일 추출
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    emails = re.findall(email_pattern, response.text)

    # 전화번호 추출
    phone_pattern = r'(\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})'
    phones = re.findall(phone_pattern, response.text)

    # 사업자등록번호 추출
    biz_num_pattern = r'(\d{3}[-.\s]?\d{2}[-.\s]?\d{5})'
    biz_numbers = re.findall(biz_num_pattern, response.text)

    return {
        'url': url,
        'emails': list(set(emails)),
        'phones': list(set(phones)),
        'business_numbers': list(set(biz_numbers)),
    }
```

#### Cafe24 쇼핑몰 특화 구조

Cafe24 쇼핑몰의 사업자정보는 다음 위치에 존재:

- **HTML 경로**: `footer.html` 내 `<div module="Layout_footer">`
- **주요 템플릿 변수**:
  - `{$company_name}` - 법인명
  - `{$president_name}` - 대표자명
  - `{$company_regno}` - 사업자등록번호
  - `{$network_regno}` - 통신판매업 신고번호
  - `{$phone}`, `{$fax}` - 전화, 팩스
  - `{$mall_addr1}`, `{$mall_addr2}` - 주소

> 실제 렌더된 HTML에서는 이 변수가 실제 값으로 치환되어 있으므로 BS4로 바로 파싱 가능.

---

### 2.2 Playwright / Puppeteer (동적 페이지)

JavaScript 렌더링이 필요한 SPA 기반 쇼핑몰에 적합하다.

#### Playwright vs Puppeteer 비교

| 항목 | Playwright | Puppeteer |
|------|-----------|-----------|
| 언어 지원 | Python, JS, Java, C# | JS/TS 전용 |
| 브라우저 | Chromium, Firefox, WebKit | Chrome/Chromium 전용 |
| Auto-waiting | 내장 (자동 대기) | 수동 설정 필요 |
| 봇 탐지 우회 | 비교적 우수 | 기본 수준 |
| 병렬 처리 | 네이티브 지원 | 가능하나 설정 필요 |

#### Playwright 추천 이유

- **Python 네이티브 지원**: `pip install playwright && playwright install`
- **Auto-waiting**: 동적 콘텐츠 로딩 자동 대기
- **멀티 브라우저**: 다양한 환경 시뮬레이션 가능
- **Browser fingerprint 위장**: 봇 차단 우회에 유리

#### Playwright 코드 예시

```python
from playwright.sync_api import sync_playwright
import re

def scrape_with_playwright(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until='networkidle')

        # 전체 페이지 텍스트에서 정보 추출
        content = page.content()

        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        emails = re.findall(email_pattern, content)

        phone_pattern = r'(\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})'
        phones = re.findall(phone_pattern, content)

        browser.close()
        return {'emails': emails, 'phones': phones}
```

#### Crawlee (Apify) - 고급 프레임워크

Crawlee는 Apify에서 만든 Python/Node.js 크롤링 프레임워크로, Playwright를 래핑하여 더 안정적인 크롤링을 제공한다.

**주요 특징:**
- 자동 재시도 + 요청 큐 관리
- 프록시 로테이션 내장
- 브라우저 fingerprint 랜덤화 (봇 탐지 우회)
- 세션 관리 자동화
- BS4/Playwright 양쪽 백엔드 지원

```bash
pip install crawlee[playwright]
```

---

### 2.3 Firecrawl (LLM 최적화 크롤러)

AI/LLM 워크플로에 최적화된 웹 데이터 API. Y Combinator 투자 기업.

#### 핵심 기능

| 기능 | 설명 |
|------|------|
| **Scrape** | URL -> 마크다운/HTML/구조화된 JSON 변환 |
| **Crawl** | 사이트 전체를 재귀적으로 크롤링 |
| **Search** | 웹 검색 + 결과 페이지 콘텐츠 일괄 수집 |
| **Map** | 사이트맵 기반 URL 목록 수집 |
| **Extract** | LLM 기반 구조화된 데이터 추출 |
| **Interact** | 페이지 상호작용 (클릭, 폼 입력) |

#### 성능

- 98% 추출 정확도
- HTML 대비 67% 적은 토큰 사용 (LLM 비용 절감)
- 50ms 평균 응답 시간
- JS 렌더링 자동 지원

#### 요금제

| 요금제 | 월 가격 | 크레딧 | 동시 요청 |
|--------|---------|--------|----------|
| **Free** | $0 | 500 | 2 |
| **Hobby** | $16 | 3,000 | 5 |
| **Standard** | $83 | 100,000 | 50 |
| **Growth** | $333 | 500,000 | 100 |
| **Scale** | $599 | 1,000,000 | 150 |

> 크레딧: Scrape/Crawl = 1크레딧/페이지, Search = 2크레딧/10결과

#### 설치 및 사용

```bash
pip install firecrawl-py
```

```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# 단일 페이지 스크래핑
result = app.scrape_url("https://example-vape-shop.cafe24.com", {
    'formats': ['markdown', 'html']
})

# 사업자정보 구조화 추출
extracted = app.scrape_url("https://example-vape-shop.cafe24.com", {
    'formats': ['extract'],
    'extract': {
        'schema': {
            'type': 'object',
            'properties': {
                'company_name': {'type': 'string'},
                'ceo_name': {'type': 'string'},
                'email': {'type': 'string'},
                'phone': {'type': 'string'},
                'business_number': {'type': 'string'},
                'address': {'type': 'string'}
            }
        }
    }
})
```

#### 사업자정보 수집에 Firecrawl이 적합한 이유

1. **구조화 추출**: LLM이 페이지를 이해하고 사업자정보를 JSON으로 자동 추출
2. **JS 렌더링 자동**: SPA 쇼핑몰도 문제없이 처리
3. **대량 크롤링**: crawl API로 다수 쇼핑몰 일괄 처리
4. **마크다운 변환**: 후처리 단계에서 GPT/Claude로 재분석 용이

---

### 2.4 도구 선택 가이드

| 시나리오 | 추천 도구 | 이유 |
|---------|----------|------|
| Cafe24 쇼핑몰 10~50개 | requests + BS4 | 정적 HTML, 빠르고 무료 |
| JS 렌더링 필요 쇼핑몰 | Playwright | 동적 콘텐츠 지원 |
| 100개 이상 대량 수집 | Crawlee + Playwright | 재시도/큐/프록시 자동화 |
| LLM 기반 구조화 추출 | Firecrawl | 스키마 기반 자동 추출 |
| 빠른 프로토타입 | Firecrawl Free | 500페이지 무료, 코드 최소화 |

---

## 3. 이메일 정규식 패턴으로 페이지에서 이메일 자동 추출

### 3.1 기본 이메일 정규식

```python
import re

# 범용 이메일 패턴
EMAIL_PATTERN = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'

# 간단한 패턴 (빠르지만 false positive 가능)
SIMPLE_PATTERN = r'\S+@\S+\.\S+'

# RFC 5322 준수 엄격한 패턴
STRICT_PATTERN = r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])"
```

### 3.2 실전: 웹페이지에서 이메일 추출 함수

```python
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def extract_emails_from_url(url):
    """웹페이지에서 이메일 주소를 추출하는 함수"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                       'AppleWebKit/537.36'
    }

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.encoding = 'utf-8'
    except requests.RequestException:
        return []

    # HTML 텍스트에서 이메일 추출
    pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    raw_emails = re.findall(pattern, resp.text)

    # mailto: 링크에서도 추출
    soup = BeautifulSoup(resp.text, 'html.parser')
    for a_tag in soup.find_all('a', href=re.compile(r'^mailto:')):
        href = a_tag.get('href', '')
        email = href.replace('mailto:', '').split('?')[0]
        raw_emails.append(email)

    # 필터링: 이미지 파일 등 false positive 제거
    noise_extensions = ('.png', '.jpg', '.gif', '.svg', '.css', '.js')
    valid_emails = [
        e.lower() for e in set(raw_emails)
        if not any(e.lower().endswith(ext) for ext in noise_extensions)
        and len(e) < 100
        and '.' in e.split('@')[-1]
    ]

    return list(set(valid_emails))
```

### 3.3 대량 쇼핑몰 이메일 수집 파이프라인

```python
import csv
import time

def batch_extract_emails(shop_urls, output_csv='vape_shop_emails.csv'):
    """다수 쇼핑몰에서 이메일을 일괄 수집"""
    results = []

    for url in shop_urls:
        print(f"Scraping: {url}")
        emails = extract_emails_from_url(url)
        for email in emails:
            results.append({'url': url, 'email': email})
        time.sleep(1)  # 예의 바른 크롤링: 1초 딜레이

    # CSV로 저장
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['url', 'email'])
        writer.writeheader()
        writer.writerows(results)

    print(f"총 {len(results)}개 이메일 수집 완료 -> {output_csv}")
    return results
```

### 3.4 이메일 추출 시 주의사항

- **false positive 필터링**: `noreply@`, `example@`, 이미지 파일명 등 제거 필요
- **난독화 대응**: `info [at] shop [dot] com` 형식은 별도 패턴 필요
- **JavaScript 렌더링**: 이메일이 JS로 동적 삽입되는 경우 Playwright 사용
- **robots.txt 준수**: 크롤링 전 `robots.txt` 확인 권장

---

## 4. 대량 이메일 발송 도구

### 4.1 한국 서비스

#### 스티비 (Stibee) - 추천

한국 시장에 최적화된 이메일 마케팅 서비스.

**요금제:**

| 요금제 | 월 가격 | 구독자 | 발송 | 사용자 |
|--------|---------|--------|------|--------|
| **스타터** | 무료 | 500명 | 월 2회 | 1명 |
| **스탠다드** | 8,900원~ | 500명+ | 무제한 | 3명 |
| **프로** | 29,000원~ | 유동적 | 무제한 | 10명 |
| **엔터프라이즈** | 57,000원~ | 대규모 | 무제한 | 무제한 |

**주요 기능:**
- 메일머지 (개인화 변수 삽입)
- 자동 이메일 시퀀스
- A/B 테스트 (프로 이상)
- 세그먼트 관리 (프로: 50개, 엔터프라이즈: 무제한)
- 전용 발송 서버 (엔터프라이즈)
- 연간 결제 시 10% 할인
- 비영리단체 30% 할인

**핵심 장점:**
- KISA 화이트리스트 등록 서버 (높은 수신율)
- 한국어 UI/고객지원
- 수신거부 링크 자동 삽입 (법적 준수)
- 크리에이터 지원 프로그램

#### 기타 한국 서비스

| 서비스 | 특징 |
|--------|------|
| **Relate Engage** | B2B 콜드메일 자동화 특화, CRM 연동 |
| **세일즈맵** | B2B 영업 이메일 시퀀스 자동화 |

---

### 4.2 글로벌 서비스

#### Mailchimp

| 항목 | 내용 |
|------|------|
| **장점** | 직관적 UI, 드래그앤드롭 에디터, 마케팅 자동화 |
| **단점** | 한국어 미지원, 한국 발송 서버 부재로 수신율 낮을 수 있음 |
| **가격** | Free(500명/월1,000건), Essentials($13/mo~), Standard($20/mo~) |
| **적합** | 글로벌 대상 마케팅, 디자인 중심 뉴스레터 |

#### SendGrid (Twilio)

| 항목 | 내용 |
|------|------|
| **장점** | 대량 트랜잭셔널 이메일, 개발자 친화적 API, 높은 전송률 |
| **단점** | 마케팅 자동화 기능 제한적, 한국어 미지원 |
| **가격** | Free(100건/일), Essentials($19.95/mo~), Pro($89.95/mo~) |
| **적합** | API 기반 대량 발송, 개발자 직접 연동 |

### 4.3 B2B 제안서 발송 도구 추천 조합

```
[수집] Firecrawl/BS4 -> [저장] CSV/DB -> [발송] 스티비 or Relate Engage
```

**권장 워크플로:**
1. 전자담배 쇼핑몰 URL 목록 수집 (Google 검색, 네이버 검색)
2. requests+BS4 또는 Firecrawl로 사업자정보(이메일, 전화번호) 자동 추출
3. CSV로 정리 후 스티비에 구독자 목록으로 업로드
4. 제안서 템플릿 작성 + 메일머지로 개인화 발송
5. 오픈율/클릭율 추적 및 후속 시퀀스 설정

---

## 5. 법적 고려사항

### 5.1 관련 법률 체계

| 법률 | 주요 내용 |
|------|----------|
| **정보통신망법 제50조** | 영리목적 광고성 정보 전송 제한 |
| **개인정보보호법** | 개인정보 수집/이용/제공 규제 |
| **전자상거래법** | 사업자정보 표시 의무 |

### 5.2 정보통신망법 제50조 핵심 요약

#### 기본 원칙: 사전 동의(Opt-in) 필수

> "누구든지 전자적 전송매체를 이용하여 영리목적의 광고성 정보를 전송하려면 그 수신자의 **명시적인 사전 동의**를 받아야 한다."

#### 사전동의 예외 조건 (2가지만)

1. **기존 거래관계**: 금전적 대가를 지불한 거래를 통해 **직접** 수집한 연락처로, 거래 종료 후 **6개월 이내**에 **동일 종류** 상품 광고를 전송하는 경우
2. **전화권유판매**: 방문판매법상 전화권유판매자가 개인정보 출처 고지 후 음성 전화로 권유하는 경우

#### 추가 의무사항

- **표시 의무**: 전송자 명칭, 연락처, 수신거부/철회 방법 명시
- **야간 제한**: 오후 9시 ~ 오전 8시 발송 시 **별도 사전 동의** 필요
- **수신거부 처리**: 수신거부 의사 표시 시 즉시 전송 중단
- **정기 확인**: 수신 동의 여부 정기적 재확인 의무

#### 위반 시 벌칙

| 위반 유형 | 1차 | 2차 | 3차 |
|----------|-----|-----|-----|
| 사전동의 없는 발송 | 750만원 | 1,500만원 | 3,000만원 |
| 표시의무 위반 | 300만원 | 600만원 | 1,000만원 |
| 수신거부 회피/방해 등 | **1년 이하 징역 또는 1천만원 이하 벌금** |

### 5.3 사업자 공개 이메일로 B2B 제안서 발송 시 법적 분석

#### 핵심 쟁점

전자담배 쇼핑몰의 법적 필수 공개 이메일로 쇼핑몰 리뉴얼 제안서를 보내는 것이 합법인가?

#### 법적 해석

**원칙적으로 위반 가능성 있음:**

1. **정보통신망법 적용**: "영리목적의 광고성 정보"에 해당하면 사전 동의 필수
2. **공개 정보라도 보호 대상**: 개인정보보호법상 "공적 생활에서 형성되었거나 이미 공개된 개인정보"도 보호 대상
3. **목적 외 사용 제한**: 사업자정보는 "소비자 보호 목적"으로 공개된 것이므로, B2B 영업 목적 사용은 당초 공개 목적과 다를 수 있음
4. **기존 거래관계 없음**: 콜드메일은 기존 거래관계가 없으므로 예외 조항 적용 불가

**다만, 실무적 관행:**

- B2B 간 1:1 맞춤형 제안 이메일은 "광고성 정보"가 아닌 "사업 제안"으로 볼 여지 있음
- 대량 발송이 아닌 개별 맞춤 발송은 규제 적용이 모호한 영역
- 실제로 많은 B2B 기업이 콜드메일을 활용하고 있으며, 단속 사례는 주로 대량 스팸에 집중

#### 리스크 최소화 전략

1. **"광고" 표기 포함**: 메일 제목에 `(광고)` 표기
2. **수신거부 링크 삽입**: 모든 메일에 수신거부 방법 명시
3. **발신자 정보 명시**: 회사명, 연락처, 주소 명확히 기재
4. **야간 발송 금지**: 21시~08시 발송 회피
5. **개인화**: 대량 발송보다 1:1 맞춤형 제안으로 작성
6. **발송량 제한**: 일일 발송량을 합리적 수준으로 유지
7. **수신거부 즉시 처리**: 거부 의사 표시 시 48시간 내 처리
8. **BCC 사용**: 다수 발송 시 수신자 이메일 노출 방지

#### 가장 안전한 접근법

```
[1단계] 사업자 전화번호로 먼저 전화 -> 이메일 발송 동의 획득
[2단계] 동의받은 이메일로 제안서 발송
[3단계] 후속 이메일 시퀀스 진행
```

> 전화 영업 후 이메일 동의를 받는 것이 법적으로 가장 안전하다.
> 콜드메일 직접 발송 시에는 위 리스크 최소화 전략을 반드시 적용해야 한다.

### 5.4 요약: 법적 리스크 매트릭스

| 방법 | 리스크 | 비고 |
|------|--------|------|
| 전화 동의 후 이메일 | **낮음** | 가장 안전 |
| 1:1 맞춤형 B2B 제안 | **중간** | "광고성 정보" 해당 여부 모호 |
| 대량 콜드메일 (수십 건) | **높음** | 정보통신망법 위반 가능 |
| 대량 스팸 (수백 건 이상) | **매우 높음** | 과태료 + 형사처벌 가능 |

---

## 6. 실행 체크리스트

- [ ] Google/네이버에서 전자담배 쇼핑몰 URL 100개 수집
- [ ] requests+BS4 스크립트로 사업자정보(이메일, 전화번호) 일괄 추출
- [ ] 수집 결과 CSV 정리 (쇼핑몰명, URL, 이메일, 전화번호, 플랫폼)
- [ ] 제안서 이메일 템플릿 작성 (광고 표기, 수신거부 링크 포함)
- [ ] 스티비 스탠다드 플랜 가입 (월 8,900원~)
- [ ] 전화 선행 -> 이메일 동의 획득 -> 동의자 대상 발송 (안전 루트)
- [ ] 또는 소량 1:1 맞춤형 제안 발송 (리스크 감수 루트)
- [ ] 오픈율/응답율 추적 -> 후속 시퀀스 운영

---

## 참고 링크

### 법률/규제
- [전자상거래 사업자 표시 의무 - 찾기쉬운 생활법령정보](https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=25&ccfNo=3&cciNo=1&cnpClsNo=1)
- [정보통신망법 제50조 - 국가법령정보센터](https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A0%95%EB%B3%B4%ED%86%B5%EC%8B%A0%EB%A7%9D%20%EC%9D%B4%EC%9A%A9%EC%B4%89%EC%A7%84%20%EB%B0%8F%20%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%20%EB%93%B1%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0/%EC%A0%9C50%EC%A1%B0)
- [개인정보보호법 - 국가법령정보센터](https://www.law.go.kr/LSW/lsInfoP.do?lsId=011357&ancYnChk=0)
- [광고성 정보 전송 가이드라인](https://developers.fingerpush.com/assemble/guide/ads)

### 크롤링 도구
- [Firecrawl - 공식 사이트](https://www.firecrawl.dev/)
- [Firecrawl - GitHub](https://github.com/firecrawl/firecrawl)
- [Firecrawl - 문서](https://docs.firecrawl.dev/introduction)
- [Crawlee Python - GitHub](https://github.com/apify/crawlee-python)
- [Playwright Python 문서](https://playwright.dev/python/)
- [BeautifulSoup 튜토리얼 - Real Python](https://realpython.com/beautiful-soup-web-scraper-python/)

### 이메일 발송
- [스티비 공식 사이트](https://stibee.com/pricing)
- [스티비 요금제 가이드](https://blog.stibee.com/stibee-pricing-guide/)
- [Relate Engage - B2B 콜드메일 자동화](https://www.relate.kr/products/engage)

### 콜드메일 가이드
- [B2B 콜드메일 도메인 가이드 - 세일즈맵](https://salesmap.kr/blog/b2b-cold-email-domain-guide)
- [콜드메일 규제 대응 - Notifly](https://blog.notifly.tech/email-regulations-2024/)
- [B2B 콜드메일 수신동의 논의 - 아이보스](https://www.i-boss.co.kr/ab-2110-24557)

### Cafe24 구조
- [Cafe24 Footer 구조](https://sdsupport.cafe24.com/module/layout/footer.html)
- [Cafe24 쇼핑몰 기본정보 설정](https://support.cafe24.com/hc/ko/articles/8471138892313)
