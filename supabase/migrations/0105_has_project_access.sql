CREATE OR REPLACE FUNCTION projects.has_project_access(_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, org, auth
AS $$
BEGIN
  -- A. Check if user is the Project Owner
  IF EXISTS (
    SELECT 1 FROM projects.projects
    WHERE id = _project_id AND owner_user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- B. Check if user is a Participant (via Freelancer Profile)
  IF EXISTS (
    SELECT 1 
    FROM projects.project_participants pp
    JOIN org.freelancer_profiles fp ON pp.profile_id = fp.id
    WHERE pp.project_id = _project_id
      AND pp.profile_type = 'freelancer'
      AND fp.user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- C. Check if user is a Participant (via Business Profile)
  IF EXISTS (
    SELECT 1 
    FROM projects.project_participants pp
    JOIN org.business_profiles bp ON pp.profile_id = bp.id
    WHERE pp.project_id = _project_id
      AND pp.profile_type = 'business'
      AND bp.owner_user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;