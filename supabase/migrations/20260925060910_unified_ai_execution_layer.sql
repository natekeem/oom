begin;

alter table public.ai_plan_limits drop constraint ai_plan_limits_feature_check;
alter table public.ai_plan_limits add constraint ai_plan_limits_feature_check
  check (feature in ('answer_feedback','script_rewrite','roleplay_question'));
alter table public.ai_usage_buckets drop constraint ai_usage_buckets_feature_check;
alter table public.ai_usage_buckets add constraint ai_usage_buckets_feature_check
  check (feature in ('answer_feedback','script_rewrite','roleplay_question'));
alter table public.ai_usage_events drop constraint ai_usage_events_feature_check;
alter table public.ai_usage_events add constraint ai_usage_events_feature_check
  check (feature in ('answer_feedback','script_rewrite','roleplay_question'));

insert into public.ai_plan_limits(plan,feature,limit_count) values
  ('free','script_rewrite',3),('pro','script_rewrite',30),
  ('free','roleplay_question',3),('pro','roleplay_question',30)
on conflict (plan,feature) do nothing;

create table public.ai_generation_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_event_id uuid not null unique,
  feature text not null check (feature in ('script_rewrite','roleplay_question')),
  schema_version integer not null default 1 check (schema_version = 1),
  prompt_version text not null,
  provider text not null,
  model text not null,
  result jsonb not null check (jsonb_typeof(result) = 'object' and octet_length(result::text) <= 30000),
  created_at timestamptz not null default now(),
  foreign key (usage_event_id,user_id) references public.ai_usage_events(id,user_id) on delete cascade
);
create index ai_generation_results_user_created_idx on public.ai_generation_results(user_id,created_at desc);
alter table public.ai_generation_results enable row level security;
revoke all on public.ai_generation_results from public, anon, authenticated;
grant all on public.ai_generation_results to service_role;

drop function public.ai_quota(uuid);
drop function public.reserve_ai_usage(uuid,uuid,text);
drop function public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text,integer);

create function public.ai_quota(p_user uuid,p_feature text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d date := (now() at time zone 'Asia/Seoul')::date; l public.ai_plan_limits; b public.ai_usage_buckets; r record; enabled boolean;
begin
  if p_user is null or p_feature not in ('answer_feedback','script_rewrite','roleplay_question') then raise exception 'INVALID_REQUEST'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,3101));
  for r in update public.ai_usage_events set status='failed',error_code='RESERVATION_EXPIRED',completed_at=now()
    where user_id=p_user and status='reserved' and expires_at < now() returning period_start,feature loop
    update public.ai_usage_buckets set reserved_count=greatest(0,reserved_count-1),updated_at=now()
      where user_id=p_user and feature=r.feature and period_start=r.period_start;
  end loop;
  select * into strict l from public.ai_plan_limits where plan='free' and feature=p_feature;
  select * into b from public.ai_usage_buckets where user_id=p_user and feature=p_feature and period_start=d;
  select s.managed_ai_enabled and l.enabled and m.enabled into enabled from public.ai_runtime_settings s
    join public.ai_model_catalog m on (m.provider,m.model)=(s.default_provider,s.default_model) where s.id;
  return jsonb_build_object('feature',p_feature,'plan','free','limit',l.limit_count,'used',coalesce(b.consumed_count,0),
    'reserved',coalesce(b.reserved_count,0),'remaining',greatest(0,l.limit_count-coalesce(b.consumed_count,0)-coalesce(b.reserved_count,0)),
    'resetsAt',((d+1)::timestamp at time zone 'Asia/Seoul'),'enabled',enabled);
end $$;

