# Architecture

## Runtime Model

OOM is a browser-only React application built by Vite. It has no server route, database, authentication service, or bundled secret.

- Entry point: `src/main.tsx`
- Application coordinator: `src/App.tsx`
- Route matching: `BrowserRouter` and `Routes` in `src/App.tsx`
- Shell navigation state: derived `activeView` with the `ViewId` union from `src/components/layout/Sidebar.tsx`
- Visual transitions: `AnimatePresence` and `motion.div` in `App.tsx`
- Persistent browser state:
  - `oom-theme` for dark mode
  - `oom-llm-settings` for the user-entered LLM configuration
  - `oom-training-selection-v1` for the selected Course and Level
- Deployment target: GitHub Pages or any static host serving `dist/`

GitHub Pages has no server rewrite. `scripts/generate-static-routes.mjs` runs after Vite build and writes route-specific `dist/**/index.html` files with SEO metadata, canonical URLs, Open Graph tags, and static body content while preserving the built JavaScript bundle. Magazine routes read `src/data/magazine.ts` and render the article title, summary, takeaway, disclaimer, sections, paragraphs, bullets, examples, and notes into the route HTML so `view-source:` contains the learning article body.

## App Shell

`AppShell` owns the shared responsive frame.

| Owner | Responsibility |
| --- | --- |
| `AppShell` | Desktop shell, fixed-height sidebar frame with main-content scrolling, mobile controls, training-only sticky header, progress bar, next-step button |
| `ExpandableSidebar` | Desktop/mobile navigation, guide and training expanders, theme control |
| `Sidebar.tsx` | `ViewId` contract and dynamic page-title mapping (`getViewTitle`) |
| `Toast` | Shared completion, warning, and error feedback |

The sticky header is intentionally limited to `training-hub` and the STEP 1-5 descendants. Home, the OPIc candidate guide, magazine, legal pages, and AI settings use the content frame without a training progress bar. On mobile, those non-training pages keep compact floating menu/theme controls so navigation is never lost.

## Navigation Ownership

`App.tsx` is the only place that selects a top-level screen from `activeView`.

```text
Home
├─ OPIc candidate guide
│  ├─ overview and grades
│  ├─ application and fees
│  ├─ exam day
│  └─ results and certificates
├─ OPIc training hub
│  ├─ STEP 1 target level & course setup
│  ├─ STEP 2 survey
│  ├─ STEP 3 difficulty
│  ├─ STEP 4 script hub
│  │  └─ four generic script slot views
│  ├─ STEP 5 role-play hub
│  │  └─ four scenario slot views
│  └─ STEP 6 practice
├─ OOM magazine
├─ legal pages
└─ AI feedback and settings
```

Parent hubs explain the purpose of their child pages. Parent routes should not silently jump straight to a child detail page.

## Feature Boundaries

| Area | Primary components | Contract |
| --- | --- | --- |
| Home | `HomeView` | Product overview and entry points |
| OOM magazine | `MagazineList`, `MagazineDetail` | Static learning articles with local editorial images, author/reviewer identity, honest publish/modified dates, official sources, structured data, examples, and practice takeaways |
| Candidate guide | `ExamGuideHub`, `ExamGuideOverview`, `ExamGuideDashboard`, `ExamGuideDay`, `ExamGuideFaq`, `ExamGuideTabs` | Informational content, Q&A, and official-source links for time-sensitive rules |
| Training overview | `TrainingHub`, `TrainingSetupView` | STEP 1: Target level and course selection + 6 STEP overview roadmap |
| Survey | `BackgroundSurveySheet` | STEP 2: Full survey-like list, course-specific recommendation view, rehearsal mode and scoring |
| Difficulty | `DifficultyGuide` | STEP 3: Level-specific difficulty presets (5-5, 4-4, 3-3) and goal guidance |
| Script training | `ScriptHub`, `ScriptDashboardV2`, `ScriptTrainingTabs`, `ScriptTrainingGuide`, `MemoryModeToggle`, `TtsControls` | STEP 4: Canonical storyline per group, question variations, and answer blueprint |
| Role-play | `RoleplayHub`, `RoleplayViewV2` | STEP 5: Integrated formula, flow, phrases, and course-specific scenarios |
| Practice | `PracticeView`, `PracticeTimer`, `Recorder` | STEP 6: Random question filtered by Course × Level, timer, in-memory audio, text response, feedback request |
| AI settings | `AiSettingsView`, `AiSettingsPanel` | Runtime-only LLM endpoint and request-shape configuration |
| Legal pages | `LegalPageView` | About, privacy, contact, terms, editorial policy, and image credit content for public trust and static SEO |

