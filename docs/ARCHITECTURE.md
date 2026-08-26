# OOM Architecture

## System Overview

OOM is a browser-only Vite + React application deployed as static files. There is no application server, database, authentication service, or repository-owned secret.

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
│  └─ optional LLM feedback endpoint
└─ TTS
   ├─ static WebM/Opus + peaks
   ├─ Kokoro browser runtime
   └─ Web Speech fallback

Static host
└─ `dist/` from Vite + generated route HTML + generated TTS assets
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
| Training selection | `src/training/TrainingSelectionContext.tsx`, `src/training/storage.ts` | browser-persisted Course × Level selection |
| Course registry | `src/training/courseRegistry.ts` | auto-discovery and `resolveTrainingContext` |
| Level registry | `src/training/levels.ts` | three Level display/difficulty/time definitions |
| Course data | `src/data/training/courses/course-N/` | active survey, storyline, variant, replacement, roleplay, question data |

The detailed route/sidebar/header contract is in [ROUTING.md](ROUTING.md). The Course × Level and STEP behavior is in [TRAINING_SYSTEM.md](TRAINING_SYSTEM.md).

## Runtime Boundaries

### Training

`TrainingSelectionProvider` is mounted around AppShell routes. STEP 1 writes a selection to `oom-training-selection-v1`. STEP 2~6 use `TrainingSelectionGuard`; they never invent a default Course or Level. `resolveTrainingContext(courseId, levelId)` combines one Course bundle with one Level definition and exposes Level-active storylines, roleplays, and questions.

The registry discovers `/src/data/training/courses/*/index.ts` eagerly with `import.meta.glob`. Adding a Course bundle does not require a registry edit, although the current four STEP 4 slot routes and three visible STEP 5 scenario routes impose content-shape checks documented in [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md).

### Practice, Recorder, STT, and AI

`src/components/practice/PracticeView.tsx` owns STEP 6 state and separates the exam phase from review/retry. `Recorder` uses `MediaRecorder`; audio remains an in-memory Blob unless the user has configured an STT endpoint. The editable transcript is the user-confirmed input to AI feedback.

`src/lib/stt.ts` and `src/lib/llm.ts` call user-configured endpoints directly from the browser. Settings are stored in localStorage. Endpoint CORS support is required. No key or recording is stored by an OOM backend because no OOM backend exists.

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

Current production is entirely browser frontend + static hosting:

- fixed training content and fixed TTS stay deployable as static assets;
- recorder audio remains local unless the user explicitly calls a configured endpoint;
- LLM/STT credentials remain browser-local settings.

A future intranet/backend may own authentication, STT, AI feedback, dynamic-text TTS, observability, or GPU inference. That is a boundary change requiring explicit design and secret handling. It does **not** require migrating enumerable fixed-content TTS away from static-first delivery; static assets can continue to be served by an intranet static host or CDN.

## Documentation and Generated Data

- Human-maintained current behavior: README, AGENTS, Architecture, Training System, Content Authoring, TTS Audio Pipeline, Routing, Deployment.
- Generated source inventory: `docs/PROJECT_SNAPSHOT.md` via `npm run docs:generate`.
- Generated TTS inventory and generator input: `artifacts/tts-inventory.json` via `npm run tts:audit`.
- Generator-owned runtime files: `public/generated-tts/audio/**` and `public/generated-tts/tts-manifest.json`.
- Historical evidence: `docs/decisions/**` and dated audit documents.
- Non-canonical implementation inputs: `reference/**`.

Do not duplicate source-owned values in view components or canonical documents when a direct link to the registry/data owner is sufficient.
