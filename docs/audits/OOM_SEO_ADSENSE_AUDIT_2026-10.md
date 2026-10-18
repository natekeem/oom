# OOM 기술 SEO 및 AdSense 준비도 감사 보고서 (2026년 10월)

> **문서 ID:** OOM-AUDIT-2026-10-SEO-ADSENSE  
> **기준 일시:** 2026-10-18  
> **운영 도메인:** `https://opic-on-me.com/`  
> **원칙:** 정밀한 색인 정책 분석, AdSense 준비도와 승인 가능성의 명확한 구분  

---

## 1. 개요 및 기술 아키텍처

오픽온미(OOM)는 GitHub Pages 정적 호스팅 환경에서 동작하는 SPA(Single Page Application)입니다.
일반적인 SPA가 겪는 대표적인 SEO 결함(빈 `<div id="root"></div>` 서빙, 검색봇 크롤링 지연, 리디렉션 혼선)을 방지하기 위해 `scripts/generate-static-routes.mjs`를 활용하여 빌드 시점에 **완전한 시맨틱 본문과 메타데이터가 주입된 정적 라우트 파일(`dist/**/index.html`)**을 생성하고 있습니다.

### 핵심 수치 요약
- **생성된 정적 index.html 수**: 총 73개
- **`sitemap.xml` 포함 canonical URL**: 정확히 48개
- **`noindex,follow` 대상 라우트**: 정확히 25개 (기능성 훈련 17개 + 계정/관리자/설정 8개)
- **트레일링 슬래시 통일성**: 모든 경로에 `/` 적용으로 서버 리디렉션(301) 차단

---

## 2. 48개 Sitemap 색인 대상 URL 전수 목록

`dist/sitemap.xml`에 포함된 색인 대상 URL 48개의 세부 구성은 다음과 같습니다:

1. **브랜드 랜딩 (1개)**:
   - `https://opic-on-me.com/`
2. **요금제 안내 (1개)**:
   - `https://opic-on-me.com/pricing/`
3. **OPIc 수험 가이드 (7개)**:
   - `https://opic-on-me.com/exam-guide/`
   - `https://opic-on-me.com/exam-guide/overview/`
   - `https://opic-on-me.com/exam-guide/screen/`
   - `https://opic-on-me.com/exam-guide/apply/`
   - `https://opic-on-me.com/exam-guide/day/`
   - `https://opic-on-me.com/exam-guide/results/`
   - `https://opic-on-me.com/exam-guide/faq/`
4. **훈련 개요 및 설정 (2개)**:
   - `https://opic-on-me.com/training/`
   - `https://opic-on-me.com/training/setup/`
5. **정보성 매거진 (31개 - 허브 1개 + 아티클 30개)**:
   - `https://opic-on-me.com/magazine/`
   - `https://opic-on-me.com/magazine/opic-second-difficulty-choice/`
   - `https://opic-on-me.com/magazine/opic-40-minute-pacing-plan/`
   - `https://opic-on-me.com/magazine/opic-park-walking-hiking-answer-map/`
   - `https://opic-on-me.com/magazine/opic-text-type-upgrade-drill/`
   - `https://opic-on-me.com/magazine/opic-word-recovery-circumlocution/`
   - `https://opic-on-me.com/magazine/opic-question-type-decoder/`
   - `https://opic-on-me.com/magazine/opic-museum-photo-reading-guide/`
   - `https://opic-on-me.com/magazine/opic-shopping-exchange-roleplay/`
   - `https://opic-on-me.com/magazine/opic-movie-music-performance-story-map/`
   - `https://opic-on-me.com/magazine/opic-pronunciation-comprehensibility-guide/`
   - `https://opic-on-me.com/magazine/opic-two-listens-memory-grid/`
   - `https://opic-on-me.com/magazine/opic-camping-weather-problem-solution/`
   - `https://opic-on-me.com/magazine/opic-time-frame-storyline-guide/`
   - `https://opic-on-me.com/magazine/opic-holistic-assessment-checklist/`
   - `https://opic-on-me.com/magazine/opic-self-assessment-selection-guide/`
   - `https://opic-on-me.com/magazine/opic-recording-review-routine/`
   - `https://opic-on-me.com/magazine/opic-answer-checklist/`
   - `https://opic-on-me.com/magazine/opic-roleplay-6-step-template/`
   - `https://opic-on-me.com/magazine/opic-last-week-study-plan/`
   - `https://opic-on-me.com/magazine/opic-travel-topic-script-guide/`
   - `https://opic-on-me.com/magazine/opic-55-difficulty-guide/`
   - `https://opic-on-me.com/magazine/opic-home-topic-script-guide/`
   - `https://opic-on-me.com/magazine/opic-indoor-topic-guide/`
   - `https://opic-on-me.com/magazine/opic-im-to-ih-practice-plan/`
   - `https://opic-on-me.com/magazine/opic-survey-choice-guide/`
   - `https://opic-on-me.com/magazine/opic-self-introduction-strategy/`
   - `https://opic-on-me.com/magazine/opic-2026-strategy/`
   - `https://opic-on-me.com/magazine/opic-filler-tips/`
   - `https://opic-on-me.com/magazine/opic-grade-guide/`
   - `https://opic-on-me.com/magazine/oom-full-guide/`
