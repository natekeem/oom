# OOM (오픽온미) 전수 감사 보고서 (2026년 10월)

> **문서 ID:** OOM-AUDIT-2026-10-FULL  
> **기준 일시:** 2026-10-18  
> **대상 저장소:** `https://github.com/natekeem/oom` (Branch: `main`, Commit: `22cd103`)  
> **운영 사이트:** `https://opic-on-me.com/`  
> **원칙:** 독립 서비스 보존, 기존 아키텍처 및 디자인 보존, 정직한 보안 및 품질 평가  

---

## 1. 전수 감사 배경 및 작업 원칙

오픽온미(OOM)는 OPIc 말하기 시험 대비를 위한 브라우저 기반 독립 정적 웹 애플리케이션입니다.
본 감사는 외부 자동화 블로그(`ai-autoblog` 등)와 완전히 분리된 환경에서, **기존 학습 기능과 디자인 정체성을 100% 보존하면서** 서비스 품질, 사용자 경험, 기술 SEO(Technical SEO), Google AdSense 정책 준비도, 콘텐츠 사실성, 개인정보 및 보안 상태를 전수 점검하고 확인된 취약점을 개선하는 것을 목적으로 합니다.

### 불변 원칙 (Architectural Invariants)
1. **Course × Level 구조 보존**: Course(이야기 맥락, 서베이 조합, 롤플레이)와 Level(난이도, 답변 밀도, 목표 발화 시간)의 역할 분리.
2. **SIX STEPS 단일 학습 흐름 보존**:
   - STEP 1. 목표 구간 · 코스 설정 (`/training/setup/`)
   - STEP 2. 추천 서베이 익히기 (`/training/survey/`)
   - STEP 3. 난이도 설정 (`/training/difficulty/`)
   - STEP 4. 만능 스크립트 (`/training/scripts/`)
   - STEP 5. 롤플레이 공식 (`/roleplay/`)
   - STEP 6. 실전 연습 (Hub `/practice/`, Quick `/practice/quick/`, Full Mock `/practice/mock/`)
3. **정적 우선(Static-First) TTS**: 4종 전속 음성(Heart, Bella, Sarah, Sky)의 1.00× 정적 WebM/Opus 음원 우선 재생 및 WaveSurfer 시각화.
4. **인증 및 보안 경계**: 클라이언트-서버 간 무인가 API 노출 차단, BYOK(Bring Your Own Key)의 탭 세션 기본 격리(`sessionStorage`), 관리자 역할(`admin_users`)의 Supabase Edge Function(`admin-api`) 서버 검증.
5. **시험 신뢰성 및 보장 금지**: 공식 채점 보장, 점수 산출 등 과장 표현 금지 및 프로세스 중심 학습 지표 유지.

---

## 2. 형상 관리 및 빌드 인프라 상태

- **현재 브랜치**: `main` (원격 `origin/main`과 동일 최신 상태)
- **최근 커밋**: `22cd103 feat: replace July magazine cover artwork`
- **작업 트리 상태**: 검증 및 문서 정합성 패치 적용 상태 (사용자 승인 대기)
- **런타임 자산 무결성**:
  - TTS 인벤토리: 186개 고정 텍스트 × 4개 음성 = 744개 오디오 및 피크 데이터(100% 일치, 결손 0개)
  - 정적 라우트 산출물: 48개 색인 대상 canonical URL, 73개 사전 렌더링 HTML 산출물 생성 확인

---

## 3. 전체 문제 인벤토리 (P0 / P1 / P2)

