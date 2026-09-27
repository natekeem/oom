begin;

-- 1. STT Runtime Settings
create table public.stt_runtime_settings (
  id boolean primary key default true check (id),
  managed_stt_enabled boolean not null default false,
  default_provider text not null default 'gemini' check (default_provider in ('gemini')),
  default_model text not null default 'gemini-3.5-transcribe',
  requests_per_minute integer not null default 5 check (requests_per_minute between 1 and 120),
  daily_limit_ms_free bigint not null default 600000 check (daily_limit_ms_free >= 0 and daily_limit_ms_free <= 86400000),
  daily_limit_ms_pro bigint not null default 3600000 check (daily_limit_ms_pro >= 0 and daily_limit_ms_pro <= 86400000),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

insert into public.stt_runtime_settings (id, managed_stt_enabled, default_provider, default_model, requests_per_minute, daily_limit_ms_free, daily_limit_ms_pro)
values (true, false, 'gemini', 'gemini-3.5-transcribe', 5, 600000, 3600000)
on conflict (id) do nothing;

-- 2. STT Model Catalog
create table public.stt_model_catalog (
  provider text not null,
  model text not null,
  enabled boolean not null default true,
  input_cost_per_million_microusd integer not null default 2000000,
  output_cost_per_million_microusd integer not null default 12000000,
  estimated_cost_per_second_microusd integer not null default 83,
  pricing_note text not null default 'Gemini 3.5 Transcribe official pricing ($2/1M input, $12/1M output, ~$0.005/min)',
  primary key (provider, model)
);

insert into public.stt_model_catalog (provider, model, enabled, input_cost_per_million_microusd, output_cost_per_million_microusd, estimated_cost_per_second_microusd, pricing_note)
values ('gemini', 'gemini-3.5-transcribe', true, 2000000, 12000000, 83, 'Gemini 3.5 Transcribe official pricing')
on conflict (provider, model) do nothing;

-- 3. STT Usage Buckets
create table public.stt_usage_buckets (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  reserved_ms bigint not null default 0 check (reserved_ms >= 0),
  consumed_ms bigint not null default 0 check (consumed_ms >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

-- 4. STT Usage Events (Telemetry only, NO raw audio, NO raw transcript)
create table public.stt_usage_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_hash text not null,
  source text not null check (source in ('quick_practice', 'roleplay', 'mock_review')),
  effective_plan text not null default 'free' check (effective_plan in ('free', 'pro')),
  period_start date not null,
  provider text not null,
  model text not null,
  status text not null check (status in ('reserved', 'succeeded', 'failed', 'quota_blocked')),
  audio_duration_ms integer not null check (audio_duration_ms >= 0),
  pricing_snapshot jsonb not null default '{}'::jsonb,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_microusd bigint check (estimated_cost_microusd is null or estimated_cost_microusd >= 0),
  latency_ms integer not null default 0 check (latency_ms >= 0),
  error_code text,
  expires_at timestamptz not null default (now() + interval '2 minutes'),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (id, user_id)
);

create index stt_usage_events_user_created_idx on public.stt_usage_events(user_id, created_at desc);
create index stt_usage_events_created_idx on public.stt_usage_events(created_at desc);

-- 5. STT Results (Temporary 24-hour cache for idempotency/retry and immediate AI workflow)
create table public.stt_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_event_id uuid not null unique,
  transcript text not null check (octet_length(transcript) <= 30000),
  language text not null default 'en-US',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  foreign key (usage_event_id, user_id) references public.stt_usage_events(id, user_id) on delete cascade
);

create index stt_results_user_created_idx on public.stt_results(user_id, created_at desc);
create index stt_results_expires_idx on public.stt_results(expires_at);

-- RLS & Grants for tables
alter table public.stt_runtime_settings enable row level security;
alter table public.stt_model_catalog enable row level security;
alter table public.stt_usage_buckets enable row level security;
alter table public.stt_usage_events enable row level security;
alter table public.stt_results enable row level security;

revoke all on public.stt_runtime_settings from public, anon, authenticated;
revoke all on public.stt_model_catalog from public, anon, authenticated;
revoke all on public.stt_usage_buckets from public, anon, authenticated;
revoke all on public.stt_usage_events from public, anon, authenticated;
revoke all on public.stt_results from public, anon, authenticated;

grant all on public.stt_runtime_settings to service_role;
grant all on public.stt_model_catalog to service_role;
grant all on public.stt_usage_buckets to service_role;
grant all on public.stt_usage_events to service_role;
grant all on public.stt_results to service_role;

-- 6. RPC: Quota
create function public.stt_quota(p_user uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  d date := (now() at time zone 'Asia/Seoul')::date;
  s public.stt_runtime_settings;
  b public.stt_usage_buckets;
  r record;
  enabled boolean;
  limit_ms bigint;
begin
  if p_user is null then raise exception 'INVALID_REQUEST'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 3201));
  for r in update public.stt_usage_events set status='failed',error_code='RESERVATION_EXPIRED',completed_at=now()
    where user_id=p_user and status='reserved' and expires_at < now() returning period_start,audio_duration_ms loop
    update public.stt_usage_buckets set reserved_ms=greatest(0,reserved_ms-r.audio_duration_ms),updated_at=now()
      where user_id=p_user and period_start=r.period_start;
  end loop;

  select * into strict s from public.stt_runtime_settings where id;
  limit_ms := s.daily_limit_ms_free;
  select * into b from public.stt_usage_buckets where user_id=p_user and period_start=d;
  select s.managed_stt_enabled and m.enabled into enabled
    from public.stt_model_catalog m where (m.provider,m.model)=(s.default_provider,s.default_model);

  return jsonb_build_object(
    'plan', 'free',
    'limitMs', limit_ms,
    'usedMs', coalesce(b.consumed_ms, 0),
    'reservedMs', coalesce(b.reserved_ms, 0),
    'remainingMs', greatest(0, limit_ms - coalesce(b.consumed_ms, 0) - coalesce(b.reserved_ms, 0)),
    'resetsAt', ((d + 1)::timestamp at time zone 'Asia/Seoul'),
    'enabled', coalesce(enabled, false),
    'defaultModel', s.default_model
  );
