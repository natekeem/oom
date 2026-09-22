# Phase 3.1 구현 및 검증 보고서

검증일: 2026-09-23. 로컬 구현과 검증을 완료했다. 운영 Supabase migration 적용, secrets 설정, Edge Function 배포, 실제 Gemini 유료 호출 및 실제 실행 리전 확인은 수행하지 않았다. 신규 migration은 **Managed AI OFF**로 시작한다. 커밋·푸시는 하지 않았다.

## 구현 범위

- Quick Practice 완료 후 텍스트 답변에 대한 관리형 Gemini 피드백을 추가했다. 구조화된 AI COACH / KEEP / FIX / RETRY, 선택형 연습 신호와 답변 예시를 기존 Card/Button/Badge와 리뷰 레이아웃으로 표시한다. 원문 입력 없이는 호출하지 않는다.
- AI 설정은 관리형 상태·할당량·개인정보 안내를 먼저 보여주고 기존 사용자 설정 STT/LLM을 고급 설정 안에 유지한다. Full Mock 시험·리뷰 동작, STEP 1~6, TTS, 공개 훈련과 Pricing의 PRO 준비 중 상태를 유지했다.
- `/admin/ai/`에 KPI 6개, 7일 호출/예상 비용 그래프, 모델/기능 집계, 최근 실패, 상위 사용자, 평균/p95 지연, 서버 필터·페이지 조회를 추가했다. 기존 AdminLayout을 재사용하며 일반 학습자에게는 해당 lazy chunk를 로드하지 않는다.
- owner/admin만 ON/OFF·모델·FREE/향후 PRO 한도를 확인 후 변경한다. support는 읽기 전용이다. 서버 인증과 DB 역할 재검증, 설정 변경과 감사 로그 저장을 한 트랜잭션으로 처리한다.
- 관리자 경로는 noindex, sitemap 제외, 광고 제외, footer 없음이다. 정적 GitHub Pages 구조를 유지했다.

## 보안·할당량·저장

