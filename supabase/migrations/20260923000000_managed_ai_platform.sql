begin;

create table public.ai_plan_limits (
  plan text not null check (plan in ('free','pro')),
  feature text not null check (feature = 'answer_feedback'),
  period text not null default 'daily' check (period = 'daily'),
  limit_count integer not null check (limit_count between 0 and 1000),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (plan, feature)
);
insert into public.ai_plan_limits(plan,feature,limit_count) values ('free','answer_feedback',3),('pro','answer_feedback',30);
create table public.ai_model_catalog (
  provider text not null check (provider = 'gemini'),
  model text not null check (model ~ '^gemini-[a-z0-9.-]{1,80}$'),
  enabled boolean not null default true,
  input_cost_per_million_microusd bigint not null check (input_cost_per_million_microusd between 0 and 1000000000),
  output_cost_per_million_microusd bigint not null check (output_cost_per_million_microusd between 0 and 1000000000),
  cached_input_cost_per_million_microusd bigint check (cached_input_cost_per_million_microusd between 0 and 1000000000),
  currency text not null default 'USD' check (currency = 'USD'),
  pricing_note text not null check (length(pricing_note) <= 500),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (provider,model)
);
insert into public.ai_model_catalog(provider,model,input_cost_per_million_microusd,output_cost_per_million_microusd,cached_input_cost_per_million_microusd,pricing_note)
values ('gemini','gemini-3.5-flash-lite',300000,2500000,30000,'Standard paid text pricing verified 2026-09-21: https://ai.google.dev/gemini-api/docs/pricing ; estimate, not invoice'),
 ('gemini','gemini-3.1-flash-lite',250000,1500000,25000,'Alternative stable model; Standard paid text pricing verified 2026-09-21: https://ai.google.dev/gemini-api/docs/pricing ; estimate, not invoice');
create table public.ai_runtime_settings (
  id boolean primary key default true check (id),
  managed_ai_enabled boolean not null default false,
  default_provider text not null default 'gemini',
  default_model text not null default 'gemini-3.5-flash-lite',
  requests_per_minute integer not null default 5 check (requests_per_minute between 1 and 60),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  foreign key(default_provider,default_model) references public.ai_model_catalog(provider,model)
);
insert into public.ai_runtime_settings(id) values (true);
-- No subscription or display-plan override: all learners resolve to FREE in v1.
create table public.ai_usage_buckets (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature = 'answer_feedback'),
  period_start date not null,
  reserved_count integer not null default 0 check (reserved_count >= 0),
  consumed_count integer not null default 0 check (consumed_count >= 0),
  updated_at timestamptz not null default now(),
  primary key(user_id,feature,period_start)
);
create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  feature text not null default 'answer_feedback' check (feature = 'answer_feedback'),
  effective_plan text not null check (effective_plan in ('free','pro')),
  period_start date not null,
  provider text not null,
  model text not null,
  status text not null check (status in ('reserved','succeeded','failed','quota_blocked')),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  cached_input_tokens integer check (cached_input_tokens >= 0),
  latency_ms integer check (latency_ms >= 0),
  estimated_cost_microusd bigint check (estimated_cost_microusd >= 0),
  pricing_snapshot jsonb not null,
  error_code text check (error_code is null or error_code in ('DAILY_QUOTA_EXCEEDED','PROVIDER_TIMEOUT','PROVIDER_UNAVAILABLE','INVALID_AI_RESPONSE','SERVER_ERROR','RESERVATION_EXPIRED')),
  prompt_version text not null default 'opic_answer_feedback_v1',
  schema_version integer not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 minutes'),
  completed_at timestamptz,
  unique(id,user_id)
);
alter table public.learning_attempts add constraint learning_attempts_id_user_unique unique(id,user_id);
create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_event_id uuid not null unique,
  learning_attempt_id uuid,
  feature text not null default 'answer_feedback' check (feature = 'answer_feedback'),
  schema_version integer not null default 1 check (schema_version = 1),
  prompt_version text not null,
  provider text not null,
  model text not null,
  feedback jsonb not null check (jsonb_typeof(feedback) = 'object' and octet_length(feedback::text) <= 30000),
  created_at timestamptz not null default now(),
  foreign key (usage_event_id,user_id) references public.ai_usage_events(id,user_id) on delete cascade,
  foreign key (learning_attempt_id,user_id) references public.learning_attempts(id,user_id)
);
create index ai_usage_user_created_idx on public.ai_usage_events(user_id,created_at desc);
create index ai_usage_created_idx on public.ai_usage_events(created_at desc);
create index ai_usage_status_created_idx on public.ai_usage_events(status,created_at desc);
create index ai_usage_model_created_idx on public.ai_usage_events(model,created_at desc);
create index ai_feedback_user_created_idx on public.ai_feedback(user_id,created_at desc);
create index ai_feedback_attempt_idx on public.ai_feedback(learning_attempt_id,user_id);

