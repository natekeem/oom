# OOM | OPIc On Me

OOM은 사내 구성원이 OPIc 영어 말하기를 체계적으로 연습하도록 돕는 정적 웹앱입니다. 백엔드 없이 브라우저에서 동작하며, 목표 구간 설정, 추천 서베이 익히기, 난이도 설정, 재사용 가능한 만능 스크립트, 롤플레이 공식, 실전 녹음, AI 피드백을 하나의 6단계 흐름으로 제공합니다.

루트 `/`는 OOM의 학습 방식을 설명하는 독립형 브랜드 랜딩입니다. AppShell과 Sidebar를 사용하지 않으며, 하나의 Voice/Signal object가 story 재사용, 세 Level, 6 STEP, 녹음·복기·재도전으로 이어지는 제품 구조를 설명합니다. STEP 6 미리보기는 실제 `ExamScreenShell`을 presentation-only로 재사용하며 Recorder·STT·AI·훈련 상태를 mount하지 않습니다. 유체 커서와 시그니처 오브젝트 WebGL, scroll motion은 progressive enhancement이고, mobile·low capability·`prefers-reduced-motion`에서는 동일한 카피와 CTA를 가진 정적 흐름으로 전환됩니다.

이 앱은 실제 점수나 등급을 보장하지 않습니다. 익숙한 경험을 여러 질문에 연결하고 자연스럽게 말하는 구조를 반복 연습하는 데 초점을 둡니다.

## 핵심 흐름

### OPIc 수험 가이드

신청 전 확인할 정보와 시험 당일 준비를 정리한 정보 영역입니다.

- 시험 소개와 등급 체계
- 시험 화면과 조작법 (가상 인터뷰어, 청취 제한, 녹음 및 타이머 조작)
- 회원가입, 시험 신청, 응시료
- 규정 신분증, 입실 통제, OT와 본시험 흐름
- 성적 발표, 인증서, 세이빙 쿠폰
- 자주 묻는 질문 (FAQ)

변경될 수 있는 일정, 응시료, 신분증 규정은 각 화면의 공식 링크를 통해 OPIc 공식 사이트에서 다시 확인해야 합니다.

### OPIc 실전 훈련하기

실제 훈련은 사이드바의 **OPIc 실전 훈련하기** (`/training/` Overview Hub) 아래 STEP 1~6으로 구성됩니다.

1. **목표 구간 · 코스 설정 (`/training/setup/`)**: 1구간(AL), 2구간(IH/IM3), 3구간(IM2/IM1) 중 목표 구간과 학습 코스(Everyday & Getaway, Culture & City, Nature & Weekend)를 설정합니다.
2. **추천 서베이 익히기 (`/training/survey/`)**: 실제형 설문 목록에서 선택한 코스 맞춤 추천 조합을 확인하고 연습 모드로 훈련합니다.
3. **난이도 설정 (`/training/difficulty/`)**: 선택한 구간의 권장 난이도를 확인하고, 별도의 시험 난이도 선택 시뮬레이션으로 조합을 미리 봅니다. 시뮬레이션은 현재 Course × Level 설정을 바꾸지 않습니다.
4. **만능 스크립트 (`/training/scripts/`)**: 코스별 4개 핵심 이야기를 `① 시작·서론 → ② 핵심 장면·본론 → ③ 마무리·결론` 말하기 순서로 익히고, 각 구간 안의 ANSWER·SCENE/ACTION·RESULT 기능 fact를 질문에 맞게 고릅니다. 이 3단계는 실제 문단 수 규칙이 아닙니다.
5. **롤플레이 공식 (`/roleplay/`)**: 문제·목적, 질문 또는 요청, 다음 행동을 CORE로 먼저 잡고, 정보 질문·대안·마무리를 OPTIONAL 메뉴처럼 골라 코스별 3개 실전 시나리오를 훈련합니다. 6단계를 매번 모두 사용할 필요는 없습니다.
6. **실전 연습 (`/practice/`)**: 실제 OPIc 시험 화면 스타일의 통합 콘솔에서 가상 인터뷰어(EVA)의 질문을 청취(최대 2회)하고 음성 녹음과 타이머로 답변을 진행합니다. 녹음 완료 후 2-Phase 복기 영역으로 전환되어 ① 내 녹음 재생 → ② optional STT 전사 및 editable transcript 확인·수정 → ③ Course × Level 맞춤 AI 피드백 → 같은 질문 다시 말하기(재도전) 흐름으로 실전 감각을 기릅니다.

## 기능

