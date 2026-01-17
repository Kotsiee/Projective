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