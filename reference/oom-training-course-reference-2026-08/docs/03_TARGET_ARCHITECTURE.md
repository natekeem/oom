# 03. Target Architecture

## 권장 디렉터리

```text
src/
  training/
    types.ts
    levels.ts
    registry.ts
    storage.ts
    selectors.ts
    validate.ts

  data/
    training/
      surveys/
        course1Survey.ts
        course2Survey.ts
      courses/
        course1.ts
        course2.ts
      storylines/
        course1Storylines.ts
        course2Storylines.ts
      roleplays/
        course1Roleplays.ts
        course2Roleplays.ts
      questions/
        course1Questions.ts
        course2Questions.ts

  components/
    training/
      TrainingHub.tsx
      TrainingSetupView.tsx
      TrainingSelectionSummary.tsx
      TrainingGuard.tsx
```

실제 저장소의 기존 스타일에 맞춰 파일 수는 조정해도 되지만 **책임 분리**는 유지합니다.

## Survey 데이터 중복 금지

전체 OPIc Background Survey option list는 기존처럼 한 곳에서 유지합니다.

Course는 option 문구를 복제하지 않고 ID만 참조합니다.

```ts
{
  courseId: "course-2",
  activityOptionIds: [
    "leisure-movie",
    "leisure-performance",
    ...
  ]
}
```

STEP1에서 `recommended` badge는 현재 Course preset과 option id를 비교해 계산합니다.

## 단일 selector

STEP1~5가 개별 data file을 직접 조합하지 말고:

```ts
const ctx = resolveTrainingContext(courseId, levelId)
```

를 통해 받도록 합니다.

Resolved context:
- course
- level
- survey
- active level storylines
- active level roleplays
- filtered practice questions

## localStorage

Key:
`oom-training-selection-v1`

```json
{
  "courseId": "course-1",
  "levelId": "intermediate",
  "selectedAt": "ISO_DATE"
}
```

invalid/stale JSON은 selector 화면으로 graceful fallback.

## Routing/Gating

새 router dependency를 추가하지 않습니다.

우선안:
- `training-hub`에서 selection이 없으면 setup UI
- selection이 있으면 기존 STEP cards
- training child view를 selection 없이 열면 hub로 gate
- 선택 완료 뒤 현재 routing 구조 유지

## Story A/B 제거와 variation 보존

제거:
- Story A/B selector
- Story B 선택 상태
- Story B 전용 data/import (migration 후)

유지:
- 질문 유형별 pivot
- keep blocks
- blind/keyword
- TTS
- recording
- question variation

둘을 같은 기능으로 취급하지 말 것.