신규 migration은 `20260923000000_managed_ai_platform.sql`이며 기존 적용 migration은 수정하지 않았다. 6개 테이블, 5개 service_role 전용 RPC, RLS·권한·제약·인덱스 상세는 [플랫폼 문서](MANAGED_AI.md#database)에 있다.

FREE 3회/서울 날짜, 향후 PRO 설정 30회, 신규 요청 5회/분이다. 현재 실효 플랜은 항상 FREE이며 `profiles.plan`을 결제 권한으로 사용하지 않는다. 사용자별 PostgreSQL 트랜잭션 advisory lock 안에서 예약·완료·환불을 처리한다. 성공한 피드백만 일일 한도를 소비한다. UUID와 입력 fingerprint로 중복을 식별하고 성공 결과를 재전달한다. 실패와 만료 UUID도 유지해 재호출이 자동으로 다시 Gemini를 호출하지 않도록 했다.

Gemini 키는 서버 `GEMINI_API_KEY`만 사용한다. 요청/응답 JSON과 길이·키·타입을 검증하며, 클라이언트는 quota를 변경할 수 없다. 오디오를 보내지 않는다. OOM DB/서버 로그에 원본 답변을 별도 저장하지 않으며 피드백과 사용량만 저장한다. 피드백에는 답변의 일부 내용이 반영될 수 있음을 공개했다. 계정 변경·로그아웃 시 이전 피드백과 진행 중 응답을 분리한다.

## 모델·비용·성능

선택 모델은 `gemini-3.5-flash-lite`, 대안은 `gemini-3.1-flash-lite`이다. 공식 모델·가격·API 문서를 2026-09-21 확인해 안정 버전의 텍스트 구조화 응답과 비용을 기준으로 선택했다. `v1/interactions`, `store:false`, JSON Schema, 최대 출력 4,000토큰, 전체 응답 읽기 포함 25초 timeout을 사용한다. 과금 중복을 피하기 위해 provider 자동 재시도는 하지 않으며, 멱등 DB finalization만 한 번 재시도한다. 공식 링크 및 구체적인 정책은 [Gemini와 비용](MANAGED_AI.md#gemini-and-cost)에 있다.

모델별 가격은 DB catalog에 두며 예약 시 snapshot을 남긴다. 실제 보고된 토큰과 보고된 thought tokens를 사용하고 캐시 입력을 중복 계산하지 않는다. 알 수 없는 사용량/비용은 null로 남긴다. 화면은 실제 청구액이 아닌 **예상 API 비용**으로 표시한다.

`Server-Timing: total;dur=...`, `X-Response-Time`을 반환하고 요청 시 `x-region: ap-northeast-2`를 보낸다. 실제 `x-sb-edge-region`과 운영 응답 시간은 미측정이다. QA fixture의 지연이나 차트 숫자는 운영 성능 자료가 아니다.

빌드 결과: 메인 JS 743.52 kB / gzip 218.28 kB, 관리형 피드백 chunk 11.59 kB / gzip 4.68 kB, Admin AI chunk 12.51 kB / gzip 4.52 kB. Gemini SDK·차트 라이브러리 등 런타임 의존성을 추가하지 않았다. 기존 큰 chunk 경고는 남아 있다.

동일 의존성으로 HEAD 소스를 별도 임시 경로에서 Vite 빌드한 기준값은 메인 JS 742.71 kB / gzip 218.00 kB였다. 메인 증가량은 약 0.81 kB / gzip 0.28 kB이며 새로운 AI UI는 별도 chunk로 분리된다. 기준 빌드는 JS 비교용으로 공개 정적 파일을 복사하지 않았다.

## 실제 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run lint` | 통과 |
| `npm run test` | 42 파일, 361 테스트 통과 |
| Deno 2.9.6 `check --no-lock` | ai-api / admin-api 통과 |
| `npm run docs:generate` / `docs:check` | 통과, PROJECT_SNAPSHOT 갱신 |
| `npm run build` | 통과 |
| `npm run verify:pages` | 통과: canonical sitemap 50개, 생성 index 58개, 대표 경로 16개 |
| 모든 migration 적용 및 SQL 테스트 | 새 PostgreSQL 18.4 DB에 순서대로 적용, `managed_ai.sql` 통과 |
| 실제 동시성 테스트 | 독립 연결 3개, 경쟁 중인 waiter 2개 확인, 마지막 1회에 RESERVED 1개 / DAILY_QUOTA_EXCEEDED 1개 |
| 관리형 브라우저 QA | Chromium, 스크린샷 31개, mock feedback POST 8회, overflow/상태 검증 통과 |
| 기존 레이아웃 회귀 | 46개 route/fixture/interaction 검사 통과 |
| `git diff --check` | 통과 |

함수 테스트는 로그인·입력 검증·원문 없음·비활성·quota 차단·UUID 재시도·저장 실패와 복구·provider 오류·구조화 응답·admin 권한/입력을 검증한다. 학습자 테스트는 중복 클릭, 불확실한 응답의 동일 UUID 재시도, 확정 실패 후 신규 UUID, quota 소진, 계정 전환과 늦은 응답 무시를 포함한다. 관리자 테스트는 조회/필터/페이지·변경 확인·support 제한·오류·입력 검증을 포함한다.

SQL 검증은 실제 PostgreSQL에서 수행했으나 Supabase Auth의 최소 schema/roles shim을 사용했다. 운영 Supabase 배포 및 advisors 검증으로 해석하면 안 된다. Docker 엔진을 사용할 수 없어 임시 native PostgreSQL을 사용했고 테스트 도구는 `.tmp/` 아래 설치하여 프로젝트 의존성을 변경하지 않았다.

## 시각 검증

구현 전 `/mypage/`, `/ai-settings/`, `/training/`, `/training/scripts/`, `/practice/`, `/practice/quick/`, `/admin/`, `/admin/users/`, `/pricing/`의 기존 구조를 확인했다. 구현 후 기존 관리자/사용자/마이페이지를 비교 기준으로 사용했다.

새 화면은 **1440×1000 / 390×844, dark / light** 조합으로 `/ai-settings/`, `/admin/ai/`, Quick Practice 리뷰를 검사했다. Quick 리뷰는 원문 없음·분석 중·성공·실패·quota 소진 상태를 각각 캡처했다. 관리자 모바일 차트의 overflow와 헤더 탭 줄바꿈을 조정했다. 기존 레이아웃 자동 검사는 1440×900, 1920×1080, 390×844를 사용했다.

재현 스크립트: `scripts/verify-managed-ai.mjs`, `scripts/verify-layout.mjs`. 스크린샷과 실행 로그: 로컬 `.tmp/ai-qa/` (Git 제외). 모든 인증·provider 숫자는 명시적 QA fixture이며 실제 사용자 데이터나 운영 지표가 아니다.

## 운영 적용과 후속 범위

정확한 migration·SQL 테스트·secret 설정·두 Edge Function 배포·OFF 확인·활성화·실제 1회 호출·재시도·quota 소진·리전 확인 순서는 [owner rollout](MANAGED_AI.md#owner-rollout)에 있다. API 키를 채팅이나 브라우저 환경변수에 넣지 않는다. 운영 검증이 완료되기 전 Pricing에 FREE 3회 사용 가능을 광고하지 않는다.

미포함: 관리형 STT, 오디오 저장/처리, 발음 분석, Full Mock 종합 AI 보고서, 실제 구독/결제, PRO 구매, 광고 제거 entitlement, 커뮤니티. 선택 사항인 피드백 히스토리와 임시 entitlement override도 추가하지 않았다.

저장소의 실제 명령은 `docs:generate`, `docs:check`, `verify:pages`이므로 요청문에 언급된 일반 `docs`/`verify` 이름 대신 이를 사용했다. 고정 TTS 콘텐츠는 변경하지 않아 음성 자산을 재생성하지 않았다.