end $$;

-- 7. RPC: Reserve STT Usage
create function public.reserve_stt_usage(p_user uuid, p_request uuid, p_hash text, p_duration_ms integer, p_source text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  q jsonb;
  e public.stt_usage_events;
  s public.stt_runtime_settings;
  m public.stt_model_catalog;
  d date := (now() at time zone 'Asia/Seoul')::date;
  recovered text;
  recovered_lang text;
begin
  if p_request is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$'
    or p_source not in ('quick_practice', 'roleplay', 'mock_review')
    or p_duration_ms is null or p_duration_ms not between 500 and 180000 then
    raise exception 'INVALID_REQUEST';
  end if;

  q := public.stt_quota(p_user);

  select * into e from public.stt_usage_events where request_id=p_request;
  if found then
    if e.user_id <> p_user or e.audio_hash <> p_hash or e.source <> p_source then
      return jsonb_build_object('code', 'IDEMPOTENCY_CONFLICT');
    end if;
    if e.status = 'succeeded' then
      select transcript, language into recovered, recovered_lang from public.stt_results where usage_event_id = e.id;
      return jsonb_build_object(
        'code', 'RECOVERED',
        'transcript', recovered,
        'language', coalesce(recovered_lang, 'en-US'),
        'durationMs', e.audio_duration_ms,
        'quota', q
      );
    end if;
    return jsonb_build_object(
      'code', case when e.status = 'reserved' then 'REQUEST_IN_PROGRESS' else e.error_code end,
      'quota', q,
      'terminal', e.status <> 'reserved'
    );
  end if;

  if not (q->>'enabled')::boolean then
    return jsonb_build_object('code', 'STT_DISABLED', 'quota', q);
  end if;

  select * into strict s from public.stt_runtime_settings where id;
  if (select count(*) from public.stt_usage_events where user_id=p_user and created_at > now() - interval '1 minute') >= s.requests_per_minute then
    return jsonb_build_object('code', 'RATE_LIMITED', 'quota', q);
  end if;

  select * into strict m from public.stt_model_catalog where provider=s.default_provider and model=s.default_model;

  if (q->>'remainingMs')::bigint < p_duration_ms then
    insert into public.stt_usage_events(
      request_id, user_id, audio_hash, source, effective_plan, period_start, provider, model, status,
      audio_duration_ms, pricing_snapshot, error_code, completed_at
    ) values (
      p_request, p_user, p_hash, p_source, 'free', d, m.provider, m.model, 'quota_blocked',
      p_duration_ms,
      jsonb_build_object('input', m.input_cost_per_million_microusd, 'output', m.output_cost_per_million_microusd, 'per_second', m.estimated_cost_per_second_microusd),
      'DAILY_STT_QUOTA_EXCEEDED', now()
    );
    return jsonb_build_object('code', 'DAILY_STT_QUOTA_EXCEEDED', 'quota', q, 'terminal', true);
  end if;

  insert into public.stt_usage_events(
    request_id, user_id, audio_hash, source, effective_plan, period_start, provider, model, status,
    audio_duration_ms, pricing_snapshot
  ) values (
    p_request, p_user, p_hash, p_source, 'free', d, m.provider, m.model, 'reserved',
    p_duration_ms,
    jsonb_build_object('input', m.input_cost_per_million_microusd, 'output', m.output_cost_per_million_microusd, 'per_second', m.estimated_cost_per_second_microusd)
  ) returning * into e;

  insert into public.stt_usage_buckets(user_id, period_start, reserved_ms)
  values(p_user, d, p_duration_ms)
  on conflict(user_id, period_start) do update
  set reserved_ms = public.stt_usage_buckets.reserved_ms + p_duration_ms, updated_at = now();

  return jsonb_build_object(
    'code', 'RESERVED',
    'provider', e.provider,
    'model', e.model,
    'durationMs', p_duration_ms,
    'quota', public.stt_quota(p_user)
  );
end $$;

-- 8. RPC: Finalize STT Usage
create function public.finalize_stt_usage(
  p_user uuid,
  p_request uuid,
  p_transcript text default null,
  p_attempt uuid default null,
  p_duration_ms integer default null,
  p_input integer default null,
  p_output integer default null,
  p_latency integer default 0,
  p_error text default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  e public.stt_usage_events;
  cost bigint;
  q jsonb;
  recovered text;
  recovered_lang text;
  actual_duration integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 3201));
  select * into strict e from public.stt_usage_events where request_id=p_request and user_id=p_user for update;
  q := public.stt_quota(p_user);

  if e.status <> 'reserved' then
    select transcript, language into recovered, recovered_lang from public.stt_results where usage_event_id = e.id;
    return jsonb_build_object('code', e.status, 'quota', q, 'transcript', recovered, 'language', coalesce(recovered_lang, 'en-US'));
  end if;

  if (p_transcript is null) = (p_error is null) then
    raise exception 'INVALID_FINALIZATION';
  end if;

  actual_duration := coalesce(p_duration_ms, e.audio_duration_ms);

  if p_input is not null and p_output is not null then
    cost := ceil((p_input::numeric * (e.pricing_snapshot->>'input')::numeric + p_output::numeric * (e.pricing_snapshot->>'output')::numeric) / 1000000);
  elsif actual_duration > 0 and e.pricing_snapshot->>'per_second' is not null then
    cost := ceil((actual_duration::numeric / 1000.0) * (e.pricing_snapshot->>'per_second')::numeric);
  end if;

  if p_transcript is not null then
    insert into public.stt_results(user_id, usage_event_id, transcript, language)
    values(p_user, e.id, p_transcript, 'en-US');

    update public.stt_usage_events set
      status = 'succeeded',
      audio_duration_ms = actual_duration,
      input_tokens = p_input,
      output_tokens = p_output,
      latency_ms = p_latency,
      estimated_cost_microusd = cost,
      completed_at = now()
    where id = e.id;

    update public.stt_usage_buckets set
      reserved_ms = greatest(0, reserved_ms - e.audio_duration_ms),
      consumed_ms = consumed_ms + actual_duration,
      updated_at = now()
    where user_id = p_user and period_start = e.period_start;

    return jsonb_build_object(
      'code', 'succeeded',
      'transcript', p_transcript,
      'durationMs', actual_duration,
      'quota', public.stt_quota(p_user)
    );
  else
    update public.stt_usage_events set
      status = 'failed',
      latency_ms = p_latency,
      error_code = p_error,
      completed_at = now()
    where id = e.id;

    update public.stt_usage_buckets set
      reserved_ms = greatest(0, reserved_ms - e.audio_duration_ms),
      updated_at = now()
    where user_id = p_user and period_start = e.period_start;

    return jsonb_build_object(
      'code', 'failed',
      'quota', public.stt_quota(p_user)
    );
  end if;
