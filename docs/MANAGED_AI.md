# Managed AI Platform v1 — Phase 3.1

## Boundary and ownership

Learner browser → `ai-api` → Supabase Auth `getUser(token)` → FREE entitlement → atomic quota reservation → Gemini → runtime JSON validation → transactional feedback + usage finalization → Quick Practice review.

The frontend remains a static GitHub Pages application. `src/features/managed-ai/` owns learner API/UI; `supabase/functions/ai-api/` owns authentication, prompts and the provider boundary; `_shared/feedback.ts` contains only the public versioned contract. `admin-api/handlers/ai.ts` owns AI operations endpoints. No Gemini SDK or key is shipped to the browser. Ordinary users do not load the lazy Admin AI route.

Quick Practice receives managed feedback only in its completed answer review. A usable transcript or manually entered answer is required. No transcription is invented and no audio is sent to managed AI. Full Mock keeps its existing custom LLM review. User-configured STT/LLM continues as a distinct advanced path. Unauthenticated learning remains available.

## Database

Migration: `supabase/migrations/20260923000000_managed_ai_platform.sql`. It was scaffolded with the CLI; its version was ordered after the existing Phase 3.0 migration (20260922). No applied migration was edited.

| Table | Purpose |
| --- | --- |
| `ai_plan_limits` | Server policy: FREE 3/day, future PRO 30/day, feature enable flag |
| `ai_model_catalog` | Allowed Gemini models, enabled flag, versioned pricing metadata |
| `ai_runtime_settings` | Singleton runtime OFF by default, selected provider/model, burst limit 5/minute |
| `ai_usage_buckets` | User + feature + Seoul calendar date; reserved and consumed counts |
| `ai_usage_events` | Unique request UUID, input fingerprint, status, model/prompt/schema versions, provider token counts, timing, pricing snapshot and estimated cost |
| `ai_feedback` | Validated result JSON, owner, unique usage event and optional same-owner learning attempt |

Server-only functions: `ai_quota(uuid)`, `reserve_ai_usage(uuid,uuid,text)`, `finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text)`, `admin_update_ai(uuid,jsonb)`, `admin_ai_overview()`.

All functions have an empty `search_path`, schema-qualified application objects, and EXECUTE revoked from PUBLIC/anon/authenticated, granted only to service_role. Every new table has RLS enabled and all browser privileges revoked; even direct own-feedback SELECT is deliberately absent. Gateways are the only access path. No existing RLS policy is weakened.

Explicit indexes: `ai_usage_user_created_idx`, `ai_usage_created_idx`, `ai_usage_status_created_idx`, `ai_usage_model_created_idx`, `ai_feedback_user_created_idx`, `ai_feedback_attempt_idx`. Primary/unique constraints additionally index plan+feature, provider+model, bucket identity, request UUID, usage-event owner identity and feedback usage ID. A composite unique constraint `learning_attempts_id_user_unique` enables the same-owner foreign key.

The entitlement resolver always returns FREE. `profiles.plan` is never billing truth. PRO configuration creates no paid entitlement; temporary overrides and subscription tables are not implemented.

## Atomic quota and failure policy

Each operation takes the same transaction-scoped advisory lock derived from the authenticated user ID. A lock collision can only serialize unrelated users; it cannot allow excess usage. Reserve checks the bucket and policy while holding this lock, writes one unique event and increments one reservation. Finalize and expiry take the same lock order. Provider networking occurs outside the DB transaction.

- The period is `(now() at time zone 'Asia/Seoul')::date`; reset is the next Seoul midnight, returned by the server. A request finalizes against its original period even after midnight.
- Available slots = `max(0, limit - consumed - reserved)`. Success writes feedback, token metadata, cost and consumed count in one transaction. A provider, validation or server failure releases the reservation without consuming a success slot.
- A unique `request_id` binds to its user and SHA-256 fingerprint of the request material. The raw material is not stored. Same UUID + same input recovers success or returns `REQUEST_IN_PROGRESS`. Changed input or another owner returns `IDEMPOTENCY_CONFLICT` without result disclosure.
- A failed UUID is a terminal tombstone. The browser creates a new UUID only after the server confirms a terminal failure; transport uncertainty retains the previous UUID. Retries never restart a provider call for the same UUID.
- A 2-minute lease releases abandoned reservations on the next quota/reserve/finalize call. Expired UUIDs remain terminal. If the Edge process dies after Gemini accepts a request, provider cost can be incurred without recoverable token metadata; it remains unknown, not zero. Exactly-once billing across a third-party provider and a crashed process is not claimed.
- On an uncertain persistence response, retry only the idempotent DB finalization once, never Gemini. If success committed, recover that result. Otherwise record a failure and known provider metadata, refund the slot, and permit a new explicit request. A DB outage leaves the lease for recovery. The learner sees “not consumed” only when a DB finalization confirms it.
- Under the same user lock, 5 new valid requests in the last rolling minute are allowed. Reservations, successes, failures and daily-quota blocks count. Further requests return `RATE_LIMITED` without provider work or unbounded rate-block rows. Invalid payloads fail before reservation. Duplicate UUID lookups do not consume another burst slot.

