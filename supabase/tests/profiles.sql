-- Run after migration, in a disposable/local project or SQL Editor.
-- Fixtures and changes are rolled back; any failed assertion aborts the transaction.
begin;
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-4000-a000-000000000001', '{"plan":"pro"}'),
  ('00000000-0000-4000-a000-000000000002', '{}');
do $$ begin
  if (select count(*) from public.profiles where id in ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002') and plan = 'free') <> 2 then
    raise exception 'Trigger must create free profiles';
  end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000001', true);
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'Own-row SELECT failed'; end if;
  update public.profiles set display_name = 'Allowed' where id = '00000000-0000-4000-a000-000000000001';
  if not found then raise exception 'Safe update failed'; end if;
  update public.profiles set display_name = 'Forbidden' where id = '00000000-0000-4000-a000-000000000002';
  if found then raise exception 'Cross-user update succeeded'; end if;
  begin
    update public.profiles set plan = 'pro' where id = '00000000-0000-4000-a000-000000000001';
    raise exception 'Self-upgrade succeeded';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.profiles;
    raise exception 'Delete succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.profiles (id) values ('00000000-0000-4000-a000-000000000003');
    raise exception 'Insert succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform * from public.profiles;
    raise exception 'Anonymous read succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id = '00000000-0000-4000-a000-000000000002';
do $$ begin
  if exists (select 1 from public.profiles where id = '00000000-0000-4000-a000-000000000002') then raise exception 'Cascade failed'; end if;
end $$;
rollback;
