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