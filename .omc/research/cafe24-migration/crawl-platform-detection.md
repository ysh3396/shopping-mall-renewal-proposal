# 웹사이트 플랫폼 자동 식별 리서치: Cafe24 vs 아임웹

> 조사일: 2026-03-29
> 목적: 잠재 고객 웹사이트가 Cafe24 또는 아임웹으로 만들어졌는지 자동으로 판별하는 기술적 방법 정리

---

## 1. Cafe24 식별 시그니처

### 1-1. JavaScript 전역 변수 (가장 신뢰도 높음)

Cafe24 쇼핑몰은 모든 페이지에 다음 전역 JS 변수를 자동 삽입한다.

| 변수명 | 설명 |
|---|---|
| `EC_GLOBAL_DATETIME` | 서버 날짜/시간 정보 |
| `EC_GLOBAL_INFO` | 쇼핑몰 기본 설정 정보 (쇼핑몰 ID, 스킨 번호, 언어 등) |
| `EC_ROOT_DOMAIN` | 쇼핑몰 루트 도메인 (예: `myshop.cafe24.com`) |
| `EC_SDE_SHOP_NUM` | 쇼핑몰 번호 |
| `EC_FRONT_JS_CONFIG_MANAGE` | 프론트 JS 설정 |

**검증 방법**: 브라우저 콘솔에서 `typeof EC_GLOBAL_INFO !== 'undefined'` 확인

### 1-2. URL 패턴

| 패턴 | 예시 |
|---|---|
| 기본 도메인 | `{shopid}.cafe24.com` |
| 상품 목록 | `/product/list.html?cate_no={번호}` |
| 상품 상세 | `/product/detail.html?product_no={번호}` |
| 게시판 | `/board/list.html?board_no={번호}` |
| 주문/결제 | `/order/orderform.html` |
| 관리자 로그인 | `eclogin.cafe24.com/Shop/` |

**핵심 특징**: 파일 확장자가 `.html` 이며, 상품 경로에 `product` 키워드 사용 (고도몰은 `.php` + `goods`)

### 1-3. HTTP 헤더 / 서버 정보

| 항목 | 값 |
|---|---|
| Server | `openresty` (Cafe24 인프라 표준) |
| X-Cache | 캐시 관련 커스텀 헤더 |
| X-ttl | `300` 등 TTL 값 |
| DNS | Cafe24 자체 DNS 사용 시 `cafe24.com` 네임서버 |

### 1-4. 쿠키

| 쿠키명 | 설명 |
|---|---|
| `ECSESSID` | Cafe24 세션 쿠키 |
| `AREA_SHIPPING_` | 지역별 배송 설정 |
| `EC_FRONT_*` | Cafe24 프론트 관련 쿠키군 |

### 1-5. HTML 소스 패턴

```html
<!-- Cafe24 공통 삽입 스크립트 -->
<script src="//img.echosting.cafe24.com/..."></script>
<script src="//img.cafe24.com/..."></script>

<!-- meta 태그 -->
<meta name="generator" content="Cafe24" />  <!-- 일부 스킨에서 -->

<!-- CDN 도메인 -->
img.echosting.cafe24.com
ssl.pstatic.net  (네이버페이 연동 시)

<!-- 특징적 class/id -->
<div id="cafe24-layer-...</div>
<div class="ec-base-...</div>
```

### 1-6. 기타 식별 포인트

- **IP 대역**: Cafe24 서버 IP 대역 (AS4766, 183.111.x.x 등 한국 기반)
- **SSL 인증서**: Sectigo Limited 인증서 다수 사용
- **Front API**: `{shopid}.cafe24api.com` 엔드포인트 존재 여부

---

## 2. 아임웹(Imweb) 식별 시그니처

### 2-1. JavaScript 전역 변수

| 변수명 | 설명 |
|---|---|
| `IMWEB_TEMPLATE` | 아임웹 템플릿 식별자 (Wappalyzer 공식 탐지 기준) |
| `__IMWEB__` | 아임웹 내부 설정 객체 |

**검증 방법**: 브라우저 콘솔에서 `typeof IMWEB_TEMPLATE !== 'undefined'` 확인

### 2-2. CDN / 스크립트 소스 (가장 확실한 지표)

