ALTER TABLE security.audit_logs ENABLE ROW LEVEL SECURITY;

-- allow a user to read only their own audit trail, plus admins
CREATE POLICY pol_security_audit_logs_select_self_or_admin
ON security.audit_logs
FOR SELECT
USING (
  audit_logs.user_id = auth.uid()
  OR security.is_admin() = true
);

-- no INSERT/UPDATE/DELETE policies for public
-- audit rows are inserted by service_role from the API layer