create function public.reserve_ai_usage(p_user uuid,p_request uuid,p_hash text,p_feature text,p_prompt_version text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare q jsonb; e public.ai_usage_events; s public.ai_runtime_settings; m public.ai_model_catalog; d date := (now() at time zone 'Asia/Seoul')::date; recovered jsonb;
begin
  if p_request is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$'
    or p_feature not in ('answer_feedback','script_rewrite','roleplay_question')
    or p_prompt_version is null or length(p_prompt_version) not between 1 and 100 then raise exception 'INVALID_REQUEST'; end if;
  q := public.ai_quota(p_user,p_feature);
  select * into e from public.ai_usage_events where request_id=p_request;
  if found then
    if e.user_id<>p_user or e.input_hash<>p_hash or e.feature<>p_feature then return jsonb_build_object('code','IDEMPOTENCY_CONFLICT'); end if;
    if e.status='succeeded' then
      select case when e.feature='answer_feedback'
        then (select feedback from public.ai_feedback where usage_event_id=e.id)
        else (select result from public.ai_generation_results where usage_event_id=e.id) end into recovered;
      return jsonb_build_object('code','RECOVERED','result',recovered,'quota',q);
    end if;
    return jsonb_build_object('code',case when e.status='reserved' then 'REQUEST_IN_PROGRESS' else e.error_code end,'quota',q,'terminal',e.status<>'reserved');
  end if;
  if not (q->>'enabled')::boolean then return jsonb_build_object('code','AI_DISABLED','quota',q); end if;
  select * into strict s from public.ai_runtime_settings where id;
  if (select count(*) from public.ai_usage_events where user_id=p_user and created_at>now()-interval '1 minute') >= s.requests_per_minute then
    return jsonb_build_object('code','RATE_LIMITED','quota',q);
  end if;
  select * into strict m from public.ai_model_catalog where provider=s.default_provider and model=s.default_model;
  insert into public.ai_usage_events(request_id,user_id,input_hash,feature,effective_plan,period_start,provider,model,status,pricing_snapshot,error_code,completed_at,prompt_version)
  values(p_request,p_user,p_hash,p_feature,'free',d,m.provider,m.model,case when (q->>'remaining')::integer>0 then 'reserved' else 'quota_blocked' end,
    jsonb_build_object('input',m.input_cost_per_million_microusd,'output',m.output_cost_per_million_microusd,'cached',m.cached_input_cost_per_million_microusd),
    case when (q->>'remaining')::integer=0 then 'DAILY_QUOTA_EXCEEDED' end,case when (q->>'remaining')::integer=0 then now() end,p_prompt_version) returning * into e;
  if e.status='quota_blocked' then return jsonb_build_object('code','DAILY_QUOTA_EXCEEDED','quota',q,'terminal',true); end if;
  insert into public.ai_usage_buckets(user_id,feature,period_start,reserved_count) values(p_user,p_feature,d,1)
    on conflict(user_id,feature,period_start) do update set reserved_count=public.ai_usage_buckets.reserved_count+1,updated_at=now();
  return jsonb_build_object('code','RESERVED','provider',e.provider,'model',e.model,'quota',public.ai_quota(p_user,p_feature));
end $$;

create function public.finalize_ai_usage(p_user uuid,p_request uuid,p_result jsonb default null,p_attempt uuid default null,
  p_input integer default null,p_output integer default null,p_cached integer default null,p_latency integer default 0,p_error text default null,p_thought integer default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare e public.ai_usage_events; cost bigint; q jsonb; recovered jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,3101));
  select * into strict e from public.ai_usage_events where request_id=p_request and user_id=p_user for update;
  q := public.ai_quota(p_user,e.feature);
  if e.status <> 'reserved' then
    select case when e.feature='answer_feedback'
      then (select feedback from public.ai_feedback where usage_event_id=e.id)
      else (select result from public.ai_generation_results where usage_event_id=e.id) end into recovered;
    return jsonb_build_object('code',e.status,'quota',q,'result',recovered);
  end if;
  if (p_result is null) = (p_error is null) then raise exception 'INVALID_FINALIZATION'; end if;
  if e.feature<>'answer_feedback' and p_attempt is not null then raise exception 'INVALID_ATTEMPT'; end if;
  if p_input is not null and p_output is not null and (coalesce(p_cached,0)=0 or e.pricing_snapshot->>'cached' is not null) then
    cost := ceil((greatest(0,p_input-coalesce(p_cached,0))::numeric*(e.pricing_snapshot->>'input')::numeric +
      (p_output::numeric+coalesce(p_thought,0))*(e.pricing_snapshot->>'output')::numeric + coalesce(p_cached,0)::numeric*coalesce((e.pricing_snapshot->>'cached')::numeric,0))/1000000);
  end if;
  if p_result is not null and e.feature='answer_feedback' then
    insert into public.ai_feedback(user_id,usage_event_id,learning_attempt_id,feature,prompt_version,provider,model,feedback)
      values(p_user,e.id,p_attempt,e.feature,e.prompt_version,e.provider,e.model,p_result);
  elsif p_result is not null then
    insert into public.ai_generation_results(user_id,usage_event_id,feature,prompt_version,provider,model,result)
      values(p_user,e.id,e.feature,e.prompt_version,e.provider,e.model,p_result);
  end if;
  update public.ai_usage_events set status=case when p_error is null then 'succeeded' else 'failed' end,
    input_tokens=p_input,output_tokens=p_output,thought_tokens=p_thought,cached_input_tokens=p_cached,latency_ms=p_latency,
    estimated_cost_microusd=cost,error_code=p_error,completed_at=now() where id=e.id;
  update public.ai_usage_buckets set reserved_count=greatest(0,reserved_count-1),consumed_count=consumed_count+case when p_error is null then 1 else 0 end,updated_at=now()
    where user_id=p_user and feature=e.feature and period_start=e.period_start;
  return jsonb_build_object('code',case when p_error is null then 'succeeded' else 'failed' end,'result',p_result,'quota',public.ai_quota(p_user,e.feature));
