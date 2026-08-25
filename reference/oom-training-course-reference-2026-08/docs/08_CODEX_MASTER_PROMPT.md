# 08. CODEX MASTER PROMPT

이 문서는 구현 에이전트에게 그대로 전달할 최종 작업 지시다.

---

당신은 `natekeem/oom` 저장소의 OPIc 실전 훈련 구조를 개편한다.

중간에 사용자에게 설계 질문을 되묻지 말고, 저장소 코드/규칙과 이 reference pack을 읽은 뒤 합리적으로 통합 구현하라. unrelated refactor는 하지 말라.

## 0. 먼저 읽을 것

저장소:
1. `/AGENTS.md`
2. `/docs/ARCHITECTURE.md`
3. `/docs/ROUTING.md`
4. `/docs/PROJECT_SNAPSHOT.md`

그 다음 이 폴더:
1. `README_START_HERE.md`
2. `docs/00_EXECUTIVE_SUMMARY.md`
3. `docs/01_FINAL_PRODUCT_MODEL.md`
4. `docs/02_CURRENT_REPO_ANALYSIS.md`
5. `docs/03_TARGET_ARCHITECTURE.md`
6. `docs/04_CONTENT_AUTHORING_RULES.md`
7. `docs/05_COURSE_CONTENT_SPEC.md`
8. `docs/06_UI_UX_FLOW.md`
9. `docs/07_MIGRATION_PLAN.md`
10. `docs/09_ACCEPTANCE_CRITERIA.md`
11. `content/*.json`
12. `reference/*`

## 1. 제품 목표

현재 하나의 고정된 OPIc 훈련 흐름을:

`목표 구간(Level) × 훈련 코스(Course)`

구조로 바꾼다.

별도의 user-facing Training Set 단계는 만들지 않는다.

### Level

- `advanced` = 화면 1구간 = AL 목표 = 기본 5-5
- `intermediate` = 화면 2구간 = IH / IM3 목표 = 기본 4-4
- `foundation` = 화면 3구간 = IM2 / IM1 목표 = 기본 3-3

난이도는 등급을 보장하지 않는 학습 프리셋이라고 UI에 표시한다.

### Course

- Course 1 = Everyday & Getaway
- Course 2 = Culture & City
- Course 3 = Nature & Weekend

Course는 survey/story context를 소유한다.
Level은 difficulty/answer density를 소유한다.

## 2. 학습 철학 — 절대 훼손 금지

OOM의 목적은 답변 수를 늘려 외우게 하는 것이 아니다.

**하나의 anchor scene과 core facts를 여러 질문에 재사용하여 최소한의 준비로 최대한 많은 질문에 대응하게 한다.**

같은 Course의 3 level은 서로 다른 이야기로 만들지 않는다.

- foundation = core scene의 최소 완성형
- intermediate = same scene + 구체 이유 + 최근 경험 + 간단한 변화
- advanced = same scene + 문제/예상 밖 상황 + 비교/변화 + 선택/의미 + 유연한 연결

학습자가 2구간에서 같은 Course를 익힌 뒤 1구간으로 올라가면 story를 다시 외우는 것이 아니라 기능을 더하도록 한다.

Script 전체 통암기를 권장하는 문구를 만들지 말라.

기존 blind/keyword/TTS/recording/question-variation은 유지한다.

## 3. 현재 콘텐츠 migration

현재 `src/data/scripts.ts`의 main 4 scripts는 Course 1 / `advanced` 기준 콘텐츠로 최대한 보존한다.

이 reference pack의:
- `content/course-1-storylines.json`
- `content/course-2-storylines.json`
- `content/course-3-storylines.json`
- survey JSON
- roleplay JSON
- questions JSON

을 source/reference로 사용하여 TypeScript 프로젝트 스타일에 맞게 옮긴다.

콘텐츠를 임의로 크게 다시 쓰지 말라.

## 4. Story A/B

STEP3의 Story Set A/B 선택 UI를 제거한다.

Story B 전용 state/import/data는 안전하게 migration 후 정리한다.

하지만 `scriptTrainingData` 류의 **질문별 pivot/variation/keep-block 기능은 Story A/B와 완전히 다른 기능**이다. 이것은 삭제하지 말고 canonical storyline에 연결하여 유지한다.

## 5. Training entry UX

`OPIc 실전 훈련하기` 진입 시 기존 STEP cards 전에:

1. 목표 구간 선택
2. 훈련 코스 선택

두 단계만 제공한다.

선택 완료 뒤 기존 STEP1~5 구조를 최대한 유지한다.

학습 화면 상단/헤더에:
`1구간 AL · 코스 1 Everyday & Getaway`
같은 현재 context와 `구간/코스 변경` 액션을 제공한다.

selection 없이 training child view에 접근하면 selector가 있는 training hub로 gate한다.

