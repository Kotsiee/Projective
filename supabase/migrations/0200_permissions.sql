-- -----------------------------------------------------------------------------
-- SCHEMA PERMISSIONS SETUP
-- Based on provided access control JSON
-- -----------------------------------------------------------------------------

-- 1. Reset/Revoke permissions on Application Schemas to ensure a clean slate.
-- We do not touch system schemas (auth, storage, etc) to avoid platform breakage.
REVOKE USAGE ON SCHEMA analytics,
comms,
files,
finance,
integrations,
marketplace,
ops,
org,
projects,
search,
security
FROM
    anon,
    authenticated,
    service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA analytics,
comms,
files,
finance,
integrations,
marketplace,
ops,
org,
projects,
search,
security
FROM
    anon,
    authenticated,
    service_role;

-- -----------------------------------------------------------------------------
-- GRANTS: PUBLIC ACCESS (Anon + Auth)
-- -----------------------------------------------------------------------------

-- Schema: ORG
GRANT USAGE ON SCHEMA org TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA org TO anon, authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA org TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA org
GRANT ALL ON TABLES TO anon,
authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA org
GRANT ALL ON SEQUENCES TO anon,
authenticated;

-- Schema: PUBLIC (Standard Supabase default)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,
authenticated,
service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon,
authenticated,
service_role;

-- -----------------------------------------------------------------------------
-- GRANTS: AUTHENTICATED ONLY
-- -----------------------------------------------------------------------------

-- Schema: COMMS
GRANT USAGE ON SCHEMA comms TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA comms TO authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA comms TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA comms
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA comms
GRANT ALL ON SEQUENCES TO authenticated;

-- Schema: FILES
GRANT USAGE ON SCHEMA files TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA files TO authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA files TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA files
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA files
GRANT ALL ON SEQUENCES TO authenticated;

-- -----------------------------------------------------------------------------
-- GRANTS: AUTHENTICATED + SERVICE_ROLE (No Anon)
-- -----------------------------------------------------------------------------

-- Schema: PROJECTS
-- Note: JSON specified 'anon_can_use: false'.
-- This hides project data from unauthenticated users completely.
GRANT USAGE ON SCHEMA projects TO authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA projects TO authenticated,
service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA projects TO authenticated,
service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA projects
GRANT ALL ON TABLES TO authenticated,
service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA projects
GRANT ALL ON SEQUENCES TO authenticated,
service_role;

-- -----------------------------------------------------------------------------
-- RESTRICTED SCHEMAS (Admin/Postgres Only)
-- -----------------------------------------------------------------------------
-- The following schemas explicitly have NO permissions for anon/authenticated/service_role
-- based on the "false" flags in the configuration. They are accessible only by the
-- superuser (postgres) or via direct SQL editor execution.

-- analytics
-- finance
-- integrations
-- marketplace
-- ops
-- search
-- security

-- -----------------------------------------------------------------------------
-- SYSTEM SCHEMAS (Reference Only - Managed by Platform)
-- -----------------------------------------------------------------------------
-- api          -> Anon, Auth, Service
-- auth         -> Anon, Auth, Service
-- storage      -> Anon, Auth, Service
-- realtime     -> Anon, Auth, Service