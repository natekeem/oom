# OOM Architecture

## System Overview

OOM is a browser-only Vite + React application deployed as static files. There is no OOM application server or repository-owned secret. Optional external Supabase Auth (Google) and PostgreSQL tables (`profiles`, `learning_sessions`, `learning_attempts`) provide identity and learning history; the public product remains usable without login or Supabase configuration.

```text
Browser
├─ React Router + App coordinator
├─ Landing route `/` (independent shell)
├─ AppShell routes
│  ├─ guide / about / magazine / legal / settings
│  └─ training STEP 1~6
├─ Training selection
│  ├─ Course registry
│  ├─ Level registry
│  └─ training context resolver
├─ Practice runtime
│  ├─ Recorder / local audio Blob
│  ├─ optional STT endpoint
│  ├─ optional LLM feedback endpoint
│  └─ optional Supabase learning history
└─ TTS
   ├─ static WebM/Opus + peaks
   ├─ Kokoro browser runtime
   └─ Web Speech fallback

Static host / Supabase
└─ `dist/` from Vite + generated route HTML + generated TTS assets
└─ Supabase Auth + PostgreSQL (profiles, learning_sessions, learning_attempts, learning_preferences)
```

## Frontend Ownership

| Area | Owner | Responsibility |
| --- | --- | --- |
| Entry | `src/main.tsx` | mounts React and `BrowserRouter` |
| Application routes | `src/App.tsx` | route elements, lazy screen loading, global settings, theme, navigation coordination |
| Route mapping | `src/lib/routes.ts` | `ViewId` ↔ canonical trailing-slash path |
| Shared shell | `src/components/layout/AppShell.tsx` | responsive frame, training-only sticky header, progress, next-step action |
| Navigation | `src/components/layout/ExpandableSidebar.tsx` | guide/training hierarchy and Course-aware STEP 4/5 labels |
| View contract | `src/components/layout/Sidebar.tsx` | `ViewId` and page-title resolution |
| Independent landing | `src/landing/LandingPage.tsx` | full-bleed `/` route without AppShell or training state runtime |
| Training selection | `src/training/TrainingSelectionContext.tsx`, `src/training/storage.ts` | browser-persisted Course × Level selection with account synchronization |
| Course registry | `src/training/courseRegistry.ts` | auto-discovery and `resolveTrainingContext` |
| Level registry | `src/training/levels.ts` | three Level display/difficulty/time definitions |
| Course data | `src/data/training/courses/course-N/` | active survey, storyline, variant, replacement, roleplay, question data |
| Learning history | `src/features/history/` | Supabase data-access layer for sessions/attempts |
| Learning preferences | `src/features/preferences/` | Supabase data-access layer for account-level target level/course preferences |

The detailed route/sidebar/header contract is in [ROUTING.md](ROUTING.md). The Course × Level and STEP behavior is in [TRAINING_SYSTEM.md](TRAINING_SYSTEM.md).

## Runtime Boundaries

### Training

`TrainingSelectionProvider` is mounted around AppShell routes. For anonymous users, selections persist in `oom-training-selection-v1` in localStorage. For authenticated users, existing account preferences in Supabase `learning_preferences` are authoritatively restored on login, while new/updated selections persist to Supabase (`target_level`, `course_id`) and locally. Anonymous local state is never silently uploaded on login until the user explicitly saves preferences. Logout isolates accounts by clearing in-memory preferences. STEP 1 writes a selection. STEP 2~6 use `TrainingSelectionGuard`; they never invent a default Course or Level. `resolveTrainingContext(courseId, levelId)` combines one Course bundle with one Level definition and exposes Level-active storylines, roleplays, and questions.

The registry discovers `/src/data/training/courses/*/index.ts` eagerly with `import.meta.glob`. Adding a Course bundle does not require a registry edit, although the current four STEP 4 slot routes and three visible STEP 5 scenario routes impose content-shape checks documented in [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md).

### Practice, Recorder, STT, and AI

STEP 6 is a routed product area: `/practice/` mounts only the hub, `/practice/quick/` mounts the existing one-question exam → review/retry engine without a mandatory self-introduction warm-up, and `/practice/mock/` mounts the Mock engine. All three share the canonical selection guard and 100% progress contract. `FullMockPracticeView.tsx` separates orientation state (Survey → Self Assessment → Pre-Test) from exam state (Self Introduction warm-up → Session 1 → adjustment → Session 2 → complete) and keeps result summary, answer review, and training report as sibling post-exam views over the same in-memory attempts, while `mockSessionPlanner.ts` builds the fixed seeded plan independently from React. `Recorder` uses `MediaRecorder`; audio remains an in-memory Blob unless the user explicitly sends one selected post-exam answer to an STT endpoint. The editable transcript is the user-confirmed input to AI feedback. Learning sessions (`learning_sessions`, `learning_attempts`) are persisted silently to Supabase if the user is authenticated.

