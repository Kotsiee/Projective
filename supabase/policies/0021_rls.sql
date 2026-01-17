-- Enable Row Level Security on all application tables
-- This ensures that by default, no data is accessible unless a policy exists.

-- ORG SCHEMA
ALTER TABLE org.attachments ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.business_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.freelancer_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.org_invitations ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.portfolios ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.profile_links ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.team_memberships ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.team_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.user_emails ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.user_skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE org.users_public ENABLE ROW LEVEL SECURITY;

-- PROJECTS SCHEMA
ALTER TABLE projects.maintenance_contracts ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.project_activity ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.project_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.project_stages ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.stage_assignments ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.stage_budget_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.stage_open_seats ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.stage_revision_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.stage_staffing_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects.stage_submissions ENABLE ROW LEVEL SECURITY;

-- COMMS SCHEMA
-- Note: Some of these were false in your dump, enabled here for security.
ALTER TABLE comms.channel_files ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.device_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.dm_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.dm_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.dm_threads ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.message_attachments ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.notification_prefs ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.project_channel_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.project_channels ENABLE ROW LEVEL SECURITY;

ALTER TABLE comms.project_messages ENABLE ROW LEVEL SECURITY;

-- OPS SCHEMA
ALTER TABLE ops.admin_users ENABLE ROW LEVEL SECURITY;