end $$;

-- 9. Admin Overview
create function public.admin_stt_overview() returns jsonb
language sql security definer set search_path = '' as $$
with bounds as (select (now() at time zone 'Asia/Seoul')::date d),
events as (select e.* from public.stt_usage_events e, bounds b where e.created_at >= ((b.d-6)::timestamp at time zone 'Asia/Seoul')),
today as (select e.* from events e, bounds b where e.created_at >= (b.d::timestamp at time zone 'Asia/Seoul')),
days as (select generate_series(d-6, d, '1 day')::date as day from bounds)
select jsonb_build_object(
  'today', (select jsonb_build_object(
    'calls', count(*) filter(where status <> 'quota_blocked'),
    'succeeded', count(*) filter(where status = 'succeeded'),
    'failed', count(*) filter(where status = 'failed'),
    'users', count(distinct user_id) filter(where status <> 'quota_blocked'),
    'audioDurationMs', coalesce(sum(audio_duration_ms) filter(where status = 'succeeded'), 0),
    'audioMinutes', round(coalesce(sum(audio_duration_ms) filter(where status = 'succeeded'), 0) / 60000.0, 1),
    'cost', sum(estimated_cost_microusd),
    'unknownCost', count(*) filter(where status in ('succeeded','failed') and estimated_cost_microusd is null),
    'blocked', count(*) filter(where status = 'quota_blocked'),
    'avgLatency', avg(latency_ms),
    'p95Latency', percentile_cont(0.95) within group(order by latency_ms)
  ) from today),
  'days', (select jsonb_agg(t order by day) from (
    select day,
      count(e.id) filter(where status <> 'quota_blocked') calls,
      round(coalesce(sum(audio_duration_ms) filter(where status = 'succeeded'), 0) / 60000.0, 1) minutes,
      sum(estimated_cost_microusd) cost
    from days left join events e on (e.created_at at time zone 'Asia/Seoul')::date = day
    group by day
  ) t),
  'models', (select coalesce(jsonb_agg(t), '[]') from (
    select model, count(*) calls, sum(estimated_cost_microusd) cost from events group by model
  ) t),
  'sources', (select coalesce(jsonb_agg(t), '[]') from (
    select source, count(*) calls from events group by source
  ) t),
  'failures', (select coalesce(jsonb_agg(t), '[]') from (
    select request_id, model, error_code, created_at from events where status = 'failed' order by created_at desc limit 10
  ) t),
  'users', (select coalesce(jsonb_agg(t), '[]') from (
    select user_id, count(*) calls from events where status = 'succeeded' group by user_id order by count(*) desc limit 10
  ) t)
);
$$;

