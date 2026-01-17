CREATE OR REPLACE FUNCTION projects.get_project_details(
  p_project_id uuid
)
RETURNS TABLE (
  project_id uuid,
  title text,
  status text, -- This return variable causes the collision
  banner_url text,
  is_starred boolean,
  owner jsonb,
  viewer_context jsonb,
  stages jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, org, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_is_owner boolean;
BEGIN
  -- 1. Determine Access & Role
  SELECT 
    CASE 
      WHEN p.owner_user_id = v_user_id THEN 'owner'
      WHEN EXISTS (
        SELECT 1 FROM org.business_profiles bp 
        WHERE bp.id = p.client_business_id AND bp.owner_user_id = v_user_id
      ) THEN 'owner'
      WHEN EXISTS (
        SELECT 1 FROM projects.project_participants pp 
        WHERE pp.project_id = p.id 
        AND (
           (pp.profile_type = 'freelancer' AND pp.profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id)) OR
           (pp.profile_type = 'business' AND pp.profile_id IN (SELECT id FROM org.business_profiles WHERE owner_user_id = v_user_id))
        )
      ) THEN 'collaborator'
      -- Check if assigned to any stage (Freelancer or Team Member)
      WHEN EXISTS (
        SELECT 1 FROM projects.stage_assignments sa
        JOIN projects.project_stages ps ON ps.id = sa.project_stage_id
        WHERE ps.project_id = p.id
        AND (
           (sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id)) OR
           -- FIX: Aliased team_memberships to 'tm' and used 'tm.status'
           (sa.assignee_type = 'team' AND sa.team_id IN (
              SELECT tm.team_id 
              FROM org.team_memberships tm 
              WHERE tm.user_id = v_user_id AND tm.status = 'active'
           ))
        )
      ) THEN 'collaborator'
      ELSE NULL
    END
  INTO v_user_role
  FROM projects.projects p
  WHERE p.id = p_project_id;

  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  v_is_owner := (v_user_role = 'owner');

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.status::text,
    NULL::text as banner_url,
    COALESCE(pref.is_starred, false),

    jsonb_build_object(
      'id', COALESCE(bp.id, p.owner_user_id),
      'name', CASE 
          WHEN bp.id IS NOT NULL THEN bp.name 
          ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up.first_name, up.last_name)), ''), up.username)
        END,
      'avatar_url', COALESCE(bp.logo_url, up.avatar_url),
      'type', CASE WHEN bp.id IS NOT NULL THEN 'business' ELSE 'freelancer' END
    ) as owner,

    jsonb_build_object(
  'role', v_user_role,
  'permissions', (
    SELECT jsonb_agg(perm)
    FROM (
      SELECT 'manage_settings' WHERE v_is_owner
      UNION ALL
      SELECT 'manage_members' WHERE v_is_owner
      UNION ALL
      SELECT 'view_financials' WHERE v_is_owner
    ) as p(perm)
  )
) as viewer_context,

    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ps.id,
          'name', ps.name,
          'status', ps.status,
          'stage_type', ps.stage_type,
          'unread', EXISTS(
             SELECT 1 FROM comms.notifications n 
             WHERE n.user_id = v_user_id AND n.read_at IS NULL AND n.entity_id = ps.id
          )
        ) ORDER BY ps."order" ASC
      )
      FROM projects.project_stages ps
      WHERE ps.project_id = p.id
    ) as stages

  FROM projects.projects p
  LEFT JOIN projects.user_preferences pref ON pref.project_id = p.id AND pref.user_id = v_user_id
  LEFT JOIN org.business_profiles bp ON bp.id = p.client_business_id
  LEFT JOIN org.users_public up ON up.user_id = p.owner_user_id
  WHERE p.id = p_project_id;
END;
$$;