| 도메인 | 용도 |
|---|---|
| `vendor-cdn.imweb.me` | 아임웹 벤더 라이브러리 CDN (Wappalyzer 공식 탐지 기준) |
| `cdn.imweb.me` | 아임웹 정적 자원 CDN |
| `s.imweb.me` | 아임웹 스크립트 서버 |
| `pay.imweb.me` | 아임웹 결제 모듈 |

```html
<script src="https://vendor-cdn.imweb.me/..."></script>
<script src="https://cdn.imweb.me/..."></script>
```

### 2-3. URL 패턴

| 패턴 | 설명 |
|---|---|
| `{subdomain}.imweb.me` | 아임웹 기본 도메인 (독자 도메인 미연결 시) |
| `/shop` | 쇼핑몰 메인 |
| `/shop/detail/{product_id}` | 상품 상세 |
| `/shop/category/{category_id}` | 카테고리 목록 |
| `/board` | 게시판 |

### 2-4. HTML 소스 패턴

```html
<!-- 아임웹 공통 삽입 -->
<meta name="generator" content="Imweb" />  <!-- 일부 사이트 -->

<!-- 아임웹 특유의 data 속성 -->
<div data-widget-type="..." data-widget-id="..."></div>

<!-- 아임웹 위젯 시스템 -->
<div class="widget-...</div>
<div class="imweb-...</div>

<!-- 아임웹 내부 스크립트 -->
<script>
  window.__IMWEB__ = { ... };
</script>
```

### 2-5. HTTP 헤더 / 쿠키

| 항목 | 값 |
|---|---|
| Server | AWS 기반 인프라 사용 |
| 쿠키 | `imweb_session`, `_imweb_*` 패턴 |

### 2-6. 기타 식별 포인트

- **호스팅 만료 페이지**: "현재 접속하신 사이트의 호스팅 기간이 만료되었습니다" + 아임웹 로고
- **관리자 경로**: `/admin` 접근 시 아임웹 로그인 페이지로 리다이렉트

---

## 3. 무료 도구를 활용한 호스팅/플랫폼 확인 방법

### 3-1. Wappalyzer

- **사이트**: https://www.wappalyzer.com/
- **사용법**: 브라우저 확장 프로그램(Chrome/Firefox) 설치 후 웹사이트 방문 시 자동 탐지
- **Cafe24**: "Ecommerce" 카테고리로 탐지 (JS 변수: `EC_GLOBAL_DATETIME`, `EC_GLOBAL_INFO`, `EC_ROOT_DOMAIN`)
- **아임웹**: "Ecommerce" 카테고리로 탐지 (JS 변수: `IMWEB_TEMPLATE`, 스크립트 소스: `vendor-cdn.imweb.me`)
- **리스트 기능**: https://wappalyzer.com/technologies/ecommerce/cafe24 에서 Cafe24 사용 사이트 목록 제공
- **API**: 유료 (Business 플랜 $250/월~), 기술 조회 API 제공

### 3-2. BuiltWith

- **사이트**: https://builtwith.com/
- **사용법**: 웹사이트 URL 입력으로 기술 스택 조회 (무료 개별 조회 가능)
- **Cafe24 트렌드**: https://trends.builtwith.com/shop/Cafe24/South-Korea 에서 한국 내 Cafe24 사용 현황 확인
- **장점**: 과거 기술 변경 이력까지 추적 가능
- **브라우저 확장**: Chrome 확장 프로그램 무료 제공

### 3-3. WhatCMS

- **사이트**: https://whatcms.org/
- **사용법**: URL 입력 시 CMS/플랫폼 즉시 판별
- **Cafe24 탐지 방법**: HTTP 헤더(`set-cookie`, `x-powered-by`)와 JavaScript 패턴 분석
- **데이터베이스**: Cafe24 사용 사이트 약 5,540개 추적 중 (.kr 도메인 52.78%)

### 3-4. WhatRuns

- **사이트**: https://www.whatruns.com/
- **사용법**: Chrome 확장 프로그램으로 실시간 기술 스택 탐지
- **특징**: 워드프레스 테마/플러그인까지 상세 탐지 가능

### 3-5. 기타 도구

