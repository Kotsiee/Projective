-- db/migrations/0005_ops_tables.sql

-- ops.admin_users:
-- List of platform-level admins / moderators.
-- If you're in here, you get elevated access in RLS checks via security.is_admin().

CREATE TABLE ops.admin_users (
  user_id     uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text        NOT NULL DEFAULT 'admin', -- e.g. 'admin', 'support', 'moderator'
  granted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Optional: audit who added admins.
-- You can later enforce "only existing admins can INSERT here" with a policy if you ever expose it.
-- For now we’ll keep it service-role only and not RLS-enable it.
