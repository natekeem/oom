begin;

-- 1. admin_users table
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'support')),
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id) on delete set null
);

alter table public.admin_users enable row level security;

-- Revoke default table privileges and grant minimal read-own privilege
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated;

create policy admin_users_select_own on public.admin_users
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- 2. admin_audit_logs table (write-only by server-side service role)
create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  target_type text null,
  target_id text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

-- Audit logs are inaccessible from ordinary browser clients
revoke all on public.admin_audit_logs from public, anon, authenticated;

-- 3. Indexes for efficient administration queries
create index admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index admin_audit_logs_admin_user_idx on public.admin_audit_logs (admin_user_id, created_at desc);

create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
create index if not exists learning_sessions_started_at_idx on public.learning_sessions (started_at desc);
create index if not exists learning_activity_events_occurred_at_idx on public.learning_activity_events (occurred_at desc);

-- 4. Comments
comment on table public.admin_users is 'Phase 3.0: Authoritative server/database-backed administrative roles.';
comment on column public.admin_users.role is 'owner, admin, or support; determines administrative capabilities.';
comment on table public.admin_audit_logs is 'Phase 3.0: Audit log of administrative actions, written exclusively by service role.';

commit;