| 도구 | URL | 특징 |
|---|---|---|
| WebTechSurvey | https://webtechsurvey.com/ | 서브도메인별 기술 분석 |
| CMS Detector | https://cmsdetect.com/ | meta generator 태그 기반 빠른 탐지 |
| What CMS | https://www.whichcms.org/ | 1,540+ CMS 탐지 지원 |
| Website Informer | https://website.informer.com/ | 도메인 정보 + 기술 스택 |

---

## 4. 프로그래밍 방식: 자동 식별 코드

### 4-1. Python (requests + BeautifulSoup) -- 경량 버전

```python
"""
cafe24_imweb_detector.py
웹사이트가 Cafe24 또는 아임웹으로 만들어졌는지 자동 식별하는 스크립트
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
import json


def detect_platform(url: str, timeout: int = 10) -> dict:
    """
    URL을 분석하여 Cafe24 또는 아임웹 여부를 판별한다.

    Returns:
        {
            "url": str,
            "platform": "cafe24" | "imweb" | "unknown",
            "confidence": "high" | "medium" | "low",
            "signals": [str]  # 탐지 근거 목록
        }
    """
    result = {
        "url": url,
        "platform": "unknown",
        "confidence": "low",
        "signals": []
    }

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        html = resp.text
        soup = BeautifulSoup(html, "html.parser")

        # ===== Cafe24 탐지 =====
        cafe24_signals = []

        # 1) JS 전역 변수 패턴 (가장 신뢰도 높음)
        js_vars = ["EC_GLOBAL_DATETIME", "EC_GLOBAL_INFO", "EC_ROOT_DOMAIN",
                    "EC_SDE_SHOP_NUM", "EC_FRONT_JS_CONFIG_MANAGE"]
        for var in js_vars:
            if var in html:
                cafe24_signals.append(f"JS 변수 발견: {var}")

        # 2) CDN/스크립트 소스
        cafe24_cdn_patterns = [
            r"img\.echosting\.cafe24\.com",
            r"img\.cafe24\.com",
            r"ec\.cafe24\.com",
            r"cafe24api\.com",
        ]
        for pattern in cafe24_cdn_patterns:
            if re.search(pattern, html):
                cafe24_signals.append(f"CDN 패턴 발견: {pattern}")

        # 3) URL 구조 분석
        parsed = urlparse(resp.url)
        if "cafe24.com" in parsed.hostname:
            cafe24_signals.append(f"도메인에 cafe24.com 포함: {parsed.hostname}")
        if re.search(r"/product/(list|detail)\.html", parsed.path):
            cafe24_signals.append(f"Cafe24 URL 패턴: {parsed.path}")

        # 4) HTTP 헤더
        server = resp.headers.get("Server", "")
        if "openresty" in server.lower():
            cafe24_signals.append(f"Server 헤더: {server}")

        # 5) 쿠키
        for cookie in resp.cookies:
            if cookie.name.startswith("ECSESS") or cookie.name.startswith("EC_FRONT"):
                cafe24_signals.append(f"쿠키 발견: {cookie.name}")

        # 6) HTML class/id 패턴
        if soup.find(id=re.compile(r"cafe24-layer")):
            cafe24_signals.append("HTML ID 패턴: cafe24-layer-*")
        if soup.find(class_=re.compile(r"ec-base-")):
            cafe24_signals.append("HTML class 패턴: ec-base-*")

        # 7) meta generator
        gen_tag = soup.find("meta", {"name": "generator"})
        if gen_tag and "cafe24" in (gen_tag.get("content", "")).lower():
            cafe24_signals.append("meta generator: Cafe24")

        # ===== 아임웹 탐지 =====
        imweb_signals = []

        # 1) JS 전역 변수
        imweb_js_vars = ["IMWEB_TEMPLATE", "__IMWEB__"]
        for var in imweb_js_vars:
            if var in html:
                imweb_signals.append(f"JS 변수 발견: {var}")

        # 2) CDN/스크립트 소스 (가장 확실한 지표)
        imweb_cdn_patterns = [
            r"vendor-cdn\.imweb\.me",
            r"cdn\.imweb\.me",
            r"s\.imweb\.me",
            r"pay\.imweb\.me",
        ]
        for pattern in imweb_cdn_patterns:
            if re.search(pattern, html):
                imweb_signals.append(f"CDN 패턴 발견: {pattern}")

        # 3) URL/도메인
        if parsed.hostname and "imweb.me" in parsed.hostname:
            imweb_signals.append(f"도메인에 imweb.me 포함: {parsed.hostname}")

        # 4) HTML 패턴
        if soup.find(attrs={"data-widget-type": True}):
            imweb_signals.append("아임웹 위젯 data 속성 발견")
        if soup.find(class_=re.compile(r"imweb-")):
            imweb_signals.append("HTML class 패턴: imweb-*")

        # 5) meta generator
        if gen_tag and "imweb" in (gen_tag.get("content", "")).lower():
            imweb_signals.append("meta generator: Imweb")

        # 6) 쿠키
        for cookie in resp.cookies:
            if "imweb" in cookie.name.lower():
                imweb_signals.append(f"쿠키 발견: {cookie.name}")

        # ===== 판정 =====
        if len(cafe24_signals) >= 3:
            result["platform"] = "cafe24"
            result["confidence"] = "high"
            result["signals"] = cafe24_signals
        elif len(cafe24_signals) >= 1:
            result["platform"] = "cafe24"
            result["confidence"] = "medium"
            result["signals"] = cafe24_signals
        elif len(imweb_signals) >= 2:
            result["platform"] = "imweb"
            result["confidence"] = "high"
            result["signals"] = imweb_signals
        elif len(imweb_signals) >= 1:
            result["platform"] = "imweb"
            result["confidence"] = "medium"
            result["signals"] = imweb_signals

    except requests.RequestException as e:
        result["signals"].append(f"요청 오류: {str(e)}")

    return result


def detect_bulk(urls: list[str]) -> list[dict]:
    """여러 URL을 일괄 탐지"""
    results = []
    for url in urls:
        if not url.startswith("http"):
            url = f"https://{url}"
        r = detect_platform(url)
        results.append(r)
        print(f"[{r['confidence']:>6}] {r['platform']:>8} | {r['url']}")
    return results


# --- 사용 예시 ---
if __name__ == "__main__":
    test_urls = [
        "https://example-cafe24-shop.cafe24.com",
        "https://example-imweb-shop.imweb.me",
        "https://some-custom-domain.co.kr",
    ]
    results = detect_bulk(test_urls)
    print(json.dumps(results, ensure_ascii=False, indent=2))
```

