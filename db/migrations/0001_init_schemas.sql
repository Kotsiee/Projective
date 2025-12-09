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
CREATE TYPE IF NOT EXISTS profile_type AS ENUM ('freelancer', 'business');

CREATE TYPE IF NOT EXISTS assignment_type AS ENUM ('freelancer', 'team');

CREATE TYPE IF NOT EXISTS visibility AS ENUM ('public', 'invite_only', 'unlisted');

CREATE TYPE IF NOT EXISTS project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');

CREATE TYPE IF NOT EXISTS stage_status AS ENUM ('open','assigned','in_progress','submitted','approved','revisions','paid');

CREATE TYPE IF NOT EXISTS dispute_status AS ENUM ('open', 'under_review', 'resolved', 'refunded');

CREATE TYPE IF NOT EXISTS public.timeline_preset AS ENUM (
  'sequential', 'simultaneous', 'staggered', 'custom'
);

CREATE TYPE IF NOT EXISTS public.ip_option_mode AS ENUM (
  'exclusive_transfer', 'licensed_use', 'shared_ownership', 'projective_partner'
);

CREATE TYPE IF NOT EXISTS public.portfolio_rights AS ENUM (
  'allowed', 'forbidden', 'embargoed'
);

CREATE TYPE IF NOT EXISTS public.budget_type AS ENUM (
  'fixed_price', 'hourly_cap'
);

CREATE TYPE IF NOT EXISTS public.stage_type_enum AS ENUM (
  'file_based', 'session_based', 'group_session_based', 'management_based', 'maintenance_based'
);

CREATE TYPE IF NOT EXISTS public.start_trigger_type AS ENUM (
  'fixed_date', 'on_project_start', 'on_hire_confirmed', 'dependent_on_stage'
);