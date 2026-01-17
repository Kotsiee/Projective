CREATE OR REPLACE FUNCTION security.switch_session_context(
  p_type public.profile_type,
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, security, org
AS $$
BEGIN
  -- 1. Security Check: Does the user actually own this profile?
  IF p_type = 'freelancer' THEN
    IF NOT EXISTS (
      SELECT 1 FROM org.freelancer_profiles 
      WHERE id = p_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Access Denied: You do not own this freelancer profile.';
    END IF;
  
  ELSIF p_type = 'business' THEN
    IF NOT EXISTS (
      SELECT 1 FROM org.business_profiles 
      WHERE id = p_id AND owner_user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Access Denied: You do not own this business profile.';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid profile type';
  END IF;

  -- 2. Update the session context
  UPDATE security.session_context
  SET 
    active_profile_type = p_type,
    active_profile_id = p_id,
    active_team_id = NULL, -- Reset team context on profile switch
    updated_at = NOW()
  WHERE user_id = auth.uid();

  -- 3. Log the switch (Optional but good for security tables)
  INSERT INTO security.audit_logs (
    user_id, 
    action, 
    entity_table, 
    entity_id, 
    actor_profile_id
  ) VALUES (
    auth.uid(),
    'session.switch_context',
    'security.session_context',
    auth.uid(),
    p_id
  );
END;
$$;