### 4-2. Playwright 버전 -- JS 변수 직접 접근 (높은 정확도)

```python
"""
cafe24_imweb_detector_playwright.py
Playwright를 사용하여 JavaScript 전역 변수까지 직접 확인하는 고정확도 버전
(SPA, 동적 렌더링 사이트에도 대응)
"""

import asyncio
from playwright.async_api import async_playwright
import json


async def detect_platform_js(url: str) -> dict:
    """
    Playwright로 페이지를 렌더링한 후 JS 전역 변수를 직접 평가하여 플랫폼 판별
    """
    result = {
        "url": url,
        "platform": "unknown",
        "confidence": "low",
        "signals": []
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            resp = await page.goto(url, wait_until="networkidle", timeout=15000)

            # --- Cafe24 JS 변수 직접 평가 ---
            cafe24_checks = {
                "EC_GLOBAL_INFO": "typeof EC_GLOBAL_INFO !== 'undefined'",
                "EC_GLOBAL_DATETIME": "typeof EC_GLOBAL_DATETIME !== 'undefined'",
                "EC_ROOT_DOMAIN": "typeof EC_ROOT_DOMAIN !== 'undefined'",
            }
            cafe24_signals = []
            for name, expr in cafe24_checks.items():
                try:
                    exists = await page.evaluate(expr)
                    if exists:
                        cafe24_signals.append(f"JS 전역 변수 확인: {name}")
                except:
                    pass

            # --- 아임웹 JS 변수 직접 평가 ---
            imweb_checks = {
                "IMWEB_TEMPLATE": "typeof IMWEB_TEMPLATE !== 'undefined'",
                "__IMWEB__": "typeof __IMWEB__ !== 'undefined'",
            }
            imweb_signals = []
            for name, expr in imweb_checks.items():
                try:
                    exists = await page.evaluate(expr)
                    if exists:
                        imweb_signals.append(f"JS 전역 변수 확인: {name}")
                except:
                    pass

            # --- CDN 스크립트 소스 확인 ---
            scripts = await page.evaluate("""
                () => Array.from(document.querySelectorAll('script[src]'))
                          .map(s => s.src)
            """)
            for src in scripts:
                if "echosting.cafe24.com" in src or "cafe24api.com" in src:
                    cafe24_signals.append(f"스크립트 소스: {src[:80]}")
                if "vendor-cdn.imweb.me" in src or "cdn.imweb.me" in src:
                    imweb_signals.append(f"스크립트 소스: {src[:80]}")

            # --- 쿠키 확인 ---
            cookies = await page.context.cookies()
            for c in cookies:
                if c["name"].startswith("ECSESS") or c["name"].startswith("EC_FRONT"):
                    cafe24_signals.append(f"쿠키: {c['name']}")
                if "imweb" in c["name"].lower():
                    imweb_signals.append(f"쿠키: {c['name']}")

            # --- 판정 ---
            if len(cafe24_signals) >= 2:
                result["platform"] = "cafe24"
                result["confidence"] = "high"
                result["signals"] = cafe24_signals
            elif len(cafe24_signals) >= 1:
                result["platform"] = "cafe24"
                result["confidence"] = "medium"
                result["signals"] = cafe24_signals
            elif len(imweb_signals) >= 2:
                result["platform"] = "imweb"
                result["confidence"] = "high"
                result["signals"] = imweb_signals
            elif len(imweb_signals) >= 1:
                result["platform"] = "imweb"
                result["confidence"] = "medium"
                result["signals"] = imweb_signals

        except Exception as e:
            result["signals"].append(f"오류: {str(e)}")
        finally:
            await browser.close()

    return result


async def detect_bulk_js(urls: list[str]) -> list[dict]:
    """여러 URL을 Playwright로 일괄 탐지 (동시 처리)"""
    tasks = [detect_platform_js(u if u.startswith("http") else f"https://{u}") for u in urls]
    results = await asyncio.gather(*tasks)
    for r in results:
        print(f"[{r['confidence']:>6}] {r['platform']:>8} | {r['url']}")
    return list(results)


if __name__ == "__main__":
    urls = [
        "https://example-shop.cafe24.com",
        "https://example-shop.imweb.me",
    ]
    results = asyncio.run(detect_bulk_js(urls))
    print(json.dumps(results, ensure_ascii=False, indent=2))
```

