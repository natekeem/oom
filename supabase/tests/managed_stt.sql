-- Run after migrations. Disposable DB or SQL editor; every fixture is rolled back.
begin;

insert into auth.users(id, raw_user_meta_data) values
 ('32000000-0000-4000-a000-000000000001', '{}'),
 ('32000000-0000-4000-a000-000000000002', '{}'),
 ('32000000-0000-4000-a000-000000000003', '{}');

insert into public.admin_users(user_id, role) values
 ('32000000-0000-4000-a000-000000000002', 'owner'),
 ('32000000-0000-4000-a000-000000000003', 'support');

create function pg_temp.assert_true(ok boolean, message text) returns void language plpgsql as $$
begin
  if ok is distinct from true then
    raise exception 'FAIL: %', message;
  end if;
end $$;

create function pg_temp.denied(q text) returns void language plpgsql as $$
begin
  begin
    execute q;
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'Expected permission denial: %', q;
end $$;

create function pg_temp.invalid(q text) returns void language plpgsql as $$
begin
  begin
    execute q;
  exception when check_violation or unique_violation or foreign_key_violation then
    return;
  end;
  raise exception 'Expected constraint failure: %', q;
end $$;

-- 1. Browser (authenticated) permissions: cannot mutate settings, cannot forge usage, cannot read results
set local role authenticated;
select pg_temp.denied('update public.stt_runtime_settings set managed_stt_enabled=true');
select pg_temp.denied('insert into public.stt_usage_events(request_id) values(gen_random_uuid())');
select pg_temp.denied('update public.stt_usage_buckets set consumed_ms=0');
select pg_temp.denied('select * from public.stt_results');
select pg_temp.denied('select * from public.stt_usage_events');
select pg_temp.denied('select public.reserve_stt_usage(gen_random_uuid(), gen_random_uuid(), repeat(''a'', 64), 30000, ''quick_practice'')');
select pg_temp.denied('select public.admin_update_stt(gen_random_uuid(), ''{}'')');
reset role;

-- 2. Browser (anonymous) permissions
set local role anon;
select pg_temp.denied('select * from public.stt_results');
select pg_temp.denied('select public.stt_quota(gen_random_uuid())');
reset role;

-- 3. Validation checks on constraints
select pg_temp.invalid('insert into public.stt_runtime_settings(id, requests_per_minute) values(true, 500)');
select pg_temp.invalid('insert into public.stt_model_catalog(provider, model) values(''other'', ''fake'')');

-- 4. Initial runtime kill switch is OFF
select pg_temp.assert_true(not (public.stt_quota('32000000-0000-4000-a000-000000000001')->>'enabled')::boolean, 'initial STT kill switch OFF');

-- 5. Admin updates STT settings & regression checks
-- 5.1 enabled=true only
select public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"enabled":true}');
select pg_temp.assert_true((select managed_stt_enabled from public.stt_runtime_settings where id), 'enabled=true only succeeded');

-- 5.2 enabled=false only
select public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"enabled":false}');
select pg_temp.assert_true(not (select managed_stt_enabled from public.stt_runtime_settings where id), 'enabled=false only succeeded');

-- 5.3 valid free/pro limits
select public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"limits":{"free":120000,"pro":720000}}');
select pg_temp.assert_true((select daily_limit_ms_free = 120000 and daily_limit_ms_pro = 720000 from public.stt_runtime_settings where id), 'valid free/pro limits succeeded');

-- 5.4 model change
select public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"model":"gemini-3.5-transcribe"}');
select pg_temp.assert_true((select default_model = 'gemini-3.5-transcribe' from public.stt_runtime_settings where id), 'model change succeeded');

-- 5.5 combined enabled/model/limits patch
select public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"enabled":true,"model":"gemini-3.5-transcribe","limits":{"free":60000,"pro":3600000}}');
select pg_temp.assert_true((select managed_stt_enabled and default_model = 'gemini-3.5-transcribe' and daily_limit_ms_free = 60000 and daily_limit_ms_pro = 3600000 from public.stt_runtime_settings where id), 'combined enabled/model/limits patch succeeded');

-- 5.6 unknown limits key rejected
do $$ begin
  begin
    perform public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"limits":{"unknown":12345}}');
    raise exception 'unknown limits key was allowed';
  exception when raise_exception then
    if sqlerrm <> 'INVALID_SETTINGS' then raise; end if;
  end;
end $$;

