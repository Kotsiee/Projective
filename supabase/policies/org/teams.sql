DROP POLICY IF EXISTS "pol_org_teams_delete_owner" ON org.teams;

CREATE POLICY "pol_org_teams_delete_owner" ON org.teams FOR DELETE TO public USING (
    (owner_user_id = auth.uid ())
    OR (security.is_admin () = true)
);

DROP POLICY IF EXISTS "pol_org_teams_insert_self" ON org.teams;

CREATE POLICY "pol_org_teams_insert_self" ON org.teams FOR
INSERT
    TO public
WITH
    CHECK (
        (owner_user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_teams_select_member_or_owner" ON org.teams;

CREATE POLICY "pol_org_teams_select_member_or_owner" ON org.teams
    FOR SELECT
    TO public
    USING ((owner_user_id = auth.uid()) OR (EXISTS ( SELECT 1
       FROM org.team_memberships tm
      WHERE ((tm.team_id = tm.id) AND (tm.user_id = auth.uid()) AND (tm.status = 'active'::text)))) OR (security.is_admin() = true));

DROP POLICY IF EXISTS "pol_org_teams_update_owner" ON org.teams;

CREATE POLICY "pol_org_teams_update_owner" ON org.teams FOR
UPDATE TO public USING (
    (owner_user_id = auth.uid ())
    OR (security.is_admin () = true)
)
WITH
    CHECK (
        (owner_user_id = auth.uid ())
        OR (security.is_admin () = true)
    );