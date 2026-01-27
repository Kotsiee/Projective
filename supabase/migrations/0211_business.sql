-- ============================================================
-- TABLE: org.business_profiles
-- ============================================================
ALTER TABLE org.business_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT
DROP POLICY IF EXISTS "Users can view their own business profiles" ON org.business_profiles;

CREATE POLICY "Users can view their own business profiles" ON org.business_profiles FOR
SELECT TO public USING (
        owner_user_id = auth.uid ()
        OR security.is_admin ()
    );

-- INSERT
DROP POLICY IF EXISTS "Users can create their own business profiles" ON org.business_profiles;

CREATE POLICY "Users can create their own business profiles" ON org.business_profiles FOR
INSERT
    TO public
WITH
    CHECK (
        owner_user_id = auth.uid ()
        OR security.is_admin ()
    );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own business profiles" ON org.business_profiles;

CREATE POLICY "Users can update their own business profiles" ON org.business_profiles FOR
UPDATE TO public USING (
    owner_user_id = auth.uid ()
    OR security.is_admin ()
);

-- DELETE
DROP POLICY IF EXISTS "Users can delete their own business profiles" ON org.business_profiles;

CREATE POLICY "Users can delete their own business profiles" ON org.business_profiles FOR DELETE TO public USING (
    owner_user_id = auth.uid ()
    OR security.is_admin ()
);