Full Mock stores Survey selection, Mock initial Level, and 12~15 attempts only in current React memory. It does not persist Blobs or sessions. Survey eligibility follows explicit `TrainingStoryline.surveyOptionIds` → `TrainingPracticeQuestion.storylineId` relationships and never keyword matching; preferred pools fall back only within the same Course when needed to preserve session size. Its 40-minute main timer and question count exclude the 20~30 second Self Introduction warm-up, and its difficulty adjustment resolves another Level context for Session 2 prompts without changing the saved `TrainingSelection`. STT/LLM calls are prohibited during the exam and remain manual, one selected answer at a time, after completion. `mockReport.ts` derives deterministic process metrics from completion, target-duration fit, recording coverage, answer time, and available review evidence; it does not produce a 0–100 diagnostic score or estimated OPIc grade. The user can download a self-contained HTML snapshot locally without sending report data to an OOM server.

`src/lib/stt.ts` and `src/lib/llm.ts` call user-configured endpoints directly from the browser. Settings are stored in localStorage. Endpoint CORS support is required. No STT/LLM key or recording is sent to or stored in Supabase in Phase 1.

Text transcripts can support structure, relevance, and language coaching. They do not contain sufficient acoustic evidence for pronunciation grading, and OOM must not claim otherwise.

### TTS

`src/lib/tts/TtsManager.ts` resolves generated static audio first. A static hit uses the production manifest, WebM/Opus audio, and precomputed peaks without loading the Kokoro worker or duplicating the file in IndexedDB. A miss or media error continues through the lazy browser-local Kokoro q8/WASM path and finally system Web Speech.

STEP 4 uses a seekable WaveSurfer player and applies Level speed as client playback rate. STEP 6 stays non-seekable, fixed at 1.00×, and keeps the 0/2 listen contract. See [TTS_AUDIO_PIPELINE.md](TTS_AUDIO_PIPELINE.md).

## Build and Static Hosting

`npm run build` executes:

```text
tsc -b
→ vite build
→ node scripts/generate-static-routes.mjs
```

Vite copies `public/` into `dist/`, including `CNAME`, robots, ads, 404 fallback, and `generated-tts/`. The post-build route generator reads the built root HTML and writes canonical route-specific `dist/**/index.html` files with metadata and crawler-visible content. Source redirect placeholders are not required.

`scripts/verify-pages-artifact.mjs` validates bundle references, required files, canonical URLs, trailing slashes, route body content, trust signals, and the absence of redirect-only generated pages. Deployment details are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Current and Future Service Boundary

The frontend remains browser code + static hosting, with optional external Supabase identity:

- fixed training content and fixed TTS stay deployable as static assets;
- recorder audio remains local unless the user explicitly calls a configured endpoint;
- LLM/STT credentials remain browser-local settings.

Supabase currently owns authentication and profiles only. A future backend may own STT, AI feedback, dynamic-text TTS, observability, or GPU inference. That is a boundary change requiring explicit design and secret handling. It does **not** require migrating enumerable fixed-content TTS away from static-first delivery; static assets can continue to be served by an intranet static host or CDN.

## Documentation and Generated Data

- Human-maintained current behavior: README, AGENTS, Architecture, Training System, Content Authoring, TTS Audio Pipeline, Routing, Deployment.
- Generated source inventory: `docs/PROJECT_SNAPSHOT.md` via `npm run docs:generate`.
- Generated TTS inventory and generator input: `artifacts/tts-inventory.json` via `npm run tts:audit`.
- Generator-owned runtime files: `public/generated-tts/audio/**` and `public/generated-tts/tts-manifest.json`.
- Historical evidence: `docs/decisions/**` and dated audit documents.
- Non-canonical implementation inputs: `reference/**`.

Do not duplicate source-owned values in view components or canonical documents when a direct link to the registry/data owner is sufficient.

## Phase 1 identity boundary

AuthProvider wraps the router application from main.tsx. A single typed client in src/lib/supabase.ts persists sessions and automatically completes browser PKCE callbacks. Auth event callbacks are synchronous; profile reads occur separately and stale requests are discarded. TrainingSelection remains browser-owned and independent of identity.

OOM → Supabase Auth → Google → Supabase → /auth/callback/ → session → own profile. Internal return paths use a canonical route allowlist. Missing public configuration leaves auth unconfigured without preventing public rendering. My Page and callback are noindex and excluded from ads and sitemap.

profiles.plan is display-only, constrained to free/pro; clients can update only display_name/avatar_url under own-row RLS. Database triggers create free profiles and maintain updated_at. Future subscriptions/payment state must become server-authoritative; no client plan checks gate current functionality.

Current advanced-user mode: browser → user-configured STT/LLM endpoint. Future managed mode: browser → Supabase Edge Function → auth/usage/plan checks → Gemini/OpenAI → persistence. No managed AI, storage, billing, history, or extra providers are implemented. See [setup](SUPABASE_SETUP.md).
