CREATE OR REPLACE FUNCTION org.onboard_user(
  p_first_name text,
  p_last_name text,
  p_username text,
  p_dob date,
  p_profile_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, org, auth, security
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_email_confirmed_at timestamptz;
  v_profile_id uuid;
BEGIN
  -- 1. GET USER ID
  SELECT id, email, email_confirmed_at 
  INTO v_user_id, v_email, v_email_confirmed_at
  FROM auth.users 
  WHERE id = auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. IDEMPOTENCY CHECK
  IF EXISTS (SELECT 1 FROM org.users_public WHERE user_id = v_user_id) THEN
    RETURN json_build_object('status', 'exists', 'message', 'User already onboarded');
  END IF;

  -- 3. VALIDATION
  IF EXISTS (SELECT 1 FROM org.users_public WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- 4. INSERT PUBLIC USER
  INSERT INTO org.users_public (
    user_id, first_name, last_name, username, dob, visibility
  ) VALUES (
    v_user_id, p_first_name, p_last_name, p_username, p_dob, 'unlisted'
  );

  -- 5. SYNC EMAIL
  INSERT INTO org.user_emails (
    user_id, email, is_primary, verified_at
  ) VALUES (
    v_user_id, v_email, true, v_email_confirmed_at
  );

  -- 6. HANDLE PROFILE & SESSION CONTEXT
  IF p_profile_type = 'freelancer' THEN
    -- Create Freelancer Profile
    INSERT INTO org.freelancer_profiles (
      user_id, visibility, hourly_rate, bio, headline
    ) VALUES (
      v_user_id, 'public', NULL, '', ''
    ) RETURNING id INTO v_profile_id;

    -- UPSERT Session Context (Active Freelancer)
    INSERT INTO security.session_context (user_id, active_profile_type, active_profile_id, updated_at)
    VALUES (v_user_id, 'freelancer', v_profile_id, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET 
      active_profile_type = EXCLUDED.active_profile_type,
      active_profile_id = EXCLUDED.active_profile_id,
      updated_at = NOW();

  ELSE
    -- Business User (No business created yet)
    -- UPSERT Session Context (Null Profile = Setup Mode)
    INSERT INTO security.session_context (user_id, active_profile_type, active_profile_id, updated_at)
    VALUES (v_user_id, NULL, NULL, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET 
      active_profile_type = NULL,
      active_profile_id = NULL,
      updated_at = NOW();
  END IF;

  RETURN json_build_object('status', 'success', 'user_id', v_user_id);
END;
$$;