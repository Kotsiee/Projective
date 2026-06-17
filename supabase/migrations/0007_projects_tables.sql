CREATE TYPE project_format AS ENUM ('one_off', 'pipeline');

CREATE TYPE ticket_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'completed', 'cancelled');

CREATE TYPE projects.cohort_status AS ENUM ('enrolling', 'active', 'completed', 'cancelled');

CREATE TYPE projects.session_event_status AS ENUM ('scheduled', 'completed', 'cancelled_by_freelancer', 'cancelled_by_client');

CREATE TYPE projects.waitlist_status AS ENUM ('waiting', 'invited', 'expired', 'converted');

CREATE TYPE projects.application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TYPE projects.application_target_type AS ENUM ('stage', 'role');


CREATE TABLE projects.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_business_id uuid,
  owner_user_id uuid NOT NULL,
  title text NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_text text NOT NULL DEFAULT ''::text,
  format project_format NOT NULL DEFAULT 'pipeline'::project_format,
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
  CONSTRAINT projects_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES org.users_public(user_id)
);


CREATE TABLE projects.project_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_text text NOT NULL DEFAULT ''::text,
  sort_order integer NOT NULL,
  status stage_status NOT NULL DEFAULT 'open'::stage_status,

  file_upload_required boolean NOT NULL DEFAULT false,
  default_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills text[] DEFAULT '{}'::text[],

  start_trigger_type start_trigger_type NOT NULL DEFAULT 'on_project_start'::start_trigger_type,
  fixed_start_date timestamp with time zone,
  start_dependency_stage_id uuid,
  start_dependency_lag_days integer DEFAULT 0,
  hire_trigger_active boolean NOT NULL DEFAULT true,

  file_revisions_allowed integer DEFAULT 0,
  file_duration_mode text,
  file_duration_days integer,
  file_due_date timestamp with time zone,
  
  session_duration_minutes integer,
  session_count integer DEFAULT 1,
  session_preferred_days text[],
  session_end_date timestamp with time zone,

  ip_ownership_override ip_option_mode,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  ip_mode ip_option_mode DEFAULT 'exclusive_transfer'::ip_option_mode,
  
  CONSTRAINT project_stages_pkey PRIMARY KEY (id),
  CONSTRAINT project_stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id),
  CONSTRAINT project_stages_start_dependency_stage_id_fkey FOREIGN KEY (start_dependency_stage_id) REFERENCES projects.project_stages(id)
);

CREATE TABLE projects.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  status ticket_status NOT NULL DEFAULT 'backlog'::ticket_status,
required_stage_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  current_stage_id uuid,
assigned_to_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id),
  CONSTRAINT tickets_current_stage_id_fkey FOREIGN KEY (current_stage_id) REFERENCES projects.project_stages(id),
  CONSTRAINT tickets_assigned_user_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES org.users_public(user_id)
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
  CONSTRAINT project_activity_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES org.users_public(user_id)
);

CREATE TABLE projects.project_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL,
    profile_type profile_type NOT NULL,
    profile_id uuid NOT NULL,
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
    is_client_managed boolean NOT NULL DEFAULT false,
    status text NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT stage_assignments_pkey PRIMARY KEY (id),
        CONSTRAINT stage_assignments_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages (id),
        CONSTRAINT stage_assignments_freelancer_profile_id_fkey FOREIGN KEY (freelancer_profile_id) REFERENCES org.freelancer_profiles (user_id),
        CONSTRAINT stage_assignments_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams (id),
        CONSTRAINT stage_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES org.users_public (user_id)
);


CREATE TABLE projects.stage_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  ticket_id uuid NOT NULL,
  submitted_by uuid NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  status text DEFAULT 'pending_review'::text,
  
  CONSTRAINT stage_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT stage_submissions_project_stage_id_fkey FOREIGN KEY (project_stage_id) REFERENCES projects.project_stages(id),
  CONSTRAINT stage_submissions_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES projects.tickets(id),
  CONSTRAINT stage_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES org.users_public(user_id)
);

