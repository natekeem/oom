begin;
insert into auth.users(id,raw_user_meta_data) values ('32000000-0000-4000-a000-000000000001','{}');
update public.ai_runtime_settings set managed_ai_enabled=true;
insert into public.learning_sessions(id,user_id,mode) values ('32000000-0000-4000-b000-000000000001','32000000-0000-4000-a000-000000000001','quick_practice');
insert into public.learning_attempts(id,session_id,user_id,question_id,question_order,completed) values ('32000000-0000-4000-c000-000000000001','32000000-0000-4000-b000-000000000001','32000000-0000-4000-a000-000000000001','fixture',1,true);
select public.reserve_ai_usage('32000000-0000-4000-a000-000000000001','32000000-0000-4000-d000-000000000001',repeat('b',64),'answer_feedback','opic_answer_feedback_v1');
select public.finalize_ai_usage('32000000-0000-4000-a000-000000000001','32000000-0000-4000-d000-000000000001',p_result=>'{"schemaVersion":1}',p_attempt=>'32000000-0000-4000-c000-000000000001',p_input=>100,p_output=>20,p_cached=>10,p_thought=>5);
do $$
declare e public.ai_usage_events;
begin
 select * into strict e from public.ai_usage_events where request_id='32000000-0000-4000-d000-000000000001';
 if e.output_tokens <> 20 or e.thought_tokens <> 5 or e.cached_input_tokens <> 10 then raise exception 'Raw token telemetry changed'; end if;
 if e.estimated_cost_microusd <> ceil((90*(e.pricing_snapshot->>'input')::numeric+25*(e.pricing_snapshot->>'output')::numeric+10*(e.pricing_snapshot->>'cached')::numeric)/1000000) then raise exception 'Cost must include thought only in billing'; end if;
 if not exists(select 1 from public.ai_feedback where usage_event_id=e.id and learning_attempt_id='32000000-0000-4000-c000-000000000001') then raise exception 'Attempt link missing'; end if;
  if has_function_privilege('authenticated','public.finalize_ai_usage(uuid,uuid,jsonb,uuid,integer,integer,integer,integer,text,integer)','EXECUTE') then raise exception 'Exposed privileged function'; end if;
end $$;
select public.reserve_ai_usage('32000000-0000-4000-a000-000000000001','32000000-0000-4000-d000-000000000002',repeat('b',64),'answer_feedback','opic_answer_feedback_v1');
select public.finalize_ai_usage('32000000-0000-4000-a000-000000000001','32000000-0000-4000-d000-000000000002',p_result=>'{"schemaVersion":1}',p_input=>100,p_output=>20);
do $$ begin
 if (select thought_tokens from public.ai_usage_events where request_id='32000000-0000-4000-d000-000000000002') is not null then raise exception 'Unavailable thoughts must stay null'; end if;
end $$;
rollback;
