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
- Deployment target: GitHub Pages or any static host serving `dist/`

GitHub Pages has no server rewrite. `scripts/generate-static-routes.mjs` runs after Vite build and writes route-specific `dist/**/index.html` files with SEO metadata, canonical URLs, Open Graph tags, and static body content while preserving the built JavaScript bundle. Magazine routes read `src/data/magazine.ts` and render the article title, summary, takeaway, disclaimer, sections, paragraphs, bullets, examples, and notes into the route HTML so `view-source:` contains the learning article body.

## App Shell

`AppShell` owns the shared responsive frame.

| Owner | Responsibility |
| --- | --- |
| `AppShell` | Desktop shell, fixed-height sidebar frame with main-content scrolling, mobile controls, training-only sticky header, progress bar, next-step button |
| `ExpandableSidebar` | Desktop/mobile navigation, guide and training expanders, theme control |
| `Sidebar.tsx` | `ViewId` contract and page-title mapping only |
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
│  ├─ STEP 1 survey
│  ├─ STEP 2 difficulty
│  ├─ STEP 3 script hub
│  │  └─ four script groups
│  ├─ STEP 4 role-play hub
│  │  └─ formula and four scenario groups
│  └─ STEP 5 practice
├─ OOM magazine
├─ legal pages
└─ AI feedback and settings
```

Parent hubs explain the purpose of their child pages. Parent routes should not silently jump straight to a child detail page.

## Feature Boundaries

| Area | Primary components | Contract |
| --- | --- | --- |
| Home | `HomeView` | Product overview and entry points |
| OOM magazine | `MagazineList`, `MagazineDetail` | Static learning articles with local editorial images, summaries, examples, and practice takeaways |
| Candidate guide | `ExamGuideHub`, `ExamGuideOverview`, `ExamGuideDashboard`, `ExamGuideDay`, `ExamGuideFaq`, `ExamGuideTabs` | Informational content, Q&A, and official-source links for time-sensitive rules |
| Training overview | `TrainingHub` | Explains STEP 1-5 and links to each stage |
| Survey | `BackgroundSurveySheet` | Full survey-like list, fixed recommendation view, rehearsal mode and scoring |
| Difficulty | `DifficultyGuide` | 5-5 guidance and target-level speaking strategies |
| Script training | `ScriptHub`, `ScriptDashboardV2`, `ScriptTrainingTabs`, `ScriptTrainingGuide`, `MemoryModeToggle`, `TtsControls` | Choose one story set, then train main story, question variations, and answer blueprint |
| Role-play | `RoleplayHub`, `RoleplayFormulaView`, `RoleplayViewV2` | Formula page links to scenario groups; detailed examples appear only in group pages |
| Practice | `PracticeView`, `PracticeTimer`, `Recorder` | Random question, timer, in-memory audio, text response, feedback request |
| AI settings | `AiSettingsView`, `AiSettingsPanel` | Runtime-only LLM endpoint and request-shape configuration |
| Legal pages | `LegalPageView` | About, privacy, contact, terms, and image credit content for static SEO and AdSense review |

Some older presentation components remain in the source tree for now. They are not route owners. Use `App.tsx` and `docs/ROUTING.md` to determine the active implementation before editing.

## Script Training Contract

`scripts.ts` owns each default 60-90 second reusable scene. `additionalScripts.ts` contains an optional alternative scene for the same group.

The choice is intentional:

1. The learner picks one story set in a group.
2. The selected story remains the main scene.
3. A variation changes the question entry point and selected blocks, not the whole underlying experience.
4. The blueprint explains which opening, detail, or closing block should be kept or replaced.

`ScriptTrainingTabs` owns the `story`, `variants`, and `blueprint` views. Preserve this separation when adding a group or a story alternative.

## Data Ownership

| Data file | Source of truth |
| --- | --- |
| `fixedSurvey.ts` | Survey parts, OOM recommended answer IDs, rehearsal answer key |
| `scripts.ts` | Default script groups and primary stories |
| `additionalScripts.ts` | Optional second story set for each script group |
| `scriptTrainingData.ts` | Default question-type variations and blueprints |
| `additionalScriptTraining.ts` | Variation data for optional stories |
| `scriptReplacementGuides.ts` | Default replacement-block lookup |
| `additionalScriptReplacementGuides.ts` | Replacement-block lookup for optional stories |
| `questions.ts` | Random-practice question pool |
| `magazine.ts` | OOM magazine article copy, learning examples, takeaways, and local editorial-image metadata |
| `legalPages.ts` | About, privacy, contact, terms, and image credit page copy |
| `roleplays.ts` | Six-step formula, reusable phrases, core scenarios |
| `additionalRoleplays.ts` | Additional indoor/rest, sports, and home scenarios |
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

## Testing and Build

- Tests: Vitest + Testing Library
- Route/shell smoke coverage: `App.test.tsx`, `ExamGuide.test.tsx`, `TrainingNavigation.test.tsx`
- Survey behavior coverage: `OomSurvey.test.tsx`
- Script-tab smoke coverage: `ScriptTrainingTabs.test.tsx`
- Production build: TypeScript project build, Vite build, then static SEO route generation
- Pages check: `scripts/verify-pages-artifact.mjs` verifies bundled asset references, required root files, required route files, and absence of redirect-only HTML in generated routes

See `AGENTS.md` for the required validation command sequence.
