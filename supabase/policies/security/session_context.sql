ALTER TABLE security.session_context ENABLE ROW LEVEL SECURITY;

-- SELECT own context
CREATE POLICY pol_security_session_context_select_self
ON security.session_context
FOR SELECT
USING ( user_id = auth.uid() );

-- INSERT own context
CREATE POLICY pol_security_session_context_insert_self
ON security.session_context
FOR INSERT
WITH CHECK ( user_id = auth.uid() );

-- UPDATE own context
CREATE POLICY pol_security_session_context_update_self
ON security.session_context
FOR UPDATE
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- no DELETE policy for normal users
