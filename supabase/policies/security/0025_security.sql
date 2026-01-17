ALTER TABLE security.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_security_audit_logs_select_self_or_admin ON security.audit_logs FOR
SELECT USING (
        audit_logs.user_id = auth.uid ()
        OR security.is_admin () = true
    );

ALTER TABLE security.refresh_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE security.session_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_security_session_context_select_self ON security.session_context FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY pol_security_session_context_insert_self ON security.session_context FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY pol_security_session_context_update_self ON security.session_context FOR
UPDATE USING (user_id = auth.uid ())
WITH
    CHECK (user_id = auth.uid ());

ALTER VIEW security.v_current_context SET(security_invoker = true);