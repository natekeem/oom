-- Phase 3.0: Admin Console RLS, privilege, and security tests.
-- Run in a disposable/local project or SQL Editor.
-- All changes are rolled back; any failed assertion aborts the transaction.
begin;

-- Fixture: create three test users
-- User A: ordinary non-admin user
-- User B: owner admin user
-- User C: support admin user
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-4000-a000-000000000001', '{"name":"Ordinary User A"}'),
  ('00000000-0000-4000-a000-000000000002', '{"name":"Owner User B"}'),
  ('00000000-0000-4000-a000-000000000003', '{"name":"Support User C"}');

-- Set up admin memberships as superuser/service-role (simulating owner bootstrap)
insert into public.admin_users (user_id, role)
values ('00000000-0000-4000-a000-000000000002', 'owner')
on conflict (user_id) do update set role = excluded.role;

insert into public.admin_users (user_id, role, created_by)
values ('00000000-0000-4000-a000-000000000003', 'support', '00000000-0000-4000-a000-000000000002');

-- === 1. Tests as Ordinary User A (non-admin) ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000001', true);

-- 1-1. Ordinary user cannot see any rows in admin_users
do $$ begin
  if (select count(*) from public.admin_users) <> 0 then
    raise exception 'Non-admin user A should see 0 rows in admin_users';
  end if;
end $$;

-- 1-2. Ordinary user cannot insert into admin_users (privilege denied)
do $$ begin
  begin
    insert into public.admin_users (user_id, role)
    values ('00000000-0000-4000-a000-000000000001', 'owner');
    raise exception 'Non-admin user A inserted into admin_users!';
  exception when insufficient_privilege then null; end;
end $$;

-- 1-3. Ordinary user cannot update admin_users
do $$ begin
  begin
    update public.admin_users set role = 'admin' where user_id = '00000000-0000-4000-a000-000000000002';
    raise exception 'Non-admin user A updated admin_users!';
  exception when insufficient_privilege then null; end;
end $$;

-- 1-4. Ordinary user cannot delete from admin_users
do $$ begin
  begin
    delete from public.admin_users where user_id = '00000000-0000-4000-a000-000000000002';
    raise exception 'Non-admin user A deleted from admin_users!';
  exception when insufficient_privilege then null; end;
end $$;

-- 1-5. Ordinary user cannot read admin_audit_logs
do $$ begin
  begin
    perform * from public.admin_audit_logs;
    raise exception 'Non-admin user A selected from admin_audit_logs!';
  exception when insufficient_privilege then null; end;
end $$;

-- 1-6. Ordinary user cannot insert into admin_audit_logs
do $$ begin
  begin
    insert into public.admin_audit_logs (admin_user_id, action)
    values ('00000000-0000-4000-a000-000000000001', 'unauthorized_action');
    raise exception 'Non-admin user A inserted into admin_audit_logs!';
  exception when insufficient_privilege then null; end;
end $$;

reset role;

-- === 2. Tests as Admin User B (Owner) ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000002', true);

-- 2-1. Admin B can read ONLY their own row in admin_users
do $$ begin
  if (select count(*) from public.admin_users) <> 1 then
    raise exception 'Admin B should see exactly 1 row (own row)';
  end if;
  if (select role from public.admin_users where user_id = '00000000-0000-4000-a000-000000000002') <> 'owner' then
    raise exception 'Admin B role mismatch';
  end if;
end $$;

-- 2-2. Admin B cannot see User C's membership directly via browser table SELECT
do $$ begin
  if exists (select 1 from public.admin_users where user_id = '00000000-0000-4000-a000-000000000003') then
    raise exception 'Admin B should not see other admin rows via browser RLS';
  end if;
end $$;

-- 2-3. Browser client cannot write audit logs directly even if admin
do $$ begin
  begin
    insert into public.admin_audit_logs (admin_user_id, action)
    values ('00000000-0000-4000-a000-000000000002', 'browser_write_test');
    raise exception 'Direct browser audit log insert succeeded!';
  exception when insufficient_privilege then null; end;
end $$;

reset role;

-- === 3. Tests as Support User C ===
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000003', true);

-- 3-1. Support C sees only own row
do $$ begin
  if (select count(*) from public.admin_users) <> 1 then
    raise exception 'Support C should see exactly 1 row';
  end if;
  if (select role from public.admin_users where user_id = '00000000-0000-4000-a000-000000000003') <> 'support' then
    raise exception 'Support C role mismatch';
  end if;
end $$;

reset role;

-- === 4. Anonymous Access Tests ===
set local role anon;

-- 4-1. Anonymous SELECT on admin_users is blocked
do $$ begin
  begin
    perform * from public.admin_users;
    raise exception 'Anonymous SELECT on admin_users succeeded!';
  exception when insufficient_privilege then null; end;
end $$;

-- 4-2. Anonymous SELECT on admin_audit_logs is blocked
do $$ begin
  begin
    perform * from public.admin_audit_logs;
    raise exception 'Anonymous SELECT on admin_audit_logs succeeded!';
  exception when insufficient_privilege then null; end;
end $$;

reset role;

-- === 5. Constraint & Schema Validation (Privileged) ===

-- 5-1. Invalid role is rejected by check constraint
do $$ begin
  begin
    insert into public.admin_users (user_id, role)
    values ('00000000-0000-4000-a000-000000000001', 'superadmin');
    raise exception 'Invalid role superadmin accepted!';
  exception when check_violation then null; end;
end $$;

-- 5-2. Service role / migration bootstrap upsert works as intended
insert into public.admin_users (user_id, role)
values ('00000000-0000-4000-a000-000000000001', 'admin')
on conflict (user_id) do update set role = excluded.role;

do $$ begin
  if (select role from public.admin_users where user_id = '00000000-0000-4000-a000-000000000001') <> 'admin' then
    raise exception 'Bootstrap insert failed';
  end if;
end $$;

-- 5-3. Cascading deletion of Auth user cascades admin_users
delete from auth.users where id = '00000000-0000-4000-a000-000000000001';

do $$ begin
  if exists (select 1 from public.admin_users where user_id = '00000000-0000-4000-a000-000000000001') then
    raise exception 'Cascade delete failed for admin_users';
  end if;
end $$;

rollback;
