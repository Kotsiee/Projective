CREATE OR REPLACE FUNCTION org.create_team(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = org, public
AS $$
DECLARE
  new_team_id uuid;
  new_team_slug text;
  invite_record jsonb;
BEGIN
  
  INSERT INTO org.teams (
    owner_user_id,
    name,
    slug,
    description,
    avatar_url,
    visibility,
    payout_model,
    default_payout_settings
  )
  VALUES (
    (payload->>'owner_id')::uuid,
    payload->>'name',
    payload->>'slug',
    COALESCE(payload->>'description', ''),
    payload->>'avatar_url',
    COALESCE(payload->>'visibility', 'invite_only'),
    COALESCE(payload->>'payout_model', 'manager_discretion'),
    COALESCE(payload->'default_payout_settings', '{}'::jsonb)
  )
  RETURNING id, slug INTO new_team_id, new_team_slug;

  
  INSERT INTO org.team_memberships (
    team_id,
    user_id,
    role,
    status
  )
  VALUES (
    new_team_id,
    (payload->>'owner_id')::uuid,
    'owner',
    'active'
  );

  
  IF payload ? 'invites' AND jsonb_array_length(payload->'invites') > 0 THEN
    FOR invite_record IN SELECT * FROM jsonb_array_elements(payload->'invites')
    LOOP
      INSERT INTO org.org_invitations (
        inviter_user_id,
        target_email,
        team_id,
        token, 
        status
      )
      VALUES (
        (payload->>'owner_id')::uuid,
        invite_record->>'email',
        new_team_id,
        encode(gen_random_bytes(32), 'hex'), 
        'pending'
      );
    END LOOP;
  END IF;

  
  RETURN jsonb_build_object(
    'team_id', new_team_id,
    'team_slug', new_team_slug
  );

EXCEPTION WHEN unique_violation THEN
  
  RAISE EXCEPTION 'Team handle already exists' USING ERRCODE = '23505';
END;
$$;