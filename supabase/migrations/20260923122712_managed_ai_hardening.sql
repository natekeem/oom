begin;
-- Historical output totals cannot be disentangled; leave existing thought_tokens unknown.
alter table public.ai_usage_events add column thought_tokens integer check(thought_tokens >= 0);
-- Replace the signature atomically to avoid ambiguous PostgREST overload resolution.
drop function public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text);
create function public.finalize_ai_usage(p_user uuid,p_request uuid,p_feedback jsonb default null,p_attempt uuid default null,
  p_input integer default null,p_output integer default null,p_cached integer default null,p_latency integer default 0,p_error text default null,p_thought integer default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare e public.ai_usage_events; cost bigint; q jsonb;
begin
  q := public.ai_quota(p_user);
  select * into strict e from public.ai_usage_events where request_id=p_request and user_id=p_user for update;
  if e.status <> 'reserved' then return jsonb_build_object('code',e.status,'quota',q,'feedback',(select feedback from public.ai_feedback where usage_event_id=e.id)); end if;
  if (p_feedback is null) = (p_error is null) then raise exception 'INVALID_FINALIZATION'; end if;
  if p_input is not null and p_output is not null and (coalesce(p_cached,0)=0 or e.pricing_snapshot->>'cached' is not null) then
    cost := ceil((greatest(0,p_input-coalesce(p_cached,0))::numeric*(e.pricing_snapshot->>'input')::numeric +
      (p_output::numeric+coalesce(p_thought,0))*(e.pricing_snapshot->>'output')::numeric + coalesce(p_cached,0)::numeric*coalesce((e.pricing_snapshot->>'cached')::numeric,0))/1000000);
  end if;
  if p_feedback is not null then
    insert into public.ai_feedback(user_id,usage_event_id,learning_attempt_id,prompt_version,provider,model,feedback)
      values(p_user,e.id,p_attempt,e.prompt_version,e.provider,e.model,p_feedback);
  end if;
  update public.ai_usage_events set status=case when p_error is null then 'succeeded' else 'failed' end,
    input_tokens=p_input,output_tokens=p_output,thought_tokens=p_thought,cached_input_tokens=p_cached,latency_ms=p_latency,
    estimated_cost_microusd=cost,error_code=p_error,completed_at=now() where id=e.id;
  update public.ai_usage_buckets set reserved_count=reserved_count-1,consumed_count=consumed_count+case when p_error is null then 1 else 0 end,updated_at=now()
    where user_id=p_user and feature=e.feature and period_start=e.period_start;
  return jsonb_build_object('code',case when p_error is null then 'succeeded' else 'failed' end,'feedback',p_feedback,'quota',public.ai_quota(p_user));
end $$;


create or replace function public.admin_ai_overview() returns jsonb
language sql security definer set search_path = '' as $$
with bounds as (select (now() at time zone 'Asia/Seoul')::date d),
events as (select e.* from public.ai_usage_events e,bounds b where e.created_at >= ((b.d-6)::timestamp at time zone 'Asia/Seoul')),
today as (select e.* from events e,bounds b where e.created_at >= (b.d::timestamp at time zone 'Asia/Seoul')),
days as (select generate_series(d-6,d,'1 day')::date as day from bounds)
select jsonb_build_object(
 'today',(select jsonb_build_object('calls',count(*) filter(where status<>'quota_blocked'),'succeeded',count(*) filter(where status='succeeded'),
 'failed',count(*) filter(where status='failed'),'users',count(distinct user_id) filter(where status<>'quota_blocked'),
 'inputTokens',sum(input_tokens),'outputTokens',sum(output_tokens),'thoughtTokens',sum(thought_tokens),'cost',sum(estimated_cost_microusd),
 'unknownCost',count(*) filter(where status in ('succeeded','failed') and estimated_cost_microusd is null),'blocked',count(*) filter(where status='quota_blocked'),
 'avgLatency',avg(latency_ms),'p95Latency',percentile_cont(0.95) within group(order by latency_ms)) from today),
 'days',(select jsonb_agg(t order by day) from (select day,count(e.id) filter(where status<>'quota_blocked') calls,sum(estimated_cost_microusd) cost from days left join events e on (e.created_at at time zone 'Asia/Seoul')::date=day group by day)t),
 'models',(select coalesce(jsonb_agg(t),'[]') from (select model,count(*) calls,sum(estimated_cost_microusd) cost from events group by model)t),
 'features',(select coalesce(jsonb_agg(t),'[]') from (select feature,count(*) calls from events group by feature)t),
 'failures',(select coalesce(jsonb_agg(t),'[]') from (select request_id,model,error_code,created_at from events where status='failed' order by created_at desc limit 10)t),
 'users',(select coalesce(jsonb_agg(t),'[]') from (select user_id,count(*) calls from events where status='succeeded' group by user_id order by count(*) desc limit 10)t)
);
$$;

revoke all on function public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text,integer) from public,anon,authenticated;
grant execute on function public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text,integer) to service_role;
commit;
