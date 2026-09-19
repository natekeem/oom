begin;

-- 1. learning_sessions table
create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('quick_practice', 'mock_test')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  target_level text,
  question_count integer not null default 0 check (question_count >= 0),
  answered_count integer not null default 0 check (answered_count >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add composite unique for cross-user FK protection
alter table public.learning_sessions add constraint learning_sessions_id_user_id_unique unique (id, user_id);

alter table public.learning_sessions enable row level security;

-- 2. learning_attempts table
create table public.learning_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.learning_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  question_order integer,
  duration_seconds integer check (duration_seconds >= 0),
  completed boolean not null default true,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Composite FK: ensures attempt user_id matches session user_id
alter table public.learning_attempts
  add constraint learning_attempts_session_user_fk
  foreign key (session_id, user_id) references public.learning_sessions(id, user_id) on delete cascade;

-- Prevent duplicate attempts at the same position in a session
create unique index learning_attempts_session_order_unique
  on public.learning_attempts (session_id, question_order)
  where question_order is not null;

alter table public.learning_attempts enable row level security;

-- 3. Revoke default grants and grant minimal privileges (following Phase-1 pattern)
revoke all on public.learning_sessions from public, anon, authenticated;
grant select, insert, update on public.learning_sessions to authenticated;

revoke all on public.learning_attempts from public, anon, authenticated;
grant select, insert on public.learning_attempts to authenticated;

-- 4. RLS policies for learning_sessions
create policy learning_sessions_select_own on public.learning_sessions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy learning_sessions_insert_own on public.learning_sessions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy learning_sessions_update_own on public.learning_sessions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 5. RLS policies for learning_attempts
create policy learning_attempts_select_own on public.learning_attempts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy learning_attempts_insert_own on public.learning_attempts
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.learning_sessions
      where id = session_id and user_id = (select auth.uid())
    )
  );

-- 6. Generic reusable updated_at trigger function
create function public.oom_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.oom_set_updated_at() from public, anon, authenticated;

create trigger oom_learning_sessions_updated before update on public.learning_sessions
  for each row execute function public.oom_set_updated_at();

-- 7. Indexes for efficient querying
create index learning_sessions_user_started on public.learning_sessions (user_id, started_at desc);
create index learning_attempts_session_order on public.learning_attempts (session_id, question_order);
create index learning_attempts_user_answered on public.learning_attempts (user_id, answered_at desc);

-- 8. Comments
comment on table public.learning_sessions is 'Phase 2: per-session learning history for authenticated users.';
comment on table public.learning_attempts is 'Phase 2: individual question attempts within a learning session.';
comment on column public.learning_sessions.mode is 'quick_practice or mock_test; matches STEP 6 practice modes.';
comment on column public.learning_sessions.target_level is 'Training level ID: advanced, intermediate, or foundation.';
comment on column public.learning_attempts.question_id is 'Stable question ID from the Course content catalog.';
comment on constraint learning_attempts_session_user_fk on public.learning_attempts is 'Prevents cross-user attempt injection: attempt user must match session user.';

commit;
