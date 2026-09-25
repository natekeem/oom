# Phase 3.1.1 implementation and verification report

Historical implementation evidence; canonical behavior lives in the architecture/training/managed-AI guides. Implementation and tests were performed locally on September 23, with final review resumed September 25, 2026. No production deployment, real Gemini request, commit or push was performed.

## Diagnosis

Confirmed in the starting code: competing managed/custom feedback CTAs; a deterministic custom-endpoint fallback presented as AI; fire-and-forget attempts that discarded returned IDs; no explicit Quick completion; all admin routes assigned default width; thinking added into raw output tokens; frontend imports from Edge Function source; custom keys persisted by default; full course data eagerly reachable from AppShell; Framer Motion in the entry route/toast path. Baseline main was 743.50 kB, gzip 218.29 kB.

Already correct and preserved: server attempt ownership validation, composite same-owner FK, atomic quota locking, request idempotency and failure refund/recovery, lazy admin route views, runtime OFF default, static SEO routes and six-step training boundaries.

## Learner behavior

- `/ai-settings/` selects one device-local `managed` or `custom` mode (`oom-ai-feedback-mode`). Managed is the default; explicit custom survives navigation/reload. Anonymous/OFF managed mode gives login/unavailable guidance, without switching providers.
- Quick review shows only the selected feedback path. Custom without an endpoint shows the settings action and no fabricated AI result. Custom configuration remains accessible in the advanced disclosure, initially open for custom mode. Existing Full Mock custom review remains intact.
- Completed recording or timer-only answer → one `learning_session` → one `learning_attempt` → returned real ID → managed request → same-owner `ai_feedback.learning_attempt_id`. Duplicate completion callbacks reuse the promise; AI retry cannot create an attempt. Failed persistence returns null and leaves AI usable without linkage.
- **연습 종료** waits for pending writes and completes only on explicit action. `completed_at` comes from the existing repository update; `answered_count` counts saved completed attempts. Repeated completion is idempotent. Navigation/refresh/unmount never complete a session.
- Summary shows actual local completed-answer count and measured duration. It contains My Page/restart actions, moves keyboard focus to the heading, and discloses unconfirmed account persistence. AI-count aggregation was deliberately omitted.
- Account changes remount Quick review and use separate persistence state. Late managed responses remain aborted/ignored. Delayed recording persistence cannot start old-answer STT after a retry/end.

## Admin and telemetry

| Route | Width |
| --- | --- |
| `/admin/` | default (1280px maximum) |
| `/admin/users/` | wide (1440px maximum) |
| `/admin/learning/` | wide |
| `/admin/audit/` | default |
| `/admin/ai/` | wide |

AI top-user and usage rows use display name plus abbreviated UUID. One bounded `profiles` query enriches each page/overview; no per-user Auth lookup or additional email exposure. Existing timing headers remain in the gateway.

Migration `20260923122712_managed_ai_hardening.sql` adds nullable `thought_tokens`, replaces the finalization signature atomically and preserves server-only grants. Input/output/thought/cached counts retain provider values. Billing alone adds output + coalesced thought, and removes cached input from ordinary input charges. Null telemetry remains unknown. Existing rows retain historical combined output values with null thought counts; the split cannot be reconstructed.

