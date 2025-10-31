ALTER TABLE org.teams ENABLE ROW LEVEL SECURITY;

-- SELECT: show teams you are a member of OR that you own OR admin
CREATE POLICY pol_org_teams_select_member_or_owner
ON org.teams
FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM org.team_memberships tm
    WHERE tm.team_id = id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
  OR security.is_admin() = true
);

-- INSERT: any user can create a team they own
CREATE POLICY pol_org_teams_insert_self
ON org.teams
FOR INSERT
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: only owner or admin
CREATE POLICY pol_org_teams_update_owner
ON org.teams
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
CREATE POLICY pol_org_teams_delete_owner
ON org.teams
FOR DELETE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);
