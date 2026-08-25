# Integration Plan

Gemini가 giant rewrite를 하지 않도록 단계별로 작업합니다.

---

## Phase 0 — Inspect only

먼저 읽기:

- `src/components/home/HomeView.tsx`
- About 관련 CSS
- Course registry
- `resolveTrainingContext`
- Level metadata/source
- AppShell content wrapper
- current tests

찾아야 할 것:

1. 실제 Course ID type
2. Course list를 얻는 canonical API/export
3. 실제 Level ID type
4. Level display name
5. target duration
6. current About CTA routes
7. HomeView test path

이 단계에서는 코드 수정 금지.

---

## Phase 1 — Data adapter

About 전용 view model을 만듭니다.

가능하면:

`src/components/home/aboutSystemModel.ts`

역할:
- canonical registry → `AboutCourseOption[]`
- canonical level source → `AboutLevelOption[]`
- selected IDs → display model

새 product data source를 만들지 않습니다.

---

## Phase 2 — Interactive explorer component

권장:

```text
src/components/home/
  HomeView.tsx
  AboutSystemExplorer.tsx
  AboutCourseSelector.tsx
  AboutLevelSelector.tsx
  AboutTrainingMap.tsx
  aboutSystemModel.ts
```

하지만 현재 repo component granularity가 더 단순하면
2~3개 파일로 줄여도 됩니다.

컴포넌트를 과도하게 쪼개지 않습니다.

---

## Phase 3 — Styling

현재 OOM design tokens / Tailwind conventions 우선.

샘플 HTML의 hex color를 그대로 복사하지 않습니다.

샘플의:
- hierarchy
- grid
- behavior
- interaction

만 가져옵니다.

About 전용 CSS가 이미 있다면 거기 수정.

---

## Phase 4 — Course overflow

현재 3개에서 보이지 않아도
4개 이상 mock/unit test로 overflow contract 검증.

실제 product course를 fake로 추가하지 않습니다.

Test fixture에서만 추가.

---

## Phase 5 — Test

최소:

- dynamic course count
- select course
- select level
- context changes
- focus mode
- full system
- no global training state write
- 4+ course overflow class
- CTA routes

---

## Phase 6 — Browser QA

1440×900:
page no-scroll 목표.

1920×1080:
no giant empty region.

1024×900:
layout usable.

390×844:
stacked scroll.

---

# Critical preservation boundary

Do not modify:

- TrainingSelection implementation
- Course registry ownership
- resolveTrainingContext behavior
- Course content
- scripts
- variants
- roleplay
- STEP pages
- Practice runtime
- AI provider/settings
- AppShell width
- Sidebar

About consumes existing data.
It does not own or rewrite it.