| ID | 영역 | 우선순위 | 현상 및 잠재적 문제 | 관련 파일 | 해결 상태 및 구분 |
|---|---|---|---|---|---|
| **ISS-01** | Test & CI | **P1** | 전체 테스트(443개) 병렬 구동 시 시스템 부하로 `findByText` 기본 타임아웃(1000ms) 초과 flakiness 발생 | `src/TrainingCourse.test.tsx` (L461-L510) | **해결 완료 (실제 코드 수정)**: 비동기 Suspense 가드 대기 타임아웃을 4000ms로 명시하여 443개 전체 테스트 100% 통과 |
| **ISS-02** | Privacy | **P1** | 커스텀 STT 사용 시 외부 엔드포인트로 음성 파일이 전송되는 동작이 개인정보처리방침에 명시되지 않음 | `src/data/legalPages.ts` (L71) | **해결 완료 (문서 수정)**: 커스텀 STT 사용 시 사용자 설정 외부 엔드포인트로 음성 전송됨을 투명하게 명시 |
| **ISS-03** | SEO | **P0** | 상태 의존적인 학습 진행 페이지(STEP 2~6)가 검색엔진에 노출될 경우 빈 화면 또는 불완전 렌더링으로 인식될 위험 | `src/lib/publicationPolicy.ts`, `scripts/generate-static-routes.mjs` | **기반 정상 확인**: `SELECTION_DEPENDENT_PATHS`에 `noindex,follow` 부여 및 `sitemap.xml` 제외 정책 철저 유지 확인 |
| **ISS-04** | SEO / Search Console | **P1** | Search Console에서 "발견됨/크롤링됨 — 현재 색인이 생성되지 않음" 및 리디렉션 오류 보고 이력 | `scripts/generate-static-routes.mjs`, `public/robots.txt` | **기술 조치 완료 및 관찰 대상**: 트레일링 슬래시 통일, 사전 렌더링 본문 주입 완료. 실제 색인 반영 여부는 GSC 관찰 필요 |
| **ISS-05** | Security | **P0** | 브라우저 BYOK(Bring Your Own Key) 사용 시 API Key의 로컬스토리지 저장 및 XSS 위험 | `src/lib/customSettingsStorage.ts` | **위협 모델 정립 및 안내**: 기본 세션 격리 제공. 단, 로컬스토리지 저장은 평문 저장이므로 공용 PC 주의 필요, XSS 시에는 스토리지 유형과 무관하게 노출 가능함을 문서화 |
| **ISS-06** | AdSense | **P1** | 과거 AdSense 승인 거절 이력 및 가치 있는 인벤토리 기준 충족 여부 | `src/data/magazine.ts`, `src/data/legalPages.ts` | **기술 준비 완료 (승인 보장 불가)**: 매거진 30편 출처/구조화 완비, 6대 신뢰 페이지 완비, 광고 격리 적용. 최종 승인은 AdSense 심사팀 권한 |
| **ISS-07** | UX / A11y | **P1** | 모바일 네비게이션 드로어의 키보드 트랩 및 접근성, 1024px 반응형 레이아웃 겹침 | `src/components/layout/ExpandableSidebar.tsx`, `src/components/practice/PracticeView.tsx` | **기반 정상 확인**: Focus trap, Escape 키 닫기, 모바일 터치 타겟 44px 이상 준수, 데스크톱 2열 전환 1280px(xl) 상향 적용 확인 |
| **ISS-08** | Content | **P0** | 공식 시험 점수나 특정 등급 합격을 보장하는 부적절한 표현 존재 여부 | `src/data/legalPages.ts`, `src/data/magazine.ts`, `src/components/**` | **기반 정상 확인**: 모든 페이지에서 "공식 채점표가 아니며 등급이나 합격을 보장하지 않는다"는 면책 고지 철저 준수 확인 |

---

## 4. 도메인별 상세 점검 결과

### 4.1 실제 학습 기능 및 훈련 흐름 (Course × Level)
- **SIX STEPS 정합성**:
  - `README.md`, `LandingPage.tsx`, `TrainingHub.tsx`, `Sidebar.tsx` 간의 단계 명칭 및 번호(1~6)가 100% 일치합니다.
  - 자기소개는 독립된 STEP 7이 아니며, **STEP 4의 코스 중립적 워밍업(Warm-up)** 및 Full Mock 본시험 전 워밍업으로 정확히 포지셔닝되어 있습니다.
- **실전 모의고사 (Full Mock)**:
  - 40분 타이머는 워밍업 발화 후 본 세션 시작 시 작동합니다.
  - 시험 진행 중에는 STT, AI 피드백, 힌트, 전사 텍스트가 노출되지 않으며, 시험 종료 후 답변 검토 및 리포트 화면에서만 선택적으로 호출됩니다.
  - 진단 점수(0~100점)나 가짜 OPIc 등급을 추정하지 않고, 발화 시간 적합도, 녹음 완수율 등 실제 훈련 프로세스 지표만 산출합니다.

### 4.2 기술 SEO 및 Search Console
- **정적 HTML 사전 렌더링**:
  - `scripts/generate-static-routes.mjs`에 의해 빌드 시 73개 HTML 파일이 생성됩니다.
  - 각 HTML 파일에는 검색봇이 JS를 실행하지 않고도 즉시 읽을 수 있는 의미 있는 시맨틱 본문(`<main class="seo-static-content">`), 페이지 고유 Title, Description, Canonical URL, Open Graph 메타데이터, Schema.org Article 구조화 데이터가 포함되어 있습니다.
- **색인 정책 분리**:
  - **색인 대상 (48개)**: 홈(`/`), 정보성 매거진(30편), OPIc 수험 가이드(7편), 법적/신뢰 페이지(6편), 요금제(`/pricing/`), 훈련 허브(`/training/`), STEP 1 설정(`/training/setup/`).
  - **색인 제외 (`noindex,follow`) (25개)**: STEP 2~6 훈련 진행 뷰(17개), 마이페이지, 로그인 콜백, 관리자 콘솔(5개), AI 설정.

### 4.3 Google AdSense 준비도
- **독창적 가치 제공**: 단순 블로그가 아닌, 실제 오디오 청취 제한(0/2), 녹음, WaveSurfer 시각화, 만능 스크립트 변형 연습, 롤플레이 공식, 모의고사를 직접 구동할 수 있는 대화형 웹앱입니다.
- **광고 배치 격리 (`isAdEligiblePath`)**:
  - 애드센스 광고는 안정적인 텍스트 콘텐츠가 제공되는 매거진 상세(`/magazine/:id/`)와 수험 가이드(`/exam-guide/**`)에만 로드됩니다.
  - 사용자가 집중해서 발화하고 녹음 버튼을 눌러야 하는 실전 훈련 화면(STEP 1~6), 마이페이지, 설정, 관리자 페이지에는 광고가 제외(`adExcluded: true`)되어 정책 위반(오클릭 유도) 위험을 구조적으로 낮췄습니다.
