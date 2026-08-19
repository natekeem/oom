# OOM | OPIc On Me

OOM은 사내 구성원이 OPIc 영어 말하기를 체계적으로 연습하도록 돕는 정적 웹앱입니다. 백엔드 없이 브라우저에서 동작하며, 목표 구간 설정, 서베이 고정, 난이도 설정, 재사용 가능한 만능 스크립트, 롤플레이 공식, 실전 녹음, AI 피드백을 하나의 6단계 흐름으로 제공합니다.

이 앱은 실제 점수나 등급을 보장하지 않습니다. 익숙한 경험을 여러 질문에 연결하고 자연스럽게 말하는 구조를 반복 연습하는 데 초점을 둡니다.

## 핵심 흐름

### OPIc 수험 가이드

신청 전 확인할 정보와 시험 당일 준비를 정리한 정보 영역입니다.

- 시험 소개와 등급 체계
- 회원가입, 시험 신청, 응시료
- 규정 신분증, 입실 통제, OT와 본시험 흐름
- 성적 발표, 인증서, 세이빙 쿠폰

변경될 수 있는 일정, 응시료, 신분증 규정은 각 화면의 공식 링크를 통해 OPIc 공식 사이트에서 다시 확인해야 합니다.

### OPIc 실전 훈련하기

실제 훈련은 사이드바의 **OPIc 실전 훈련하기** (`/training/` Overview Hub) 아래 STEP 1~6으로 구성됩니다.

1. **목표 구간 · 코스 설정 (`/training/setup/`)**: 1구간(AL), 2구간(IH/IM3), 3구간(IM2/IM1) 중 목표 구간과 학습 코스(Everyday & Getaway, Culture & City, Nature & Weekend)를 설정합니다.
2. **서베이 고정 (`/training/survey/`)**: 실제형 설문 목록에서 선택한 코스 맞춤 추천 조합을 확인하고 연습 모드로 훈련합니다.
3. **난이도 설정 (`/training/difficulty/`)**: 선택한 구간에 맞춘 권장 난이도(5-5, 4-4, 3-3)와 평가 초점을 확인합니다.
4. **만능 스크립트 (`/training/scripts/`)**: 코스별 4개의 canonical storyline을 질문별 변형과 답변 설계도로 익힙니다.
5. **롤플레이 공식 (`/roleplay/`)**: 6단계 만능 해결 공식(상황 → 문제 → 질문 → 대안 1 → 대안 2 → 마무리)과 필수 만능 표현을 익히고 코스별 실전 시나리오를 훈련합니다.
6. **실전 연습 (`/practice/`)**: 목표 구간·코스 맞춤 질문, 60/90/120초 타이머, 녹음, 텍스트 답변, AI 피드백을 사용합니다.

## 기능

- 다크 모드와 반응형 접이식 사이드바
- 훈련 화면에서만 보이는 상단 진행 표시와 다음 단계 이동 (0% → 20% → 40% → 60% → 80% → 100%)
- 스크립트 전체/블라인드/키워드 암기 모드
- 질문 변형별 교체 블록 및 4단계 답변 설계도 (Opening → Scene → Detail → Closing)
- Web Speech API 기반 영어 TTS와 속도 조절
- 클립보드 복사 피드백
- MediaRecorder 기반 브라우저 내 녹음 및 재생
- 브라우저 `localStorage` 기반 내부 LLM 설정
- 스크립트 자연스러운 변형, 답변 피드백, 롤플레이 질문 생성

## 기술 구성

- Vite, React, TypeScript
- Tailwind CSS, Framer Motion, Lucide React
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
