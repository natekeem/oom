# Supabase configuration setup

The frontend remains a static GitHub Pages build. Supabase is optional external Auth/PostgreSQL infrastructure. Without configuration, public content and all existing training work; My Page explains that login needs configuration.

## Supabase owner actions

1. Create/select the intended Supabase project. Copy **Project URL** and the **Publishable key** (`sb_publishable_…`) from Connect / Settings → API Keys. These are public browser configuration, not secrets.
2. Copy `.env.example` to ignored `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite. Use Node 22+ (CI uses 24).
3. Apply `supabase/migrations/20260919000000_create_profiles.sql` once using the project's SQL Editor, or your existing Supabase migration deployment workflow. Review the project target first. The migration also creates profiles for existing Auth users. A trigger failure can block signup, so test signup before enabling production login.
4. Apply `supabase/migrations/20260920000000_create_learning_history.sql` to create `learning_sessions` and `learning_attempts` for Phase 2 history persistence.
5. Apply `supabase/migrations/20260921000000_create_learning_preferences.sql` to create `learning_preferences` for Phase 2.7 account-level learning preferences persistence.
6. In Authentication → Sign In / Providers → Google, copy the exact Supabase **callback URL** shown there for the Google dashboard. Do not invent the project hostname.
7. Enable Google after adding its Client ID and Client Secret as described below.
8. In Authentication → URL Configuration set Site URL to `https://opic-on-me.com`.
9. Allow these redirect URLs:
   - `https://opic-on-me.com/auth/callback/`
   - `http://localhost:5173/auth/callback/`
   - `https://opic-on-me.com/auth/callback/?returnTo=*`
   - `http://localhost:5173/auth/callback/?returnTo=*`

The final two patterns allow the validated returnTo query used by OOM. Keep these constrained to the callback path; do not allow arbitrary production origins. If you use another local port, explicitly add its callback URL. PKCE login must finish in the same browser where it started.

## Google Auth Platform owner actions

1. Configure Branding, Audience (test users while in Testing), and Data Access for basic identity (openid, email, profile).
2. Create an OAuth client of type **Web application**.
3. Authorized JavaScript origins:
   - `https://opic-on-me.com`
   - `http://localhost:5173`
4. Authorized redirect URI: paste the exact **Supabase callback URL copied from its Google provider screen**. Do not enter OOM's `/auth/callback/` here.
5. Copy Client ID and Client Secret into the Supabase Google provider settings. Keep the secret only there; never paste it into chat, source, `.env.example`, or Pages build variables.

There are two different redirects:

```text
Google → Supabase callback (configured in Google)
Supabase → current OOM origin /auth/callback/?returnTo=… (allowed in Supabase)
```

The SDK performs browser PKCE exchange/restoration. OOM does not run a token-exchange server. A successful callback replaces itself with a registered internal route, defaulting to `/mypage/`. External/encoded/unrecognized return paths and callback loops are rejected.

## GitHub / Pages owner actions

In repository Settings → Secrets and variables → Actions → **Variables**, add:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key |

The existing Pages workflow passes these to the build. Re-run deployment after setting/changing them. Leave Pages source as GitHub Actions. No Google Client Secret, service-role key, Supabase secret key, or AI key belongs in this build. Missing values do not fail the build.

## Database protection and release checks

- `profiles` references Auth user IDs with cascade deletion. Signup always creates `plan = free` regardless of metadata. RLS permits only authenticated own-row SELECT/UPDATE. Table privileges are revoked first; UPDATE is granted only for `display_name` and `avatar_url`, so REST updates cannot change `plan`, ID, or timestamps. No browser INSERT/DELETE or anonymous SELECT grants exist.
- `learning_sessions` and `learning_attempts` are insert/select only by the owning authenticated user. A composite foreign key prevents inserting attempts into another user's session even if RLS somehow fails.
- `learning_preferences` stores account-level target level and course preferences (`user_id` PK referencing `auth.users(id)` cascade delete). RLS permits only authenticated own-row SELECT/INSERT/UPDATE/DELETE. Check constraint enforces `target_level in ('advanced', 'intermediate', 'foundation')`. Anonymous access is blocked.

