begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Remove Supabase default table grants before granting safe column updates.
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.oom_create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when new.raw_user_meta_data ->> 'avatar_url' like 'https://%'
      then new.raw_user_meta_data ->> 'avatar_url' else null end)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.oom_create_profile() from public, anon, authenticated;
create trigger oom_auth_user_created after insert on auth.users
  for each row execute function public.oom_create_profile();

create function public.oom_profile_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.oom_profile_updated_at() from public, anon, authenticated;
create trigger oom_profile_updated before update on public.profiles
  for each row execute function public.oom_profile_updated_at();

-- Support accounts created before this migration, without trusting metadata plans.
insert into public.profiles (id, display_name, avatar_url)
select id, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  case when raw_user_meta_data ->> 'avatar_url' like 'https://%'
    then raw_user_meta_data ->> 'avatar_url' else null end
from auth.users on conflict (id) do nothing;

comment on column public.profiles.plan is 'Display-only Phase 1 plan; future server-owned subscription state is authoritative.';
commit;
