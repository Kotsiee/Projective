GRANT USAGE ON SCHEMA security TO authenticated;

GRANT USAGE ON SCHEMA security TO service_role;

GRANT
SELECT,
INSERT
,
UPDATE ON
TABLE security.session_context TO authenticated;

GRANT ALL ON TABLE security.session_context TO service_role;

ALTER TABLE security.session_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own session context" ON security.session_context;

CREATE POLICY "Users can view own session context" ON security.session_context FOR
SELECT TO authenticated USING (user_id = auth.uid ());

DROP POLICY IF EXISTS "Users can manage own session context" ON security.session_context;

CREATE POLICY "Users can manage own session context" ON security.session_context FOR ALL TO authenticated USING (user_id = auth.uid ())
WITH
    CHECK (user_id = auth.uid ());