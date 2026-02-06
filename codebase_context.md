# Selected Codebase Context

> Included paths: ./supabase/migrations

## Project Tree (Selected)

```text
./supabase/migrations/
  migrations/
  0000_init_enums.sql
  0001_init_schemas.sql
  0002_org_tables.sql
  0003_security_tables.sql
  0004_ops_tables.sql
  0005_projects_tables.sql
  0006_comms_tables.sql
  0007_finance_tables.sql
  0008_files_tables.sql
  0009_helpers_functions.sql
  0100_context_switcher.sql
  0101_create_project.sql
  0102_get_dashboard_project_details.sql
  0103_get_dashboard_projects.sql
  0104_get_dashboard_stage_details.sql
  0105_has_project_access.sql
  0106_onboard_user_rpc.sql
  0107_create_team.sql
  0108_get_dashboard_teams.sql
  0109_is_active_team_member.sql
  0110_business_management.sql
  0111_business_helpers.sql
  0200_permissions.sql
  0201_rls.sql
  0202_comms.sql
  0203_users.sql
  0204_projects.sql
  0205_security.sql
  0206_realtime.sql
  0207_storage.sql
  0208_files.sql
  0209_teams.sql
  0210_freelancers.sql
  0211_business.sql
  0212_team_memberships.sql
  0213_user_preferences.sql
  0300_message_file_details.sql
  0301_business_views.sql
```

## File Contents

### File: supabase\migrations\0000_init_enums.sql

```sql
-- 1. profile_type
DO $$ BEGIN
    CREATE TYPE profile_type AS ENUM ('freelancer', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. assignment_type
DO $$ BEGIN
    CREATE TYPE assignment_type AS ENUM ('freelancer', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. visibility
DO $$ BEGIN
    CREATE TYPE visibility AS ENUM ('public', 'invite_only', 'unlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. project_status
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. stage_status
DO $$ BEGIN
    CREATE TYPE stage_status AS ENUM ('open','assigned','in_progress','submitted','approved','revisions','paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. dispute_status
DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. timeline_preset
DO $$ BEGIN
    CREATE TYPE public.timeline_preset AS ENUM ('sequential', 'simultaneous', 'staggered', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. ip_option_mode
DO $$ BEGIN
    CREATE TYPE public.ip_option_mode AS ENUM ('exclusive_transfer', 'licensed_use', 'shared_ownership', 'projective_partner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. portfolio_rights
DO $$ BEGIN
    CREATE TYPE public.portfolio_rights AS ENUM ('allowed', 'forbidden', 'embargoed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. budget_type
DO $$ BEGIN
    CREATE TYPE public.budget_type AS ENUM ('fixed_price', 'hourly_cap');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 11. stage_type_enum
DO $$ BEGIN
    CREATE TYPE public.stage_type_enum AS ENUM ('file_based', 'session_based', 'group_session_based', 'management_based', 'maintenance_based');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 12. start_trigger_type
DO $$ BEGIN
    CREATE TYPE public.start_trigger_type AS ENUM ('fixed_date', 'on_project_start', 'on_hire_confirmed', 'dependent_on_stage');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

### File: supabase\migrations\0001_init_schemas.sql

```sql
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

CREATE SCHEMA IF NOT EXISTS files;
```

### File: supabase\migrations\0002_org_tables.sql

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE org.skills (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    slug text NOT NULL UNIQUE,
    label text NOT NULL,
    CONSTRAINT skills_pkey PRIMARY KEY (id)
);

CREATE TABLE org.users_public (
    user_id uuid NOT NULL,
    username text NOT NULL UNIQUE,
    first_name text,
    last_name text,
    avatar_url text,
    country text,
    timezone text,
    languages text[] NOT NULL DEFAULT '{}'::text[],
    dob date NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    visibility text NOT NULL DEFAULT 'public'::text,
    description jsonb NOT NULL DEFAULT '{}'::jsonb,
    headline text NOT NULL DEFAULT ''::text,
    CONSTRAINT users_public_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_public_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE org.freelancer_profiles (
    user_id uuid NOT NULL,
    hourly_rate integer,
    skills text[] NOT NULL DEFAULT '{}'::text[],
    availability_status text DEFAULT 'available',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT freelancer_profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT freelancer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE org.business_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    legal_name text,
    logo_url text,
    country text,
    billing_email text NOT NULL,
    plan text NOT NULL DEFAULT 'free'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    headline text NOT NULL DEFAULT ''::text,
    description jsonb NOT NULL DEFAULT '{}'::jsonb,
    languages text[] NOT NULL DEFAULT '{}'::text[],
    timezone text,
    default_currency text DEFAULT 'USD',
    tax_id text,
    address_line_1 text,
    address_city text,
    address_zip text,
    CONSTRAINT business_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT business_profiles_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

-- NEW: Business Roles (Custom permissions within a business)
CREATE TABLE org.business_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL,
    title text NOT NULL, 
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb, 
    CONSTRAINT business_roles_pkey PRIMARY KEY (id),
    CONSTRAINT business_roles_business_id_fkey FOREIGN KEY (business_id) REFERENCES org.business_profiles(id)
);

-- NEW: Business Memberships (Staff list)

CREATE TABLE org.business_memberships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member'::text, 
    status text NOT NULL DEFAULT 'active'::text, 
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    
    CONSTRAINT business_memberships_pkey PRIMARY KEY (id),
    CONSTRAINT business_memberships_business_id_fkey FOREIGN KEY (business_id) REFERENCES org.business_profiles(id),
    CONSTRAINT business_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT business_memberships_unique_user_per_business UNIQUE (business_id, user_id) 
);

CREATE TABLE org.portfolios (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    cover_url text,
    attachment_id uuid,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT portfolios_pkey PRIMARY KEY (id),
        CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.freelancer_profiles (user_id) ON DELETE CASCADE
);

CREATE TABLE org.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE, 
    avatar_url text,
    headline text NOT NULL DEFAULT ''::text,
    description jsonb NOT NULL DEFAULT '{}'::jsonb, -- Updated to JSONB for consistency
    visibility text NOT NULL DEFAULT 'invite_only'::text, 
    payout_model text NOT NULL DEFAULT 'manager_discretion'::text, 
    default_payout_settings jsonb DEFAULT '{}'::jsonb, 
    treasury_wallet_id uuid, 
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT teams_pkey PRIMARY KEY (id),
    CONSTRAINT teams_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

CREATE TABLE org.user_emails (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    email text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    verified_at timestamp
    with
        time zone,
        created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT user_emails_pkey PRIMARY KEY (id),
        CONSTRAINT user_emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT user_emails_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES org.users_public (user_id)
);

CREATE TABLE org.team_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL,
    title text NOT NULL, 
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb, 
    CONSTRAINT team_roles_pkey PRIMARY KEY (id),
    CONSTRAINT team_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id)
);


CREATE TABLE org.team_memberships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member'::text, 
    status text NOT NULL DEFAULT 'active'::text, 
    default_split_share numeric(5,2), 
    invited_by uuid, 
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    
    CONSTRAINT team_memberships_pkey PRIMARY KEY (id),
    CONSTRAINT team_memberships_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id),
    CONSTRAINT team_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT team_memberships_inviter_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
    CONSTRAINT team_memberships_unique_user_per_team UNIQUE (team_id, user_id) 
);

CREATE TABLE org.org_invitations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    inviter_user_id uuid NOT NULL,
    target_email text NOT NULL,
    team_id uuid,
    business_profile_id uuid,
    token text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT org_invitations_pkey PRIMARY KEY (id),
    CONSTRAINT org_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES auth.users(id),
    CONSTRAINT org_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id),
    CONSTRAINT org_invitations_business_profile_id_fkey FOREIGN KEY (business_profile_id) REFERENCES org.business_profiles(id)
);

CREATE TABLE org.profile_links (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    profile_type text NOT NULL,
    profile_id uuid NOT NULL,
    kind text NOT NULL,
    url text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT profile_links_pkey PRIMARY KEY (id)
);

CREATE TABLE org.user_skills (
    user_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    proficiency smallint,
    CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id),
    CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES org.skills (id)
);

CREATE TABLE org.user_preferences (
    user_id uuid NOT NULL,
    theme text DEFAULT 'system',
    notification_email boolean DEFAULT true,
    notification_push boolean DEFAULT false,
    locale text DEFAULT 'en-US',
    CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);
```

### File: supabase\migrations\0003_security_tables.sql

```sql
CREATE TABLE security.feature_flags (
  key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feature_flags_pkey PRIMARY KEY (key)
);

CREATE TABLE security.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  request_id uuid,
  actor_profile_id uuid,
  actor_team_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE security.turnstile_verifications (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid,
    ip inet NOT NULL,
    token_prefix text NOT NULL,
    success boolean NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT turnstile_verifications_pkey PRIMARY KEY (id),
        CONSTRAINT turnstile_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

CREATE TABLE security.refresh_tokens (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    revoked boolean NOT NULL DEFAULT false,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        replaced_by uuid,
        CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
        CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT refresh_tokens_replaced_by_fkey FOREIGN KEY (replaced_by) REFERENCES security.refresh_tokens (id)
);

CREATE TABLE security.session_context (
    user_id uuid NOT NULL,
    active_profile_type public.profile_type,
    active_profile_id uuid,
    active_team_id uuid,
    updated_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT session_context_pkey PRIMARY KEY (user_id),
        CONSTRAINT session_context_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT session_context_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES org.users_public (user_id)
);
```

### File: supabase\migrations\0004_ops_tables.sql

```sql
CREATE TABLE ops.admin_users (
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin'::text,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (user_id),
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT admin_users_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id)
);
```

### File: supabase\migrations\0005_projects_tables.sql