Provider semantics checked against [Interactions API](https://ai.google.dev/api/interactions-api) and [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing). No model or catalog-price experiment was applied.

## Contracts and secrets

Frontend and Edge Functions depend on `shared/managed-ai/feedback.ts`, a pure TypeScript contract without environment imports. Frontend no longer imports the Edge Function contract path.

Endpoint/model/options remain device-local. API keys default to tab sessionStorage; `rememberKey` plus explicit Save opts into localStorage. Uncheck + Save removes the persistent secret. Legacy keys remain usable and untouched until a visible notice and the user's saved choice. Device-owned custom settings survive account changes; managed state does not. Inputs stay masked. Custom endpoint response bodies are no longer echoed into errors. No client encryption or secret forwarding to managed AI was introduced.

## Bundle evidence and deliberate limits

| Main JavaScript | Before | After |
| --- | ---: | ---: |
| minified | 743.50 kB | 476.70 kB |
| gzip | 218.29 kB | 137.50 kB |

Main reduction: 266.80 kB (35.9%); gzip reduction: 80.79 kB (37.0%). No warning threshold was changed and no dependency was added.

Largest five JavaScript outputs (decimal kB; worker included):

| Output | minified | gzip |
| --- | ---: | ---: |
| Kokoro worker | 2,219.76 | 920.18 |
| VoiceUniverseCanvas | 828.05 | 223.39 |
| main index | 476.70 | 137.50 |
| LandingPage | 183.99 | 65.17 |
| courseRegistry | 154.25 | 43.75 |

`courseCatalog.ts` discovers lightweight manifests/navigation. Shell and course lists no longer pull the corpus into the entry. Canonical content is loaded through the shared lazy training/history chunk. **Deviation from the suggested per-course split:** bundles remain synchronous inside this deferred chunk, preserving multi-level Full Mock and history consumers; no per-course asynchronous state model was introduced. The entry target was achieved without that risk. Metadata/content parity tests cover every current course and level.

Simple route/toast entrances now use CSS with reduced-motion support; exit-wait sequencing was removed. Complex lazy-view animations remain. A >500 kB warning still exists for the unrelated lazy 3D canvas, and the lazy Kokoro worker is large. Neither is hidden by configuration.

## Validation evidence

- `npm run lint`: PASS.
- `npm run test`: 46 files, 382 tests PASS. A subsequent targeted run covered the final recording/persistence race guard and admin/provider paths: 3 files, 50 tests PASS.
- `npm run docs:generate`, `npm run docs:check`: PASS.
- `npm run build`: PASS; main below 500 kB, lazy canvas warning retained.
- `npm run verify:pages`: PASS; 50 sitemap routes, 58 generated indexes and 16 representative static pages checked.
- `git diff --check`: PASS.
- Disposable native PostgreSQL: all seven migrations applied; `managed_ai.sql` and `managed_ai_hardening.sql` PASS. Separate real concurrent last-slot test PASS: one reservation, one rejection, reserved count 1. Auth schema/roles were a local shim; these results do not substitute for target Supabase rollout verification.
- `scripts/verify-layout.mjs`: 46 route/fixture/interaction cases PASS.
- `scripts/verify-managed-ai.mjs`: 71 captures and 12 mocked provider requests PASS. Verified attempt ID transport, exact session completion patch/count/date, one selected feedback path, radio-keyboard selection and default/remember/unremember key storage. No paid request occurred.

Visual matrix: `/ai-settings/`, `/practice/quick/`, `/admin/`, `/admin/users/`, `/admin/learning/`, `/admin/ai/`; 1440×1000, 1920×1080, 390×844; dark/light. Quick empty/loading/success/error/quota/end states, populated admin rows, width geometry and page overflow were checked. Representative desktop/mobile captures were visually inspected, including custom settings, summary, admin AI and user/learning tables. Captures are local ignored artifacts in `.tmp/ai-qa/`.

Synthetic coaching cases in `fixtures/managed-ai-quality.json`: too short, off-topic, repetitive, natural imperfect English, detailed advanced answer, Korean/English mix, injection-like text. Manual quality/model evaluation remains **NOT RUN**; mocked schema/UI results are not evidence of real coaching quality. Criteria and outcome-recording procedure are in `MANAGED_AI.md`.

## Owner rollout — still required

Use the existing linked project's reviewed migration workflow; never reset production.

1. Keep managed AI OFF. Apply Phase 3.1 `20260923000000_managed_ai_platform.sql`, then Phase 3.1.1 `20260923122712_managed_ai_hardening.sql`.
2. Run both SQL test files; run concurrency tests only against a disposable DB.
3. Set `GEMINI_API_KEY` in Function secrets, never chat/source/VITE variables.
4. Deploy updated `ai-api`, then `admin-api` with the documented independent bearer-auth configuration.
5. Preview `/admin/ai/` while OFF. Verify FREE policy, real rows, permissions and Seoul reset boundaries.
6. Enable managed AI deliberately. Make one real request with synthetic text; verify session → attempt → feedback linkage, separate token fields, cost and quota.
7. Retry the same request UUID; verify no second event/provider call. Exhaust quota on a test account and verify rejection.
8. Verify kill switch, logout/account switch, support read-only access and mutation audit rows.
9. Deploy the frontend only after owner verification. Keep PRO marked 준비 중; do not advertise unverified availability.

Exact commands and secret-file handling are in [MANAGED_AI.md](MANAGED_AI.md#owner-rollout).

Still excluded: managed STT, managed audio upload/storage/analysis, pronunciation scoring, Full Mock aggregate AI report, payments/subscriptions/PRO checkout, community and notifications. Pricing promises were not expanded.
