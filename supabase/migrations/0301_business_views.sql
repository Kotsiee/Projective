CREATE OR REPLACE VIEW org.view_business_staff AS
SELECT
    bm.business_id,
    bm.user_id,
    bm.role as membership_role, -- 'owner', 'member'
    bm.status,
    bm.joined_at,
    up.first_name,
    up.last_name,
    up.username,
    up.avatar_url,
    ue.email -- Fetched from the joined emails table
FROM org.business_memberships bm
    JOIN org.users_public up ON up.user_id = bm.user_id
    -- FIXED: Join user_emails to get the address, filtering for the primary one
    LEFT JOIN org.user_emails ue ON ue.user_id = bm.user_id
    AND ue.is_primary = true;

-- Grant Access
GRANT SELECT ON org.view_business_staff TO authenticated;