After applying the migration, use two disposable test accounts and verify:

- Each signup creates exactly one free profile.
- Account A can select/update its safe fields; it cannot select or modify B's profile.
- Account A can record sessions and attempts, but cannot see or inject into Account B's sessions.
- Account A can save and update learning preferences, but cannot view or modify Account B's preferences.
- Anonymous reads and writes fail.
- Deleting a test Auth user in the dashboard removes its profile and preferences.
- Google login returns to OOM, reload preserves the session, logout removes the local session, and callback cancellation gives a retry action.
- Direct production requests to both utility routes return generated HTML with noindex and no ads. Public/training routes still work signed out.

These checks require your configured project; unit tests mock the SDK and do not certify a deployed database or real Google OAuth. Run `supabase/tests/profiles.sql` and `supabase/tests/learning_preferences.sql` in SQL Editor after migration for transactional RLS/privilege checks; both roll back their fixture users.

## Future boundary

The profile plan is a display field, not billing truth. Future server-owned subscriptions/payment state will authorize entitlements. Practice sessions/attempts, learning preferences and explicit study activities are implemented. Managed AI feedback is implemented behind an OFF-by-default runtime switch; see [Phase 3.1 rollout](MANAGED_AI.md). Kakao login, paid entitlements, payments and ad-free PRO behavior are not implemented. Raw audio is not uploaded by managed AI; answer text is processed transiently for feedback.

Current advanced-user STT/LLM remains browser → user-configured endpoint. Managed mode is browser → ai-api → authentication/atomic quota → Gemini → structured feedback/usage persistence.

