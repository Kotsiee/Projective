-- db/migrations/0004_helpers_functions.sql

-- NOTE: we rely on pgcrypto/gen_random_uuid(). Make sure extension is on.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- is_admin(): check ops.admin_users
CREATE OR REPLACE FUNCTION security.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM ops.admin_users au
    WHERE au.user_id = auth.uid()
  );
$$;

-- simple debug helper: return current JWT context
CREATE OR REPLACE FUNCTION security.current_context()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'user_id', auth.uid(),
    'active_profile_type', auth.jwt()->>'active_profile_type',
    'active_profile_id',   auth.jwt()->>'active_profile_id',
    'active_team_id',      auth.jwt()->>'active_team_id'
  );
$$;