```sql
CREATE TABLE projects.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_business_id uuid,
  owner_user_id uuid NOT NULL,
  title text NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  status project_status NOT NULL DEFAULT 'draft'::project_status,
  industry_category_id uuid,
  visibility visibility NOT NULL DEFAULT 'public'::visibility,
  currency text NOT NULL DEFAULT 'USD'::text,
  timeline_preset timeline_preset NOT NULL DEFAULT 'sequential'::timeline_preset,
  target_project_start_date timestamp with time zone,
  ip_ownership_mode ip_option_mode NOT NULL DEFAULT 'exclusive_transfer'::ip_option_mode,
  nda_required boolean NOT NULL DEFAULT false,
  portfolio_display_rights portfolio_rights NOT NULL DEFAULT 'allowed'::portfolio_rights,
  location_restriction text[] DEFAULT '{}'::text[],
  language_requirement text[] DEFAULT '{}'::text[],
  screening_questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_business_id_fkey FOREIGN KEY (client_business_id) REFERENCES org.business_profiles(id),
  CONSTRAINT projects_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

CREATE TABLE projects.project_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL,
  stage_type stage_type_enum NOT NULL,
  status stage_status NOT NULL DEFAULT 'open'::stage_status,
  start_trigger_type start_trigger_type NOT NULL DEFAULT 'on_project_start'::start_trigger_type,
  fixed_start_date timestamp with time zone,
  start_dependency_stage_id uuid,
  file_revisions_allowed integer DEFAULT 0,
  file_duration_mode text,
  file_duration_days integer,
  file_due_date timestamp with time zone,
  session_duration_minutes integer,
  session_count integer DEFAULT 1,
  management_contract_mode text,
  maintenance_cycle_interval text,
  ip_ownership_override ip_option_mode,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  ip_mode ip_option_mode DEFAULT 'exclusive_transfer'::ip_option_mode,
  CONSTRAINT project_stages_pkey PRIMARY KEY (id),
  CONSTRAINT project_stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id),
  CONSTRAINT project_stages_start_dependency_stage_id_fkey FOREIGN KEY (start_dependency_stage_id) REFERENCES projects.project_stages(id)
);

CREATE TABLE projects.maintenance_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  freelancer_profile_id uuid NOT NULL,
  business_profile_id uuid NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL,
  billing_interval text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_contracts_pkey PRIMARY KEY (id),
  -- FIXED: References user_id instead of id
  CONSTRAINT maintenance_contracts_freelancer_profile_id_fkey FOREIGN KEY (freelancer_profile_id) REFERENCES org.freelancer_profiles(user_id),
  CONSTRAINT maintenance_contracts_business_profile_id_fkey FOREIGN KEY (business_profile_id) REFERENCES org.business_profiles(id)
);

CREATE TABLE projects.project_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_activity_pkey PRIMARY KEY (id),
  CONSTRAINT project_activity_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id)
);

CREATE TABLE projects.project_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL,
    profile_type profile_type NOT NULL, -- 'freelancer' or 'business'
    profile_id uuid NOT NULL, -- Points to user_id (freelancer) or id (business)
    role text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT project_participants_pkey PRIMARY KEY (id),
        CONSTRAINT project_participants_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id)
);

CREATE TABLE projects.stage_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL,
    assignee_type assignment_type NOT NULL,
    freelancer_profile_id uuid,
    team_id uuid,
    assigned_by uuid NOT NULL,
    status text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT stage_assignments_pkey PRIMARY KEY (id),
        CONSTRAINT stage_assignments_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages (id),
        -- FIXED: References user_id instead of id
        CONSTRAINT stage_assignments_freelancer_profile_id_fkey FOREIGN KEY (freelancer_profile_id) REFERENCES org.freelancer_profiles (user_id),
        CONSTRAINT stage_assignments_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams (id),
        CONSTRAINT stage_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users (id)
);

CREATE TABLE projects.stage_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  submitted_by uuid NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  status text DEFAULT 'pending_review'::text,
  CONSTRAINT stage_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT stage_submissions_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages(id),
  CONSTRAINT stage_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id)
);

CREATE TABLE projects.project_attachments (
    project_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    CONSTRAINT project_attachments_pkey PRIMARY KEY (project_id, attachment_id),
    CONSTRAINT project_attachments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id),
    CONSTRAINT project_attachments_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES org.attachments (id)
);

CREATE TABLE projects.project_required_skills (
    project_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    CONSTRAINT project_required_skills_pkey PRIMARY KEY (project_id, skill_id),
    CONSTRAINT project_required_skills_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id),
    CONSTRAINT project_required_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES org.skills (id)
);

CREATE TABLE projects.user_preferences (
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    is_starred boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    last_viewed_at timestamp
    with
        time zone DEFAULT now(),
        CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id, project_id),
        CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT user_preferences_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id)
);

CREATE TABLE projects.stage_open_seats (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL,
    description_of_need text NOT NULL,
    budget_min_cents bigint,
    budget_max_cents bigint,
    require_proposals boolean NOT NULL DEFAULT true,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT stage_open_seats_pkey PRIMARY KEY (id),
        CONSTRAINT stage_open_seats_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages (id)
);

CREATE TABLE projects.stage_staffing_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  role_title text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  budget_type budget_type NOT NULL DEFAULT 'fixed_price'::budget_type,
  budget_amount_cents bigint NOT NULL CHECK (budget_amount_cents >= 0),
  allow_proposals boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stage_staffing_roles_pkey PRIMARY KEY (id),
  CONSTRAINT stage_staffing_roles_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages(id)
);

CREATE TABLE projects.submission_files (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    submission_id uuid NOT NULL,
    file_item_id uuid NOT NULL,
    CONSTRAINT submission_files_pkey PRIMARY KEY (id),
    CONSTRAINT fk_sub_file_submission FOREIGN KEY (submission_id) REFERENCES projects.stage_submissions (id)
);

CREATE TABLE projects.stage_budget_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL,
    rule_type text NOT NULL,
    amount_currency text NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    notes text,
    CONSTRAINT stage_budget_rules_pkey PRIMARY KEY (id)
);

CREATE TABLE projects.stage_revision_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  request_type text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT stage_revision_requests_pkey PRIMARY KEY (id),
  CONSTRAINT stage_revision_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id)
);
```

### File: supabase\migrations\0006_comms_tables.sql

```sql
CREATE TABLE comms.notification_prefs (
    user_id uuid NOT NULL,
    email boolean NOT NULL DEFAULT true,
    push boolean NOT NULL DEFAULT false,
    in_app boolean NOT NULL DEFAULT true,
    digest boolean NOT NULL DEFAULT false,
    quiet_hours tstzrange,
    CONSTRAINT notification_prefs_pkey PRIMARY KEY (user_id),
    CONSTRAINT notification_prefs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

CREATE TABLE comms.device_tokens (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    provider text NOT NULL,
    token text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT device_tokens_pkey PRIMARY KEY (id),
        CONSTRAINT device_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

CREATE TABLE comms.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    entity_table text,
    entity_id uuid,
    read_at timestamp
    with
        time zone,
        created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT notifications_pkey PRIMARY KEY (id),
        CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

CREATE TABLE comms.dm_threads (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    created_by_user_id uuid NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT dm_threads_pkey PRIMARY KEY (id),
        CONSTRAINT dm_threads_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users (id)
);

CREATE TABLE comms.dm_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT dm_participants_pkey PRIMARY KEY (id),
        CONSTRAINT dm_participants_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES comms.dm_threads (id),
        CONSTRAINT dm_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

CREATE TABLE comms.dm_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    thread_id uuid NOT NULL,
    sender_user_id uuid NOT NULL,
    body text NOT NULL,
    has_attachments boolean NOT NULL DEFAULT false,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        deleted_at timestamp
    with
        time zone,
        CONSTRAINT dm_messages_pkey PRIMARY KEY (id),
        CONSTRAINT dm_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES auth.users (id),
        CONSTRAINT dm_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES comms.dm_threads (id)
);

CREATE TABLE comms.project_channels (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    name text NOT NULL,
    stage_id uuid,
    visibility text NOT NULL DEFAULT 'project_all'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT project_channels_pkey PRIMARY KEY (id),
    CONSTRAINT project_channels_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id)
);

CREATE TABLE comms.project_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    channel_id uuid NOT NULL,
    sender_user_id uuid NOT NULL,
    body text NOT NULL,
    has_attachments boolean NOT NULL DEFAULT false,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        edited_at timestamp
    with
        time zone,
        deleted_at timestamp
    with
        time zone,
        CONSTRAINT project_messages_pkey PRIMARY KEY (id),
        CONSTRAINT project_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES comms.project_channels (id),
        CONSTRAINT project_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES auth.users (id)
);

CREATE TABLE comms.project_channel_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    channel_id uuid NOT NULL,
    profile_type public.profile_type NOT NULL, 
    profile_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'participant'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT project_channel_participants_pkey PRIMARY KEY (id),
    CONSTRAINT project_channel_participants_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES comms.project_channels(id)
);

CREATE TABLE comms.channel_files (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    channel_type text NOT NULL CHECK (
        channel_type IN ('project', 'dm')
    ),
    channel_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT channel_files_pkey PRIMARY KEY (id),
        CONSTRAINT channel_files_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES org.attachments (id)
);

CREATE TABLE comms.message_attachments (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    message_table text NOT NULL CHECK (
        message_table IN (
            'comms.project_messages',
            'comms.dm_messages'
        )
    ),
    message_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT message_attachments_pkey PRIMARY KEY (id),
        CONSTRAINT message_attachments_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES org.attachments (id)
);
```

### File: supabase\migrations\0007_finance_tables.sql

