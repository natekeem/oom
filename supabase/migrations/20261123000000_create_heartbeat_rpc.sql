-- Migration: 20261123000000_create_heartbeat_rpc.sql
-- Lightweight RPC function for external uptime checks / heartbeat to prevent free-tier inactivity pauses.

CREATE OR REPLACE FUNCTION public.heartbeat()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'status', 'ok',
    'timestamp', now()
  );
$$;

-- Explicit privilege management: allow anon, authenticated, and service_role to execute heartbeat
REVOKE ALL ON FUNCTION public.heartbeat() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.heartbeat() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.heartbeat() IS 'Lightweight public heartbeat function for inactivity prevention and uptime monitoring.';
