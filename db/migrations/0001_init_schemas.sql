-- db/migrations/0001_init_schemas.sql

-- core schemas
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS comms;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS marketplace;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS integrations;

-- enums
CREATE TYPE profile_type AS ENUM ('freelancer', 'business');
CREATE TYPE assignment_type AS ENUM ('freelancer', 'team');
CREATE TYPE visibility AS ENUM ('public', 'invite_only', 'unlisted');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE stage_status AS ENUM ('open','assigned','in_progress','submitted','approved','revisions','paid');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'refunded');