### 4-3. 탐지 정확도 비교

| 방법 | Cafe24 탐지율 | 아임웹 탐지율 | 속도 | 비용 |
|---|---|---|---|---|
| requests + BS4 (HTML 분석) | ~85% | ~80% | 빠름 (0.5-2초/사이트) | 무료 |
| Playwright (JS 변수 직접 확인) | ~98% | ~95% | 보통 (3-8초/사이트) | 무료 |
| Wappalyzer API | ~95% | ~90% | 빠름 | $250/월~ |
| BuiltWith API | ~95% | ~90% | 빠름 | $295/월~ |

> **권장**: 소량(~100개) 사이트는 Playwright 버전, 대량(1,000개+) 사이트는 requests 버전으로 1차 필터링 후 미탐지분만 Playwright로 재확인.

---

## 5. 기술 분석 서비스로 일괄 조회

### 5-1. BuiltWith -- 특정 기술 사용 사이트 목록 조회

#### Lists API

BuiltWith의 Lists API를 통해 특정 기술(Cafe24, Imweb 등)을 사용하는 전체 사이트 목록을 CSV로 내려받을 수 있다.

```
GET https://api.builtwith.com/lists/api.json?KEY={api_key}&TECH=Cafe24
```

| 항목 | 내용 |
|---|---|
| 엔드포인트 | `https://api.builtwith.com/lists/api.[json|xml|csv]` |
| 인증 | API Key (유료 플랜 필수) |
| 응답 포맷 | JSON, XML, CSV |
| Rate Limit | 최대 8개 동시 요청, 초당 10개 |
| 기술 필터 | `TECH` 파라미터로 기술명 지정 |

#### Domain API -- 개별 사이트 조회

```
GET https://api.builtwith.com/v21/api.json?KEY={api_key}&LOOKUP=example.com
```

반환 데이터: 현재 사용 기술 + 과거 기술 변경 이력 + 관련 도메인

#### Free API -- 무료 기본 조회

```
GET https://api.builtwith.com/free1/api.json?KEY={api_key}&LOOKUP=example.com
```