-- 5.7 support/non-admin rejected
-- Support role (user 3) rejected
do $$ begin
  begin
    perform public.admin_update_stt('32000000-0000-4000-a000-000000000003', '{"enabled":false}');
    raise exception 'support role was allowed';
  exception when raise_exception then
    if sqlerrm <> 'FORBIDDEN' then raise; end if;
  end;
end $$;

-- Non-admin regular user (user 1) rejected
do $$ begin
  begin
    perform public.admin_update_stt('32000000-0000-4000-a000-000000000001', '{"enabled":false}');
    raise exception 'non-admin user was allowed';
  exception when raise_exception then
    if sqlerrm <> 'FORBIDDEN' then raise; end if;
  end;
end $$;

-- 5.8 successful mutation creates exactly one audit row per mutation
do $$
declare
  audit_count_before integer;
  audit_count_after integer;
begin
  select count(*) into audit_count_before from public.admin_audit_logs where admin_user_id='32000000-0000-4000-a000-000000000002' and action='update_stt_settings';
  perform public.admin_update_stt('32000000-0000-4000-a000-000000000002', '{"enabled":true,"limits":{"free":60000}}');
  select count(*) into audit_count_after from public.admin_audit_logs where admin_user_id='32000000-0000-4000-a000-000000000002' and action='update_stt_settings';
  if audit_count_after - audit_count_before <> 1 then
    raise exception 'Expected exactly 1 audit row created, before: %, after: %', audit_count_before, audit_count_after;
  end if;
end $$;

-- 6. Atomic duration reservation
-- Remaining is 60,000 ms (1 minute). Reserving 45,000 ms.
select pg_temp.assert_true(public.reserve_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000001', repeat('a', 64), 45000, 'quick_practice')->>'code' = 'RESERVED', 'first 45s reserved');

-- Duplicate request ID with same audio hash returns REQUEST_IN_PROGRESS without double-reserving
select pg_temp.assert_true(public.reserve_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000001', repeat('a', 64), 45000, 'quick_practice')->>'code' = 'REQUEST_IN_PROGRESS', 'duplicate in-progress no double reservation');

select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'reservedMs')::bigint = 45000, 'only 45000ms reserved');
select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'remainingMs')::bigint = 15000, '15000ms remaining');

-- Next 45s reservation should exceed quota (15000 remaining < 45000 requested)
select pg_temp.assert_true(public.reserve_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000002', repeat('b', 64), 45000, 'quick_practice')->>'code' = 'DAILY_STT_QUOTA_EXCEEDED', 'quota enforced');

-- 7. Failure releases reservation
select public.finalize_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000001', p_error => 'PROVIDER_UNAVAILABLE');
select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'remainingMs')::bigint = 60000, 'failure fully refunded reservation');
select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'reservedMs')::bigint = 0, 'reservedMs reset to 0');

-- 8. Success consumes duration once and stores transient result
select public.reserve_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000003', repeat('c', 64), 20000, 'quick_practice');
select public.finalize_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000003', p_transcript => 'I went to a park yesterday.', p_duration_ms => 20000, p_input => 50, p_output => 20);

select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'usedMs')::bigint = 20000, 'usedMs consumed once');
select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'remainingMs')::bigint = 40000, 'remainingMs accurate');

-- 9. Idempotency recovery
select pg_temp.assert_true(public.reserve_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000003', repeat('c', 64), 20000, 'quick_practice')->>'code' = 'RECOVERED', 'succeeded request recovered without consuming quota');

-- Cross-user request with same request ID blocked
select pg_temp.assert_true(public.reserve_stt_usage('32000000-0000-4000-a000-000000000002', '32000000-0000-4000-b000-000000000003', repeat('c', 64), 20000, 'quick_practice')->>'code' = 'IDEMPOTENCY_CONFLICT', 'cross-user idempotency conflict');

-- 10. Expiry of reservations
select public.reserve_stt_usage('32000000-0000-4000-a000-000000000001', '32000000-0000-4000-b000-000000000004', repeat('d', 64), 10000, 'quick_practice');
update public.stt_usage_events set expires_at = now() - interval '1 second' where request_id = '32000000-0000-4000-b000-000000000004';
select pg_temp.assert_true((public.stt_quota('32000000-0000-4000-a000-000000000001')->>'remainingMs')::bigint = 40000, 'expired reservation released');

-- 11. Admin overview RPC
select public.admin_stt_overview();

rollback;