end $$;

create or replace function public.admin_update_ai(p_admin uuid,p_patch jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare before_state jsonb; before_limits jsonb; feature_key text; feature_limits jsonb; plan_key text; limit_value integer;
begin
  if not exists(select 1 from public.admin_users where user_id=p_admin and role in ('owner','admin')) then raise exception 'FORBIDDEN'; end if;
  if jsonb_typeof(p_patch)<>'object' or p_patch - array['enabled','model','limits'] <> '{}'::jsonb or p_patch='{}'::jsonb then raise exception 'INVALID_SETTINGS'; end if;
  select to_jsonb(s) into before_state from public.ai_runtime_settings s where id for update;
  select jsonb_agg(to_jsonb(l) order by l.feature,l.plan) into before_limits from public.ai_plan_limits l;
  if p_patch ? 'enabled' and jsonb_typeof(p_patch->'enabled')<>'boolean' then raise exception 'INVALID_SETTINGS'; end if;
  if p_patch ? 'model' and not exists(select 1 from public.ai_model_catalog where provider='gemini' and model=p_patch->>'model' and enabled) then raise exception 'INVALID_MODEL'; end if;
  if p_patch ? 'limits' then
    if jsonb_typeof(p_patch->'limits')<>'object' then raise exception 'INVALID_SETTINGS'; end if;
    for feature_key,feature_limits in select key,value from jsonb_each(p_patch->'limits') loop
      if feature_key not in ('answer_feedback','script_rewrite','roleplay_question') or jsonb_typeof(feature_limits)<>'object'
        or feature_limits - array['free','pro'] <> '{}'::jsonb or feature_limits='{}'::jsonb then raise exception 'INVALID_SETTINGS'; end if;
      for plan_key in select jsonb_object_keys(feature_limits) loop
        if jsonb_typeof(feature_limits->plan_key)<>'number' then raise exception 'INVALID_SETTINGS'; end if;
        limit_value := (feature_limits->>plan_key)::integer;
        if limit_value < 0 or limit_value > 1000 or limit_value::text <> feature_limits->>plan_key then raise exception 'INVALID_SETTINGS'; end if;
        update public.ai_plan_limits set limit_count=limit_value,updated_by=p_admin,updated_at=now()
          where plan=plan_key and feature=feature_key;
        if not found then raise exception 'INVALID_SETTINGS'; end if;
      end loop;
    end loop;
  end if;
  update public.ai_runtime_settings set managed_ai_enabled=coalesce((p_patch->>'enabled')::boolean,managed_ai_enabled),
    default_model=coalesce(p_patch->>'model',default_model),updated_by=p_admin,updated_at=now() where id;
  insert into public.admin_audit_logs(admin_user_id,action,target_type,target_id,metadata)
    values(p_admin,'update_ai_settings','ai_runtime_settings','true',jsonb_build_object('before',before_state,'beforeLimits',before_limits,'patch',p_patch));
end $$;

revoke all on function public.ai_quota(uuid,text),public.reserve_ai_usage(uuid,uuid,text,text,text),
  public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text,integer) from public,anon,authenticated;
grant execute on function public.ai_quota(uuid,text),public.reserve_ai_usage(uuid,uuid,text,text,text),
  public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text,integer) to service_role;

commit;