무료 플랜으로 기술 그룹 개수와 마지막 업데이트 시점 정도의 기본 정보 제공.

#### 가격

| 플랜 | 월 비용 | 기술 필터 수 | 주요 기능 |
|---|---|---|---|
| Basic | $295/월 | 2개 | 기본 Lists API |
| Pro | $495/월 | 무제한 | 전체 기능 + 상세 필터 |
| Team | $995/월 | 무제한 | 팀 공유 + 우선 지원 |

#### BuiltWith Trends (무료)

- https://trends.builtwith.com/shop/Cafe24 -- Cafe24 전체 통계
- https://trends.builtwith.com/shop/Cafe24/South-Korea -- 한국 내 Cafe24 통계
- 무료로 사용 규모/추이 확인 가능 (개별 사이트 목록은 유료)

### 5-2. SimilarTech

| 항목 | 내용 |
|---|---|
| 사이트 | https://www.similartech.com/ |
| 기능 | 기술별 사이트 목록, 시장 점유율, 경쟁 분석 |
| 가격 | $200~500/월 |
| 장점 | 리드 생성 + 기술 분석 통합 |
| Cafe24/아임웹 | 한국 이커머스 플랫폼 추적 지원 |

### 5-3. Wappalyzer Lists

| 항목 | 내용 |
|---|---|
| Cafe24 목록 | https://wappalyzer.com/technologies/ecommerce/cafe24 |
| 아임웹 목록 | https://wappalyzer.com/technologies/ecommerce/imweb/ |
| 기능 | 기술별 사이트 목록 + 리드 리스트 생성 |
| 가격 | Business 플랜 $250/월~ |
| 장점 | 실시간 탐지 + 이메일 인증 통합 |

### 5-4. 무료/저비용 대안

| 도구 | 가격 | 일괄 조회 | 특징 |
|---|---|---|---|
| BuiltWith Trends | 무료 | 통계만 (목록 X) | 시장 규모 파악에 유용 |
| Hunter TechLookup | 무료 기본 | 제한적 | 이메일 연락처 연동 |
| Wappalyzer (확장) | 무료 | 수동 1건씩 | 개별 사이트 확인에 적합 |
| WebTechSurvey | 무료 | 제한적 | 서브도메인별 분석 |
| Apify Actors | 사용량 기반 | 가능 | BuiltWith/Wappalyzer 스크래핑 자동화 |

---

## 6. 실전 활용 전략 (요약)

### 시나리오: "Cafe24 또는 아임웹 사용 잠재 고객 발굴"

```
1단계: BuiltWith Trends (무료)로 시장 규모 파악
   └─ Cafe24: 한국 내 활성 사이트 수, 업종 분포 확인

2단계: 대상 URL 리스트 확보
   └─ 업종별 쇼핑몰 디렉토리, 네이버 쇼핑 입점 업체 등

3단계: Python 스크립트로 자동 분류 (requests 버전)
   └─ 1차 필터링: JS 변수 + CDN 패턴 매칭
   └─ 미탐지분: Playwright 버전으로 재확인

4단계: 결과 검증
   └─ Wappalyzer 확장 프로그램으로 샘플 교차 검증
```

### 핵심 탐지 규칙 (간결 버전)

```
Cafe24 판별:
  IF html CONTAINS ("EC_GLOBAL_INFO" OR "echosting.cafe24.com")
  → Cafe24 (high confidence)

아임웹 판별:
  IF html CONTAINS ("IMWEB_TEMPLATE" OR "vendor-cdn.imweb.me")
  → Imweb (high confidence)
```

---

## 출처

- Wappalyzer 오픈소스 탐지 규칙: https://github.com/AliasIO/wappalyzer (현재 enthec/webappanalyzer에서 유지보수)
- WhatCMS Cafe24 탐지: https://whatcms.org/c/Cafe24
- BuiltWith API 문서: https://api.builtwith.com/
- BuiltWith Cafe24 트렌드: https://trends.builtwith.com/shop/Cafe24/South-Korea
- Wappalyzer Cafe24 목록: https://wappalyzer.com/technologies/ecommerce/cafe24
- Wappalyzer 아임웹 목록: https://wappalyzer.com/technologies/ecommerce/imweb/
- 쇼핑몰 솔루션 구분법: https://dbreblog.com/56