6. **소개 및 법적/신뢰 페이지 (6개)**:
   - `https://opic-on-me.com/about/`
   - `https://opic-on-me.com/privacy/`
   - `https://opic-on-me.com/contact/`
   - `https://opic-on-me.com/editorial-policy/`
   - `https://opic-on-me.com/image-credits/`
   - `https://opic-on-me.com/terms/`

---

## 3. 25개 Noindex 라우트 대조 및 색인 정책

73개 정적 HTML 중 검색 색인에서 제외되어야 하는 25개 라우트는 명확한 이유에 근거해 `noindex,follow`로 처리되고 있습니다:

### 3.1 상태 의존적 학습 진행 라우트 (17개)
- **목록**:
  - 서베이: `/training/survey/`
  - 난이도: `/training/difficulty/`
  - 스크립트: `/training/scripts/`, `/training/scripts/self-introduction/`, `/training/scripts/outdoor/`, `/training/scripts/indoor/`, `/training/scripts/sports/`, `/training/scripts/home/`
  - 롤플레이: `/roleplay/`, `/roleplay/formula/`, `/roleplay/travel/`, `/roleplay/indoor/`, `/roleplay/sports/`, `/roleplay/home/`
  - 실전 연습: `/practice/`, `/practice/quick/`, `/practice/mock/`
- **배경**: 사용자가 브라우저에서 Course와 Level을 선택하기 전에는 `TrainingSelectionGuard`에 의해 설정 안내 화면만 노출되므로, 검색 유입 랜딩 페이지로 부적합합니다.
- **처리**: `noindex,follow` 메타태그 부여 및 `sitemap.xml` 누락 처리.

### 3.2 계정, 관리자 및 유틸리티 라우트 (8개)
- **목록**:
  - 마이페이지: `/mypage/`
  - 로그인 콜백: `/auth/callback/`
  - AI 설정: `/ai-settings/`
  - 관리자 콘솔: `/admin/`, `/admin/users/`, `/admin/learning/`, `/admin/audit/`, `/admin/ai/`
- **배경**: 개인정보 표시, 세션 복구 및 내부 운영 콘솔로 검색엔진에 노출되어서는 안 됩니다.
- **처리**: `noindex,follow` 부여 및 `sitemap.xml` 제외.

---

## 4. 정적 사전 렌더링 HTML과 SPA 렌더링 비교

### 4.1 빈 SPA 셸 문제 해결 검증
- 일반적인 Vite 빌드 산출물은 `<div id="root"></div>`만 비어 있어 크롤러가 자바스크립트를 실행하지 않으면 내용을 읽을 수 없습니다.
- OOM의 `scripts/generate-static-routes.mjs`는 빌드 시점에 각 라우트의 HTML 내부 `<div id="root">` 안에 완전한 `<main class="seo-static-content">` 블록을 주입합니다.
- 포함 요소:
  - 고유 H1, H2 헤딩
  - 아티클 및 페이지 상세 본문 문단
  - 예시 발화 및 구조 분해 블록 (`<blockquote>`)
  - 체크리스트 및 다음 학습 이동 링크 (`<ul>`, `<li>`)
  - Schema.org Article JSON-LD 메타데이터

