-- Independent of the practice sessions/preferences migrations.
create table public.learning_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('survey_completed', 'universal_script_completed', 'roleplay_completed')),
  course_id text not null check (length(course_id) between 1 and 100),
  level_id text not null check (level_id in ('advanced', 'intermediate', 'foundation')),
  content_id text not null check (length(content_id) between 1 and 200),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index learning_activity_events_user_time_idx on public.learning_activity_events (user_id, occurred_at desc);
alter table public.learning_activity_events enable row level security;
revoke all on public.learning_activity_events from public, anon, authenticated;
grant select on public.learning_activity_events to authenticated;
grant insert (id, user_id, activity_type, course_id, level_id, content_id) on public.learning_activity_events to authenticated;
create policy "Read own study activities" on public.learning_activity_events for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Insert own study activities" on public.learning_activity_events for insert to authenticated
  with check ((select auth.uid()) = user_id);
