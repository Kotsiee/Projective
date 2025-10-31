ALTER TABLE org.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: owner or admin
CREATE POLICY pol_org_freelancer_profiles_select_owner
ON org.freelancer_profiles
FOR SELECT
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- INSERT: user can create exactly one freelancer profile tied to themselves
CREATE POLICY pol_org_freelancer_profiles_insert_self
ON org.freelancer_profiles
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: only owner / admin can edit
CREATE POLICY pol_org_freelancer_profiles_update_owner
ON org.freelancer_profiles
FOR UPDATE
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
)
WITH CHECK (
  user_id = auth.uid()
  OR security.is_admin() = true
);

/* no DELETE */
