DROP POLICY IF EXISTS "pol_org_business_profiles_delete_owner" ON org.business_profiles;

CREATE POLICY "pol_org_business_profiles_delete_owner" ON org.business_profiles FOR DELETE TO public USING (
    (owner_user_id = auth.uid ())
    OR (security.is_admin () = true)
);

DROP POLICY IF EXISTS "pol_org_business_profiles_insert_self" ON org.business_profiles;

CREATE POLICY "pol_org_business_profiles_insert_self" ON org.business_profiles FOR
INSERT
    TO public
WITH
    CHECK (
        (owner_user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_business_profiles_select_owner" ON org.business_profiles;

CREATE POLICY "pol_org_business_profiles_select_owner" ON org.business_profiles FOR
SELECT TO public USING (
        (owner_user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_business_profiles_update_owner" ON org.business_profiles;

CREATE POLICY "pol_org_business_profiles_update_owner" ON org.business_profiles FOR
UPDATE TO public USING (
    (owner_user_id = auth.uid ())
    OR (security.is_admin () = true)
)
WITH
    CHECK (
        (owner_user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_freelancer_profiles_insert_self" ON org.freelancer_profiles;

CREATE POLICY "pol_org_freelancer_profiles_insert_self" ON org.freelancer_profiles FOR
INSERT
    TO public
WITH
    CHECK (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_freelancer_profiles_select_owner" ON org.freelancer_profiles;

CREATE POLICY "pol_org_freelancer_profiles_select_owner" ON org.freelancer_profiles FOR
SELECT TO public USING (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_freelancer_profiles_update_owner" ON org.freelancer_profiles;

CREATE POLICY "pol_org_freelancer_profiles_update_owner" ON org.freelancer_profiles FOR
UPDATE TO public USING (
    (user_id = auth.uid ())
    OR (security.is_admin () = true)
)
WITH
    CHECK (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

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

DROP POLICY IF EXISTS "pol_org_freelancer_profiles_insert_self" ON org.freelancer_profiles;

CREATE POLICY "pol_org_freelancer_profiles_insert_self" ON org.freelancer_profiles FOR
INSERT
    TO public
WITH
    CHECK (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_freelancer_profiles_select_owner" ON org.freelancer_profiles;

CREATE POLICY "pol_org_freelancer_profiles_select_owner" ON org.freelancer_profiles FOR
SELECT TO public USING (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_freelancer_profiles_update_owner" ON org.freelancer_profiles;

CREATE POLICY "pol_org_freelancer_profiles_update_owner" ON org.freelancer_profiles FOR
UPDATE TO public USING (
    (user_id = auth.uid ())
    OR (security.is_admin () = true)
)
WITH
    CHECK (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

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

-- SELECT: you can read only your own email records
CREATE POLICY pol_org_user_emails_select_self ON org.user_emails FOR
SELECT USING (
        user_id = auth.uid ()
        OR security.is_admin () = true
    );

-- INSERT: you can add an email for yourself
CREATE POLICY pol_org_user_emails_insert_self ON org.user_emails FOR
INSERT
WITH
    CHECK (
        user_id = auth.uid ()
        OR security.is_admin () = true
    );

-- UPDATE: you can update only your own row
CREATE POLICY pol_org_user_emails_update_self ON org.user_emails FOR
UPDATE USING (
    user_id = auth.uid ()
    OR security.is_admin () = true
)
WITH
    CHECK (
        user_id = auth.uid ()
        OR security.is_admin () = true
    );

-- DELETE: you can delete only your own row
CREATE POLICY pol_org_user_emails_delete_self ON org.user_emails FOR DELETE USING (
    user_id = auth.uid ()
    OR security.is_admin () = true
);

DROP POLICY IF EXISTS "pol_org_users_public_insert_self" ON org.users_public;

CREATE POLICY "pol_org_users_public_insert_self" ON org.users_public FOR
INSERT
    TO public
WITH
    CHECK (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );

DROP POLICY IF EXISTS "pol_org_users_public_select_all_auth" ON org.users_public;

CREATE POLICY "pol_org_users_public_select_all_auth" ON org.users_public FOR
SELECT TO public USING ((auth.uid () IS NOT NULL));

DROP POLICY IF EXISTS "pol_org_users_public_update_self" ON org.users_public;

CREATE POLICY "pol_org_users_public_update_self" ON org.users_public FOR
UPDATE TO public USING (
    (user_id = auth.uid ())
    OR (security.is_admin () = true)
)
WITH
    CHECK (
        (user_id = auth.uid ())
        OR (security.is_admin () = true)
    );