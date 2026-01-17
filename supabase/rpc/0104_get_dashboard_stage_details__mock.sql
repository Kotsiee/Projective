CREATE OR REPLACE FUNCTION projects.get_stage_details(
  p_project_id uuid,
  p_stage_id uuid
)
RETURNS TABLE (
  stage_id uuid,
  project_id uuid,
  title text,
  description text,
  "order" int,
  status text, -- <--- This output name clashes with variables inside if not aliased!
  stage_type text,
  ip_mode text,
  due_date timestamptz,
  budget jsonb,
  assignee jsonb,
  latest_submission jsonb,
  viewer_context jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, org, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_stage_status public.stage_status;
  v_is_funded boolean;
BEGIN
  -- 1. Fetch Stage Status
  SELECT ps.status INTO v_stage_status
  FROM projects.project_stages ps
  WHERE ps.id = p_stage_id AND ps.project_id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found or access denied';
  END IF;

  -- 2. Determine Role
  SELECT 
    CASE 
      WHEN p.owner_user_id = v_user_id OR EXISTS(SELECT 1 FROM org.business_profiles bp WHERE bp.id = p.client_business_id AND bp.owner_user_id = v_user_id) THEN 'owner'
      WHEN sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id) THEN 'assignee'
      
      -- FIX: Explicitly alias 'org.team_memberships' to 'tm' to avoid ambiguity with the 'status' output variable
      WHEN sa.assignee_type = 'team' AND sa.team_id IN (
          SELECT tm.team_id 
          FROM org.team_memberships tm 
          WHERE tm.user_id = v_user_id AND tm.status = 'active'
      ) THEN 'assignee'
      
      ELSE 'viewer'
    END
  INTO v_user_role
  FROM projects.projects p
  LEFT JOIN projects.stage_assignments sa ON sa.project_stage_id = p_stage_id AND sa.status = 'accepted'
  WHERE p.id = p_project_id;

  -- 3. Check Funding (Mocked)
  v_is_funded := (v_stage_status NOT IN ('open', 'assigned'));

  RETURN QUERY
  SELECT
    ps.id,
    ps.project_id,
    ps.name,
    ps.description::text,
    ps."order",
    ps.status::text,
    ps.stage_type::text,
    ps.ip_mode::text,
    
    -- Correct column name from schema
    ps.file_due_date AS due_date,

    -- Budget
    (
      SELECT jsonb_build_object(
        'type', sbr.type,
        'amount_cents', sbr.amount_cents,
        'currency', sbr.amount_currency
      )
      FROM projects.stage_budget_rules sbr
      WHERE sbr.project_stage_id = ps.id
    ) as budget,

    -- Assignee
    (
      SELECT jsonb_build_object(
        'type', sa.assignee_type,
        'status', sa.status,
        'profile_id', COALESCE(sa.freelancer_profile_id, sa.team_id),
        'name', CASE 
            WHEN sa.assignee_type = 'team' THEN t.name 
            ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', upa.first_name, upa.last_name)), ''), upa.username)
          END,
        'avatar_url', CASE 
            WHEN sa.assignee_type = 'team' THEN NULL 
            ELSE upa.avatar_url
          END
      )
      FROM projects.stage_assignments sa
      LEFT JOIN org.teams t ON t.id = sa.team_id
      LEFT JOIN org.freelancer_profiles fp ON fp.id = sa.freelancer_profile_id
      LEFT JOIN org.users_public upa ON upa.user_id = fp.user_id
      WHERE sa.project_stage_id = ps.id
      LIMIT 1
    ) as assignee,

    -- Latest Submission
    (
      SELECT jsonb_build_object(
        'id', ss.id,
        'submitted_at', ss.created_at,
        'notes', ss.notes,
        'files', '[]'::jsonb 
      )
      FROM projects.stage_submissions ss
      WHERE ss.project_stage_id = ps.id
      ORDER BY ss.created_at DESC
      LIMIT 1
    ) as latest_submission,

    -- Viewer Context
    jsonb_build_object(
      'role', v_user_role,
      'permissions', (
        SELECT COALESCE(jsonb_agg(perm), '[]'::jsonb)
        FROM (
            -- Owner Permissions
            SELECT 'edit_details' WHERE v_user_role = 'owner' AND ps.status IN ('open', 'assigned', 'in_progress')
            UNION ALL
            SELECT 'assign_worker' WHERE v_user_role = 'owner' AND ps.status IN ('open', 'assigned')
            UNION ALL
            SELECT 'fund_escrow' WHERE v_user_role = 'owner' AND NOT v_is_funded AND ps.status IN ('open', 'assigned')
            UNION ALL
            SELECT 'approve_work' WHERE v_user_role = 'owner' AND ps.status = 'submitted'
            UNION ALL
            SELECT 'request_revision' WHERE v_user_role = 'owner' AND ps.status = 'submitted'
            
            -- Assignee Permissions
            UNION ALL
            SELECT 'submit_work' WHERE v_user_role = 'assignee' AND ps.status IN ('in_progress', 'revisions') AND v_is_funded
        ) as p(perm)
      )
    ) as viewer_context

  FROM projects.project_stages ps
  WHERE ps.id = p_stage_id;
END;
$$;