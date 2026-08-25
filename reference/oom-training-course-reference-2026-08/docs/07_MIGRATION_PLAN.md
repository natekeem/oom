# 07. Migration Plan

Code agent가 아래 순서를 지키게 하세요.

## Phase 0 — Repo rules 확인

반드시 읽기:
1. repository root `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `docs/ROUTING.md`
4. `docs/PROJECT_SNAPSHOT.md`
5. 이 reference pack

## Phase 1 — Types/Data

- `TrainingLevelId`
- `TrainingCourseId`
- `TrainingCourseDefinition`
- `SurveyPreset`
- `TrainingStoryline`
- `TrainingRoleplay`
- `TrainingPracticeQuestion`
- `TrainingSelection`
- `ResolvedTrainingContext`

추가.

기존 `GoalLevel`이 다른 화면에서 필요하면 즉시 삭제하지 말고 adapter를 두어 migration.

Course 1/2/3 데이터 등록.

`resolveTrainingContext()` 작성.

## Phase 2 — Selection state

- localStorage `oom-training-selection-v1`
- provider/hook 또는 현재 app state 스타일에 맞는 single owner
- stale JSON fallback
- child training view gate

## Phase 3 — Survey

전체 option hierarchy 유지.

전역 `recommended`를 Course source of truth로 쓰지 않음.

현재 Course의 IDs로 동적 recommendation 계산.

## Phase 4 — Difficulty

- advanced 5-5
- intermediate 4-4
- foundation 3-3

현재 Level을 default/locked preset으로 사용.

## Phase 5 — Script

1. Current main 4 scripts → Course1 advanced
2. 이 pack의 Course1 intermediate/foundation 추가
3. Course2 세 level 추가
4. Story A/B selector 제거
5. blind/keyword/TTS/variation 유지
6. variation key를 course/storyline-aware하게 변경

중요:
Story choice와 question variation은 별개의 기능이다.

## Phase 6 — Roleplay

Course × Level 구조로 변환.

기존 formula UI가 좋다면 공통 component는 유지.

## Phase 7 — Practice/AI

Practice:
- `courseId`
- `levelId`
- `storylineId`

필수.

Random pool을 course & level로 filter.

AI:
- 기존 IM3/IH/AL-only hardcode 검색
- foundation/intermediate/advanced + display grade label로 확장
- reference script exact match를 평가 기준으로 삼지 않음

## Phase 8 — Legacy cleanup

모든 import가 사라진 뒤:
- `additionalScripts.ts`
- `additionalScriptTraining.ts`
- `additionalScriptReplacementGuides.ts`

등 Story B 전용 파일 삭제 검토.

`additionalRoleplays.ts`의 좋은 scenario는 먼저 future course backlog로 옮길 수 있음.

## Phase 9 — Repo instruction docs

`AGENTS.md`를 반드시 새 제품 결정과 맞춤.

권장 규칙:

- A training course owns one canonical storyline per group.
- Story A/B choice UI is no longer part of the product model.
- The same storyline provides foundation/intermediate/advanced variants preserving the same core scene.
- Course owns survey/story context.
- Level owns difficulty/answer density.
- Question-type variation training remains required.

`ARCHITECTURE.md`, `ROUTING.md` 갱신.

`PROJECT_SNAPSHOT.md`는 직접 편집하지 말고 repo generator 사용.

## Phase 10 — Validate

Repo가 요구하는 명령을 실제로 실행.

기존 AGENTS 분석 기준:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
```

실패를 남긴 채 완료 처리하지 않음.