새 router dependency는 추가하지 않는다.

## 6. Data model

전체 Background Survey option tree는 한 곳에서 유지한다.

Course survey는 option ID를 참조한다.

Storyline 최소 구조:
- id
- courseId
- group
- title
- surveyOptionIds
- core.anchorScene
- core.facts
- core.reusableFor
- levels.foundation
- levels.intermediate
- levels.advanced

Roleplay:
- 같은 scenario 아래 3 level variants

PracticeQuestion:
- id
- courseId
- levelId
- storylineId
- group
- type
- prompt

STEP5 random pool은 반드시:
`current courseId AND current levelId`
로 필터한다.

## 7. Selection persistence

localStorage key:
`oom-training-selection-v1`

최소 값:
- courseId
- levelId
- selectedAt

invalid/stale data는 crash하지 말고 selector로 fallback.

## 8. Survey

기존 full option hierarchy는 유지한다.

현재 전역 `recommended` boolean이 있더라도 최종 source of truth는 current Course preset이어야 한다.

Course 1:
가족 거주 중심 현재 OOM 추천값.

Course 2:
홀로 거주 + 영화/공연/쇼핑/콘서트/공원 + 음악 + 조깅/걷기/운동 안 함 + 국내/해외/집 휴가.

## 9. Difficulty

- advanced 5-5
- intermediate 4-4
- foundation 3-3

Level owns difficulty.

만약 기존 STEP2에 수동 선택 기능이 있다면 v1에서는 current level preset을 명확한 추천/고정값으로 보여주고 제품 규칙과 모순되는 state를 만들지 않는다.

## 10. AI feedback

repo 전체에서 기존:
- IM3
- IH
- AL
- IM3-IH-AL

hardcode와 type assumptions를 찾는다.

새 training path에서:
- target level
- target grade label
- current question
- course/storyline context
를 AI prompt에 전달한다.

평가 기준:
- question relevance
- level-appropriate function
- coherent story adaptation
- understandable delivery/content
- spontaneous variation

Reference script와 exact sentence match를 요구하지 않는다.

## 11. AGENTS.md도 코드와 함께 변경

현재 AGENTS.md가 Story A/B hierarchy를 non-negotiable로 규정하면 새 제품 결정과 충돌한다.

코드만 바꾸고 AGENTS를 남기지 말라.

새 규칙에 다음을 명시:
- Course owns survey/story context.
- Level owns difficulty/answer density.
- One canonical storyline per group per course.
- Same core scene across three levels.
- Story A/B choice UI is removed.
- Question-type variation training remains required.

`docs/ARCHITECTURE.md`, `docs/ROUTING.md`도 새 모델에 맞춘다.

`PROJECT_SNAPSHOT.md`는 generator가 있다면 직접 편집하지 말고 생성 명령 사용.

## 12. 기술 제약

- static hosting 유지
- backend 추가 금지
- server-only dependency 금지
- API key hardcode 금지
- 현재 UI tone/design system 유지
- mobile nav/accessibility/keyboard focus 유지
- unrelated refactor 금지

## 13. 테스트

최소 다음 회귀 테스트를 추가/수정:

1. 첫 training 진입에서 Level/Course selector 렌더
2. selection 확정 후 기존 STEP1~5 렌더
3. localStorage reload persistence
4. Course1 vs Course2 survey recommendation 차이
5. 같은 Course에서 level 변경 시 storyline ID/core scene 유지, active level content만 변경
6. Story A/B selector 없음
7. question variation 기능은 존재
8. STEP5가 다른 course/level 문제를 섞지 않음
9. no-selection child training view gate
10. AI feedback이 foundation/intermediate/advanced를 이해
11. 기존 TTS/recording/blind/keyword 기능 회귀 없음

## 14. 완료 검증

저장소가 요구하는 검증 명령을 실행하고 실패를 고친다.

분석 당시 기준:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
```

실제 package.json/AGENTS가 더 최신이면 거기의 최신 명령을 우선한다.

## 15. 최종 보고

최종 응답에는:
- 변경 파일
- architecture 요약
- legacy/삭제 파일
- migration compatibility 처리
- 테스트 결과
- 남은 P1/P2 아이디어

만 간결하게 보고한다.

---


## 미래 Course 자동 확장 요구

Course ID를 `course-1 | course-2 | course-3` union으로 고정하지 말라. `course-${number}` 또는 동등한 extensible 타입을 사용한다.

가능하면 `import.meta.glob` 기반 build-time discovery를 구현해서 새 `src/data/training/courses/course-N/` 폴더를 추가한 뒤 registry/UI 코드를 수정하지 않고 build할 수 있게 한다. `reference/autoCourseRegistry.reference.ts` 참고.

초기 서비스에서는 Course 1/2/3이 모두 selector에 보여야 한다.
