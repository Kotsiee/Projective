ALTER TABLE security.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- DO NOT expose refresh tokens to regular users at all.
-- No SELECT/INSERT/UPDATE/DELETE policies on purpose.

-- Only service_role should ever touch this table, and service_role bypasses RLS.
-- That means from the browser you literally cannot query this table.
