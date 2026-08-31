# OOM | 오픽온미 (OPIc On Me)

OOM은 OPIc 영어 말하기를 Course × Level 구조로 연습하는 브라우저 기반 정적 웹앱입니다. 목표 설정부터 서베이, 스크립트, 롤플레이, 녹음과 복기까지 하나의 6단계 흐름으로 연결합니다. 실제 점수나 등급을 보장하지 않으며, 익숙한 장면을 여러 질문에 맞게 바꾸어 말하는 연습에 초점을 둡니다.

## Product model

- **Course**는 서베이 조합, 이야기 세계, 롤플레이, 실전 질문을 소유합니다.
- **Level**은 난이도, 답변 밀도, 목표 발화 시간을 소유합니다.
- 현재 Level은 `1구간 · AL · 60~90초`, `2구간 · IH / IM3 · 45~65초`, `3구간 · IM2 / IM1 · 30~45초`입니다.
- 현재 등록된 Course는 Everyday & Getaway, Culture & City, Nature & Weekend입니다. Course registry는 폴더를 자동 발견하므로 Course 수를 세 개로 고정하지 않습니다.

훈련 흐름은 다음과 같습니다.

1. **STEP 1 목표 구간 · 코스 설정** — `/training/setup/`
2. **STEP 2 추천 서베이 익히기** — `/training/survey/`
3. **STEP 3 난이도 설정** — `/training/difficulty/`
4. **STEP 4 만능 스크립트** — `/training/scripts/`
5. **STEP 5 롤플레이 공식** — `/roleplay/`
6. **STEP 6 실전 연습** — Hub `/practice/`, 빠른 연습 `/practice/quick/`, 실전 모의고사 `/practice/mock/`

`/`는 AppShell과 분리된 제품 랜딩이고, `/about/`는 OOM 학습 방식, `/exam-guide/`는 수험 가이드, `/magazine/`은 정적 학습 콘텐츠입니다. STEP 2~6은 유효한 `TrainingSelection`이 있어야 하며, 선택이 없을 때 임의 Course나 Level로 넘어가지 않습니다.

## Main capabilities

- Course별 한 canonical storyline을 세 Level에서 같은 장면으로 확장
- STEP 4의 `OPEN → SCENE → CLOSE`, 질문 변형, KEEP / CHANGE / DROP
- STEP 5의 CORE 기능과 OPTIONAL 기능을 고르는 6-function menu
- STEP 6 빠른 연습과 실전 모의고사, 질문 청취 0/2 제한, MediaRecorder 녹음, 다시 듣기
- 실전 모의고사의 Background Survey → Self Assessment → 시험 준비 → 자기소개 워밍업 → 1st Session → 난이도 재조정 → 2nd Session → 결과 요약 / 답변 복기 / 훈련 리포트
- optional STT 전사, editable transcript, 사용자 설정 LLM 기반 KEEP / FIX / RETRY 피드백
- Heart / Bella / Sarah / Sky 음성과 WaveSurfer waveform
- 고정 콘텐츠는 WebM/Opus 정적 음원을 먼저 쓰는 static-first TTS

STEP 6의 빠른 연습은 자기소개 워밍업 없이 한 문제를 바로 듣고 녹음한 뒤 STT·AI로 복기합니다. 실전 모의고사는 현재 Course의 설문을 확인하고 Mock 전용 Self Assessment Level을 고른 뒤, 문항 수와 40분 타이머에 포함되지 않는 20~30초 자기소개 워밍업을 거쳐 두 Session을 이어갑니다. Survey와 Mock Level은 현재 세션 메모리에만 있으며 저장된 `TrainingSelection`을 바꾸지 않습니다. 시험 중에는 STT·AI·transcript·힌트를 호출하거나 표시하지 않습니다. 종료 후에는 결과 요약, 답변 복기, 훈련 리포트를 같은 세션에서 오가며 확인합니다. 훈련 리포트는 완료율, 목표 발화 시간 적합도, 녹음과 답변 시간, 선택적으로 수행한 STT·AI 복기 범위만 보여 주며 점수나 예상 OPIc 등급을 산출하지 않습니다. 리포트는 서버 전송 없이 standalone HTML로 내려받을 수 있습니다.

