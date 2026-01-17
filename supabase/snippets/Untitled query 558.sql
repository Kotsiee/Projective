CREATE OR REPLACE FUNCTION projects.get_dashboard_projects(
  p_category text,
  p_category_id uuid,
  p_search_query text,
  p_sort_by text,
  p_sort_dir text,
  p_limit int,
  p_offset int
)
RETURNS TABLE (
  project_id uuid,
  title text,
  status text,
  banner_url text,
  owner_name text,
  owner_avatar_url text,
  is_starred boolean,
  is_archived boolean,
  has_unread boolean,
  last_updated_at timestamptz,
  total_count bigint
) 
LANGUAGE plpgsql
SECURITY INVOKER -- Ensures RLS policies on underlying tables are respected
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  WITH user_projects AS (
    SELECT DISTINCT
      p.id,
      p.title,
      p.status,
      p.client_business_id,
      p.owner_user_id,
      COALESCE(up.is_starred, false) as is_starred,
      COALESCE(up.is_archived, false) as is_archived,
      up.last_viewed_at,
      p.created_at as project_created_at
    FROM projects.projects p
    LEFT JOIN projects.user_preferences up ON up.project_id = p.id AND up.user_id = v_user_id
    LEFT JOIN projects.project_participants pp ON pp.project_id = p.id
    LEFT JOIN projects.stage_assignments sa ON sa.assigned_by = v_user_id
      OR (sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id))
      OR (sa.assignee_type = 'team' AND sa.team_id IN (
          SELECT tm.team_id 
          FROM org.team_memberships tm 
          WHERE tm.user_id = v_user_id AND tm.status = 'active'
      ))
    WHERE 
      (
        p.owner_user_id = v_user_id
        OR pp.profile_id IN (SELECT id FROM org.business_profiles WHERE owner_user_id = v_user_id)
        OR pp.profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id)
      )
      AND (p_category <> 'team' OR (
        EXISTS (
            SELECT 1 FROM projects.stage_assignments sa_team 
            WHERE sa_team.project_stage_id IN (
                SELECT ps.id FROM projects.project_stages ps WHERE ps.project_id = p.id
            )
            AND sa_team.assignee_type = 'team'
            AND sa_team.team_id = p_category_id
        )
      ))
      AND (p_category <> 'service' OR (
        EXISTS (
            SELECT 1 FROM projects.project_required_skills prs
            JOIN org.skills s ON s.id = prs.skill_id
            WHERE prs.project_id = p.id AND s.id = p_category_id
        )
      ))
  ),
  calc_updates AS (
    SELECT
      up.id,
      (
        SELECT MAX(pa.created_at) 
        FROM projects.project_activity pa 
        WHERE pa.project_id = up.id
      ) as activity_ts,
      EXISTS (
        SELECT 1 
        FROM comms.notifications n 
        WHERE n.user_id = v_user_id 
        AND n.read_at IS NULL 
        AND (
            (n.entity_table = 'projects.projects' AND n.entity_id = up.id) OR
            (n.entity_table = 'projects.project_stages' AND n.entity_id IN (
                SELECT ps.id FROM projects.project_stages ps WHERE ps.project_id = up.id
            ))
        )
      ) as has_unread
    FROM user_projects up
  )
  SELECT
    p.id as project_id,
    p.title,
    p.status::text,
    NULL::text as banner_url,
    
    CASE 
      WHEN bp.id IS NOT NULL THEN bp.name 
      ELSE COALESCE(
        NULLIF(TRIM(CONCAT_WS(' ', up_public.first_name, up_public.last_name)), ''), 
        up_public.username
      )
    END as owner_name,
    
    CASE 
      WHEN bp.id IS NOT NULL THEN bp.logo_url 
      ELSE up_public.avatar_url 
    END as owner_avatar_url,

    up.is_starred,
    up.is_archived,
    cu.has_unread,
    COALESCE(cu.activity_ts, p.created_at) as last_updated_at,
    COUNT(*) OVER() as total_count

  FROM user_projects up
  JOIN projects.projects p ON p.id = up.id
  LEFT JOIN calc_updates cu ON cu.id = up.id
  LEFT JOIN org.business_profiles bp ON bp.id = p.client_business_id
  LEFT JOIN org.users_public up_public ON up_public.user_id = p.owner_user_id
  
  WHERE
    (p_search_query = '' OR p.title ILIKE '%' || p_search_query || '%')
    AND
    CASE 
      WHEN p_category = 'starred' THEN up.is_starred = true
      WHEN p_category = 'unread' THEN cu.has_unread = true
      WHEN p_category = 'in-progress' THEN p.status = 'active'
      WHEN p_category = 'completed' THEN p.status = 'completed'
      WHEN p_category = 'archived' THEN up.is_archived = true
      ELSE up.is_archived IS FALSE
    END

  ORDER BY
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'asc' THEN p.title END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'desc' THEN p.title END DESC,
    
    CASE WHEN p_sort_by = 'owner' AND p_sort_dir = 'asc' THEN 
        CASE 
          WHEN bp.id IS NOT NULL THEN bp.name 
          ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up_public.first_name, up_public.last_name)), ''), up_public.username)
        END 
    END ASC,
    CASE WHEN p_sort_by = 'owner' AND p_sort_dir = 'desc' THEN 
        CASE 
          WHEN bp.id IS NOT NULL THEN bp.name 
          ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up_public.first_name, up_public.last_name)), ''), up_public.username)
        END
    END DESC,
    
    -- Default Sort: Last Updated Descending
    CASE WHEN p_sort_by = 'last_updated' AND p_sort_dir = 'asc' THEN COALESCE(cu.activity_ts, p.created_at) END ASC,
    CASE WHEN p_sort_by = 'last_updated' AND p_sort_dir = 'desc' THEN COALESCE(cu.activity_ts, p.created_at) END DESC,
    
    -- Fallback sort to ensure consistent pagination
    p.id DESC

  LIMIT p_limit OFFSET p_offset;
END;
$$;