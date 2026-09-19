-- Phase 2: Learning history RLS and constraint tests.
-- Run after both migrations, in a disposable/local project or SQL Editor.
-- Fixtures and changes are rolled back.
begin;

-- Fixture: create two test users
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-4000-a000-000000000001', '{"name":"User A"}'),
  ('00000000-0000-4000-a000-000000000002', '{"name":"User B"}');

-- === Tests as User A ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000001', true);

-- 1. User A inserts own session
insert into public.learning_sessions (id, user_id, mode, target_level, question_count)
values ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'quick_practice', 'advanced', 5);

-- 2. User A selects own session
do $$ begin
  if (select count(*) from public.learning_sessions) <> 1 then
    raise exception 'User A should see exactly 1 session';
  end if;
end $$;

-- 3. User A inserts attempt into own session
insert into public.learning_attempts (id, session_id, user_id, question_id, question_order, duration_seconds)
values ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'course-1-advanced-q25', 1, 65);

do $$ begin
  if (select count(*) from public.learning_attempts) <> 1 then
    raise exception 'User A should see exactly 1 attempt';
  end if;
end $$;

-- 4. User A cannot insert session for User B
do $$ begin
  begin
    insert into public.learning_sessions (user_id, mode)
    values ('00000000-0000-4000-a000-000000000002', 'quick_practice');
    raise exception 'Cross-user session insert succeeded';
  exception when others then null; end;
end $$;

reset role;

-- === Tests as User B ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000002', true);

-- 5. User B cannot see User A's session
do $$ begin
  if (select count(*) from public.learning_sessions) <> 0 then
    raise exception 'User B should see 0 sessions';
  end if;
end $$;

-- 6. User B cannot insert attempt into User A's session
do $$ begin
  begin
    insert into public.learning_attempts (session_id, user_id, question_id, question_order)
    values ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'test-q', 1);
    raise exception 'Cross-user attempt insert succeeded';
  exception when others then null; end;
end $$;

reset role;

-- === Constraint tests (as superuser) ===

-- 7. Composite FK: attempt user_id must match session user_id
do $$ begin
  begin
    insert into public.learning_attempts (session_id, user_id, question_id)
    values ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'test-q');
    raise exception 'Mismatched user attempt insert succeeded';
  exception when foreign_key_violation then null; end;
end $$;

-- 8. Invalid mode rejected
do $$ begin
  begin
    insert into public.learning_sessions (user_id, mode)
    values ('00000000-0000-4000-a000-000000000001', 'invalid_mode');
    raise exception 'Invalid mode insert succeeded';
  exception when check_violation then null; end;
end $$;

-- 9. Invalid status rejected
do $$ begin
  begin
    update public.learning_sessions
    set status = 'cancelled'
    where id = '10000000-0000-4000-a000-000000000001';
    raise exception 'Invalid status update succeeded';
  exception when check_violation then null; end;
end $$;

-- 10. Negative duration rejected
do $$ begin
  begin
    insert into public.learning_attempts (session_id, user_id, question_id, duration_seconds)
    values ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'test-q', -10);
    raise exception 'Negative duration insert succeeded';
  exception when check_violation then null; end;
end $$;

-- 11. Duplicate question_order in same session rejected
do $$ begin
  begin
    insert into public.learning_attempts (session_id, user_id, question_id, question_order)
    values ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'course-1-advanced-q26', 1);
    raise exception 'Duplicate question_order insert succeeded';
  exception when unique_violation then null; end;
end $$;

-- === Anonymous tests ===
set local role anon;

do $$ begin
  begin
    perform * from public.learning_sessions;
    raise exception 'Anonymous read on learning_sessions succeeded';
  exception when insufficient_privilege then null; end;
end $$;

do $$ begin
  begin
    perform * from public.learning_attempts;
    raise exception 'Anonymous read on learning_attempts succeeded';
  exception when insufficient_privilege then null; end;
end $$;

do $$ begin
  begin
    insert into public.learning_sessions (user_id, mode)
    values ('00000000-0000-4000-a000-000000000001', 'quick_practice');
    raise exception 'Anonymous insert on learning_sessions succeeded';
  exception when insufficient_privilege then null; end;
end $$;

reset role;

-- === Cascade tests ===

-- 14. Session deletion cascades attempts
insert into public.learning_sessions (id, user_id, mode)
values ('10000000-0000-4000-a000-000000000099', '00000000-0000-4000-a000-000000000002', 'mock_test');

insert into public.learning_attempts (session_id, user_id, question_id)
values ('10000000-0000-4000-a000-000000000099', '00000000-0000-4000-a000-000000000002', 'test-cascade');

delete from public.learning_sessions where id = '10000000-0000-4000-a000-000000000099';

do $$ begin
  if exists (select 1 from public.learning_attempts where session_id = '10000000-0000-4000-a000-000000000099') then
    raise exception 'Session delete did not cascade to attempts';
  end if;
end $$;

-- 15. Auth user deletion cascades sessions and attempts
do $$ begin
  if not exists (select 1 from public.learning_sessions where user_id = '00000000-0000-4000-a000-000000000001') then
    raise exception 'User A session should still exist before cascade test';
  end if;
end $$;

delete from auth.users where id = '00000000-0000-4000-a000-000000000001';

do $$ begin
  if exists (select 1 from public.learning_sessions where user_id = '00000000-0000-4000-a000-000000000001') then
    raise exception 'Auth user delete did not cascade to sessions';
  end if;
  if exists (select 1 from public.learning_attempts where user_id = '00000000-0000-4000-a000-000000000001') then
    raise exception 'Auth user delete did not cascade to attempts';
  end if;
end $$;

-- Clean up remaining user
delete from auth.users where id = '00000000-0000-4000-a000-000000000002';

rollback;