-- All data access goes through authenticated Edge gateways, never browser writes/reads.
do $$ declare t text; begin
  foreach t in array array['ai_plan_limits','ai_model_catalog','ai_runtime_settings','ai_usage_buckets','ai_usage_events','ai_feedback'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;

-- Same per-user lock order in reserve, quota/expiry and finalize. Hash collisions only serialize.
create function public.ai_quota(p_user uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d date := (now() at time zone 'Asia/Seoul')::date; l public.ai_plan_limits; b public.ai_usage_buckets; r record; enabled boolean;
begin
  if p_user is null then raise exception 'INVALID_USER'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,3101));
  -- Recover abandoned invocations; tombstones prevent the same UUID calling a provider again.
  for r in update public.ai_usage_events set status='failed',error_code='RESERVATION_EXPIRED',completed_at=now()
    where user_id=p_user and status='reserved' and expires_at < now() returning period_start,feature loop
    update public.ai_usage_buckets set reserved_count=reserved_count-1,updated_at=now()
      where user_id=p_user and feature=r.feature and period_start=r.period_start;
  end loop;
  select * into strict l from public.ai_plan_limits where plan='free' and feature='answer_feedback';
  select * into b from public.ai_usage_buckets where user_id=p_user and feature='answer_feedback' and period_start=d;
  select s.managed_ai_enabled and l.enabled and m.enabled into enabled from public.ai_runtime_settings s
    join public.ai_model_catalog m on (m.provider,m.model)=(s.default_provider,s.default_model) where s.id;
  return jsonb_build_object('feature','answer_feedback','plan','free','limit',l.limit_count,'used',coalesce(b.consumed_count,0),
    'reserved',coalesce(b.reserved_count,0),'remaining',greatest(0,l.limit_count-coalesce(b.consumed_count,0)-coalesce(b.reserved_count,0)),
    'resetsAt',((d+1)::timestamp at time zone 'Asia/Seoul'),'enabled',enabled);
end $$;