```sql
CREATE TABLE IF NOT EXISTS finance.wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_type text NOT NULL,
    owner_id uuid NOT NULL,
    currency text NOT NULL,
    balance_cents bigint NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_wallet_owner_currency UNIQUE (
        owner_type,
        owner_id,
        currency
    )
);

CREATE INDEX IF NOT EXISTS idx_wallets_owner ON finance.wallets (owner_type, owner_id);

CREATE TABLE IF NOT EXISTS finance.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    wallet_id uuid NOT NULL REFERENCES finance.wallets (id) ON DELETE CASCADE,
    direction text NOT NULL CHECK (
        direction IN ('credit', 'debit')
    ),
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    reason text NOT NULL,
    ref_table text NULL,
    ref_id uuid NULL,
    balance_after_cents bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_created ON finance.transactions (wallet_id, created_at DESC);

CREATE TABLE IF NOT EXISTS finance.escrows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE RESTRICT,
    payer_business_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    payee_type assignment_type NOT NULL,
    payee_id uuid NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    status text NOT NULL DEFAULT 'funded',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE finance.escrows
ADD CONSTRAINT fk_escrows_payee_freelancer FOREIGN KEY (payee_id) REFERENCES org.freelancer_profiles (id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE finance.escrows
ADD CONSTRAINT fk_escrows_payee_team FOREIGN KEY (payee_id) REFERENCES org.teams (id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS idx_escrows_stage ON finance.escrows (project_stage_id);

CREATE INDEX IF NOT EXISTS idx_escrows_payer_business ON finance.escrows (payer_business_id);

CREATE INDEX IF NOT EXISTS idx_escrows_payee ON finance.escrows (payee_type, payee_id);

CREATE TABLE IF NOT EXISTS finance.payout_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_type text NOT NULL,
    owner_id uuid NOT NULL,
    provider text NOT NULL,
    account_id text NOT NULL,
    status text NOT NULL DEFAULT 'pending_verification',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_payout_accounts_provider_account UNIQUE (provider, account_id)
);

CREATE INDEX IF NOT EXISTS idx_payout_accounts_owner ON finance.payout_accounts (owner_type, owner_id);

CREATE TABLE IF NOT EXISTS finance.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    issue_to_business_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    issue_from_profile uuid NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_business ON finance.invoices (
    issue_to_business_id,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_invoices_stage ON finance.invoices (project_stage_id);

CREATE TABLE IF NOT EXISTS finance.disputes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    escrow_id uuid NOT NULL REFERENCES finance.escrows (id) ON DELETE CASCADE,
    opened_by_profile uuid NOT NULL,
    reason text NOT NULL,
    status dispute_status NOT NULL DEFAULT 'open',
    resolution_notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_disputes_escrow ON finance.disputes (escrow_id);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON finance.disputes (status, created_at DESC);

CREATE TABLE IF NOT EXISTS finance.dispute_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    dispute_id uuid NOT NULL REFERENCES finance.disputes (id) ON DELETE CASCADE,
    sender_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_created ON finance.dispute_messages (dispute_id, created_at ASC);

CREATE TABLE IF NOT EXISTS finance.ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    rater_profile uuid NOT NULL,
    ratee_type text NOT NULL,
    ratee_id uuid NOT NULL,
    score smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_ratee ON finance.ratings (ratee_type, ratee_id);

CREATE INDEX IF NOT EXISTS idx_ratings_project ON finance.ratings (project_id);

CREATE TABLE IF NOT EXISTS finance.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    profile_id uuid NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    started_at timestamptz NOT NULL DEFAULT now(),
    ends_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON finance.subscriptions (profile_id, status);
```

### File: supabase\migrations\0008_files_tables.sql

```sql
CREATE TABLE files.folders (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    owner_user_id uuid NOT NULL,
    parent_folder_id uuid,
    name text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT folders_pkey PRIMARY KEY (id),
        CONSTRAINT folders_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users (id),
        CONSTRAINT folders_parent_fkey FOREIGN KEY (parent_folder_id) REFERENCES files.folders (id)
);

CREATE TABLE files.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  folder_id uuid,
  bucket_id text NOT NULL,
  storage_path text NOT NULL,
  target_bucket text,
  target_path text,
  display_name text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending_upload',
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT files_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id),
  CONSTRAINT files_folder_fkey FOREIGN KEY (folder_id) REFERENCES files.folders(id)
);
```

### File: supabase\migrations\0009_helpers_functions.sql

```sql
-- db/migrations/0004_helpers_functions.sql

-- NOTE: we rely on pgcrypto/gen_random_uuid(). Make sure extension is on.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- is_admin(): check ops.admin_users
CREATE OR REPLACE FUNCTION security.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM ops.admin_users au
    WHERE au.user_id = auth.uid()
  );
$$;

-- simple debug helper: return current JWT context
CREATE OR REPLACE FUNCTION security.current_context()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'user_id', auth.uid(),
    'active_profile_type', auth.jwt()->>'active_profile_type',
    'active_profile_id',   auth.jwt()->>'active_profile_id',
    'active_team_id',      auth.jwt()->>'active_team_id'
  );
$$;
```

### File: supabase\migrations\0100_context_switcher.sql

```sql
CREATE OR REPLACE FUNCTION security.switch_session_context(
  p_type public.profile_type,
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, security, org
AS $$
BEGIN
  -- 1. Security Check
  IF p_type = 'freelancer' THEN
    IF NOT EXISTS (
      SELECT 1 FROM org.freelancer_profiles 
      WHERE user_id = auth.uid() AND user_id = p_id 
    ) THEN
      RAISE EXCEPTION 'Access Denied: You do not have a freelancer profile.';
    END IF;
  
  ELSIF p_type = 'business' THEN
    -- CHANGED: Check Membership Table
    IF NOT EXISTS (
      SELECT 1 FROM org.business_memberships 
      WHERE business_id = p_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'Access Denied: You are not an active member of this business.';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid profile type';
  END IF;

  -- 2. Update the session context
  UPDATE security.session_context
  SET 
    active_profile_type = p_type,
    active_profile_id = p_id,
    active_team_id = NULL,
    updated_at = NOW()
  WHERE user_id = auth.uid();

  -- 3. Log the switch
  INSERT INTO security.audit_logs (
    user_id, action, entity_table, entity_id, actor_profile_id
  ) VALUES (
    auth.uid(), 'session.switch_context', 'security.session_context', auth.uid(), p_id
  );
END;
$$;
```

### File: supabase\migrations\0101_create_project.sql

```sql
CREATE OR REPLACE FUNCTION projects.create_project(
  payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with permissions of the creator (allows writing to tables)
AS $$
DECLARE
  new_project_id uuid;
  stage_record jsonb;
  new_stage_id uuid;
  role_record jsonb;
  seat_record jsonb;
  skill_id text; -- UUIDs in JSON are text
  attachment_id text;
  
  -- Variables for extraction to ensure types
  _title text;
  _desc jsonb;
  _client_biz uuid;
  _industry uuid;
  _vis visibility;
  _curr text;
  _start_date timestamp with time zone;
  _preset timeline_preset;
  _legal_screening jsonb;
  
BEGIN
  -- 1. Extract Project Level Data
  _title := payload->>'title';
  _desc := payload->'description';
  _client_biz := (payload->>'client_business_id')::uuid;
  _industry := (payload->>'industry_category_id')::uuid;
  _vis := (payload->>'visibility')::visibility;
  _curr := payload->>'currency';
  _start_date := (payload->>'target_project_start_date')::timestamp with time zone;
  _preset := (payload->>'timeline_preset')::timeline_preset;
  _legal_screening := payload->'legal_and_screening';

  -- 2. Insert Project Header
  INSERT INTO projects.projects (
    owner_user_id, -- Security: Always force the current auth user
    client_business_id,
    title,
    description,
    industry_category_id,
    visibility,
    currency,
    target_project_start_date,
    timeline_preset,
    -- Legal Fields extracted from nested JSON
    ip_ownership_mode,
    nda_required,
    portfolio_display_rights,
    screening_questions,
    location_restriction,
    language_requirement
  )
  VALUES (
    auth.uid(), -- The logged in user
    _client_biz,
    _title,
    _desc,
    _industry,
    _vis,
    _curr,
    _start_date,
    _preset,
    (_legal_screening->>'ip_ownership_mode')::ip_option_mode,
    (_legal_screening->>'nda_required')::boolean,
    (_legal_screening->>'portfolio_display_rights')::portfolio_rights,
    (_legal_screening->'screening_questions'),
    (SELECT array_agg(x)::text[] FROM jsonb_array_elements_text(_legal_screening->'location_restriction') t(x)),
    (SELECT array_agg(x)::text[] FROM jsonb_array_elements_text(_legal_screening->'language_requirement') t(x))
  )
  RETURNING id INTO new_project_id;

  -- 3. Insert Global Attachments (if any)
  IF payload ? 'global_attachments' THEN
    FOR attachment_id IN SELECT * FROM jsonb_array_elements_text(payload->'global_attachments')
    LOOP
      INSERT INTO projects.project_attachments (project_id, attachment_id)
      VALUES (new_project_id, attachment_id::uuid);
    END LOOP;
  END IF;

  -- 4. Loop through Stages
  FOR stage_record IN SELECT * FROM jsonb_array_elements(payload->'stages')
  LOOP
    -- Insert Stage
    INSERT INTO projects.project_stages (
      project_id,
      name,
      description,
      sort_order,
      stage_type,
      start_trigger_type,
      fixed_start_date,
      -- Configs
      file_revisions_allowed,
      file_duration_mode,
      file_duration_days,
      file_due_date,
      session_duration_minutes,
      session_count,
      management_contract_mode,
      maintenance_cycle_interval,
      ip_ownership_override
    )
    VALUES (
      new_project_id,
      stage_record->>'title',
      stage_record->'description',
      (stage_record->>'sort_order')::int,
      (stage_record->>'stage_type')::stage_type_enum,
      (stage_record->>'start_trigger_type')::start_trigger_type,
      (stage_record->>'fixed_start_date')::timestamp with time zone,
      
      -- Coerce optional fields
      (stage_record->>'file_revisions_allowed')::int,
      stage_record->>'file_duration_mode',
      (stage_record->>'file_duration_days')::int,
      (stage_record->>'file_due_date')::timestamp with time zone,
      (stage_record->>'session_duration_minutes')::int,
      COALESCE((stage_record->>'session_count')::int, 1),
      stage_record->>'management_contract_mode',
      stage_record->>'maintenance_cycle_interval',
      (stage_record->>'ip_ownership_override')::ip_option_mode
    )
    RETURNING id INTO new_stage_id;

    -- 5. Insert Staffing Roles for this Stage
    FOR role_record IN SELECT * FROM jsonb_array_elements(stage_record->'staffing_roles')
    LOOP
      INSERT INTO projects.stage_staffing_roles (
        project_stage_id,
        role_title,
        quantity,
        budget_type,
        budget_amount_cents,
        allow_proposals
      )
      VALUES (
        new_stage_id,
        role_record->>'role_title',
        (role_record->>'quantity')::int,
        (role_record->>'budget_type')::budget_type,
        (role_record->>'budget_amount_cents')::bigint,
        (role_record->>'allow_proposals')::boolean
      );
    END LOOP;

    -- 6. Insert Open Seats for this Stage
    FOR seat_record IN SELECT * FROM jsonb_array_elements(stage_record->'open_seats')
    LOOP
      INSERT INTO projects.stage_open_seats (
        project_stage_id,
        description_of_need,
        budget_min_cents,
        budget_max_cents,
        require_proposals
      )
      VALUES (
        new_stage_id,
        seat_record->>'description_of_need',
        (seat_record->>'budget_min_cents')::bigint,
        (seat_record->>'budget_max_cents')::bigint,
        (seat_record->>'require_proposals')::boolean
      );
    END LOOP;

  END LOOP;

  RETURN new_project_id;
END;
$$;
```