Input bounds: question 2,000 characters, context 600, answer 8,000, UUID fields only; unknown fields rejected. Streaming request body is capped at 40,000 bytes before JSON parsing. Feedback enforces exact keys/types, 1–5 integer dimensions, nonempty bounded strings, and at most 3 strengths/improvements. Database storage is additionally capped at 30KB JSON.

## Gemini and cost

The initial model is stable `gemini-3.5-flash-lite`, selected for text coaching with structured output and low latency/cost. `gemini-3.1-flash-lite` is an alternative catalog entry. Official model/pricing documentation was checked on 2026-09-21. Use the current catalog before enabling a deployment; models and prices can change.

The provider uses the stable `v1/interactions` REST API, `store:false`, structured `response_format` JSON Schema and a 4,000 output-token cap. The system instruction stays server-side. Question/context/answer are serialized as untrusted learning material; embedded commands are ignored. No tools, environment data or admin information are sent to Gemini. Runtime validation follows provider schema enforcement.

Secret: `GEMINI_API_KEY`, Supabase Function secrets only. Provider timeout: 25 seconds including reading the response. No automatic provider retry, including 429/5xx; this avoids repeating potentially charged generation. The same learner UI/types can use a replacement `AiProvider` implementation later.

Prompt version: `opic_answer_feedback_v1`; schema version: 1. Provider-reported input/output/cached token counts are recorded. Reported thought tokens are included in output cost; absent token metadata remains null. No fabricated token counts. Pricing is a reservation-time catalog snapshot in micro-USD per million tokens:

`ceil(((input - cached) × inputRate + cached × cachedRate + output × outputRate) / 1,000,000)`

Cached input is subtracted from ordinary input. Missing required usage/rates leaves estimated cost null. Unknown-cost events are counted visibly. Standard paid-tier text prices seed the catalog; free-tier credits, tax, rounding, promotions and actual invoices are not inferred. The UI says **예상 API 비용**. Catalog/pricing additions require a reviewed server migration; price editing UI is deliberately omitted.

