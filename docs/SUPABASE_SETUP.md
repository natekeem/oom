# Supabase configuration setup

The frontend remains a static GitHub Pages build. Supabase is optional external Auth/PostgreSQL infrastructure. Without configuration, public content and all existing training work; My Page explains that login needs configuration.

## Supabase owner actions

1. Create/select the intended Supabase project. Copy **Project URL** and the **Publishable key** (`sb_publishable_…`) from Connect / Settings → API Keys. These are public browser configuration, not secrets.
2. Copy `.env.example` to ignored `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite. Use Node 22+ (CI uses 24).
3. Apply `supabase/migrations/20260919000000_create_profiles.sql` once using the project's SQL Editor, or your existing Supabase migration deployment workflow. Review the project target first. The migration also creates profiles for existing Auth users. A trigger failure can block signup, so test signup before enabling production login.
4. Apply `supabase/migrations/20260920000000_create_learning_history.sql` to create `learning_sessions` and `learning_attempts` for Phase 2 history persistence.
5. In Authentication → Sign In / Providers → Google, copy the exact Supabase **callback URL** shown there for the Google dashboard. Do not invent the project hostname.
6. Enable Google after adding its Client ID and Client Secret as described below.
7. In Authentication → URL Configuration set Site URL to `https://opic-on-me.com`.
8. Allow these redirect URLs:
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

After applying the migration, use two disposable test accounts and verify:

- Each signup creates exactly one free profile.
- Account A can select/update its safe fields; it cannot select or modify B's profile.
- Account A can record sessions and attempts, but cannot see or inject into Account B's sessions.
- Anonymous reads and writes fail.
- Deleting a test Auth user in the dashboard removes its profile.
- Google login returns to OOM, reload preserves the session, logout removes the local session, and callback cancellation gives a retry action.
- Direct production requests to both utility routes return generated HTML with noindex and no ads. Public/training routes still work signed out.

These checks require your configured project; unit tests mock the SDK and do not certify a deployed database or real Google OAuth. Run `supabase/tests/profiles.sql` in SQL Editor after migration for transactional RLS/privilege checks; it rolls back its fixture users.

## Future boundary

The profile plan is a display field, not billing truth. Future server-owned subscriptions/payment state will authorize entitlements. Learning history, mock-test persistence, managed AI feedback, Kakao login, FREE/PRO entitlement, payments, and ad-free PRO behavior are not implemented. No extra tables, uploads, Edge Functions, or AI keys are added.

Current advanced-user STT/LLM remains browser → user-configured endpoint. Future managed mode will be browser → Supabase Edge Function → authentication/usage/plan validation → AI provider → persistence.

References: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [user profiles](https://supabase.com/docs/guides/auth/managing-user-data), [column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