### File: supabase\migrations\0102_get_dashboard_project_details.sql

```sql
CREATE OR REPLACE FUNCTION projects.get_project_details(
  p_project_id uuid
)
RETURNS TABLE (
  project_id uuid,
  title text,
  status text, -- This return variable causes the collision
  banner_url text,
  is_starred boolean,
  owner jsonb,
  viewer_context jsonb,
  stages jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, org, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_is_owner boolean;
BEGIN
  -- 1. Determine Access & Role
  SELECT 
    CASE 
      WHEN p.owner_user_id = v_user_id THEN 'owner'
      WHEN EXISTS (
        SELECT 1 FROM org.business_profiles bp 
        WHERE bp.id = p.client_business_id AND bp.owner_user_id = v_user_id
      ) THEN 'owner'
      WHEN EXISTS (
        SELECT 1 FROM projects.project_participants pp 
        WHERE pp.project_id = p.id 
        AND (
           (pp.profile_type = 'freelancer' AND pp.profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id)) OR
           (pp.profile_type = 'business' AND pp.profile_id IN (SELECT id FROM org.business_profiles WHERE owner_user_id = v_user_id))
        )
      ) THEN 'collaborator'
      -- Check if assigned to any stage (Freelancer or Team Member)
      WHEN EXISTS (
        SELECT 1 FROM projects.stage_assignments sa
        JOIN projects.project_stages ps ON ps.id = sa.project_stage_id
        WHERE ps.project_id = p.id
        AND (
           (sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id)) OR
           -- FIX: Aliased team_memberships to 'tm' and used 'tm.status'
           (sa.assignee_type = 'team' AND sa.team_id IN (
              SELECT tm.team_id 
              FROM org.team_memberships tm 
              WHERE tm.user_id = v_user_id AND tm.status = 'active'
           ))
        )
      ) THEN 'collaborator'
      ELSE NULL
    END
  INTO v_user_role
  FROM projects.projects p
  WHERE p.id = p_project_id;

  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  v_is_owner := (v_user_role = 'owner');

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.status::text,
    NULL::text as banner_url,
    COALESCE(pref.is_starred, false),

    jsonb_build_object(
      'id', COALESCE(bp.id, p.owner_user_id),
      'name', CASE 
          WHEN bp.id IS NOT NULL THEN bp.name 
          ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up.first_name, up.last_name)), ''), up.username)
        END,
      'avatar_url', COALESCE(bp.logo_url, up.avatar_url),
      'type', CASE WHEN bp.id IS NOT NULL THEN 'business' ELSE 'freelancer' END
    ) as owner,

    jsonb_build_object(
  'role', v_user_role,
  'permissions', (
    SELECT jsonb_agg(perm)
    FROM (
      SELECT 'manage_settings' WHERE v_is_owner
      UNION ALL
      SELECT 'manage_members' WHERE v_is_owner
      UNION ALL
      SELECT 'view_financials' WHERE v_is_owner
    ) as p(perm)
  )
) as viewer_context,

    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ps.id,
          'name', ps.name,
          'status', ps.status,
          'stage_type', ps.stage_type,
          'unread', EXISTS(
             SELECT 1 FROM comms.notifications n 
             WHERE n.user_id = v_user_id AND n.read_at IS NULL AND n.entity_id = ps.id
          )
        ) ORDER BY ps.sort_order ASC
      )
      FROM projects.project_stages ps
      WHERE ps.project_id = p.id
    ) as stages

  FROM projects.projects p
  LEFT JOIN projects.user_preferences pref ON pref.project_id = p.id AND pref.user_id = v_user_id
  LEFT JOIN org.business_profiles bp ON bp.id = p.client_business_id
  LEFT JOIN org.users_public up ON up.user_id = p.owner_user_id
  WHERE p.id = p_project_id;
END;
$$;
```

### File: supabase\migrations\0103_get_dashboard_projects.sql

```sql
CREATE OR REPLACE FUNCTION projects.get_dashboard_projects(
  p_category text,
  p_category_id uuid,
  p_search_query text,
  p_sort_by text,
  p_sort_dir text,
  p_limit int,
  p_offset int
)
RETURNS TABLE (
  project_id uuid,
  title text,
  status text,
  banner_url text,
  owner_name text,
  owner_avatar_url text,
  is_starred boolean,
  is_archived boolean,
  has_unread boolean,
  last_updated_at timestamptz,
  total_count bigint
) 
LANGUAGE plpgsql
SECURITY INVOKER -- Ensures RLS policies on underlying tables are respected
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  WITH user_projects AS (
    SELECT DISTINCT
      p.id,
      p.title,
      p.status,
      p.client_business_id,
      p.owner_user_id,
      COALESCE(up.is_starred, false) as is_starred,
      COALESCE(up.is_archived, false) as is_archived,
      up.last_viewed_at,
      p.created_at as project_created_at
    FROM projects.projects p
    LEFT JOIN projects.user_preferences up ON up.project_id = p.id AND up.user_id = v_user_id
    LEFT JOIN projects.project_participants pp ON pp.project_id = p.id
    LEFT JOIN projects.stage_assignments sa ON sa.assigned_by = v_user_id
      OR (sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id))
      OR (sa.assignee_type = 'team' AND sa.team_id IN (
          SELECT tm.team_id 
          FROM org.team_memberships tm 
          WHERE tm.user_id = v_user_id AND tm.status = 'active'
      ))
    WHERE 
      (
        p.owner_user_id = v_user_id
        OR pp.profile_id IN (SELECT id FROM org.business_profiles WHERE owner_user_id = v_user_id)
        OR pp.profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id)
      )
      AND (p_category <> 'team' OR (
        EXISTS (
            SELECT 1 FROM projects.stage_assignments sa_team 
            WHERE sa_team.project_stage_id IN (
                SELECT ps.id FROM projects.project_stages ps WHERE ps.project_id = p.id
            )
            AND sa_team.assignee_type = 'team'
            AND sa_team.team_id = p_category_id
        )
      ))
      AND (p_category <> 'service' OR (
        EXISTS (
            SELECT 1 FROM projects.project_required_skills prs
            JOIN org.skills s ON s.id = prs.skill_id
            WHERE prs.project_id = p.id AND s.id = p_category_id
        )
      ))
  ),
  calc_updates AS (
    SELECT
      up.id,
      (
        SELECT MAX(pa.created_at) 
        FROM projects.project_activity pa 
        WHERE pa.project_id = up.id
      ) as activity_ts,
      EXISTS (
        SELECT 1 
        FROM comms.notifications n 
        WHERE n.user_id = v_user_id 
        AND n.read_at IS NULL 
        AND (
            (n.entity_table = 'projects.projects' AND n.entity_id = up.id) OR
            (n.entity_table = 'projects.project_stages' AND n.entity_id IN (
                SELECT ps.id FROM projects.project_stages ps WHERE ps.project_id = up.id
            ))
        )
      ) as has_unread
    FROM user_projects up
  )
  SELECT
    p.id as project_id,
    p.title,
    p.status::text,
    NULL::text as banner_url,
    
    CASE 
      WHEN bp.id IS NOT NULL THEN bp.name 
      ELSE COALESCE(
        NULLIF(TRIM(CONCAT_WS(' ', up_public.first_name, up_public.last_name)), ''), 
        up_public.username
      )
    END as owner_name,
    
    CASE 
      WHEN bp.id IS NOT NULL THEN bp.logo_url 
      ELSE up_public.avatar_url 
    END as owner_avatar_url,

    up.is_starred,
    up.is_archived,
    cu.has_unread,
    COALESCE(cu.activity_ts, p.created_at) as last_updated_at,
    COUNT(*) OVER() as total_count

  FROM user_projects up
  JOIN projects.projects p ON p.id = up.id
  LEFT JOIN calc_updates cu ON cu.id = up.id
  LEFT JOIN org.business_profiles bp ON bp.id = p.client_business_id
  LEFT JOIN org.users_public up_public ON up_public.user_id = p.owner_user_id
  
  WHERE
    (p_search_query = '' OR p.title ILIKE '%' || p_search_query || '%')
    AND
    CASE 
      WHEN p_category = 'starred' THEN up.is_starred = true
      WHEN p_category = 'unread' THEN cu.has_unread = true
      WHEN p_category = 'in-progress' THEN p.status = 'active'
      WHEN p_category = 'completed' THEN p.status = 'completed'
      WHEN p_category = 'archived' THEN up.is_archived = true
      ELSE up.is_archived IS FALSE
    END

  ORDER BY
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'asc' THEN p.title END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'desc' THEN p.title END DESC,
    
    CASE WHEN p_sort_by = 'owner' AND p_sort_dir = 'asc' THEN 
        CASE 
          WHEN bp.id IS NOT NULL THEN bp.name 
          ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up_public.first_name, up_public.last_name)), ''), up_public.username)
        END 
    END ASC,
    CASE WHEN p_sort_by = 'owner' AND p_sort_dir = 'desc' THEN 
        CASE 
          WHEN bp.id IS NOT NULL THEN bp.name 
          ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up_public.first_name, up_public.last_name)), ''), up_public.username)
        END
    END DESC,
    
    -- Default Sort: Last Updated Descending
    CASE WHEN p_sort_by = 'last_updated' AND p_sort_dir = 'asc' THEN COALESCE(cu.activity_ts, p.created_at) END ASC,
    CASE WHEN p_sort_by = 'last_updated' AND p_sort_dir = 'desc' THEN COALESCE(cu.activity_ts, p.created_at) END DESC,
    
    -- Fallback sort to ensure consistent pagination
    p.id DESC

  LIMIT p_limit OFFSET p_offset;
END;
$$;
```

