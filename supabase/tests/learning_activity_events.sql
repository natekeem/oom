-- Run after the activity migration. Assertions roll back all fixtures.
begin;
insert into auth.users (id, raw_user_meta_data) values
 ('00000000-0000-4000-a000-000000000081', '{}'),
 ('00000000-0000-4000-a000-000000000082', '{}');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000081', true);
insert into public.learning_activity_events (id, user_id, activity_type, course_id, level_id, content_id) values
 ('00000000-0000-4000-a000-000000000083', '00000000-0000-4000-a000-000000000081', 'survey_completed', 'course-1', 'advanced', 'course-1-survey'),
 ('00000000-0000-4000-a000-000000000084', '00000000-0000-4000-a000-000000000081', 'survey_completed', 'course-1', 'advanced', 'course-1-survey');
do $$ begin
 if (select count(*) from public.learning_activity_events) <> 2 then raise exception 'Repeated study with distinct IDs must be allowed'; end if;
 begin
  insert into public.learning_activity_events (id, user_id, activity_type, course_id, level_id, content_id) values
   ('00000000-0000-4000-a000-000000000083', '00000000-0000-4000-a000-000000000081', 'survey_completed', 'course-1', 'advanced', 'course-1-survey');
  raise exception 'Same completion ID must not insert twice';
 exception when unique_violation then null; end;
 begin
  insert into public.learning_activity_events (user_id, activity_type, course_id, level_id, content_id) values
   ('00000000-0000-4000-a000-000000000082', 'survey_completed', 'course-1', 'advanced', 'course-1-survey');
  raise exception 'Cross-user insert accepted';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.learning_activity_events (user_id, activity_type, course_id, level_id, content_id) values
   ('00000000-0000-4000-a000-000000000081', 'page_view', 'course-1', 'advanced', 'course-1-survey');
  raise exception 'Invalid activity accepted';
 exception when check_violation then null; end;
 begin
  update public.learning_activity_events set content_id = 'changed';
  raise exception 'Update accepted';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.learning_activity_events;
  raise exception 'Delete accepted';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-a000-000000000082', true);
do $$ begin
 if (select count(*) from public.learning_activity_events) <> 0 then raise exception 'B sees A events'; end if;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
 begin
  perform * from public.learning_activity_events;
  raise exception 'Anonymous read accepted';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.learning_activity_events (user_id, activity_type, course_id, level_id, content_id) values
   ('00000000-0000-4000-a000-000000000081', 'survey_completed', 'course-1', 'advanced', 'course-1-survey');
  raise exception 'Anonymous insert accepted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id = '00000000-0000-4000-a000-000000000081';
do $$ begin
 if exists (select 1 from public.learning_activity_events where user_id = '00000000-0000-4000-a000-000000000081') then raise exception 'Cascade failed'; end if;
end $$;
rollback;
