-- SELECT: Visible to Owner OR Active Members OR Admin
DROP POLICY IF EXISTS "Users can view teams they belong to or own" ON org.teams;

CREATE POLICY "Users can view teams they belong to or own" ON org.teams FOR
SELECT TO public USING (
        owner_user_id = auth.uid ()
        OR org.is_active_team_member (id) -- Uses the helper function
        OR security.is_admin ()
    );

-- INSERT: Authenticated users can create teams
DROP POLICY IF EXISTS "Users can create teams" ON org.teams;

CREATE POLICY "Users can create teams" ON org.teams FOR
INSERT
    TO public
WITH
    CHECK (
        owner_user_id = auth.uid ()
        OR security.is_admin ()
    );

-- UPDATE: Owner OR Admin only
DROP POLICY IF EXISTS "Team owners can update their teams" ON org.teams;

CREATE POLICY "Team owners can update their teams" ON org.teams FOR
UPDATE TO public USING (
    owner_user_id = auth.uid ()
    OR security.is_admin ()
);

-- DELETE: Owner OR Admin only
DROP POLICY IF EXISTS "Team owners can delete their teams" ON org.teams;

CREATE POLICY "Team owners can delete their teams" ON org.teams FOR DELETE TO public USING (
    owner_user_id = auth.uid ()
    OR security.is_admin ()
);