CREATE TABLE projects.project_attachments (
    project_id uuid NOT NULL,
    attachment_id uuid NOT NULL,
    CONSTRAINT project_attachments_pkey PRIMARY KEY (project_id, attachment_id),
    CONSTRAINT project_attachments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id),
    CONSTRAINT project_attachments_file_fkey FOREIGN KEY (attachment_id) REFERENCES files.items (id) ON DELETE CASCADE
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
        CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.users_public (user_id),
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
    file_id uuid NOT NULL,
    CONSTRAINT submission_files_pkey PRIMARY KEY (id),
    CONSTRAINT fk_sub_file_submission FOREIGN KEY (submission_id) REFERENCES projects.stage_submissions (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_file_item FOREIGN KEY (file_id) REFERENCES files.items (id) ON DELETE CASCADE
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
  ticket_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  request_type text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  
  CONSTRAINT stage_revision_requests_pkey PRIMARY KEY (id),
  CONSTRAINT stage_revision_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES org.users_public(user_id),
  CONSTRAINT stage_revision_requests_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES projects.tickets(id)
);


CREATE TABLE projects.cohorts (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	project_id uuid NOT NULL,
	name text NOT NULL,
	max_seats integer NOT NULL DEFAULT 1,
	status projects.cohort_status NOT NULL DEFAULT 'enrolling'::projects.cohort_status,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	
	CONSTRAINT cohorts_pkey PRIMARY KEY (id),
	CONSTRAINT cohorts_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects(id)
);


CREATE TABLE projects.cohort_memberships (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	cohort_id uuid NOT NULL,
	user_id uuid NOT NULL,
	status text NOT NULL DEFAULT 'active'::text, 
	joined_at timestamp with time zone NOT NULL DEFAULT now(),
	
	CONSTRAINT cohort_memberships_pkey PRIMARY KEY (id),
	CONSTRAINT cohort_memberships_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES projects.cohorts(id),
	CONSTRAINT cohort_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.users_public(user_id),
	CONSTRAINT cohort_memberships_unique_user UNIQUE (cohort_id, user_id)
);


CREATE TABLE projects.session_events (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	cohort_id uuid NOT NULL,
	title text NOT NULL,
	start_time timestamp with time zone NOT NULL,
	end_time timestamp with time zone NOT NULL,




host_join_url text,
	attendee_join_url text,
	
	status projects.session_event_status NOT NULL DEFAULT 'scheduled'::projects.session_event_status,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now(),
	
	CONSTRAINT session_events_pkey PRIMARY KEY (id),
	CONSTRAINT session_events_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES projects.cohorts(id)
);

CREATE TABLE projects.session_attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    session_event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        ip_address inet,
        CONSTRAINT session_attendance_pkey PRIMARY KEY (id),
        CONSTRAINT session_attendance_event_id_fkey FOREIGN KEY (session_event_id) REFERENCES projects.session_events (id),
        CONSTRAINT session_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.users_public (user_id)
);


CREATE TABLE projects.waitlists (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	service_blueprint_id uuid NOT NULL,
	user_id uuid NOT NULL,
	status projects.waitlist_status NOT NULL DEFAULT 'waiting'::projects.waitlist_status,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	
	CONSTRAINT waitlists_pkey PRIMARY KEY (id),
	CONSTRAINT waitlists_service_blueprint_id_fkey FOREIGN KEY (service_blueprint_id) REFERENCES marketplace.service_blueprints(id),
	CONSTRAINT waitlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.users_public(user_id),
	CONSTRAINT waitlists_unique_user UNIQUE (service_blueprint_id, user_id)
);

CREATE TABLE projects.project_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL,
    applicant_user_id uuid NOT NULL,
    applicant_type text NOT NULL,
    applicant_profile_id uuid NOT NULL,
    message text,
    status projects.application_status NOT NULL DEFAULT 'pending',
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        updated_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT project_applications_pkey PRIMARY KEY (id),
        CONSTRAINT project_applications_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects.projects (id),
        CONSTRAINT project_applications_user_id_fkey FOREIGN KEY (applicant_user_id) REFERENCES org.users_public (user_id)
);

CREATE TABLE projects.project_application_targets (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    application_id uuid NOT NULL,
    target_type projects.application_target_type NOT NULL,
    target_id uuid NOT NULL,
    CONSTRAINT project_application_targets_pkey PRIMARY KEY (id),
    CONSTRAINT pat_application_id_fkey FOREIGN KEY (application_id) REFERENCES projects.project_applications (id) ON DELETE CASCADE
);