## Tech stack

- Vite + React 18 + TypeScript
- React Router, Tailwind CSS, Framer Motion, GSAP, Lenis, React Three Fiber
- Kokoro-82M via `kokoro-js`, WaveSurfer, browser Web Speech fallback
- Vitest + Testing Library
- GitHub Pages 또는 일반 정적 호스팅

백엔드, 데이터베이스, 서버 저장소는 없습니다. LLM/STT 설정과 API key는 앱 설정 화면을 통해 현재 브라우저 `localStorage`에만 저장되며 소스에 포함하지 않습니다. STT 설정 key는 `oom-stt-settings`입니다.

## Local development

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:5173`입니다.

## Commands

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run preview
npm run docs:generate
npm run docs:check
npm run tts:audit
npm run tts:validate -- --prune-dry-run
```

`npm run build`는 TypeScript와 Vite 빌드 후 `scripts/generate-static-routes.mjs`로 canonical route별 `dist/**/index.html`을 생성합니다. `npm run verify:pages`는 crawler-visible 본문, canonical URL, bundle 참조, Pages 필수 파일을 검사합니다.

TTS 콘텐츠를 추가하거나 수정했다면 [Content Authoring](docs/CONTENT_AUTHORING.md)의 순서를 따릅니다. `npm run tts:generate`는 FFmpeg/ffprobe가 있는 개발자 PC에서 실행하며, 출력된 dev URL에서 생성 시작을 눌러야 합니다. 이미 검증된 동일 hash/voice asset은 건너뛰고 누락분만 생성합니다. CI에서는 음원을 생성하지 않습니다.

## Documentation map

| 문서 | 분류 | 역할 |
| --- | --- | --- |
| [AGENTS.md](AGENTS.md) | CANONICAL | code agent 운영 규칙과 금지사항 |
| [Architecture](docs/ARCHITECTURE.md) | CANONICAL | runtime ownership와 browser/backend boundary |
| [Training System](docs/TRAINING_SYSTEM.md) | CANONICAL | Course × Level, STEP 1~6, guard와 UI contract |
| [Content Authoring](docs/CONTENT_AUTHORING.md) | CANONICAL | 새 Course·script·question 추가 절차 |
| [TTS Audio Pipeline](docs/TTS_AUDIO_PIPELINE.md) | CANONICAL | static-first TTS 생성·runtime·asset 정책 |
| [Routing](docs/ROUTING.md) | CANONICAL | route, sidebar, training header contract |
| [Deployment](docs/DEPLOYMENT.md) | CANONICAL | GitHub Pages build와 future intranet boundary |
| [Static-first TTS ADR](docs/decisions/001-static-first-tts.md) | HISTORICAL DECISION | TTS 선택의 배경과 결과 |
| [Project Snapshot](docs/PROJECT_SNAPSHOT.md) | GENERATED | package scripts와 `src/` inventory |
| `artifacts/tts-inventory.json` | GENERATED DEV INPUT | `tts:audit`이 만들고 generator/validator가 읽는 inventory |
| `docs/AUDIT_*.md`, `docs/IMPLEMENTATION_AUDIT_RESOLUTION.md`, `docs/TRAINING_CONTENT_QA.md` | HISTORICAL | 특정 시점의 감사와 해결 기록; 현재 architecture source가 아님 |
| [Magazine Image Sources](docs/image-sources.md) | PROVENANCE | 로컬 이미지 출처와 라이선스 |
| [reference/](reference/README.md) | EXPERIMENTAL / REFERENCE | 제공받은 설계·실험 패키지; production source가 아님 |

## Deployment summary

`.github/workflows/pages.yml`이 `main` 또는 `feature/adsense` push에서 lint, generated docs check, tests, build, Pages artifact 검증 후 `dist/`를 배포합니다. Vite `base`는 `/`이고 canonical origin은 `https://opic-on-me.com`입니다. 정적 TTS audio, peaks, production manifest는 `public/generated-tts/`에서 build artifact로 복사됩니다.

자세한 배포 구조와 project-subpath 주의사항은 [Deployment](docs/DEPLOYMENT.md)를 참고하세요.
