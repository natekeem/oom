# OOM Architecture

## System Overview

OOM is a browser-only Vite + React application deployed as static files. There is no OOM application server or repository-owned secret. Optional external Supabase Auth (Google) and PostgreSQL tables (`profiles`, `learning_sessions`, `learning_attempts`, `learning_preferences`, `learning_activity_events`) provide identity and learning history; the public product remains usable without login or Supabase configuration.

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
└─ Supabase Auth + PostgreSQL (profiles, learning_sessions, learning_attempts, learning_preferences, learning_activity_events)
```

## Frontend Ownership

| Area | Owner | Responsibility |
| --- | --- | --- |
| Entry | `src/main.tsx` | mounts React and `BrowserRouter` |
| Application routes | `src/App.tsx` | route elements, lazy screen loading, global settings, theme, navigation coordination |
| Route mapping | `src/lib/routes.ts` | `ViewId` ↔ canonical trailing-slash path |
| Shared shell | `src/components/layout/AppShell.tsx` | responsive frame, viewport-height sticky sidebar layout, training-only sticky header, progress, next-step action |
| Layout config & container | `src/components/layout/layoutConfig.ts`, `src/components/layout/PageContainer.tsx` | semantic PageWidth (`narrow`, `default`, `wide`, `immersive`) and FooterVariant (`public`, `none`) |
| Navigation | `src/components/layout/ExpandableSidebar.tsx` | guide/training hierarchy, Course-aware labels, desktop collapse/expand (`oom-sidebar-collapsed-v1`), independent nav scrolling, pinned bottom utilities |
| Service footer | `src/components/layout/ServiceFooter.tsx` | compact public-only footer (`nav[aria-label="서비스 정보"]`), natural flex flow placement (`mt-auto`) |
| View contract | `src/components/layout/Sidebar.tsx` | `ViewId` and page-title resolution |
| Independent landing | `src/landing/LandingPage.tsx` | full-bleed `/` route without AppShell or training state runtime |
| Training selection | `src/training/TrainingSelectionContext.tsx`, `src/training/storage.ts` | browser-persisted Course × Level selection with account synchronization |
| Course registry | `src/training/courseRegistry.ts` | auto-discovery and `resolveTrainingContext` |
| Level registry | `src/training/levels.ts` | three Level display/difficulty/time definitions |
| Course data | `src/data/training/courses/course-N/` | active survey, storyline, variant, replacement, roleplay, question data |
| Learning history | `src/features/history/` | Supabase data-access layer for sessions/attempts |
| Learning preferences | `src/features/preferences/` | Supabase data-access layer for account-level target level/course preferences |
| Admin Console | `src/features/admin/` | Admin access provider, route guard, layout, dashboard, users, learning operations, and audit views |

The detailed route/sidebar/header contract is in [ROUTING.md](ROUTING.md). The Course × Level and STEP behavior is in [TRAINING_SYSTEM.md](TRAINING_SYSTEM.md).


## Runtime Boundaries

### Training

`TrainingSelectionProvider` is mounted around AppShell routes. For anonymous users, selections persist in `oom-training-selection-v1` in localStorage. For authenticated users, existing account preferences in Supabase `learning_preferences` are authoritatively restored on login, while new/updated selections persist to Supabase (`target_level`, `course_id`) and locally. Anonymous local state is never silently uploaded on login until the user explicitly saves preferences. Logout isolates accounts by clearing in-memory preferences. STEP 1 writes a selection. STEP 2~6 use `TrainingSelectionGuard`; they never invent a default Course or Level. `resolveTrainingContext(courseId, levelId)` combines one Course bundle with one Level definition and exposes Level-active storylines, roleplays, and questions.

The registry discovers `/src/data/training/courses/*/index.ts` eagerly with `import.meta.glob`. Adding a Course bundle does not require a registry edit, although the current four STEP 4 slot routes and three visible STEP 5 scenario routes impose content-shape checks documented in [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md).

### Practice, Recorder, STT, and AI

STEP 6 is a routed product area: `/practice/` mounts only the hub, `/practice/quick/` mounts the existing one-question exam → review/retry engine without a mandatory self-introduction warm-up, and `/practice/mock/` mounts the Mock engine. All three share the canonical selection guard and 100% progress contract. `FullMockPracticeView.tsx` separates orientation state (Survey → Self Assessment → Pre-Test) from exam state (Self Introduction warm-up → Session 1 → adjustment → Session 2 → complete) and keeps result summary, answer review, and training report as sibling post-exam views over the same in-memory attempts, while `mockSessionPlanner.ts` builds the fixed seeded plan independently from React. `Recorder` uses `MediaRecorder`; audio remains an in-memory Blob unless the user explicitly sends one selected post-exam answer to an STT endpoint. The editable transcript is the user-confirmed input to AI feedback. Learning sessions (`learning_sessions`, `learning_attempts`) are persisted silently to Supabase if the user is authenticated.

Full Mock stores Survey selection, Mock initial Level, and 12~15 attempts only in current React memory. It does not persist Blobs; authenticated session summaries and attempts use the existing history repository. Survey eligibility follows explicit `TrainingStoryline.surveyOptionIds` → `TrainingPracticeQuestion.storylineId` relationships and never keyword matching; preferred pools fall back only within the same Course when needed to preserve session size. Its 40-minute main timer and question count exclude the 20~30 second Self Introduction warm-up, and its difficulty adjustment resolves another Level context for Session 2 prompts without changing the saved `TrainingSelection`. STT/LLM calls are prohibited during the exam and remain manual, one selected answer at a time, after completion. `mockReport.ts` derives deterministic process metrics from completion, target-duration fit, recording coverage, answer time, and available review evidence; it does not produce a 0–100 diagnostic score or estimated OPIc grade. The user can download a self-contained HTML snapshot locally without sending report data to an OOM server.

`src/lib/stt.ts` and `src/lib/llm.ts` call user-configured endpoints directly from the browser. Settings are stored in localStorage. Endpoint CORS support is required. No STT/LLM key, transcript or recording is sent to or stored in Supabase.

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

Supabase currently owns authentication, profiles, practice history, learning preferences and explicit study activity. Managed text feedback is now owned by the ai-api Supabase Edge Function with server quotas, Gemini and usage persistence; runtime defaults OFF. A future backend may own STT, dynamic-text TTS or GPU inference. That is a boundary change requiring explicit design and secret handling. It does **not** require migrating enumerable fixed-content TTS away from static-first delivery; static assets can continue to be served by an intranet static host or CDN.

## Documentation and Generated Data

- Human-maintained current behavior: README, AGENTS, Architecture, Training System, Content Authoring, TTS Audio Pipeline, Routing, Deployment.
- Generated source inventory: `docs/PROJECT_SNAPSHOT.md` via `npm run docs:generate`.
- Generated TTS inventory and generator input: `artifacts/tts-inventory.json` via `npm run tts:audit`.
- Generator-owned runtime files: `public/generated-tts/audio/**` and `public/generated-tts/tts-manifest.json`.
- Historical evidence: `docs/decisions/**` and dated audit documents.
- Non-canonical implementation inputs: `reference/**`.

Do not duplicate source-owned values in view components or canonical documents when a direct link to the registry/data owner is sufficient.

## Phase 1 identity boundary

AuthProvider wraps the router application from main.tsx. A single typed client in src/lib/supabase.ts persists sessions and automatically completes browser PKCE callbacks. Auth event callbacks are synchronous; profile reads occur separately and stale requests are discarded. TrainingSelection is browser-owned with explicit account preference synchronization.

OOM → Supabase Auth → Google → Supabase → /auth/callback/ → session → own profile. Internal return paths use a canonical route allowlist. Missing public configuration leaves auth unconfigured without preventing public rendering. My Page and callback are noindex and excluded from ads and sitemap.

profiles.plan is display-only, constrained to free/pro; clients can update only display_name/avatar_url under own-row RLS. Database triggers create free profiles and maintain updated_at. Future subscriptions/payment state must become server-authoritative; no client plan checks gate current functionality.

Current advanced-user mode: browser → user-configured STT/LLM endpoint. Managed mode: browser → ai-api → verified auth → FREE entitlement → atomic quota reservation → Gemini → validated feedback + usage persistence. No managed STT, audio storage, billing or paid subscription entitlement is implemented. See [setup](SUPABASE_SETUP.md).

## Phase 2.8 activity boundary

src/features/activity/ owns learning_activity_events: UUID, owning user, activity type, Course/Level/content IDs and server timestamps. No survey values, script text, transcripts, audio, score or duration are stored. Labels resolve from the static Course registry.

STEP 2 exact recommendation grading records survey_completed; STEP 4 storyline completion records universal_script_completed; STEP 5 scenario completion records roleplay_completed. These are self-reported study completions, not proof of speaking performance. Header Next remains navigation only. A ref lock prevents overlapping inserts, and the same UUID is reused after uncertain failures. Reopening content permits a new meaningful completion. Anonymous completion stays local and never auto-uploads after login.

My Page separates recent study activities from practice sessions. User-keyed sections and request cleanup prevent account-switch flashes and stale responses. Activity failures do not hide profile/preferences or block training. learning_preferences remains the settings model; learning_sessions / learning_attempts remain the practice model.

ServiceFooter owns shared low-weight navigation, with a landing color variant and Full Mock exclusion. PricingPage explains current FREE and planned PRO without activating payments, subscriptions or ad-free behavior. Managed AI availability is controlled independently by the server kill switch.

## Phase 2.9 Layout System & Shell Architecture

AppShell defines a flex layout with viewport-height sticky desktop sidebar (`min-h-[100dvh]`):
- Desktop LNB: `sticky top-0 h-[100dvh] flex flex-col shrink-0` with independent navigation scrolling (`flex-1 min-h-0 overflow-y-auto`) and pinned bottom utilities (My Page, theme mode, collapse toggle, 오늘의 한 문장).
- Desktop collapse/expand: expanded 240px (`lg:w-60`), collapsed 68px (`lg:w-[68px]`), persisted in localStorage under `oom-sidebar-collapsed-v1`. Collapsed mode presents recognizable brand icon, icon-only top-level nav buttons with accessible tooltips and active state, and compact bottom utilities. Mobile drawer navigation is unaffected (remains modal dialog `w-72 max-w-[85vw]`).
- PageContainer semantic widths: `narrow` (`max-w-4xl`), `default` (`max-w-7xl`), `wide` (`max-w-[1440px]`), `immersive` (`w-full max-w-none`). Eliminates arbitrary per-page max-width and padding combinations.
- Footer behavior: MainColumn is `min-h-[100dvh] flex flex-col`, `<main>` is `flex-1 min-w-0 flex flex-col`, and ServiceFooter is `mt-auto shrink-0`. Short pages sit naturally at the viewport bottom, while long pages push the footer below content without sticky or fixed hacks.
- Footer variants: `public` (compact grouped links with `aria-label="서비스 정보"`), `none` (all application/workspace routes, auth callback, and immersive Full Mock). No app micro-footer is retained; legal/service links remain available on public pages via the sidebar Home/About/Guide entry points.

### Phase 2.9.1 composition polish

The independent LandingPage also uses `min-h-[100dvh] flex flex-col` with a growing main; its footer stays in normal flow. AppShell already satisfied that contract and retains its existing height structure. Public footer frames reuse PageContainer horizontal width/gutter tokens; landing sections and footer share `--landing-gutter`. App workspaces retain normal PageContainer bottom padding without spacer elements.

Desktop bottom utilities are account → theme → collapse/expand → today's sentence. The sentence is a neutral ambient block; its collapsed Sparkles button exposes the sentence through an accessible name/title and a click/keyboard disclosure (Escape or blur closes it). Sidebar widths remain 240/68px, with independent navigation scrolling and pinned utilities. Mobile keeps its separate drawer without a desktop collapse control.

Optional browser layout check: with Vite running, execute `node scripts/verify-layout.mjs`. Set `OOM_LAYOUT_URL` for a non-default dev port and `PLAYWRIGHT_MODULE` to an existing external Playwright package when it is not locally installed. It checks short-content states in both real shells, public/footer-free routing, content alignment, collapsed utilities and mobile keyboard behavior at 1440×900, 1920×1080 and 390×844. It creates no public fixture route or production dependency.

## Phase 3.0 Admin Console Foundation

Phase 3.0 establishes a secure, server-enforced administrative gateway and console:

- **Server-Enforced Authorization:** `public.admin_users` assigns roles (`owner`, `admin`, `support`) to specific authenticated user UUIDs. Table-level RLS allows admins to view only their own role row. Browser clients have no INSERT/UPDATE/DELETE grants on `admin_users`.
- **Privileged Edge Function Gateway (`admin-api`):** Client requests go to `POST /functions/v1/admin-api` bearing the user's Supabase JWT. The Edge Function validates the bearer token, checks role membership in `public.admin_users` using the private service role client, validates the CORS origin, routes to endpoint handlers (`/me`, `/overview`, `/users`, `/users/:id`, `/learning`, `/audit`), and writes action entries to `public.admin_audit_logs`.
- **Credential & Secret Boundary:** The `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to the Supabase Edge Function environment. The frontend browser bundle and static hosting never receive the service role key.
- **Client UX & State Management:** `AdminAccessProvider` and `useAdminAccess` verify administrative authorization on mount and auth state change, without UI flickering. The Admin Console navigation button in the sidebar bottom rail is rendered only when authorized. Direct navigation to `/admin/**` routes is protected by `AdminGuard`, which displays clear unauthenticated/unauthorized states while the server independently blocks unprivileged queries.
- **Data Integrity & Privacy:** Operational metrics in the dashboard utilize exact Asia/Seoul (`+09:00`) calendar-day boundaries and trailing rolling windows. Sensitive user credentials, auth tokens, passwords, audio blobs, and transcript texts are strictly excluded from audit logs and administrative views. Display plans remain labeled as "현재 표시 플랜: FREE" with zero phantom AI or subscription billing logic.


## Phase 3.1 Managed AI

`src/features/managed-ai/` owns the authenticated Quick Practice feedback UI. Server implementation, database privileges, atomic reservation/finalization, provider privacy and owner rollout are specified in [MANAGED_AI.md](MANAGED_AI.md). `profiles.plan` remains display-only; effective entitlement is FREE. `/admin/ai/` is lazy, noindex, ad-excluded and footer-free. User answer text is processed transiently; only validated feedback and usage metadata are persisted.
