# GEMINI IMPLEMENTATION PROMPT
## OOM `/about/` Interactive System Explorer

You are implementing an already-decided UI. Do not redesign it.

This task is intentionally detailed because product/design decisions have already been made outside the coding agent.

Use the attached implementation pack as source of truth.

READ IN THIS ORDER:

1. `README_START_HERE.md`
2. `docs/PRODUCT_DECISIONS.md`
3. `docs/ABOUT_SYSTEM_EXPLORER_PRD.md`
4. `docs/INTERACTION_STATE_MACHINE.md`
5. `docs/FUTURE_COURSE_SCALING.md`
6. `docs/INTEGRATION_PLAN.md`
7. `docs/QA_ACCEPTANCE.md`
8. `reference/final-system-explorer.html`
9. `reference-react/`

==================================================
A. BASELINE
==================================================

Before editing:

```bash
git status
git rev-parse HEAD
git rev-parse origin/main
```

If working tree is not clean:
report it before editing.

Do not reset user changes.

==================================================
B. INSPECT ACTUAL SOURCE FIRST
==================================================

Before writing code inspect:

- current `HomeView.tsx`
- current About/Home CSS
- Course registry
- `resolveTrainingContext`
- level metadata
- Training level types
- existing HomeView tests
- AppShell content width
- CTA route definitions

IMPORTANT:

Do NOT guess import paths or APIs.

Do NOT invent:

- `getCourses()`
- `trainingLevels`
- `courseRegistry`

unless those APIs actually exist.

Use the repository's real exports.

==================================================
C. SCOPE
==================================================

ONLY redesign `/about/` middle content into the Interactive System Explorer.

KEEP:

- header/brand style unless integration requires minor spacing
- AppShell
- Sidebar
- global content width
- footer
- landing `/`
- all training pages
- all runtime behavior

Do not touch unrelated code.

==================================================
D. FINAL UX
==================================================

Desktop:

LEFT:
Course selector
Level selector
"전체 시스템 보기"

RIGHT:
OOM Training System map

Course/Level changes update:

- Training Context
- related highlighted modules
- target time
- current flow summary

This is a DEMO.

It must NOT mutate real training selection.

==================================================
E. COURSE DATA
==================================================

Course options MUST come from the actual extensible Course registry.

Do not hardcode 3 JSX options.

Current course count is expected to be 3, but future count will grow.

Metric:

`${actualCourseCount} COURSES`

==================================================
F. FUTURE COURSE SCALABILITY
==================================================

1–3 Courses:
show all.

4+ Courses:
Course choices area becomes internally vertically scrollable.

The PAGE should not grow just because more Courses are added.

Use:

- bounded choices region
- `overflow-y: auto`
- `overscroll-behavior: contain`
- stable scrollbar if appropriate

Do not show only "representative" Courses.

All current Courses must be selectable.

When selected option is outside viewport:
scroll it into the Course chooser using nearest behavior.

Do not scroll the whole page.

==================================================
G. LEVEL DATA
==================================================

Use current level source-of-truth.

Do not hardcode target durations in a second data model.

Render current:

Foundation
Intermediate
Advanced

with the project's actual user-facing section labels and target durations.

==================================================
H. LOCAL STATE ONLY
==================================================

Use local component state:

- selectedCourseId
- selectedLevelId
- focusMode

Do NOT call training selection setters.

Do NOT write localStorage.

Do NOT change URL query params for demo selection.

Do NOT persist About selections.

==================================================
I. FOCUS MODES
==================================================

`course`

Highlight:
- Survey
- Story Pool
- STEP4
- Training Context

`level`

Highlight:
- Difficulty
- Answer Density
- STEP4/Practice where appropriate
- AI Coach

`all`

Highlight:
- entire path
- all 6 steps
- AI

Do not change selected values when switching focus mode.

==================================================
J. COURSE SELECTION
==================================================

When Course option changes:

- update selectedCourseId
- focusMode = course
- update Training Context course name
- pulse related modules
- update summary

Use existing Course display metadata.

Do not invent long Course descriptions if repository does not have them.

==================================================
K. LEVEL SELECTION
==================================================

When Level changes:

- update selectedLevelId
- focusMode = level
- update display label
- update target duration
- highlight difficulty/density/practice/AI
- update summary

==================================================
L. RIGHT SYSTEM MAP
==================================================

Keep it compact.

Required modules:

Course side:
- STEP 2 추천 서베이
- Story Pool 핵심 장면

Level side:
- STEP 3 난이도
- Answer Density

Merged/right:
- STEP 4 스크립트 · 질문 변형
- STEP 6 실전 연습
- AI Coach

Training Context displayed prominently at top.

Avoid adding extra modules.

==================================================
M. SIX STEP RAIL
==================================================

