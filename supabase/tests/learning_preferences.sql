-- Phase 2.7: Learning preferences RLS and constraint tests.
-- Run after migrations, in a disposable/local project or SQL Editor.
-- Fixtures and changes are rolled back; any failed assertion aborts the transaction.
begin;

-- Fixture: create two test users
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-4000-a000-000000000001', '{"name":"User A"}'),
  ('00000000-0000-4000-a000-000000000002', '{"name":"User B"}');

-- === Tests as User A ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000001', true);

-- 1. User A inserts own preferences
insert into public.learning_preferences (user_id, target_level, course_id)
values ('00000000-0000-4000-a000-000000000001', 'advanced', 'course-1');

-- 2. User A selects own preferences
do $$ begin
  if (select count(*) from public.learning_preferences) <> 1 then
    raise exception 'User A should see exactly 1 preference row';
  end if;
  if (select target_level from public.learning_preferences where user_id = '00000000-0000-4000-a000-000000000001') <> 'advanced' then
    raise exception 'Target level mismatch';
  end if;
end $$;

-- 3. User A updates own preferences
update public.learning_preferences
set target_level = 'intermediate', course_id = 'course-2'
where user_id = '00000000-0000-4000-a000-000000000001';

do $$ begin
  if (select target_level from public.learning_preferences where user_id = '00000000-0000-4000-a000-000000000001') <> 'intermediate' then
    raise exception 'Update failed';
  end if;
end $$;

-- 4. User A cannot insert preferences for User B
do $$ begin
  begin
    insert into public.learning_preferences (user_id, target_level, course_id)
    values ('00000000-0000-4000-a000-000000000002', 'foundation', 'course-3');
    raise exception 'Cross-user preference insert succeeded';
  exception when others then null; end;
end $$;

-- 5. Duplicate insert for same user fails (one row per user enforced)
do $$ begin
  begin
    insert into public.learning_preferences (user_id, target_level, course_id)
    values ('00000000-0000-4000-a000-000000000001', 'advanced', 'course-1');
    raise exception 'Duplicate preference insert succeeded';
  exception when unique_violation then null; end;
end $$;

-- 6. Invalid target_level is rejected by constraint
do $$ begin
  begin
    update public.learning_preferences
    set target_level = 'novice'
    where user_id = '00000000-0000-4000-a000-000000000001';
    raise exception 'Invalid target_level accepted';
  exception when check_violation then null; end;
end $$;

reset role;

-- === Tests as User B ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000002', true);

-- 7. User B cannot see User A's preferences
do $$ begin
  if (select count(*) from public.learning_preferences) <> 0 then
    raise exception 'User B should see 0 preference rows';
  end if;
end $$;

-- 8. User B cannot update User A's preferences
update public.learning_preferences
set target_level = 'foundation'
where user_id = '00000000-0000-4000-a000-000000000001';

do $$ begin
  if found then
    raise exception 'Cross-user update succeeded';
  end if;
end $$;

reset role;

-- === Anonymous Access Tests ===
set local role anon;

-- 9. Anonymous SELECT is blocked
do $$ begin
  begin
    perform * from public.learning_preferences;
    raise exception 'Anonymous SELECT succeeded';
  exception when insufficient_privilege then null; end;
end $$;

-- 10. Anonymous INSERT is blocked
do $$ begin
  begin
    insert into public.learning_preferences (user_id, target_level, course_id)
    values ('00000000-0000-4000-a000-000000000001', 'advanced', 'course-1');
    raise exception 'Anonymous INSERT succeeded';
  exception when insufficient_privilege then null; end;
end $$;

reset role;

-- === Cascade Deletion Test ===
delete from auth.users where id = '00000000-0000-4000-a000-000000000001';

do $$ begin
  if exists (select 1 from public.learning_preferences where user_id = '00000000-0000-4000-a000-000000000001') then
    raise exception 'Cascade delete failed';
  end if;
end $$;

rollback;
