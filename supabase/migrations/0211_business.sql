-- ... (Existing RLS for business_profiles) ...

-- ============================================================
-- TABLE: org.business_memberships
-- ============================================================
ALTER TABLE org.business_memberships ENABLE ROW LEVEL SECURITY;

-- VIEW: Members can see who else is in the business
CREATE POLICY "Members can view business roster" ON org.business_memberships FOR
SELECT TO authenticated USING (
        org.is_active_business_member (business_id)
        OR security.is_admin ()
    );

-- MANAGE: Owners can manage members
CREATE POLICY "Owners can manage members" ON org.business_memberships FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM org.business_profiles
        WHERE
            id = business_id
            AND owner_user_id = auth.uid ()
    )
    OR security.is_admin ()
);

-- ============================================================
-- TABLE: org.business_roles
-- ============================================================
ALTER TABLE org.business_roles ENABLE ROW LEVEL SECURITY;

-- VIEW: Members can see available roles
CREATE POLICY "Members can view business roles" ON org.business_roles FOR
SELECT TO authenticated USING (
        org.is_active_business_member (business_id)
    );

-- MANAGE: Owners can manage roles
CREATE POLICY "Owners can manage business roles" ON org.business_roles FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM org.business_profiles
        WHERE
            id = business_id
            AND owner_user_id = auth.uid ()
    )
);