### File: supabase\migrations\0104_get_dashboard_stage_details.sql

```sql
CREATE OR REPLACE FUNCTION projects.get_stage_details(
  p_project_id uuid,
  p_stage_id uuid
)
RETURNS TABLE (
  stage_id uuid,
  project_id uuid,
  title text,
  description jsonb,
  sort_order int,
  status text,
  stage_type text,
  ip_mode text,
  due_date timestamptz,
  channel_id uuid,
  budget jsonb,
  assignee jsonb,
  latest_submission jsonb,
  viewer_context jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, org, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_stage_status text;
BEGIN
  -- 1. Check existence and basic status
  SELECT ps.status::text INTO v_stage_status
  FROM projects.project_stages ps
  WHERE ps.id = p_stage_id AND ps.project_id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found or access denied';
  END IF;

  -- 2. Determine User Role (Owner vs Assignee vs Viewer)
  SELECT 
    CASE 
      WHEN p.owner_user_id = v_user_id OR EXISTS(SELECT 1 FROM org.business_profiles bp WHERE bp.id = p.client_business_id AND bp.owner_user_id = v_user_id) THEN 'owner'
      
      WHEN sa.assignee_type = 'freelancer' AND sa.freelancer_profile_id IN (SELECT id FROM org.freelancer_profiles WHERE user_id = v_user_id) THEN 'assignee'
      
      WHEN sa.assignee_type = 'team' AND sa.team_id IN (
          SELECT tm.team_id 
          FROM org.team_memberships tm 
          WHERE tm.user_id = v_user_id AND tm.status = 'active'
      ) THEN 'assignee'
      
      ELSE 'viewer'
    END
  INTO v_user_role
  FROM projects.projects p
  LEFT JOIN projects.stage_assignments sa ON sa.project_stage_id = p_stage_id AND sa.status = 'accepted'
  WHERE p.id = p_project_id;

  -- 3. Return Data
  RETURN QUERY
  SELECT
    ps.id,
    ps.project_id,
    ps.name,
    ps.description,
    ps.sort_order,
    ps.status::text,
    ps.stage_type::text, -- FIX: Explicit cast to text
    ps.ip_mode::text,    -- FIX: Explicit cast to text (preventative)
    ps.file_due_date AS due_date,
    
    -- Channel ID Lookup
    (
      SELECT pc.id 
      FROM comms.project_channels pc 
      WHERE pc.project_id = ps.project_id 
      AND pc.stage_id = ps.id 
      LIMIT 1
    ) as channel_id,

    -- Budget Details
    (
      SELECT jsonb_build_object(
        'type', sbr.rule_type,
        'amount_cents', sbr.amount_cents,
        'currency', sbr.amount_currency
      )
      FROM projects.stage_budget_rules sbr
      WHERE sbr.project_stage_id = ps.id
    ) as budget,

    -- Assignee Details
    (
      SELECT jsonb_build_object(
        'type', sa.assignee_type,
        'status', sa.status,
        'profile_id', COALESCE(sa.freelancer_profile_id, sa.team_id),
        'name', CASE 
            WHEN sa.assignee_type = 'team' THEN t.name 
            ELSE COALESCE(NULLIF(TRIM(CONCAT_WS(' ', upa.first_name, upa.last_name)), ''), upa.username)
          END,
        'avatar_url', CASE 
            WHEN sa.assignee_type = 'team' THEN NULL 
            ELSE upa.avatar_url
          END
      )
      FROM projects.stage_assignments sa
      LEFT JOIN org.teams t ON t.id = sa.team_id
      LEFT JOIN org.freelancer_profiles fp ON fp.id = sa.freelancer_profile_id
      LEFT JOIN org.users_public upa ON upa.user_id = fp.user_id
      WHERE sa.project_stage_id = ps.id
      LIMIT 1
    ) as assignee,

    -- Latest Submission
    (
      SELECT jsonb_build_object(
        'id', ss.id,
        'submitted_at', ss.created_at,
        'notes', ss.notes,
        'files', '[]'::jsonb 
      )
      FROM projects.stage_submissions ss
      WHERE ss.project_stage_id = ps.id
      ORDER BY ss.created_at DESC
      LIMIT 1
    ) as latest_submission,

    -- Permissions
    jsonb_build_object(
      'role', v_user_role,
      'permissions', jsonb_build_object(
        'can_edit_details', (v_user_role = 'owner' AND ps.status::text IN ('open', 'assigned', 'in_progress')),
        'can_assign', (v_user_role = 'owner' AND ps.status::text IN ('open', 'assigned')),
        'can_submit_work', (v_user_role = 'assignee' AND ps.status::text IN ('in_progress', 'revisions')),
        'can_approve', (v_user_role = 'owner' AND ps.status::text = 'submitted'),
        'can_request_revision', (v_user_role = 'owner' AND ps.status::text = 'submitted')
      )
    ) as viewer_context

  FROM projects.project_stages ps
  WHERE ps.id = p_stage_id;
END;
$$;
```

### File: supabase\migrations\0105_has_project_access.sql

```sql
CREATE OR REPLACE FUNCTION projects.has_project_access(_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, org, auth
AS $$
BEGIN
  -- A. Check if user is the Project Owner
  IF EXISTS (
    SELECT 1 FROM projects.projects
    WHERE id = _project_id AND owner_user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- B. Check if user is a Participant (via Freelancer Profile)
  IF EXISTS (
    SELECT 1 
    FROM projects.project_participants pp
    JOIN org.freelancer_profiles fp ON pp.profile_id = fp.id
    WHERE pp.project_id = _project_id
      AND pp.profile_type = 'freelancer'
      AND fp.user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- C. Check if user is a Participant (via Business Profile)
  IF EXISTS (
    SELECT 1 
    FROM projects.project_participants pp
    JOIN org.business_profiles bp ON pp.profile_id = bp.id
    WHERE pp.project_id = _project_id
      AND pp.profile_type = 'business'
      AND bp.owner_user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- D. Check if user is assigned to any Stage (Freelancer Assignment)
  -- (Mirrors the dashboard logic)
  IF EXISTS (
    SELECT 1 
    FROM projects.stage_assignments sa
    JOIN projects.project_stages ps ON sa.project_stage_id = ps.id
    JOIN org.freelancer_profiles fp ON sa.freelancer_profile_id = fp.id
    WHERE ps.project_id = _project_id
      AND sa.assignee_type = 'freelancer'
      AND fp.user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- E. Check if user is in a Team assigned to any Stage (Team Assignment)
  IF EXISTS (
    SELECT 1 
    FROM projects.stage_assignments sa
    JOIN projects.project_stages ps ON sa.project_stage_id = ps.id
    JOIN org.team_memberships tm ON sa.team_id = tm.team_id
    WHERE ps.project_id = _project_id
      AND sa.assignee_type = 'team'
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
```

### File: supabase\migrations\0106_onboard_user_rpc.sql

```sql
CREATE OR REPLACE FUNCTION org.onboard_user(
  p_first_name text,
  p_last_name text,
  p_username text,
  p_dob date,
  p_profile_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, org, auth, security
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_email_confirmed_at timestamptz;
  v_profile_id uuid;
BEGIN
  -- 1. GET USER ID
  SELECT id, email, email_confirmed_at 
  INTO v_user_id, v_email, v_email_confirmed_at
  FROM auth.users 
  WHERE id = auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. IDEMPOTENCY CHECK
  IF EXISTS (SELECT 1 FROM org.users_public WHERE user_id = v_user_id) THEN
    RETURN json_build_object('status', 'exists', 'message', 'User already onboarded');
  END IF;

  -- 3. VALIDATION
  IF EXISTS (SELECT 1 FROM org.users_public WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- 4. INSERT PUBLIC USER
  INSERT INTO org.users_public (
    user_id, first_name, last_name, username, dob, visibility
  ) VALUES (
    v_user_id, p_first_name, p_last_name, p_username, p_dob, 'unlisted'
  );

  -- 5. SYNC EMAIL
  INSERT INTO org.user_emails (
    user_id, email, is_primary, verified_at
  ) VALUES (
    v_user_id, v_email, true, v_email_confirmed_at
  );

  -- 6. HANDLE PROFILE & SESSION CONTEXT
  IF p_profile_type = 'freelancer' THEN
    -- Create Freelancer Profile
    INSERT INTO org.freelancer_profiles (
      user_id, visibility, hourly_rate, description, headline
    ) VALUES (
      v_user_id, 'public', NULL, '', ''
    ) RETURNING id INTO v_profile_id;

    -- UPSERT Session Context (Active Freelancer)
    INSERT INTO security.session_context (user_id, active_profile_type, active_profile_id, updated_at)
    VALUES (v_user_id, 'freelancer', v_profile_id, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET 
      active_profile_type = EXCLUDED.active_profile_type,
      active_profile_id = EXCLUDED.active_profile_id,
      updated_at = NOW();

  ELSE
    -- Business User (No business created yet)
    -- UPSERT Session Context (Null Profile = Setup Mode)
    INSERT INTO security.session_context (user_id, active_profile_type, active_profile_id, updated_at)
    VALUES (v_user_id, NULL, NULL, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET 
      active_profile_type = NULL,
      active_profile_id = NULL,
      updated_at = NOW();
  END IF;

  RETURN json_build_object('status', 'success', 'user_id', v_user_id);
END;
$$;
```

### File: supabase\migrations\0107_create_team.sql