create function public.reserve_ai_usage(p_user uuid,p_request uuid,p_hash text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare q jsonb; e public.ai_usage_events; s public.ai_runtime_settings; m public.ai_model_catalog; d date := (now() at time zone 'Asia/Seoul')::date;
begin
  if p_request is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_REQUEST'; end if;
  q := public.ai_quota(p_user);
  select * into e from public.ai_usage_events where request_id=p_request;
  if found then
    if e.user_id<>p_user or e.input_hash<>p_hash then return jsonb_build_object('code','IDEMPOTENCY_CONFLICT'); end if;
    if e.status='succeeded' then return jsonb_build_object('code','RECOVERED','feedback',(select feedback from public.ai_feedback where usage_event_id=e.id),'quota',q); end if;
    return jsonb_build_object('code',case when e.status='reserved' then 'REQUEST_IN_PROGRESS' else e.error_code end,'quota',q,'terminal',e.status<>'reserved');
  end if;
  if not (q->>'enabled')::boolean then return jsonb_build_object('code','AI_DISABLED','quota',q); end if;
  select * into strict s from public.ai_runtime_settings where id;
  if (select count(*) from public.ai_usage_events where user_id=p_user and created_at>now()-interval '1 minute') >= s.requests_per_minute then
    return jsonb_build_object('code','RATE_LIMITED','quota',q);
  end if;
  select * into strict m from public.ai_model_catalog where provider=s.default_provider and model=s.default_model;
  insert into public.ai_usage_events(request_id,user_id,input_hash,effective_plan,period_start,provider,model,status,pricing_snapshot,error_code,completed_at)
  values(p_request,p_user,p_hash,'free',d,m.provider,m.model,case when (q->>'remaining')::integer>0 then 'reserved' else 'quota_blocked' end,
    jsonb_build_object('input',m.input_cost_per_million_microusd,'output',m.output_cost_per_million_microusd,'cached',m.cached_input_cost_per_million_microusd),
    case when (q->>'remaining')::integer=0 then 'DAILY_QUOTA_EXCEEDED' end,case when (q->>'remaining')::integer=0 then now() end) returning * into e;
  if e.status='quota_blocked' then return jsonb_build_object('code','DAILY_QUOTA_EXCEEDED','quota',q,'terminal',true); end if;
  insert into public.ai_usage_buckets(user_id,feature,period_start,reserved_count) values(p_user,'answer_feedback',d,1)
    on conflict(user_id,feature,period_start) do update set reserved_count=public.ai_usage_buckets.reserved_count+1,updated_at=now();
  return jsonb_build_object('code','RESERVED','provider',e.provider,'model',e.model,'quota',public.ai_quota(p_user));
end $$;

create function public.finalize_ai_usage(p_user uuid,p_request uuid,p_feedback jsonb default null,p_attempt uuid default null,
  p_input integer default null,p_output integer default null,p_cached integer default null,p_latency integer default 0,p_error text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare e public.ai_usage_events; cost bigint; q jsonb;
begin
  q := public.ai_quota(p_user);
  select * into strict e from public.ai_usage_events where request_id=p_request and user_id=p_user for update;
  if e.status <> 'reserved' then return jsonb_build_object('code',e.status,'quota',q,'feedback',(select feedback from public.ai_feedback where usage_event_id=e.id)); end if;
  if (p_feedback is null) = (p_error is null) then raise exception 'INVALID_FINALIZATION'; end if;
  if p_input is not null and p_output is not null and (coalesce(p_cached,0)=0 or e.pricing_snapshot->>'cached' is not null) then
    cost := ceil((greatest(0,p_input-coalesce(p_cached,0))::numeric*(e.pricing_snapshot->>'input')::numeric +
      p_output::numeric*(e.pricing_snapshot->>'output')::numeric + coalesce(p_cached,0)::numeric*coalesce((e.pricing_snapshot->>'cached')::numeric,0))/1000000);
  end if;
  if p_feedback is not null then
    insert into public.ai_feedback(user_id,usage_event_id,learning_attempt_id,prompt_version,provider,model,feedback)
      values(p_user,e.id,p_attempt,e.prompt_version,e.provider,e.model,p_feedback);
  end if;
  update public.ai_usage_events set status=case when p_error is null then 'succeeded' else 'failed' end,
    input_tokens=p_input,output_tokens=p_output,cached_input_tokens=p_cached,latency_ms=p_latency,
    estimated_cost_microusd=cost,error_code=p_error,completed_at=now() where id=e.id;
  update public.ai_usage_buckets set reserved_count=reserved_count-1,consumed_count=consumed_count+case when p_error is null then 1 else 0 end,updated_at=now()
    where user_id=p_user and feature=e.feature and period_start=e.period_start;
  return jsonb_build_object('code',case when p_error is null then 'succeeded' else 'failed' end,'feedback',p_feedback,'quota',public.ai_quota(p_user));
end $$;

-- Settings mutation and audit are one transaction; role is rechecked in the database.
create function public.admin_update_ai(p_admin uuid,p_patch jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare before_state jsonb; before_limits jsonb;
begin
  if not exists(select 1 from public.admin_users where user_id=p_admin and role in ('owner','admin')) then raise exception 'FORBIDDEN'; end if;
  if jsonb_typeof(p_patch)<>'object' or p_patch - array['enabled','model','freeLimit','proLimit'] <> '{}'::jsonb or p_patch='{}'::jsonb then raise exception 'INVALID_SETTINGS'; end if;
  select to_jsonb(s) into before_state from public.ai_runtime_settings s where id for update;
  select jsonb_agg(to_jsonb(l)) into before_limits from public.ai_plan_limits l;
  if p_patch ? 'enabled' and jsonb_typeof(p_patch->'enabled')<>'boolean' then raise exception 'INVALID_SETTINGS'; end if;
  if p_patch ? 'model' and not exists(select 1 from public.ai_model_catalog where provider='gemini' and model=p_patch->>'model' and enabled) then raise exception 'INVALID_MODEL'; end if;
  update public.ai_runtime_settings set managed_ai_enabled=coalesce((p_patch->>'enabled')::boolean,managed_ai_enabled),
    default_model=coalesce(p_patch->>'model',default_model),updated_by=p_admin,updated_at=now() where id;
  if p_patch ? 'freeLimit' then update public.ai_plan_limits set limit_count=(p_patch->>'freeLimit')::integer,updated_by=p_admin,updated_at=now() where plan='free'; end if;
  if p_patch ? 'proLimit' then update public.ai_plan_limits set limit_count=(p_patch->>'proLimit')::integer,updated_by=p_admin,updated_at=now() where plan='pro'; end if;
  insert into public.admin_audit_logs(admin_user_id,action,target_type,target_id,metadata)
    values(p_admin,'update_ai_settings','ai_runtime_settings','true',jsonb_build_object('before',before_state,'beforeLimits',before_limits,'patch',p_patch));
end $$;

create function public.admin_ai_overview() returns jsonb
language sql security definer set search_path = '' as $$
with bounds as (select (now() at time zone 'Asia/Seoul')::date d),
events as (select e.* from public.ai_usage_events e,bounds b where e.created_at >= ((b.d-6)::timestamp at time zone 'Asia/Seoul')),
today as (select e.* from events e,bounds b where e.created_at >= (b.d::timestamp at time zone 'Asia/Seoul')),
days as (select generate_series(d-6,d,'1 day')::date as day from bounds)
select jsonb_build_object(
 'today',(select jsonb_build_object('calls',count(*) filter(where status<>'quota_blocked'),'succeeded',count(*) filter(where status='succeeded'),
 'failed',count(*) filter(where status='failed'),'users',count(distinct user_id) filter(where status<>'quota_blocked'),
 'inputTokens',sum(input_tokens),'outputTokens',sum(output_tokens),'cost',sum(estimated_cost_microusd),
 'unknownCost',count(*) filter(where status in ('succeeded','failed') and estimated_cost_microusd is null),'blocked',count(*) filter(where status='quota_blocked'),
 'avgLatency',avg(latency_ms),'p95Latency',percentile_cont(0.95) within group(order by latency_ms)) from today),
 'days',(select jsonb_agg(t order by day) from (select day,count(e.id) filter(where status<>'quota_blocked') calls,sum(estimated_cost_microusd) cost from days left join events e on (e.created_at at time zone 'Asia/Seoul')::date=day group by day)t),
 'models',(select coalesce(jsonb_agg(t),'[]') from (select model,count(*) calls,sum(estimated_cost_microusd) cost from events group by model)t),
 'features',(select coalesce(jsonb_agg(t),'[]') from (select feature,count(*) calls from events group by feature)t),
 'failures',(select coalesce(jsonb_agg(t),'[]') from (select request_id,model,error_code,created_at from events where status='failed' order by created_at desc limit 10)t),
 'users',(select coalesce(jsonb_agg(t),'[]') from (select user_id,count(*) calls from events where status='succeeded' group by user_id order by count(*) desc limit 10)t)
);
$$;
revoke all on function public.ai_quota(uuid),public.reserve_ai_usage(uuid,uuid,text),public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text),public.admin_update_ai(uuid,jsonb),public.admin_ai_overview() from public,anon,authenticated;
grant execute on function public.ai_quota(uuid),public.reserve_ai_usage(uuid,uuid,text),public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text),public.admin_update_ai(uuid,jsonb),public.admin_ai_overview() to service_role;
commit;
