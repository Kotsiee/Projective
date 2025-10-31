ALTER TABLE org.business_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: owner or admin
CREATE POLICY pol_org_business_profiles_select_owner
ON org.business_profiles
FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- INSERT: user can create business profiles for themselves
CREATE POLICY pol_org_business_profiles_insert_self
ON org.business_profiles
FOR INSERT
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: owner or admin
CREATE POLICY pol_org_business_profiles_update_owner
ON org.business_profiles
FOR UPDATE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
)
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- DELETE: owner or admin
CREATE POLICY pol_org_business_profiles_delete_owner
ON org.business_profiles
FOR DELETE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);