```sql
CREATE OR REPLACE FUNCTION org.create_team(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = org, public
AS $$
DECLARE
  new_team_id uuid;
  new_team_slug text;
  invite_record jsonb;
BEGIN
  
  INSERT INTO org.teams (
    owner_user_id,
    name,
    slug,
    description,
    avatar_url,
    visibility,
    payout_model,
    default_payout_settings
  )
  VALUES (
    (payload->>'owner_id')::uuid,
    payload->>'name',
    payload->>'slug',
    COALESCE(payload->>'description', ''),
    payload->>'avatar_url',
    COALESCE(payload->>'visibility', 'invite_only'),
    COALESCE(payload->>'payout_model', 'manager_discretion'),
    COALESCE(payload->'default_payout_settings', '{}'::jsonb)
  )
  RETURNING id, slug INTO new_team_id, new_team_slug;

  
  INSERT INTO org.team_memberships (
    team_id,
    user_id,
    role,
    status
  )
  VALUES (
    new_team_id,
    (payload->>'owner_id')::uuid,
    'owner',
    'active'
  );

  
  IF payload ? 'invites' AND jsonb_array_length(payload->'invites') > 0 THEN
    FOR invite_record IN SELECT * FROM jsonb_array_elements(payload->'invites')
    LOOP
      INSERT INTO org.org_invitations (
        inviter_user_id,
        target_email,
        team_id,
        token, 
        status
      )
      VALUES (
        (payload->>'owner_id')::uuid,
        invite_record->>'email',
        new_team_id,
        encode(gen_random_bytes(32), 'hex'), 
        'pending'
      );
    END LOOP;
  END IF;

  
  RETURN jsonb_build_object(
    'team_id', new_team_id,
    'team_slug', new_team_slug
  );

EXCEPTION WHEN unique_violation THEN
  
  RAISE EXCEPTION 'Team handle already exists' USING ERRCODE = '23505';
END;
$$;
```

### File: supabase\migrations\0108_get_dashboard_teams.sql

```sql
CREATE OR REPLACE FUNCTION org.get_dashboard_teams(
  p_search_query text,
  p_role_filter text, -- 'all', 'owner', 'member', 'admin'
  p_sort_by text,
  p_sort_dir text,
  p_limit int,
  p_offset int
)
RETURNS TABLE (
  team_id uuid,
  name text,
  slug text,
  avatar_url text,
  description text,
  user_role text,
  member_count bigint,
  payout_model text,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
) 
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  WITH user_teams AS (
    SELECT
      t.id,
      t.name,
      t.slug,
      t.avatar_url,
      t.description,
      t.payout_model,
      t.created_at,
      t.updated_at,
      tm.role as user_role,
      -- FIX: Alias the table to 'm' and use 'm.team_id' to avoid conflict with output var
      (SELECT COUNT(*) FROM org.team_memberships m WHERE m.team_id = t.id AND m.status = 'active') as member_count
    FROM org.teams t
    JOIN org.team_memberships tm ON tm.team_id = t.id
    WHERE 
      tm.user_id = v_user_id
      AND tm.status = 'active'
      AND (
        p_role_filter = 'all' 
        OR (p_role_filter = 'owner' AND tm.role = 'owner')
        OR (p_role_filter = 'admin' AND tm.role = 'admin')
        OR (p_role_filter = 'member' AND tm.role != 'owner')
      )
      AND (
        p_search_query = '' 
        OR t.name ILIKE '%' || p_search_query || '%'
        OR t.slug ILIKE '%' || p_search_query || '%'
      )
  )
  SELECT
    ut.id as team_id, -- Maps explicitly to the return column
    ut.name,
    ut.slug,
    ut.avatar_url,
    ut.description,
    ut.user_role,
    ut.member_count,
    ut.payout_model,
    ut.created_at,
    ut.updated_at,
    COUNT(*) OVER() as total_count
  FROM user_teams ut
  ORDER BY
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'asc' THEN ut.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'desc' THEN ut.name END DESC,
    
    CASE WHEN p_sort_by = 'member_count' AND p_sort_dir = 'asc' THEN ut.member_count END ASC,
    CASE WHEN p_sort_by = 'member_count' AND p_sort_dir = 'desc' THEN ut.member_count END DESC,
    
    CASE WHEN p_sort_by = 'last_updated' AND p_sort_dir = 'asc' THEN ut.updated_at END ASC,
    CASE WHEN p_sort_by = 'last_updated' AND p_sort_dir = 'desc' THEN ut.updated_at END DESC,
    
    ut.id DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
```

### File: supabase\migrations\0109_is_active_team_member.sql

```sql
CREATE OR REPLACE FUNCTION org.is_active_team_member(_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = org, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM org.team_memberships 
    WHERE team_id = _team_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  );
$$;
```

### File: supabase\migrations\0110_business_management.sql

```sql
-- 1. Create Business (Atomic Transaction)
CREATE OR REPLACE FUNCTION org.create_business(
  payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Required to insert into finance.wallets
SET search_path = public, org, finance, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_new_business_id uuid;
  v_slug text;
BEGIN
  -- A. Validation
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_slug := payload->>'slug';
  
  -- Check slug uniqueness
  IF EXISTS (SELECT 1 FROM org.business_profiles WHERE slug = v_slug) THEN
    RAISE EXCEPTION 'Business handle already taken' USING ERRCODE = '23505';
  END IF;

  -- B. Insert Business Profile
  INSERT INTO org.business_profiles (
    owner_user_id,
    name,
    slug,
    headline,
    description,
    logo_url,
    legal_name,
    billing_email,
    country,
    address_line_1,
    address_city,
    address_zip,
    tax_id,
    default_currency
  ) VALUES (
    v_user_id,
    payload->>'name',
    v_slug,
    COALESCE(payload->>'headline', ''),
    COALESCE(payload->'description', '{}'::jsonb),
    payload->>'logo_url',
    payload->>'legal_name',
    payload->>'billing_email',
    payload->>'country',
    payload->>'address_line_1',
    payload->>'address_city',
    payload->>'address_zip',
    payload->>'tax_id',
    COALESCE(payload->>'default_currency', 'USD')
  )
  RETURNING id INTO v_new_business_id;

  -- C. NEW: Add Owner to Memberships (CRITICAL STEP)
  INSERT INTO org.business_memberships (
    business_id,
    user_id,
    role,
    status
  ) VALUES (
    v_new_business_id,
    v_user_id,
    'owner',
    'active'
  );

  -- D. Initialize Wallet
  INSERT INTO finance.wallets (
    owner_type,
    owner_id,
    currency,
    balance_cents
  ) VALUES (
    'business',
    v_new_business_id,
    COALESCE(payload->>'default_currency', 'USD'),
    0
  );

  -- E. Switch Context to new Business
  INSERT INTO security.session_context (
    user_id, 
    active_profile_type, 
    active_profile_id, 
    updated_at
  )
  VALUES (v_user_id, 'business', v_new_business_id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    active_profile_type = 'business',
    active_profile_id = v_new_business_id,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'business_id', v_new_business_id,
    'slug', v_slug
  );
END;
$$;

-- 2. Get Dashboard Businesses (Read Model)
-- (This function remains mostly the same, but good to ensure it exists)
CREATE OR REPLACE FUNCTION org.get_dashboard_businesses(
  p_search_query text,
  p_sort_by text,
  p_sort_dir text,
  p_limit int,
  p_offset int
)
RETURNS TABLE (
  id uuid,
  owner_user_id uuid,
  name text,
  slug text,
  logo_url text,
  country text,
  default_currency text,
  created_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  WITH user_businesses AS (
    SELECT
      bp.id,
      bp.owner_user_id,
      bp.name,
      bp.slug,
      bp.logo_url,
      bp.country,
      bp.default_currency,
      bp.created_at
    FROM org.business_profiles bp
    -- NEW: Join memberships so staff can see the business too, not just the owner
    JOIN org.business_memberships bm ON bm.business_id = bp.id
    WHERE 
      bm.user_id = auth.uid()
      AND bm.status = 'active'
      AND (
        p_search_query = '' 
        OR bp.name ILIKE '%' || p_search_query || '%'
        OR bp.slug ILIKE '%' || p_search_query || '%'
      )
  )
  SELECT
    ub.id,
    ub.owner_user_id,
    ub.name,
    ub.slug,
    ub.logo_url,
    ub.country,
    ub.default_currency,
    ub.created_at,
    COUNT(*) OVER()::bigint as total_count
  FROM user_businesses ub
  ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'asc' THEN ub.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'desc' THEN ub.created_at END DESC,
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'asc' THEN ub.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'desc' THEN ub.name END DESC,
    ub.id DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
```

### File: supabase\migrations\0111_business_helpers.sql

```sql
CREATE OR REPLACE FUNCTION org.is_active_business_member(_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = org, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM org.business_memberships 
    WHERE business_id = _business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  );
$$;
```

### File: supabase\migrations\0200_permissions.sql

```sql
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
```

### File: supabase\migrations\0201_rls.sql

```sql
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
```

### File: supabase\migrations\0202_comms.sql

```sql
DROP POLICY IF EXISTS "view_attachments_if_member" ON comms.message_attachments;

CREATE POLICY "view_attachments_if_member" ON comms.message_attachments
    FOR SELECT
    TO authenticated
    USING (
        (
            (message_table = 'comms.project_messages'::text) AND 
            (EXISTS ( 
                SELECT 1
                FROM (comms.project_messages pm
                JOIN comms.project_channels pc ON ((pm.channel_id = pc.id)))
                WHERE ((pm.id = message_attachments.message_id) AND projects.has_project_access(pc.project_id))
            ))
        ) 
        OR 
        (
            (message_table = 'comms.dm_messages'::text) AND 
            (EXISTS ( 
                SELECT 1
                FROM comms.dm_participants dp
                WHERE (
                    (dp.thread_id = ( SELECT dm_messages.thread_id FROM comms.dm_messages WHERE (dm_messages.id = message_attachments.message_id))) 
                    AND (dp.user_id = auth.uid())
                )
            ))
        )
    );

DROP POLICY IF EXISTS "view_channels_if_member" ON comms.project_channels;

CREATE POLICY "view_channels_if_member" ON comms.project_channels FOR
SELECT TO authenticated USING (
        projects.has_project_access (project_id)
    );

DROP POLICY IF EXISTS "send_messages_if_member" ON comms.project_messages;

CREATE POLICY "send_messages_if_member" ON comms.project_messages FOR
INSERT
    TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM comms.project_channels pc
            WHERE (
                    (
                        pc.id = project_messages.channel_id
                    )
                    AND projects.has_project_access (pc.project_id)
                )
        )
    );

DROP POLICY IF EXISTS "view_messages_if_member" ON comms.project_messages;

CREATE POLICY "view_messages_if_member" ON comms.project_messages FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM comms.project_channels pc
            WHERE (
                    (
                        pc.id = project_messages.channel_id
                    )
                    AND projects.has_project_access (pc.project_id)
                )
        )
    );

DROP POLICY IF EXISTS "Users link own message attachments" ON comms.message_attachments;

CREATE POLICY "Users link own message attachments" ON comms.message_attachments FOR
INSERT
    TO authenticated
WITH
    CHECK (
        (
            message_table = 'comms.project_messages'
            AND EXISTS (
                SELECT 1
                FROM comms.project_messages pm
                WHERE
                    pm.id = message_id
                    AND pm.sender_user_id = auth.uid ()
            )
        )
        OR (
            message_table = 'comms.dm_messages'
            AND EXISTS (
                SELECT 1
                FROM comms.dm_messages dm
                WHERE
                    dm.id = message_id
                    AND dm.sender_user_id = auth.uid ()
            )
        )
    );
```

