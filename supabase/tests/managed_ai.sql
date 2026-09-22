-- Run after migrations. Disposable DB or SQL editor; every fixture is rolled back.
begin;
insert into auth.users(id,raw_user_meta_data) values
 ('31000000-0000-4000-a000-000000000001','{}'),('31000000-0000-4000-a000-000000000002','{}'),('31000000-0000-4000-a000-000000000003','{}');
insert into public.admin_users(user_id,role) values ('31000000-0000-4000-a000-000000000002','owner'),('31000000-0000-4000-a000-000000000003','support');
create function pg_temp.assert_true(ok boolean, message text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception 'FAIL: %',message;end if;end $$;
create function pg_temp.denied(q text) returns void language plpgsql as $$ begin
 begin execute q; exception when insufficient_privilege then return; end;
 raise exception 'Expected permission denial: %',q;
end $$;
create function pg_temp.invalid(q text) returns void language plpgsql as $$ begin
 begin execute q; exception when check_violation or unique_violation or foreign_key_violation then return; end;
 raise exception 'Expected constraint failure: %',q;
end $$;
set local role authenticated;
select pg_temp.denied('update public.ai_plan_limits set limit_count=900');
select pg_temp.denied('update public.ai_runtime_settings set managed_ai_enabled=true');
select pg_temp.denied('insert into public.ai_usage_events(request_id) values(gen_random_uuid())');
select pg_temp.denied('update public.ai_usage_buckets set consumed_count=0');
select pg_temp.denied('select * from public.ai_feedback');
select pg_temp.denied('select * from public.ai_usage_events');
select pg_temp.denied('select public.reserve_ai_usage(gen_random_uuid(),gen_random_uuid(),repeat(''a'',64))');
select pg_temp.denied('select public.admin_update_ai(gen_random_uuid(),''{}'')');
reset role;
set local role anon;
select pg_temp.denied('select * from public.ai_feedback');
select pg_temp.denied('select public.ai_quota(gen_random_uuid())');
reset role;
select pg_temp.invalid('insert into public.ai_plan_limits(plan,feature,period,limit_count) values(''fake'',''answer_feedback'',''daily'',3)');
select pg_temp.invalid('update public.ai_plan_limits set feature=''fake''');
select pg_temp.invalid('update public.ai_plan_limits set period=''monthly''');
select pg_temp.invalid('update public.ai_plan_limits set limit_count=-1');
select pg_temp.assert_true(not (public.ai_quota('31000000-0000-4000-a000-000000000001')->>'enabled')::boolean,'initial kill switch OFF');
select public.admin_update_ai('31000000-0000-4000-a000-000000000002','{"enabled":true,"freeLimit":1}');
select pg_temp.assert_true((select count(*) from public.admin_audit_logs where admin_user_id='31000000-0000-4000-a000-000000000002' and action='update_ai_settings')=1,'mutation audit');
do $$ begin
 begin perform public.admin_update_ai('31000000-0000-4000-a000-000000000003','{"enabled":false}');raise exception 'support allowed';
 exception when raise_exception then if sqlerrm <> 'FORBIDDEN' then raise; end if;end;
end $$;
-- Display-only PRO must still resolve to FREE.
update public.profiles set plan='pro' where id='31000000-0000-4000-a000-000000000001';
select pg_temp.assert_true(public.ai_quota('31000000-0000-4000-a000-000000000001')->>'plan'='free','display plan not billing truth');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000001',repeat('a',64))->>'code'='RESERVED','first slot reserved');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000001',repeat('a',64))->>'code'='REQUEST_IN_PROGRESS','duplicate no reservation');
select pg_temp.assert_true((public.ai_quota('31000000-0000-4000-a000-000000000001')->>'reserved')::int=1,'only one reservation');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000002',repeat('a',64))->>'code'='DAILY_QUOTA_EXCEEDED','last slot enforced');
select public.finalize_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000001',p_error=>'PROVIDER_UNAVAILABLE');
select pg_temp.assert_true((public.ai_quota('31000000-0000-4000-a000-000000000001')->>'remaining')::int=1,'failure refund');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000001',repeat('a',64))->>'code'='PROVIDER_UNAVAILABLE','failed UUID terminal');
select public.reserve_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000003',repeat('a',64));
select public.finalize_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000003',p_feedback=>'{"schemaVersion":1}',p_input=>100,p_output=>200,p_cached=>10);
select public.finalize_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000003',p_feedback=>'{"schemaVersion":1}');
select pg_temp.assert_true((public.ai_quota('31000000-0000-4000-a000-000000000001')->>'used')::int=1,'finalize exactly once');
select pg_temp.assert_true((select count(*) from public.ai_feedback where user_id='31000000-0000-4000-a000-000000000001')=1,'unique feedback');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000001','31000000-0000-4000-b000-000000000003',repeat('a',64))->>'code'='RECOVERED','recover success');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000002','31000000-0000-4000-b000-000000000003',repeat('a',64))->>'code'='IDEMPOTENCY_CONFLICT','cross user request blocked');
select pg_temp.invalid('update public.ai_usage_events set request_id=''31000000-0000-4000-b000-000000000003'' where request_id=''31000000-0000-4000-b000-000000000001''');
insert into public.learning_sessions(id,user_id,mode) values ('31000000-0000-4000-c000-000000000001','31000000-0000-4000-a000-000000000002','quick_practice');
insert into public.learning_attempts(id,session_id,user_id,question_id) values ('31000000-0000-4000-d000-000000000001','31000000-0000-4000-c000-000000000001','31000000-0000-4000-a000-000000000002','test');
select pg_temp.invalid('update public.ai_feedback set learning_attempt_id=''31000000-0000-4000-d000-000000000001'' where user_id=''31000000-0000-4000-a000-000000000001''');
-- Lease expiry releases, never restarts the original provider request.
select public.reserve_ai_usage('31000000-0000-4000-a000-000000000002','31000000-0000-4000-b000-000000000004',repeat('a',64));
update public.ai_usage_events set expires_at=now()-interval '1 second' where request_id='31000000-0000-4000-b000-000000000004';
select pg_temp.assert_true((public.ai_quota('31000000-0000-4000-a000-000000000002')->>'remaining')::int=1,'expired lease refunded');
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000002','31000000-0000-4000-b000-000000000004',repeat('a',64))->>'code'='RESERVATION_EXPIRED','expired UUID terminal');
select pg_temp.assert_true((public.ai_quota('31000000-0000-4000-a000-000000000002')->>'resetsAt')::timestamptz = (((now() at time zone 'Asia/Seoul')::date+1)::timestamp at time zone 'Asia/Seoul'),'Seoul reset');
-- Explicit burst limiter, even while daily quota remains.
update public.ai_runtime_settings set requests_per_minute=1;
select pg_temp.assert_true(public.reserve_ai_usage('31000000-0000-4000-a000-000000000002',gen_random_uuid(),repeat('a',64))->>'code'='RATE_LIMITED','burst enforced');
select public.admin_ai_overview();
rollback;
