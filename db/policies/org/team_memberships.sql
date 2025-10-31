ALTER TABLE org.team_memberships ENABLE ROW LEVEL SECURITY;

-- SELECT: any active member of the same team may view
CREATE POLICY pol_org_team_memberships_select_team_member
ON org.team_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM org.team_memberships me
    WHERE me.team_id = team_memberships.team_id
      AND me.user_id = auth.uid()
      AND me.status = 'active'
  )
  OR security.is_admin() = true
);

-- INSERT: only team owner (or admin) can add members
CREATE POLICY pol_org_team_memberships_insert_team_owner
ON org.team_memberships
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_id
      AND t.owner_user_id = auth.uid()
  )
  OR security.is_admin() = true
);

-- UPDATE: team owner, team_lead/admin role, or platform admin
CREATE POLICY pol_org_team_memberships_update_team_owner
ON org.team_memberships
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_memberships.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM org.team_memberships me
    WHERE me.team_id = team_memberships.team_id
      AND me.user_id = auth.uid()
      AND me.role IN ('team_lead','admin')
      AND me.status = 'active'
  )
  OR security.is_admin() = true
)
WITH CHECK (
  TRUE
);

-- DELETE: same as update (remove member)
CREATE POLICY pol_org_team_memberships_delete_team_owner
ON org.team_memberships
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_memberships.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR security.is_admin() = true
);