### File: supabase\migrations\0203_users.sql

```sql
-- ============================================================
-- TABLE: org.users_public
-- ============================================================
ALTER TABLE org.users_public ENABLE ROW LEVEL SECURITY;

-- SELECT
DROP POLICY IF EXISTS "Any authenticated user can view public profiles" ON org.users_public;

CREATE POLICY "Any authenticated user can view public profiles" ON org.users_public FOR
SELECT TO public USING (
        auth.role () = 'authenticated'
    );

-- INSERT
DROP POLICY IF EXISTS "Users can create their own profile" ON org.users_public;

CREATE POLICY "Users can create their own profile" ON org.users_public FOR
INSERT
    TO public
WITH
    CHECK (
        user_id = auth.uid ()
        OR security.is_admin ()
    );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own profile" ON org.users_public;

CREATE POLICY "Users can update their own profile" ON org.users_public FOR
UPDATE TO public USING (
    user_id = auth.uid ()
    OR security.is_admin ()
);

-- ============================================================
-- TABLE: org.user_emails
-- ============================================================
ALTER TABLE org.user_emails ENABLE ROW LEVEL SECURITY;

-- SELECT
DROP POLICY IF EXISTS "Users can view their own emails" ON org.user_emails;

CREATE POLICY "Users can view their own emails" ON org.user_emails FOR
SELECT TO public USING (
        user_id = auth.uid ()
        OR security.is_admin ()
    );

-- INSERT
DROP POLICY IF EXISTS "Users can add their own emails" ON org.user_emails;

CREATE POLICY "Users can add their own emails" ON org.user_emails FOR
INSERT
    TO public
WITH
    CHECK (
        user_id = auth.uid ()
        OR security.is_admin ()
    );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own emails" ON org.user_emails;

CREATE POLICY "Users can update their own emails" ON org.user_emails FOR
UPDATE TO public USING (
    user_id = auth.uid ()
    OR security.is_admin ()
);

-- DELETE
DROP POLICY IF EXISTS "Users can delete their own emails" ON org.user_emails;

CREATE POLICY "Users can delete their own emails" ON org.user_emails FOR DELETE TO public USING (
    user_id = auth.uid ()
    OR security.is_admin ()
);
```

### File: supabase\migrations\0204_projects.sql

```sql
DROP POLICY IF EXISTS "Project owner can view activity" ON projects.project_activity;

CREATE POLICY "Project owner can view activity" ON projects.project_activity FOR
SELECT TO public USING (
        (
            EXISTS (
                SELECT 1
                FROM projects.projects p
                WHERE (
                        (
                            p.id = project_activity.project_id
                        )
                        AND (p.owner_user_id = auth.uid ())
                    )
            )
        )
    );

DROP POLICY IF EXISTS "Users can insert their own activity" ON projects.project_activity;

CREATE POLICY "Users can insert their own activity" ON projects.project_activity FOR
INSERT
    TO public
WITH
    CHECK (auth.uid () = actor_user_id);

DROP POLICY IF EXISTS "Owner manage assignments" ON projects.stage_assignments;

CREATE POLICY "Owner manage assignments" ON projects.stage_assignments FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_assignments.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View assignments" ON projects.stage_assignments;

CREATE POLICY "View assignments" ON projects.stage_assignments
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_assignments.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Owner manage budget rules" ON projects.stage_budget_rules;

CREATE POLICY "Owner manage budget rules" ON projects.stage_budget_rules FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_budget_rules.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View budget rules" ON projects.stage_budget_rules;

CREATE POLICY "View budget rules" ON projects.stage_budget_rules
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_budget_rules.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Users can view/manage own contracts" ON projects.maintenance_contracts;

CREATE POLICY "Users can view/manage own contracts" ON projects.maintenance_contracts FOR ALL TO public USING (
    (
        freelancer_profile_id IN (
            SELECT freelancer_profiles.id
            FROM org.freelancer_profiles
            WHERE (
                    freelancer_profiles.user_id = auth.uid ()
                )
        )
    )
    OR (
        EXISTS (
            SELECT 1
            FROM projects.projects p
            WHERE (
                    (
                        p.id = maintenance_contracts.project_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "Manage seats own" ON projects.stage_open_seats;

CREATE POLICY "Manage seats own" ON projects.stage_open_seats FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_open_seats.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View seats public or own" ON projects.stage_open_seats;

CREATE POLICY "View seats public or own" ON projects.stage_open_seats
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_open_seats.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Owner manage participants" ON projects.project_participants;

CREATE POLICY "Owner manage participants" ON projects.project_participants FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM projects.projects p
            WHERE (
                    (
                        p.id = project_participants.project_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View participants" ON projects.project_participants;

CREATE POLICY "View participants" ON projects.project_participants
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM projects.projects p
      WHERE ((p.id = project_participants.project_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Public can view active published projects" ON projects.projects;

CREATE POLICY "Public can view active published projects" ON projects.projects
    FOR SELECT
    TO public
    USING ((status = 'active'::project_status) AND (visibility = 'public'::visibility));

DROP POLICY IF EXISTS "Users can create projects" ON projects.projects;

CREATE POLICY "Users can create projects" ON projects.projects FOR
INSERT
    TO public
WITH
    CHECK (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects.projects;

CREATE POLICY "Users can delete own projects" ON projects.projects FOR DELETE TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects.projects;

CREATE POLICY "Users can update own projects" ON projects.projects FOR
UPDATE TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can view own projects" ON projects.projects;

CREATE POLICY "Users can view own projects" ON projects.projects FOR
SELECT TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Manage own revisions" ON projects.stage_revision_requests;

CREATE POLICY "Manage own revisions" ON projects.stage_revision_requests FOR ALL TO public USING ((requested_by = auth.uid ()));

DROP POLICY IF EXISTS "View revisions" ON projects.stage_revision_requests;

CREATE POLICY "View revisions" ON projects.stage_revision_requests FOR
SELECT TO public USING (
        (
            (requested_by = auth.uid ())
            OR (
                EXISTS (
                    SELECT 1
                    FROM (
                            projects.project_stages s
                            JOIN projects.projects p ON ((p.id = s.project_id))
                        )
                    WHERE (
                            (
                                s.id = stage_revision_requests.project_stage_id
                            )
                            AND (p.owner_user_id = auth.uid ())
                        )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Manage roles own" ON projects.stage_staffing_roles;

CREATE POLICY "Manage roles own" ON projects.stage_staffing_roles FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_staffing_roles.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View roles public or own" ON projects.stage_staffing_roles;

CREATE POLICY "View roles public or own" ON projects.stage_staffing_roles
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_staffing_roles.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Users can manage stages of own projects" ON projects.project_stages;

CREATE POLICY "Users can manage stages of own projects" ON projects.project_stages FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM projects.projects p
            WHERE (
                    (
                        p.id = project_stages.project_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "Users can view stages of visible projects" ON projects.project_stages;

CREATE POLICY "Users can view stages of visible projects" ON projects.project_stages
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM projects.projects p
      WHERE ((p.id = project_stages.project_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Insert own submissions" ON projects.stage_submissions;

CREATE POLICY "Insert own submissions" ON projects.stage_submissions FOR
INSERT
    TO public
WITH
    CHECK (submitted_by = auth.uid ());

DROP POLICY IF EXISTS "View submissions" ON projects.stage_submissions;

CREATE POLICY "View submissions" ON projects.stage_submissions FOR
SELECT TO public USING (
        (
            (submitted_by = auth.uid ())
            OR (
                EXISTS (
                    SELECT 1
                    FROM (
                            projects.project_stages s
                            JOIN projects.projects p ON ((p.id = s.project_id))
                        )
                    WHERE (
                            (
                                s.id = stage_submissions.project_stage_id
                            )
                            AND (p.owner_user_id = auth.uid ())
                        )
                )
            )
        )
    );
```

### File: supabase\migrations\0205_security.sql

```sql
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
```

### File: supabase\migrations\0206_realtime.sql

```sql
BEGIN;

ALTER PUBLICATION supabase_realtime ADD TABLE comms.project_messages;

ALTER PUBLICATION supabase_realtime ADD TABLE comms.dm_messages;

ALTER PUBLICATION supabase_realtime ADD TABLE comms.notifications;

ALTER PUBLICATION supabase_realtime ADD TABLE comms.project_channels;

ALTER PUBLICATION supabase_realtime ADD TABLE comms.dm_threads;

ALTER PUBLICATION supabase_realtime
ADD
TABLE projects.project_activity;

ALTER PUBLICATION supabase_realtime
ADD
TABLE projects.project_stages;

ALTER PUBLICATION supabase_realtime
ADD
TABLE projects.stage_submissions;

ALTER PUBLICATION supabase_realtime
ADD
TABLE projects.stage_assignments;

COMMIT;
```

### File: supabase\migrations\0207_storage.sql

