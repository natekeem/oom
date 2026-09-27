-- Fix operator precedence in admin_update_stt when validating p_patch->'limits' keys
begin;

create or replace function public.admin_update_stt(p_admin uuid, p_patch jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  before_state jsonb;
begin
  if not exists(select 1 from public.admin_users where user_id = p_admin and role in ('owner', 'admin')) then
    raise exception 'FORBIDDEN';
  end if;
  if jsonb_typeof(p_patch) <> 'object' or p_patch - array['enabled', 'model', 'limits'] <> '{}'::jsonb or p_patch = '{}'::jsonb then
    raise exception 'INVALID_SETTINGS';
  end if;
  select to_jsonb(s) into before_state from public.stt_runtime_settings s where id for update;
  if p_patch ? 'enabled' and jsonb_typeof(p_patch->'enabled') <> 'boolean' then
    raise exception 'INVALID_SETTINGS';
  end if;
  if p_patch ? 'model' and not exists(select 1 from public.stt_model_catalog where provider = 'gemini' and model = p_patch->>'model' and enabled) then
    raise exception 'INVALID_MODEL';
  end if;
  if p_patch ? 'limits' then
    if jsonb_typeof(p_patch->'limits') <> 'object' or (p_patch->'limits') - array['free', 'pro'] <> '{}'::jsonb then
      raise exception 'INVALID_SETTINGS';
    end if;
    if ((p_patch->'limits') ? 'free') and (((p_patch->'limits'->>'free')::bigint < 0) or ((p_patch->'limits'->>'free')::bigint > 86400000)) then
      raise exception 'INVALID_SETTINGS';
    end if;
    if ((p_patch->'limits') ? 'pro') and (((p_patch->'limits'->>'pro')::bigint < 0) or ((p_patch->'limits'->>'pro')::bigint > 86400000)) then
      raise exception 'INVALID_SETTINGS';
    end if;
  end if;

  update public.stt_runtime_settings set
    managed_stt_enabled = coalesce((p_patch->>'enabled')::boolean, managed_stt_enabled),
    default_model = coalesce(p_patch->>'model', default_model),
    daily_limit_ms_free = coalesce((p_patch->'limits'->>'free')::bigint, daily_limit_ms_free),
    daily_limit_ms_pro = coalesce((p_patch->'limits'->>'pro')::bigint, daily_limit_ms_pro),
    updated_by = p_admin,
    updated_at = now()
  where id;

  insert into public.admin_audit_logs(admin_user_id, action, target_type, target_id, metadata)
  values(p_admin, 'update_stt_settings', 'stt_runtime_settings', 'true', jsonb_build_object('before', before_state, 'patch', p_patch));
end $$;

revoke all on function public.admin_update_stt(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_update_stt(uuid, jsonb) to service_role;

commit;
