-- ============================================================
-- TABLE: org.team_memberships
-- ============================================================
ALTER TABLE org.team_memberships ENABLE ROW LEVEL SECURITY;

-- SELECT: Visibility Rule
DROP POLICY IF EXISTS "Users can view members of their teams" ON org.team_memberships;

CREATE POLICY "Users can view members of their teams" ON org.team_memberships FOR
SELECT TO public USING (
        -- I am the user in this row
        user_id = auth.uid ()
        OR
        -- OR I am a member of the team this row belongs to (Uses recursion breaker)
        org.is_active_team_member (team_id)
        OR security.is_admin ()
    );

-- INSERT: Add Members Rule
DROP POLICY IF EXISTS "Team owners can add members" ON org.team_memberships;

CREATE POLICY "Team owners can add members" ON org.team_memberships FOR
INSERT
    TO public
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM org.teams t
            WHERE
                t.id = team_id
                AND t.owner_user_id = auth.uid ()
        )
        OR security.is_admin ()
    );

-- UPDATE: Manage Members Rule
DROP POLICY IF EXISTS "Team owners can update members" ON org.team_memberships;

CREATE POLICY "Team owners can update members" ON org.team_memberships FOR
UPDATE TO public USING (
    EXISTS (
        SELECT 1
        FROM org.teams t
        WHERE
            t.id = team_id
            AND t.owner_user_id = auth.uid ()
    )
    OR security.is_admin ()
);

-- DELETE: Remove/Leave Rule
DROP POLICY IF EXISTS "Team owners can remove members or members can leave" ON org.team_memberships;

CREATE POLICY "Team owners can remove members or members can leave" ON org.team_memberships FOR DELETE TO public USING (
    -- I am the user leaving
    user_id = auth.uid ()
    OR
    -- OR I am the owner of the team
    EXISTS (
        SELECT 1
        FROM org.teams t
        WHERE
            t.id = team_id
            AND t.owner_user_id = auth.uid ()
    )
    OR security.is_admin ()
);