Official references: [model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output), [Interactions API](https://ai.google.dev/api/interactions-api), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [data-storage controls](https://ai.google.dev/gemini-api/docs/interactions-overview).

## Learner and administrator surfaces

Learner endpoints: `GET /quota?feature=answer_feedback`, `POST /feedback`. Every call verifies a real, non-anonymous Supabase user. Responses have controlled CORS, `Cache-Control: no-store`, `Server-Timing` and `X-Response-Time`; provider errors never reach learners verbatim.

Quick review uses Page/Card/Button/Badge tokens and structured AI COACH, KEEP/FIX/RETRY, optional answer signals and rewritten example. There is no Markdown heuristic in the managed path, pronunciation metric, speech-speed grade or official OPIc score. The advanced custom path remains separate. AI Settings presents managed status/quota first and custom STT/LLM in a disclosure. There is no feedback/history cache in localStorage. Account-keyed components remount synchronously on logout/account change; pending responses are aborted/ignored. Quota refreshes on use, focus, local settings mutation and every minute; server enforcement is always authoritative across tabs.

`/admin/ai/` reuses AdminLayout and the wide PageContainer, is lazy-loaded, noindex, ad-excluded, footer-free and excluded from sitemap. It shows six primary KPIs, two lightweight 7-day charts, model/feature breakdowns, bounded recent failures/top users, average/p95 latency, and usage rows. Filters are dates, status, feature, model, effective plan and user UUID; 20 rows per server page, never all events downloaded.

Admin endpoints: `GET /ai/overview`, `/ai/usage`, `/ai/settings`, `PATCH /ai/settings`. Support may read but cannot mutate. Owner/admin may change runtime ON/OFF, selected enabled catalog model and FREE/future PRO limits. The UI previews and confirms the change. Database role recheck, settings update and mutation audit are one transaction; read operations are not audited. Limit bounds are 0–1,000/day. Kill switch affects subsequent reservations; already-started requests may finish.

## Privacy and rollout state

The raw answer is processed by the external provider and is not separately persisted in OOM DB, browser AI cache or server logs. No raw audio is uploaded by managed AI. Feedback output can reflect parts of the answer and is stored with usage metadata; this is disclosed. No blanket external-provider retention guarantee is made. `store:false` disables the provider's interaction storage feature, not every form of provider processing. Custom STT retains its existing explicit external endpoint behavior.

Public Pricing does not advertise “3/day available” before production verification. PRO remains 준비 중 with no checkout. The migration starts OFF. See the exact [owner rollout](#owner-rollout) below; a local fixture test is not proof of production Gemini availability.

## Owner rollout

Use the intended project and inspect its existing migration history first. CLI 2.117.0 command help was checked for these flags.

1. Apply `20260923000000_managed_ai_platform.sql` after Phase 3.0, via the project's SQL Editor or the established migration workflow. For a linked project with matching prior history: `npx supabase db push --linked --dry-run`, review the sole new AI migration, then `npx supabase db push --linked`. Do not reset production or edit prior migrations.
2. Run `supabase/tests/managed_ai.sql` in SQL Editor (BEGIN/ROLLBACK). Run the concurrent test against a disposable database with all migrations applied, not production: set `AI_TEST_DATABASE_URL`, `AI_TEST_ALLOW_DISPOSABLE=yes`, optionally `PG_MODULE` pointing to an installed `pg`, then `node scripts/test-ai-concurrency.mjs`.
3. Set `GEMINI_API_KEY` in Dashboard → Edge Functions → Secrets. Never paste it in chat, use `VITE_GEMINI_API_KEY`, GitHub Pages variables or localStorage. CLI alternative: put `GEMINI_API_KEY=...` in a protected file outside the repository and run `npx supabase secrets set --project-ref "$env:OOM_SUPABASE_PROJECT_REF" --env-file "C:\secure\oom-ai.env"`; remove that local file securely afterward.
4. Deploy: `npx supabase functions deploy ai-api --project-ref "$env:OOM_SUPABASE_PROJECT_REF" --no-verify-jwt --use-api`.
5. Deploy: `npx supabase functions deploy admin-api --project-ref "$env:OOM_SUPABASE_PROJECT_REF" --no-verify-jwt --use-api`. The flag disables the gateway's legacy JWT verification only; both functions independently verify the bearer token through Auth. Anonymous managed requests must return 401.
6. Deploy/preview this frontend for the owner while runtime remains OFF. Check `/admin/ai/`: real empty/previous data, default model, FREE 3 and future PRO 30, permissions and disabled runtime. The static frontend may be deployed early because OFF is safe.
7. With an authenticated FREE test user, inspect `GET /quota?feature=answer_feedback`: FREE, limit 3, used 0, enabled false and correct next Seoul midnight. Verify unauthenticated requests are rejected.
8. Owner/admin enables managed AI through the confirmation in Admin Console. Confirm the audit row.
9. Perform **one real** feedback request from Quick Practice with non-sensitive practice text. Verify structured UI; one feedback row; one succeeded usage event; reported tokens/cost; remaining 2; same UUID recovery without another event/provider call; Admin AI totals; no raw-answer/audio DB column. Capture `Server-Timing`, `X-Response-Time` and actual `x-sb-edge-region` in Network tools.
10. On the test account, exhaust the remaining FREE quota and verify the fourth distinct request is server-blocked. Test simultaneous last-slot requests in the disposable environment. Restore any temporary policy changes via Admin Console.
11. Disable managed AI and verify the safe unavailable learner state while training still works. Test support PATCH rejection, owner/admin changes, audit rows, account switching and mobile feedback. Re-enable intentionally only after these checks.
12. Deploy frontend if not already deployed. Only after production confirms FREE 3/day should Pricing advertise that allowance. Do not enable PRO purchase.

Browser requests send `x-region: ap-northeast-2`. Verify the **actual** `x-sb-edge-region`; the requested region is not evidence of execution. [Supabase regional invocation](https://supabase.com/docs/guides/functions/regional-invocation) and [secret management](https://supabase.com/docs/guides/functions/secrets).

## Reproducible local checks

Repository commands are `npm run docs:generate`, `npm run docs:check` and `npm run verify:pages` (the prompt's `docs` and `verify` aliases do not exist). Run them with lint, tests, build and diff check. No TTS-covered fixed content changed.

`node scripts/verify-layout.mjs` checks existing shell behavior. `node scripts/verify-managed-ai.mjs` checks managed UI in Chromium with intercepted, clearly labeled QA fixture accounts and provider responses; it makes no real paid call. Set `PLAYWRIGHT_MODULE` to an existing Playwright package if needed. Start the fixture dev server with `VITE_SUPABASE_URL=https://oom-ai-qa.invalid`, `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qa_fixture_only`, port 4173. These are test-only, not production environment values. Artifacts are ignored under `.tmp/ai-qa/`.

SQL testing used a disposable PostgreSQL instance with all repository migrations and a minimal Auth schema/roles shim. This verifies PostgreSQL functions, grants, RLS and real concurrent locking; it does not replace target Supabase deployment tests or advisors.

Deferred: managed STT, audio storage/processing, pronunciation analysis, aggregate Full Mock AI report, subscriptions/payments, PRO purchase, ad-free entitlement, community, optional feedback history and temporary entitlement overrides.