References: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [user profiles](https://supabase.com/docs/guides/auth/managing-user-data), [column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Phase 2.8 owner rollout: meaningful study activities

1. Apply supabase/migrations/20260919214100_create_learning_activity_events.sql in the intended project's SQL Editor. This CLI-generated migration is independent of the later-dated history/preferences migrations. For a linked project already past this timestamp, explicitly apply this missing migration using your deployment workflow; do not reset the database.
2. Run supabase/tests/learning_activity_events.sql in SQL Editor. It uses BEGIN / ROLLBACK and two disposable fixture IDs to test own insert/select, cross-user denial, anonymous denial, invalid type, append-only grants, duplicate ID rejection, repeat study and Auth deletion cascade.
3. Deploy the validated frontend. No new environment variables are needed.
4. With a real authenticated account, submit the exact STEP 2 recommended survey via grading and click 학습 완료 in STEP 4 and STEP 5 detail pages. Check recent study activities in My Page. Repeated clicks in the same visit must not duplicate events; reopening and studying again can create another event.
5. Switch accounts and sign out: previous activity must disappear. Check that existing preferences, Quick/Mock session history and anonymous training still work. A missing table or failed request must not block learning.

The new table grants authenticated SELECT and INSERT only, with auth.uid() = user_id policies, RLS, cascade deletion and an owner/time index. Timestamp writes, UPDATE and DELETE are not granted to ordinary clients. Content identifiers only are stored. A stable client UUID is reused on retry; distinct study visits may create distinct UUIDs. This is not a preference record or a practice attempt.

Local frontend tests mock the repository. Real OAuth and deployed database verification still require the configured target project. Follow Supabase's RLS grant/policy guidance: https://supabase.com/docs/guides/database/postgres/row-level-security .

## Phase 3.0 owner rollout: Admin Console Foundation

Phase 3.0 introduces a server-enforced administrator authorization model, an `admin-api` Edge Function gateway, and an administrative console within OOM (`/admin/**`).

### 1. Database Migration

1. In Supabase Dashboard → SQL Editor, apply `supabase/migrations/20260922000000_create_admin_console.sql`.
   - Creates `public.admin_users` (`user_id` PK references `auth.users(id)` cascade delete, check constraint on `role in ('owner', 'admin', 'support')`, RLS enabled allowing users to read only their own row, table privileges revoked from public/anon).
   - Creates `public.admin_audit_logs` (`id` PK, `admin_user_id` references `auth.users(id)` restrict delete, `action`, `target_resource`, `target_id`, `details` JSONB, `ip_address`, `created_at`, RLS enabled, all privileges revoked from browser).
   - Creates supporting performance indexes on `admin_audit_logs`, `profiles(created_at desc)`, `learning_sessions(started_at desc)`, and `learning_activity_events(occurred_at desc)`.
2. Run `supabase/tests/admin_console.sql` in SQL Editor to verify database security. The test runs within a transaction block (`BEGIN` ... `ROLLBACK`) and asserts:
   - Non-admin user cannot select or insert into `admin_users`.
   - Direct browser privileges cannot insert/update/delete `admin_users` or access `admin_audit_logs`.
   - Admin user can select only their own role.
   - Check constraint blocks invalid roles.
   - Deleting an Auth user cascades to `admin_users`.

### 2. Manual Owner Bootstrap

Administrator privileges are strictly server-enforced. There is no auto-promotion, secret invite code, or client-side grant API. An owner must be registered manually in the Supabase Dashboard SQL Editor:

```sql
-- Replace <YOUR_AUTH_USER_UUID> with the target user's UUID from Authentication -> Users
INSERT INTO public.admin_users (user_id, role)
VALUES ('<YOUR_AUTH_USER_UUID>'::uuid, 'owner')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
```

Available roles:
- `owner`: Full administrative privileges, user inspection, operational metrics, audit log review.
- `admin`: User inspection, operational metrics, learning operations review.
- `support`: Read-only operational inspection; cannot view audit logs.

### 3. Edge Function Deployment

The frontend browser never connects to the database using privileged service keys. All administrative operations are dispatched through the Supabase Edge Function `admin-api`:

1. Deploy the function using the Supabase CLI:
   ```bash
   supabase functions deploy admin-api
   ```
2. Supabase Edge Functions automatically inject `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into the function environment.
3. Verify that CORS allowed origins in `supabase/functions/admin-api/cors.ts` match your deployment environments:
   - `https://opic-on-me.com` (Production)
   - `http://localhost:5173` (Local Dev)
   - `http://localhost:4173` (Vite Preview)

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` to GitHub Pages repository variables, `.env.local`, or any frontend code. The service role key belongs solely in the Edge Function server environment.

### 4. Verification and Access Checks

1. **Unauthorized Access:**
   - Sign in with an account not in `admin_users`.
   - The Admin Console icon (`ShieldCheck`) does not appear in the sidebar or mobile menu.
   - Direct navigation to `/admin/` displays an "접근 권한이 없습니다" (403 Forbidden) warning card. The Edge Function rejects requests with HTTP 403.
2. **Authorized Access:**
   - Sign in with the bootstrapped `owner` account.
   - The Admin Console button appears in the sidebar bottom utility rail.
   - Access `/admin/` to view the Dashboard (Asia/Seoul day boundaries, real user and learning event counts).
   - Access `/admin/users/` to search users by name/email, view profile details, and inspect operational metrics.
   - Access `/admin/learning/` to filter practice sessions and study completions.
   - Access `/admin/audit/` to view administrator action logs (settings mutations only; ordinary views and filtered reads are not audited).
3. **Role Enforcement:**
   - A user with `support` role accessing `/admin/audit/` receives a 403 response, and the UI displays an explanatory restriction notice.

## Phase 3.1.1 rollout dependency

After `20260923000000_managed_ai_platform.sql`, apply `20260923122712_managed_ai_hardening.sql` with managed AI OFF, then deploy updated ai-api and admin-api together. The finalization RPC gains nullable p_thought, preserving separate raw output telemetry. Run both managed_ai.sql and managed_ai_hardening.sql, and use a disposable DB for concurrency verification. Follow the full [owner rollout](MANAGED_AI.md#owner-rollout), including attempt linkage, one authorized real request, quota/idempotency/kill-switch/account-switch checks, before frontend publication. Secrets remain Function-only.
