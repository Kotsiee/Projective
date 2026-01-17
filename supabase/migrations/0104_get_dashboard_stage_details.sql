CREATE OR REPLACE FUNCTION projects.get_stage_details(
  p_project_id uuid,
  p_stage_id uuid
)
RETURNS TABLE (
  stage_id uuid,
  project_id uuid,
  title text,
  description jsonb,
  sort_order int,
  status text,
  stage_type text,
  ip_mode text,
  due_date timestamptz,
  channel_id uuid,
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
  v_stage_status text;
BEGIN
  -- 1. Check existence and basic status
  SELECT ps.status::text INTO v_stage_status
  FROM projects.project_stages ps
  WHERE ps.id = p_stage_id AND ps.project_id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found or access denied';
  END IF;

  -- 2. Determine User Role (Owner vs Assignee vs Viewer)
  SELECT 
    CASE 
      WHEN p.owner_user_id = v_user_id OR EXISTS(SELECT 1 FROM org.business_profiles bp WHERE bp.id = p.client_business_id AND bp.owner_user_id = v_user_id) THEN 'owner'
      
      WHEN sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id) THEN 'assignee'
      
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

  -- 3. Return Data
  RETURN QUERY
  SELECT
    ps.id,
    ps.project_id,
    ps.name,
    ps.description,
    ps.sort_order,
    ps.status::text,
    ps.stage_type::text, -- FIX: Explicit cast to text
    ps.ip_mode::text,    -- FIX: Explicit cast to text (preventative)
    ps.file_due_date AS due_date,
    
    -- Channel ID Lookup
    (
      SELECT pc.id 
      FROM comms.project_channels pc 
      WHERE pc.project_id = ps.project_id 
      AND pc.stage_id = ps.id 
      LIMIT 1
    ) as channel_id,

    -- Budget Details
    (
      SELECT jsonb_build_object(
        'type', sbr.rule_type,
        'amount_cents', sbr.amount_cents,
        'currency', sbr.amount_currency
      )
      FROM projects.stage_budget_rules sbr
      WHERE sbr.project_stage_id = ps.id
    ) as budget,

    -- Assignee Details
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

    -- Permissions
    jsonb_build_object(
      'role', v_user_role,
      'permissions', jsonb_build_object(
        'can_edit_details', (v_user_role = 'owner' AND ps.status::text IN ('open', 'assigned', 'in_progress')),
        'can_assign', (v_user_role = 'owner' AND ps.status::text IN ('open', 'assigned')),
        'can_submit_work', (v_user_role = 'assignee' AND ps.status::text IN ('in_progress', 'revisions')),
        'can_approve', (v_user_role = 'owner' AND ps.status::text = 'submitted'),
        'can_request_revision', (v_user_role = 'owner' AND ps.status::text = 'submitted')
      )
    ) as viewer_context

  FROM projects.project_stages ps
  WHERE ps.id = p_stage_id;
END;
$$;