# Route / Navigation patch reference

The repository currently has these guide IDs:

```ts
"exam-guide"
"exam-overview"
"exam-apply"
"exam-day"
"exam-results"
"exam-faq"
```

Add `exam-screen` between overview and apply.

## `src/components/layout/Sidebar.tsx`

```ts
export type ViewId =
  | "home"
  | "exam-guide"
  | "exam-overview"
  | "exam-screen" // NEW
  | "exam-apply"
  // ...
```

Add title:

```ts
"exam-screen": "OPIc 수험 가이드 · 시험 화면 · 조작법",
```

Also update:

```ts
survey: "STEP 2. 추천 서베이 익히기",
```

## `src/data/examGuideContent.ts`

```ts
export type ExamGuideSection =
  | "exam-overview"
  | "exam-screen"
  | "exam-apply"
  | "exam-day"
  | "exam-results"
  | "exam-faq";

export const examGuideSections = [
  { id: "exam-overview", ... },
  {
    id: "exam-screen",
    label: "시험 화면 · 조작법",
    shortLabel: "시험 화면",
    description: "인터뷰어, 질문 청취, 녹음 상태와 다음 문제 이동 흐름",
  },
  { id: "exam-apply", ... },
  // ...
];
```

`ExamGuideHub.tsx` and `ExamGuideTabs.tsx` currently map icons by array index.
When inserting a section, update the icon array so indexes stay aligned.
Prefer converting the icon lookup to an object keyed by section id:

```ts
const iconBySection = {
  "exam-overview": GraduationCap,
  "exam-screen": MonitorPlay,
  "exam-apply": UserRoundCheck,
  "exam-day": ShieldCheck,
  "exam-results": FileCheck2,
  "exam-faq": CircleHelp,
} satisfies Record<ExamGuideSection, LucideIcon>;
```

## `src/lib/routes.ts`

```ts
"exam-screen": "/exam-guide/screen/",
```

and:

```ts
if (normalized === "/exam-guide/screen") return "exam-screen";
```

Note: the current routes file should also be checked for `training-setup`.
Do not accidentally drop an existing route while editing the Record<ViewId, string>.

## `src/App.tsx`

Import `ExamGuideScreen`, then add both forms:

```tsx
<Route
  path="/exam-guide/screen"
  element={<ExamGuideScreen onNavigate={onNavigate} onSectionChange={(v) => navigate(viewPathForId[v])} />}
/>
<Route
  path="/exam-guide/screen/"
  element={<ExamGuideScreen onNavigate={onNavigate} onSectionChange={(v) => navigate(viewPathForId[v])} />}
/>
```

## `scripts/generate-static-routes.mjs`

Add `/exam-guide/screen/` metadata and page guide.
Update `/training/survey/` from `서베이 고정` to `추천 서베이 익히기`.
Update `/practice/` copy to mention:

- exam-style question/listen/record state
- optional STT
- editable transcript
- AI feedback
- same-question retry
- OOM timer is a training preset, not an official per-question time limit