### 4.2 본문 중복 및 하이드레이션 검사
- React 애플리케이션(`main.tsx`)이 브라우저에서 실행되면 `ReactDOM.createRoot(root).render(<App />)`를 통해 정적 본문을 React 대화형 컴포넌트로 매끄럽게 교체합니다.
- 화면에 정적 본문과 React 본문이 동시에 중복 노출되는 레이아웃 깨짐이 없습니다.

---

## 5. Search Console 이슈 진단 (가설과 확인 사실의 구분)

Search Console의 실시간 데이터에 직접 접근할 권한이 없으므로, 과거 보고된 이슈의 원인을 **기술적 사실**과 **추정 가설**로 명확히 구분합니다:

| 보고된 현상 | 확정된 기술적 사실 | 추정 가설 및 추가 관찰 필요성 |
|---|---|---|
| **페이지 리디렉션 관련 제외 / 리디렉션 오류** | GitHub Pages는 슬래시 없는 URL 요청 시 301 리디렉션을 발생시킴. 현재 OOM 코드는 모든 라우트, 링크, sitemap을 트레일링 슬래시(`/path/`)로 통일함. | 과거 불일치로 인해 보고되었을 가능성이 매우 높음. 현재 코드로 빌드 배포 후 GSC에서 리디렉션 오류 추이가 감소하는지 운영자 확인 필요. |
| **발견됨 — 현재 색인이 생성되지 않음** | 48개 색인 대상 URL이 `sitemap.xml`에 유효하게 등록되어 있음. | 구글 크롤러가 URL을 수집 대기열에 올려두고 방문 순서를 조율 중인 정상적인 탐색 대기 상태로 추정됨. |
| **크롤링됨 — 현재 색인이 생성되지 않음** | 현재 모든 정적 HTML에 3단 발화 예시, 공식 출처, 고유 요약이 담긴 풍부한 본문이 사전 렌더링됨. | 과거 빈 SPA 셸(빈 div)만 수집되었거나, 신규 사이트 신뢰도 검증 기간으로 추정됨. 최신 사전 렌더링 본문이 재크롤링되면 점진적으로 색인 전환될 것으로 기대되나, 운영자의 GSC 실시간 검사 필요. |

---

## 6. Google AdSense 준비도 분석 및 승인 가능성 구분

### 6.1 기술적 준비 완료 사실
1. **6대 신뢰 페이지 완비**: About, Contact, Privacy, Terms, Editorial Policy, Image Credits가 모두 유효하게 존재하며 푸터에서 연결됨.
2. **광고 배치 격리 (`isAdEligiblePath`)**:
   - 오직 정보성 매거진 상세(`/magazine/:id/`)와 수험 가이드(`/exam-guide/**`)에서만 AdSense 스크립트가 실행됨.
   - 실전 훈련 화면(STEP 1~6), 마이페이지, 설정, 관리자 페이지에서는 광고가 제외(`adExcluded: true`)되어 오클릭 유도 정책 위반 위험을 구조적으로 낮춤.
3. **독창적 서비스 가치**: 30편의 충실한 글뿐만 아니라, 실제 음성 재생, 녹음, 스크립트 변형, 실전 모의고사를 직접 구동할 수 있는 대화형 웹앱임.

### 6.2 실제 승인 가능성에 대한 객관적 평가
- 기술적 요건(신뢰 페이지, 콘텐츠 분량, 광고와 훈련 뷰의 분리)은 완전히 충족되었습니다.
- **그러나 AdSense 승인은 기술적 준비도만으로 보장되지 않습니다.**
- 구글 애드센스 심사는 검색엔진의 실제 사이트 트래픽, 도메인 연령, 심사팀의 주관적 정성 평가를 종합하여 결정됩니다.
- 따라서 "승인 보장"이나 "즉시 승인 가능"이라는 표현을 지양하며, **Search Console에서 주요 정보성 페이지들이 정상 색인된 후 운영자가 AdSense 재심사를 신청하는 절차**를 권장합니다.