Show compact 1–6 rail.

Use existing user-facing step labels if available.

Do not duplicate app routing or create clickable step navigation unless already natural.

This rail is explanatory.

==================================================
N. AI COACH
==================================================

Show:

KEEP
FIX
RETRY

Helper:
AI feedback passes one correction goal into the retry.

Keep disclaimer somewhere visible but compact:

`AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.`

==================================================
O. HEADER COPY
==================================================

Preferred:

H1:
`오픽온미란?`

Support:

`Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.`

If existing copy is already better after recent user edits:
preserve product meaning and report any deviation.

Do not make it inspirational/marketing-heavy.

==================================================
P. METRICS
==================================================

Display:

N COURSES
3 LEVELS
6 STEPS
AI COACH

N must be dynamic.

Keep metric row compact.
Do not turn into large KPI dashboard cards.

==================================================
Q. STYLING
==================================================

The provided HTML is a composition reference.

Do NOT copy its raw hex palette if current OOM tokens already exist.

Use existing:
- theme variables
- Tailwind colors
- radius
- border
- dark/light mode conventions

The final result must feel native to OOM.

==================================================
R. INTERACTIONS
==================================================

Click/tap is source of truth.

Hover is optional enhancement.

Do not create complicated transient hover state if it makes implementation fragile.

Preferred animation:

- border/tint
- connector clarity
- small 2px movement
- brief pulse

No:
- 3D tilt
- large scale
- layout jump
- accordion expansion

==================================================
S. ACCESSIBILITY
==================================================

Course and Level choices must be keyboard operable.

Use proper native controls or correct aria selection semantics.

Selected state must not be color-only.

Visible focus required.

Right-side explanatory modules should not be fake buttons.

Reduced-motion:
disable pulse/translate animation.

==================================================
T. ONE-SCREEN DESKTOP
==================================================

At 1440×900:

Aim to fit:
- Header
- Metrics
- Selectors
- System map
- Summary
- CTA

in first viewport.

Do not shrink typography until unreadable.

Do not change global content max-width.

If exact no-scroll is impossible because of the existing global header/footer dimensions:
minimize overflow and report exact reason.

Do not use `overflow:hidden` on the entire app to fake success.

==================================================
U. MOBILE
==================================================

390 / 430:
normal stacked page scroll.

Order:

Header
Metrics
Course
Level
System
Summary
CTA

Course list can expand naturally on mobile if that is more usable than an internal tiny scroll.

Do not force desktop internal-scroll behavior on mobile.

==================================================
V. TESTS
==================================================

Add/update tests for:

1. Course count comes from actual registry.
2. Course options are not hardcoded to 3.
3. Course selection updates context.
4. Level selection updates context/time.
5. Course focus highlights correct module contract.
6. Level focus highlights correct module contract.
7. Full system preserves selected values.
8. No TrainingSelection mutation.
9. No localStorage write.
10. 4+ course fixture gets overflow class/container.
11. CTA routes remain correct.
12. AI disclaimer exists.
13. No score guarantee copy.
14. Mobile layout class/contract.
15. Reduced-motion class/contract if testable.

Do not make brittle tests that assert implementation-only class order.

==================================================
W. VISUAL QA
==================================================

Required:

1440×900
1920×1080 if environment supports it
1024×900
390×844
430×932

Desktop interactions:
- select all Courses
- select all Levels
- full system
- 4+ Course overflow via test/dev fixture if possible

Check:
- no horizontal overflow
- no page jump
- Course chooser internal scroll only
- context text does not overflow
- long future Course name tolerable
- focus visible
- dark/light mode if About supports both

==================================================
X. VALIDATION
==================================================

Run actual repository scripts:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
git diff --check
```

Only run scripts that actually exist.

If a listed script is absent:
report it.

Do not silently skip failed commands.

==================================================
Y. DO NOT CHANGE
==================================================

Do NOT change:

- landing `/`
- Course content
- Course registry ownership
- resolveTrainingContext behavior
- TrainingSelection
- survey behavior
- STEP1
- STEP2
- STEP3
- STEP4
- STEP5
- STEP6
- roleplay
- practice runtime
- Recorder
- STT
- AI provider/settings
- Magazine
- Sidebar
- global content width
- static hosting architecture

==================================================
Z. COMPLETION REPORT
==================================================

Return:

1. baseline SHA
2. files changed
3. actual Course registry API used
4. actual Level source used
5. component structure
6. local state structure
7. Course focus behavior
8. Level focus behavior
9. Full system behavior
10. future Course overflow implementation
11. proof About does not mutate TrainingSelection
12. desktop 1440×900 result
13. mobile result
14. tests added/updated
15. validation results
16. remaining issues
17. intentionally unchanged areas

DO NOT COMMIT OR PUSH unless the user explicitly asks.
