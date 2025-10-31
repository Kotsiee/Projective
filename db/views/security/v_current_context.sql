CREATE OR REPLACE VIEW security.v_current_context AS
SELECT
  sc.user_id,
  sc.active_profile_type,
  sc.active_profile_id,
  sc.active_team_id,
  sc.updated_at
FROM security.session_context sc
WHERE sc.user_id = auth.uid();