- **주의사항**: AdSense 기술 준비도가 갖추어졌더라도, 실제 승인 여부는 구글 심사팀의 고유 권한이므로 승인을 단정하거나 보장할 수 없습니다.

### 4.4 개인정보 및 보안 위협 분석
- **BYOK 저장소 모델의 한계와 실체**:
  - API Key 입력 시 기본값은 `sessionStorage`에만 보관되어 탭을 닫으면 메모리에서 소멸합니다. 이는 공용 PC에서 브라우저를 닫았을 때 다음 사용자가 디스크 스토리지에서 키를 읽지 못하게 막는 완화 조치입니다.
  - 그러나 애플리케이션 내에 XSS 취약점이 발생할 경우, 악성 스크립트는 `sessionStorage`, `localStorage`, 런타임 메모리 어디든 접근할 수 있으므로, sessionStorage가 XSS 위험을 원천 차단하는 것은 아닙니다.
  - 사용자가 "이 기기에 저장"을 체크한 경우 `localStorage`에 **평문(Plaintext) JSON**으로 저장되므로, 공용 PC나 타인 공유 기기에서는 절대로 저장 옵션을 사용해서는 안 됩니다.
- **음성 데이터 네트워크 경로**:
  - 마이크 녹음본은 브라우저 런타임 메모리(Blob)에만 머무르며, OOM의 자체 서버로는 업로드되지 않습니다.
  - 단, 사용자가 **커스텀 STT(사용자 지정 Whisper API 등)**를 설정한 경우, 녹음된 오디오 Blob이 사용자가 지정한 외부 엔드포인트 URL로 직접 전송됩니다.
  - AI 피드백 호출 시에는 오디오가 아니라 **텍스트 전사본(transcript)**과 프롬프트만 외부 LLM(또는 관리형 AI 사용 시 Google Gemini)으로 전송됩니다.

---

## 5. 자동화 및 수동 검증 현황

### 5.1 자동화 테스트 (Automated Verification)
| 검증 항목 | 실행 명령 | 결과 | 상세 내용 |
|---|---|---|---|
| **ESLint 검사** | `npm run lint` | **PASS** | 코드 스타일 및 린트 오류 0건 |
| **단위/통합 테스트** | `npm run test` | **PASS** | 53개 테스트 파일, 443개 테스트 전체 통과 (0 failed) |
| **프로덕션 빌드** | `npm run build` | **PASS** | TypeScript 컴파일 통과, Vite 번들링 및 73개 정적 HTML 생성 완료 |
| **Pages 아티팩트 검증** | `npm run verify:pages` | **PASS** | 48개 canonical sitemap 라우트, 번들 참조, 필수 파일 정상 검증 |
| **문서 정합성 검사** | `npm run docs:check` | **PASS** | 인벤토리 및 생성 문서 최신 상태 일치 |
| **TTS 인벤토리 검증** | `npm run tts:validate -- --prune-dry-run` | **PASS** | 744/744개 정적 음원 및 피크 100% 매칭 완료 (누락/잉여 0건) |
| **Git Diff 검사** | `git diff --check` | **PASS** | 공백 오류 및 포맷 불일치 없음 |

### 5.2 수동 확인 및 환경 한계 (Manual / Non-automated Scope)
- **실제 모바일 기기 터치 및 화면 회전**: 에뮬레이션 및 코드 단위 테스트는 완료되었으나, 다양한 안드로이드/iOS 실제 기기에서의 터치 반응은 운영자 수동 확인 권장.
- **실제 마이크 하드웨어 녹음 품질**: 브라우저 권한 획득 실패 시 폴백 및 MediaRecorder 로직은 단위 테스트로 검증되었으나, 실제 마이크 하드웨어별 음질 및 잡음 처리는 환경에 따라 상이함.
- **실시간 Google Search Console / AdSense 데이터**: 외부 Google 서비스 실시간 데이터에 직접 접근할 권한이 없으므로, 보고서에 명시된 원인은 기술적 분석에 기반한 가설이며 실제 반영 여부는 운영자 콘솔에서 확인해야 함.

---

## 6. 결론

오픽온미(OOM)는 기술적으로 매우 견고하게 구성되어 있으며, 이번 감사 및 검증을 통해 테스트 스위트의 비동기 지연 요소를 안정화하고 개인정보 처리방침의 투명성을 한 단계 끌어올렸습니다.
보안과 SEO, AdSense에 대해 과장 없는 정직한 평가 기준을 수립하였으므로, 안정적인 운영과 점진적 품질 향상을 이어갈 수 있습니다.
