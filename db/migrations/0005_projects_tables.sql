-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE projects.maintenance_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  freelancer_profile_id uuid NOT NULL,
  business_profile_id uuid NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL,
  interval text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_contracts_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_contracts_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id),
  CONSTRAINT maintenance_contracts_freelancer_profile_id_fkey FOREIGN KEY (freelancer_profile_id) REFERENCES org.freelancer_profiles(id),
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
  CONSTRAINT project_activity_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id),
  CONSTRAINT project_activity_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id)
);

CREATE TABLE projects.project_attachments (
    project_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    CONSTRAINT project_attachments_pkey PRIMARY KEY (project_id, attachment_id),
    CONSTRAINT project_attachments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id),
    CONSTRAINT project_attachments_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES org.attachments (id)
);

CREATE TABLE projects.project_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL,
    profile_type USER - DEFINED NOT NULL,
    profile_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT project_participants_pkey PRIMARY KEY (id),
        CONSTRAINT project_participants_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id),
        CONSTRAINT fk_project_participants_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id),
        CONSTRAINT fk_project_participants_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id)
);

CREATE TABLE projects.project_required_skills (
    project_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    CONSTRAINT project_required_skills_pkey PRIMARY KEY (project_id, skill_id),
    CONSTRAINT project_required_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES org.skills (id),
    CONSTRAINT project_required_skills_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id)
);

CREATE TABLE projects.project_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  order integer NOT NULL,
  description text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'open'::stage_status,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  stage_type text,
  ip_mode text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_stages_pkey PRIMARY KEY (id),
  CONSTRAINT project_stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id)
);

CREATE TABLE projects.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_business_id uuid,
  title text NOT NULL,
  description text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::project_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  owner_user_id uuid,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_business_id_fkey FOREIGN KEY (client_business_id) REFERENCES org.business_profiles(id),
  CONSTRAINT projects_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

CREATE TABLE projects.stage_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL,
    assignee_type USER - DEFINED NOT NULL,
    freelancer_profile_id uuid,
    team_id uuid,
    assigned_by uuid NOT NULL,
    status text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT stage_assignments_pkey PRIMARY KEY (id),
        CONSTRAINT stage_assignments_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages (id),
        CONSTRAINT stage_assignments_freelancer_profile_id_fkey FOREIGN KEY (freelancer_profile_id) REFERENCES org.freelancer_profiles (id),
        CONSTRAINT stage_assignments_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams (id),
        CONSTRAINT stage_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users (id)
);

CREATE TABLE projects.stage_budget_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL,
    type text NOT NULL,
    amount_currency text NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    notes text,
    CONSTRAINT stage_budget_rules_pkey PRIMARY KEY (id),
    CONSTRAINT stage_budget_rules_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages (id)
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

CREATE TABLE projects.stage_revision_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  type text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT stage_revision_requests_pkey PRIMARY KEY (id),
  CONSTRAINT stage_revision_requests_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages(id),
  CONSTRAINT stage_revision_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id)
);

CREATE TABLE projects.stage_staffing_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  role_title text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  budget_type USER-DEFINED NOT NULL DEFAULT 'fixed_price'::budget_type,
  budget_amount_cents bigint NOT NULL CHECK (budget_amount_cents >= 0),
  allow_proposals boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stage_staffing_roles_pkey PRIMARY KEY (id),
  CONSTRAINT stage_staffing_roles_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages(id)
);

CREATE TABLE projects.stage_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL,
    submitted_by uuid NOT NULL,
    notes text,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT stage_submissions_pkey PRIMARY KEY (id),
        CONSTRAINT stage_submissions_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages (id),
        CONSTRAINT stage_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users (id)
);