- 다크 모드와 반응형 접이식 사이드바
- 훈련 화면에서만 보이는 상단 진행 표시와 다음 단계 이동 (0% → 20% → 40% → 60% → 80% → 100%)
- 스크립트 전체/블라인드/키워드 암기 모드
- canonical bilingual base question, 질문 변형별 bilingual prompt와 full-answer before/after, Level-aware KEEP / CHANGE / DROP, 그리고 canonical 선택 fact의 `이 질문에서는 필수` 승격
- 원문을 바꾸지 않고 모든 Level에서 3개 학습 구간을 파생하며, 선택 확장은 해당 구간 안의 1~2개 fact로만 연습
- Web Speech API 기반 영어 TTS와 속도 조절
- 클립보드 복사 피드백
- MediaRecorder 기반 브라우저 내 녹음 및 재생
- 브라우저 `localStorage` 기반 내부 LLM 설정
- 스크립트 자연스러운 변형, KEEP/FIX/RETRY 우선 답변 피드백, 롤플레이 질문 생성

## 기술 구성

- Vite, React, TypeScript
- Tailwind CSS, Framer Motion, GSAP, Lenis, React Three Fiber, Lucide React
- Vitest, Testing Library
- React state 기반 `ViewId` 라우팅
- GitHub Pages와 일반 정적 호스팅 지원

## 설치와 로컬 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:5173`입니다.

## 검증과 빌드

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run preview
```

`npm run build`는 Vite 산출물을 만든 뒤 sitemap에 포함된 주요 경로마다 route별 SEO HTML을 `dist/**/index.html`로 생성합니다. `npm run verify:pages`는 빌드 결과가 개발용 `src/main.tsx`가 아니라 번들 자산을 참조하는지, 주요 정적 route 파일이 존재하는지, redirect-only HTML이 남지 않았는지 확인합니다.

## GitHub Pages 배포

이 저장소는 `feature/adsense` 또는 `main` 브랜치 푸시 시 `.github/workflows/pages.yml`로 테스트, 빌드, Pages 아티팩트 검증, 배포를 실행합니다.

1. 저장소 **Settings > Pages**에서 Source를 **GitHub Actions**로 설정합니다. 브랜치 직접 배포를 선택하면 Vite의 개발용 `index.html`이 배포되어 사이트가 정상 동작하지 않습니다.
2. `feature/adsense` 또는 `main`에 푸시합니다.
3. Actions의 `Deploy OOM to GitHub Pages` workflow 완료 후 Pages 주소를 확인합니다.

개인 도메인으로 배포할 때는 Vite base(`/`)를 사용하므로, 사이트가 도메인 루트 경로에서 동작합니다. GitHub Pages의 프로젝트 하위 경로에 배포하려면 그 경로에 맞춘 별도 base 설정이 필요합니다.

개인 도메인을 연결한 뒤에는 해당 도메인의 `/` 경로로 접속합니다.

GitHub Pages는 SPA 하위 경로를 서버에서 rewrite하지 않습니다. 이 저장소는 빌드 후 `scripts/generate-static-routes.mjs`가 `dist/magazine/opic-2026-strategy/index.html`, `dist/exam-guide/index.html`, `dist/privacy/index.html`처럼 실제 파일을 생성해 직접 접근과 검색엔진 source 확인에서 route별 title, description, canonical, Open Graph 태그와 최소 본문을 반환하도록 합니다. 알 수 없는 경로만 `404.html`의 SPA fallback을 사용합니다.

## 내부 LLM 설정

**AI 피드백 / 설정** 화면에서 다음 값을 입력합니다.

- API Endpoint URL
- API Key 또는 Authorization Token
- Model Name
- 인증 방식: Bearer token / `x-api-key` / No auth
- 요청 형식: OpenAI-compatible / Generic chat messages / Custom JSON

Custom JSON에서는 `{model}`, `{messages}`, `{system}`, `{user}` 토큰을 사용할 수 있습니다.

설정은 현재 브라우저의 `localStorage`에만 저장됩니다. 실제 API 키를 소스, 문서 예시, 테스트, 커밋에 넣지 마세요. 브라우저에서 직접 API를 호출하므로 대상 API는 CORS 요청을 허용해야 합니다.

## STT (음성 인식) 설정

**AI 피드백 / 설정** 화면에서 별도 STT 설정을 입력하면 STEP 6 실전 연습에서 녹음 종료 후 자동 전사를 사용할 수 있습니다.

STT 데이터 흐름:
```
브라우저 녹음 (MediaRecorder)
→ 로컬 오디오 Blob (서버 저장 없음)
→ [선택] 사용자 설정 STT endpoint로 직접 전송
→ editable transcript (사용자 확인·수정 가능)
→ 사용자 설정 LLM으로 AI 피드백 요청
```

STT 설정은 독립 `oom-stt-settings` key로 저장되며, LLM 설정과 공유되지 않습니다. 녹음 파일은 OOM 서버에 저장되지 않습니다. STT가 설정되지 않았거나 실패해도 수동 transcript 입력으로 AI 피드백을 받을 수 있습니다.
