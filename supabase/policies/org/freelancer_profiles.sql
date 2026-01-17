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