Some older presentation components remain in the source tree for now. They are not route owners. Use `App.tsx` and `docs/ROUTING.md` to determine the active implementation before editing.

## Training Course Architecture

OOM uses a structured Course × Level data model:

1. **Course**: Defines the context (survey recommendations, core storylines, role-play scenarios, practice questions, question variations, replacement guides). Discovered automatically via `import.meta.glob` in `src/training/courseRegistry.ts`.
2. **Level**: Defines the target difficulty (`advanced` 5-5 / AL, `intermediate` 4-4 / IH, `foundation` 3-3 / IM3) and answer density. The same core scene is adapted for each level.
3. **Training Selection Context**: Provided by `TrainingSelectionProvider` (`src/training/TrainingSelectionContext.tsx`). The user's selection is persisted in `localStorage` via `src/training/storage.ts`.
4. **Generic Slot Routing**: Script and Roleplay routes (`slotIndex` 0, 1, 2, 3) resolve dynamically against `resolved.storylines[slotIndex]` and `resolved.roleplays[slotIndex]`, ensuring new courses (e.g. Course 4) work without routing edits.

## Script Training Contract

Each script group has exactly **one canonical storyline** per course. The legacy Story A/B choice UI has been completely removed.

The canonical storyline provides:
1. The 60-90 second primary story, adapted for the selected level.
2. Question-type variations that remain connected to the same core scene.
3. A blueprint explaining which opening, detail, or closing block should be kept or replaced.

`ScriptTrainingTabs` owns the `story`, `variants`, and `blueprint` views.

## Data Ownership

| Data file | Source of truth |
| --- | --- |
| `src/data/training/courses/course-N/*` | Course-specific data: manifest, survey recommendations, storylines, roleplays, questions, variants, replacementGuides |
| `src/training/*` | Training types, levels, selection context, storage, and course registry |
| `fixedSurvey.ts` | Survey parts, legacy OOM recommendations, rehearsal answer key |
| `scripts.ts` | Course 1 advanced reference |
| `scriptTrainingData.ts` | Legacy Course 1 variation and blueprint reference |
| `scriptReplacementGuides.ts` | Legacy Course 1 replacement-block lookup reference |
| `questions.ts` | Practice question pool fallback |
| `magazine.ts` | OOM magazine article copy, author/reviewer metadata, publish/modified dates, official sources, learning examples, takeaways, and local editorial-image metadata |
| `legalPages.ts` | About, privacy, contact, terms, editorial policy, and image credit page copy |
| `roleplays.ts` | Six-step formula, reusable phrases, core scenarios |
| `examFaq.ts` | Candidate-guide Q&A categories and answers |
| `examGuideContent.ts` | Candidate-guide information, official links, source-note copy |

Do not duplicate these values in view components. Add to the relevant data owner instead.

## Browser and LLM Boundaries

| Capability | Module | Behavior |
| --- | --- | --- |
| TTS | `lib/speech.ts` | Uses Web Speech API, prefers `en-US`, then `en-GB`, then other English voices |
| Recording | `lib/recorder.ts` and `Recorder` | Uses `MediaRecorder` and `getUserMedia`; audio remains in browser memory |
| LLM | `lib/llm.ts` | Calls the configured endpoint directly from the browser |

`callInternalLlm` supports OpenAI-compatible, generic messages, and custom JSON-body modes. The app can send Bearer, `x-api-key`, or no authentication header. Endpoint CORS support is required.

Never put a real API key in source, fixtures, documentation examples, or commits.

The AdSense loader is route-aware. Content routes may load the publisher script, while practice, AI settings, magazine index, and legal/trust routes do not load it. `scripts/generate-static-routes.mjs` applies the same rule to crawler-visible HTML.

## Testing and Build

- Tests: Vitest + Testing Library
- Route/shell smoke coverage: `App.test.tsx`, `ExamGuide.test.tsx`, `TrainingNavigation.test.tsx`
- Training course & regression coverage: `TrainingCourse.test.tsx` (14 comprehensive tests covering 12 criteria)
- Survey behavior coverage: `OomSurvey.test.tsx`
- Script-tab smoke coverage: `ScriptTrainingTabs.test.tsx`
- Production build: TypeScript project build, Vite build, then static SEO route generation
- Pages check: `scripts/verify-pages-artifact.mjs` verifies bundled asset references, required root files, required route files, and absence of redirect-only HTML in generated routes

See `AGENTS.md` for the required validation command sequence.