-- 10. Admin Update STT Settings
create function public.admin_update_stt(p_admin uuid, p_patch jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  before_state jsonb;
begin
  if not exists(select 1 from public.admin_users where user_id = p_admin and role in ('owner', 'admin')) then
    raise exception 'FORBIDDEN';
  end if;
  if jsonb_typeof(p_patch) <> 'object' or p_patch - array['enabled', 'model', 'limits'] <> '{}'::jsonb or p_patch = '{}'::jsonb then
    raise exception 'INVALID_SETTINGS';
  end if;
  select to_jsonb(s) into before_state from public.stt_runtime_settings s where id for update;
  if p_patch ? 'enabled' and jsonb_typeof(p_patch->'enabled') <> 'boolean' then
    raise exception 'INVALID_SETTINGS';
  end if;
  if p_patch ? 'model' and not exists(select 1 from public.stt_model_catalog where provider = 'gemini' and model = p_patch->>'model' and enabled) then
    raise exception 'INVALID_MODEL';
  end if;
  if p_patch ? 'limits' then
    if jsonb_typeof(p_patch->'limits') <> 'object' or p_patch->'limits' - array['free', 'pro'] <> '{}'::jsonb then
      raise exception 'INVALID_SETTINGS';
    end if;
    if (p_patch->'limits' ? 'free') and ((p_patch->'limits'->>'free')::bigint < 0 or (p_patch->'limits'->>'free')::bigint > 86400000) then
      raise exception 'INVALID_SETTINGS';
    end if;
    if (p_patch->'limits' ? 'pro') and ((p_patch->'limits'->>'pro')::bigint < 0 or (p_patch->'limits'->>'pro')::bigint > 86400000) then
      raise exception 'INVALID_SETTINGS';
    end if;
  end if;

  update public.stt_runtime_settings set
    managed_stt_enabled = coalesce((p_patch->>'enabled')::boolean, managed_stt_enabled),
    default_model = coalesce(p_patch->>'model', default_model),
    daily_limit_ms_free = coalesce((p_patch->'limits'->>'free')::bigint, daily_limit_ms_free),
    daily_limit_ms_pro = coalesce((p_patch->'limits'->>'pro')::bigint, daily_limit_ms_pro),
    updated_by = p_admin,
    updated_at = now()
  where id;

  insert into public.admin_audit_logs(admin_user_id, action, target_type, target_id, metadata)
  values(p_admin, 'update_stt_settings', 'stt_runtime_settings', 'true', jsonb_build_object('before', before_state, 'patch', p_patch));
end $$;

-- Revoke & Grant function permissions
revoke all on function public.stt_quota(uuid),
  public.reserve_stt_usage(uuid, uuid, text, integer, text),
  public.finalize_stt_usage(uuid, uuid, text, uuid, integer, integer, integer, integer, text),
  public.admin_stt_overview(),
  public.admin_update_stt(uuid, jsonb) from public, anon, authenticated;

grant execute on function public.stt_quota(uuid),
  public.reserve_stt_usage(uuid, uuid, text, integer, text),
  public.finalize_stt_usage(uuid, uuid, text, uuid, integer, integer, integer, integer, text),
  public.admin_stt_overview(),
  public.admin_update_stt(uuid, jsonb) to service_role;

commit;
