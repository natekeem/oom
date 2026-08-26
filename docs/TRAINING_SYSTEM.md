# OOM Training System

## Product Model

OOM training is Course × Level, not a collection of unrelated scripts.

- **Course** answers “which familiar world will the learner reuse?” It owns survey recommendations, four canonical storylines, question variants, replacement guides, roleplay scenarios, and practice questions.
- **Level** answers “how dense and long should the answer be?” It owns difficulty preset, target grade label, target duration, and learning focus.
- **TrainingSelection** is the selected Course + Level. It is configured only in STEP 1 and persisted in browser localStorage.
- **ResolvedTrainingContext** combines one Course bundle with one Level and supplies the active content to STEP 2~6.

The same canonical scene remains recognizable across all three Levels. Level changes vocabulary and answer density; it does not replace the story world.

## Levels

`src/training/levels.ts` is the only display source.

| ID | Display contract | Difficulty | Product focus |
| --- | --- | --- | --- |
| `advanced` | 1구간 · AL · 60~90초 | 5-5 | detailed scene, past experience, comparison/change, prompt-specific variation |
| `intermediate` | 2구간 · IH / IM3 · 45~65초 | 4-4 | place/routine/reason links, one recent experience, reusable blocks |
| `foundation` | 3구간 · IM2 / IM1 · 30~45초 | 3-3 | short stable sentences, who/where/what/why, simple recent experience |

These are OOM practice presets, not score guarantees. Views must call `formatTrainingPreset` or read the Level object instead of hardcoding shortened labels.

## Courses and Scaling

The current registry discovers these ready bundles:

| Current ID | Title | Content world |
| --- | --- | --- |
| `course-1` | Everyday & Getaway | family travel, cafe/rest, tennis, home/neighborhood |
| `course-2` | Culture & City | movies, performances, shopping, city experiences |
| `course-3` | Nature & Weekend | trails, camping, museums/reading, shared home/vacation |

This is a current snapshot, not a three-Course architectural limit. `src/training/courseRegistry.ts` discovers `src/data/training/courses/*/index.ts`, sorts bundles by Course ID, and exposes `discoveredCourses`. A future `course-4` should be added as a complete bundle; general UI and SEO copy must remain Course-neutral.

The current UI has four generic STEP 4 slots and four compatibility route IDs. Each Course therefore supplies exactly four ordered storylines. Current manifests expose three roleplays, and the sidebar maps the actual manifest scenarios to the first three generic STEP 5 routes. Roleplay count is not derived from storyline count.

## Selection, Guards, and Navigation

`TrainingSelectionProvider` loads `oom-training-selection-v1`. STEP 1 calls `select`; reset calls `clear`.

STEP 2~6 render through `TrainingSelectionGuard`:

```text
valid selection
→ resolveTrainingContext(courseId, levelId)
→ selected Course content + selected Level density

missing selection
→ setup explanation
→ STEP 1 action
→ no implicit fallback
```

The sidebar reads the resolved storyline/roleplay `group` labels, so a Course change updates STEP 4 and STEP 5 child names without route edits. Route ownership and compatibility aliases are documented in [ROUTING.md](ROUTING.md).

## STEP 1~6

| STEP | Route | Owner | Contract | Progress |
| --- | --- | --- | --- | --- |
| 1 | `/training/setup/` | `TrainingSetupView` | choose one Level and one discovered Course | 0% |
| 2 | `/training/survey/` | `BackgroundSurveySheet` | full survey-like structure, Course recommendation, rehearsal scoring | 20% |
| 3 | `/training/difficulty/` | `DifficultyGuide` | selected Level preset plus non-mutating difficulty simulation and voice preferences | 40% |
| 4 | `/training/scripts/` | `ScriptHub`, `ScriptDashboardV2`, `ScriptTrainingTabs` | canonical story, prompt variation, answer blueprint | 60% |
| 5 | `/roleplay/` | `RoleplayHub`, `RoleplayViewV2` | CORE/OPTIONAL function menu and Course scenarios | 80% |
| 6 | `/practice/` | `PracticeView` | audio-first question, recording, review, retry | 100% |

The training hub is a neutral six-step overview. It does not silently select a Course or Level. The sticky title/progress header is a training-only AppShell affordance; landing, about, guide, magazine, legal, and settings routes do not show it.

## STEP 4 Mental Model

Each Course owns four canonical storylines. Each storyline has one `baseQuestion`, one `core.anchorScene`, shared `core.facts`, and Level-specific scripts.

Every Level is taught with the same macro order:

```text
OPEN (시작·서론)
→ SCENE (핵심 장면·본론)
→ CLOSE (마무리·결론)
```

These are derived learning sections, not paragraph positions. Micro functions such as ANSWER, SCENE/ACTION/DETAILS, RESULT/FEELING, and EXPANSION live inside them.

`ScriptTrainingTabs` owns three stable tabs:

1. canonical story reading and memory modes;
2. a bilingual question variant with deterministic full-answer comparison;
3. a Level-aware blueprint with KEEP / CHANGE / DROP.

`scriptLearningSections.ts` derives presentation from the canonical text. `scriptVariantTransform.ts` assembles a changed answer from learning sections and explicit replacement blocks. Do not duplicate a full canonical answer in variant data, use substring replacement, or substitute an unrelated story.

Optional expansion stays inside its owning section. Foundation has no optional expansion, Intermediate has at most one sentence, and Advanced has at most two. A prompt may promote an existing optional fact to required; it should introduce at most the minimal new facts declared by that prompt.

## STEP 5 Mental Model

Roleplay has six named functions for recall, not six mandatory sentences. The learner first secures:

- CORE problem or purpose;
- CORE direct question or request;
- CORE next action.

Situation detail, extra information questions, alternatives, and closing are OPTIONAL choices. Each Course owns its scenario situation, prompt, answer structure, learning function, and three Level-specific examples. STEP 5 audio uses the script voice and the selected Level playback rate.

## STEP 6 Mental Model

STEP 6 has two explicit phases.

```text
Exam
question pre-resolved without consuming a listen
→ Play consumes one of 2 listens
→ non-seekable waveform, 1.00×
→ recording + Level-aware timer

Review
local recording replay
→ optional STT
→ editable/confirmed transcript
→ KEEP / FIX / RETRY feedback
→ same-question retry or next question
```

Recorder failure must not silently start an audio recording state. A timer-only path may remain available with clear UI. STT and LLM failure do not invalidate the local recording or prevent manual transcript review.

AI feedback is coaching, not official scoring. Transcript-only analysis must not claim pronunciation accuracy, fluency acoustics, or an OPIc grade.

## Regression Contracts

`src/TrainingCourse.test.tsx` and related tests currently verify:

- three Level definitions and display presets;
- automatic Course discovery and future `course-${number}` IDs;
- four storylines with three-Level continuity per discovered Course;
- manifest roleplay IDs matching the current three scenario records;
- at least 12 practice questions per Course × Level;
- bilingual variants, minimal `newFacts`, blueprints, and Level-owned replacement examples;
- Course 1 Advanced text matching `src/data/scripts.ts` exactly;
- no implicit selection fallback in STEP 2~6;
- progress values and route flow;
- STEP 6 recorder/STT safety and feedback boundaries.

When product shape changes intentionally, update source, tests, and the relevant canonical documentation together.
