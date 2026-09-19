begin;

-- 1. learning_preferences table (one row per authenticated user)
create table public.learning_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_level text check (target_level is null or target_level in ('advanced', 'intermediate', 'foundation')),
  course_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learning_preferences enable row level security;

-- 2. Revoke default grants and grant minimal privileges
revoke all on public.learning_preferences from public, anon, authenticated;
grant select, insert, update, delete on public.learning_preferences to authenticated;

-- 3. RLS policies
create policy learning_preferences_select_own on public.learning_preferences
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy learning_preferences_insert_own on public.learning_preferences
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy learning_preferences_update_own on public.learning_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy learning_preferences_delete_own on public.learning_preferences
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 4. Trigger for updated_at
create or replace function public.oom_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.oom_set_updated_at() from public, anon, authenticated;

create trigger oom_learning_preferences_updated before update on public.learning_preferences
  for each row execute function public.oom_set_updated_at();

commit;