```sql
-- 1. Create the 'quarantine' bucket if it doesn't exist
INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'quarantine',
        'quarantine',
        false
    ) ON CONFLICT (id) DO NOTHING;

-- 2. Create the 'project' bucket if it doesn't exist
INSERT INTO
    storage.buckets (id, name, public)
VALUES ('project', 'project', false) ON CONFLICT (id) DO NOTHING;

-- 3. [REMOVED] Enable RLS on storage.objects
-- RLS is already enabled by default on storage.objects.
-- Attempting to run ALTER TABLE here causes ownership errors (SQLSTATE 42501).

-- 4. Policy: Allow Authenticated Users to Upload to Quarantine
CREATE POLICY "Authenticated users can upload to quarantine" ON storage.objects FOR
INSERT
    TO authenticated
WITH
    CHECK (bucket_id = 'quarantine');

-- 5. Policy: Allow Users to Read/Download their own files in Quarantine
CREATE POLICY "Users can read their own quarantine files" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'quarantine'
        AND auth.uid () = owner
    );

-- 6. Policy: Authenticated users can view project files
CREATE POLICY "Authenticated users can view project files" ON storage.objects FOR
SELECT TO authenticated USING (bucket_id = 'project');
```

### File: supabase\migrations\0208_files.sql

```sql
-- 1. Grant USAGE on the schema (allows them to "see" the schema exists)
GRANT USAGE ON SCHEMA files TO service_role, authenticated;

-- 2. Service Role (Admin) gets full power
GRANT ALL ON ALL TABLES IN SCHEMA files TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA files TO service_role;

-- 3. Authenticated Users get Standard CRUD (Create, Read, Update, Delete)
-- They still cannot alter table structure or truncate.
GRANT
SELECT,
INSERT
,
UPDATE,
DELETE ON ALL TABLES IN SCHEMA files TO authenticated;

GRANT USAGE,
SELECT
    ON ALL SEQUENCES IN SCHEMA files TO authenticated;

-- 4. Set Defaults for FUTURE tables (so you don't have to run this again)
ALTER DEFAULT PRIVILEGES IN SCHEMA files
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA files
GRANT
SELECT,
INSERT
,
UPDATE,
DELETE ON TABLES TO authenticated;

ALTER TABLE files.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users handle own files" ON files.items;

CREATE POLICY "Authenticated users can view files" ON files.items FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own files" ON files.items FOR
INSERT
    TO authenticated
WITH
    CHECK (owner_user_id = auth.uid ());

CREATE POLICY "Users can update own files" ON files.items FOR
UPDATE TO authenticated USING (owner_user_id = auth.uid ());

CREATE POLICY "Users can delete own files" ON files.items FOR DELETE TO authenticated USING (owner_user_id = auth.uid ());
```

### File: supabase\migrations\0209_teams.sql

```sql
-- SELECT: Visible to Owner OR Active Members OR Admin
DROP POLICY IF EXISTS "Users can view teams they belong to or own" ON org.teams;

CREATE POLICY "Users can view teams they belong to or own" ON org.teams FOR
SELECT TO public USING (
        owner_user_id = auth.uid ()
        OR org.is_active_team_member (id) -- Uses the helper function
        OR security.is_admin ()
    );

-- INSERT: Authenticated users can create teams
DROP POLICY IF EXISTS "Users can create teams" ON org.teams;

CREATE POLICY "Users can create teams" ON org.teams FOR
INSERT
    TO public
WITH
    CHECK (
        owner_user_id = auth.uid ()
        OR security.is_admin ()
    );

-- UPDATE: Owner OR Admin only
DROP POLICY IF EXISTS "Team owners can update their teams" ON org.teams;

CREATE POLICY "Team owners can update their teams" ON org.teams FOR
UPDATE TO public USING (
    owner_user_id = auth.uid ()
    OR security.is_admin ()
);

-- DELETE: Owner OR Admin only
DROP POLICY IF EXISTS "Team owners can delete their teams" ON org.teams;

CREATE POLICY "Team owners can delete their teams" ON org.teams FOR DELETE TO public USING (
    owner_user_id = auth.uid ()
    OR security.is_admin ()
);
```

### File: supabase\migrations\0210_freelancers.sql

```sql
-- ============================================================
-- TABLE: org.freelancer_profiles
-- ============================================================
ALTER TABLE org.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT
DROP POLICY IF EXISTS "Users can view their own freelancer profile" ON org.freelancer_profiles;

CREATE POLICY "Users can view their own freelancer profile" ON org.freelancer_profiles FOR
SELECT TO public USING (
        user_id = auth.uid ()
        OR security.is_admin ()
    );

-- INSERT
DROP POLICY IF EXISTS "Users can create their own freelancer profile" ON org.freelancer_profiles;

CREATE POLICY "Users can create their own freelancer profile" ON org.freelancer_profiles FOR
INSERT
    TO public
WITH
    CHECK (
        user_id = auth.uid ()
        OR security.is_admin ()
    );

-- UPDATE
DROP POLICY IF EXISTS "Users can update their own freelancer profile" ON org.freelancer_profiles;

CREATE POLICY "Users can update their own freelancer profile" ON org.freelancer_profiles FOR
UPDATE TO public USING (
    user_id = auth.uid ()
    OR security.is_admin ()
);
```

### File: supabase\migrations\0211_business.sql

```sql
-- ... (Existing RLS for business_profiles) ...

-- ============================================================
-- TABLE: org.business_memberships
-- ============================================================
ALTER TABLE org.business_memberships ENABLE ROW LEVEL SECURITY;

-- VIEW: Members can see who else is in the business
CREATE POLICY "Members can view business roster" ON org.business_memberships FOR
SELECT TO authenticated USING (
        org.is_active_business_member (business_id)
        OR security.is_admin ()
    );

-- MANAGE: Owners can manage members
CREATE POLICY "Owners can manage members" ON org.business_memberships FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM org.business_profiles
        WHERE
            id = business_id
            AND owner_user_id = auth.uid ()
    )
    OR security.is_admin ()
);

-- ============================================================
-- TABLE: org.business_roles
-- ============================================================
ALTER TABLE org.business_roles ENABLE ROW LEVEL SECURITY;

-- VIEW: Members can see available roles
CREATE POLICY "Members can view business roles" ON org.business_roles FOR
SELECT TO authenticated USING (
        org.is_active_business_member (business_id)
    );

-- MANAGE: Owners can manage roles
CREATE POLICY "Owners can manage business roles" ON org.business_roles FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM org.business_profiles
        WHERE
            id = business_id
            AND owner_user_id = auth.uid ()
    )
);
```

### File: supabase\migrations\0212_team_memberships.sql

```sql
-- ============================================================
-- TABLE: org.team_memberships
-- ============================================================
ALTER TABLE org.team_memberships ENABLE ROW LEVEL SECURITY;

-- SELECT: Visibility Rule
DROP POLICY IF EXISTS "Users can view members of their teams" ON org.team_memberships;

CREATE POLICY "Users can view members of their teams" ON org.team_memberships FOR
SELECT TO public USING (
        -- I am the user in this row
        user_id = auth.uid ()
        OR
        -- OR I am a member of the team this row belongs to (Uses recursion breaker)
        org.is_active_team_member (team_id)
        OR security.is_admin ()
    );

-- INSERT: Add Members Rule
DROP POLICY IF EXISTS "Team owners can add members" ON org.team_memberships;

CREATE POLICY "Team owners can add members" ON org.team_memberships FOR
INSERT
    TO public
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM org.teams t
            WHERE
                t.id = team_id
                AND t.owner_user_id = auth.uid ()
        )
        OR security.is_admin ()
    );

-- UPDATE: Manage Members Rule
DROP POLICY IF EXISTS "Team owners can update members" ON org.team_memberships;

CREATE POLICY "Team owners can update members" ON org.team_memberships FOR
UPDATE TO public USING (
    EXISTS (
        SELECT 1
        FROM org.teams t
        WHERE
            t.id = team_id
            AND t.owner_user_id = auth.uid ()
    )
    OR security.is_admin ()
);

-- DELETE: Remove/Leave Rule
DROP POLICY IF EXISTS "Team owners can remove members or members can leave" ON org.team_memberships;

CREATE POLICY "Team owners can remove members or members can leave" ON org.team_memberships FOR DELETE TO public USING (
    -- I am the user leaving
    user_id = auth.uid ()
    OR
    -- OR I am the owner of the team
    EXISTS (
        SELECT 1
        FROM org.teams t
        WHERE
            t.id = team_id
            AND t.owner_user_id = auth.uid ()
    )
    OR security.is_admin ()
);
```

### File: supabase\migrations\0213_user_preferences.sql

```sql
ALTER TABLE org.user_preferences ENABLE ROW LEVEL SECURITY;

-- 1. VIEW (Own Only)
CREATE POLICY "Users can view own preferences" ON org.user_preferences FOR
SELECT TO authenticated USING (user_id = auth.uid ());

-- 2. UPDATE (Own Only)
CREATE POLICY "Users can update own preferences" ON org.user_preferences FOR
UPDATE TO authenticated USING (user_id = auth.uid ())
WITH
    CHECK (user_id = auth.uid ());

-- 3. INSERT (Own Only)
CREATE POLICY "Users can insert own preferences" ON org.user_preferences FOR
INSERT
    TO authenticated
WITH
    CHECK (user_id = auth.uid ());
```

### File: supabase\migrations\0300_message_file_details.sql

```sql
CREATE OR REPLACE VIEW comms.message_file_details AS
SELECT ma.message_id, ma.message_table, ma.attachment_id, f.id AS file_id, f.display_name, f.mime_type, f.size_bytes, f.status, f.storage_path
FROM comms.message_attachments ma
    JOIN files.items f ON ma.attachment_id = f.id;

GRANT SELECT ON comms.message_file_details TO authenticated;

GRANT SELECT ON comms.message_file_details TO service_role;
```

### File: supabase\migrations\0301_business_views.sql

```sql
CREATE OR REPLACE VIEW org.view_business_staff AS
SELECT
    bm.business_id,
    bm.user_id,
    bm.role as membership_role, -- 'owner', 'member'
    bm.status,
    bm.joined_at,
    up.first_name,
    up.last_name,
    up.username,
    up.avatar_url,
    up.email -- Only expose if needed, be careful with privacy
FROM org.business_memberships bm
    JOIN org.users_public up ON up.user_id = bm.user_id;

-- Grant Access
GRANT SELECT ON org.view_business_staff TO authenticated;
```
