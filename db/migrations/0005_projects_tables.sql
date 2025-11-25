CREATE TABLE IF NOT EXISTS projects.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    client_business_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    title text NOT NULL,
    description text NOT NULL,
    status project_status NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_client_business ON projects.projects (client_business_id);

CREATE INDEX IF NOT EXISTS idx_projects_status_created_at ON projects.projects (status, created_at DESC);

CREATE TABLE IF NOT EXISTS projects.project_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    name text NOT NULL,
    "order" integer NOT NULL,
    description text NOT NULL,
    status stage_status NOT NULL DEFAULT 'open',
    due_date timestamptz NULL,
    completed_at timestamptz NULL,
    stage_type text NULL,
    ip_mode text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_stages_project_order ON projects.project_stages (project_id, "order");

CREATE INDEX IF NOT EXISTS idx_project_stages_project_status ON projects.project_stages (project_id, status);

CREATE TABLE IF NOT EXISTS projects.stage_budget_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    type text NOT NULL,
    amount_currency text NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    notes text NULL
);

CREATE INDEX IF NOT EXISTS idx_stage_budget_rules_stage ON projects.stage_budget_rules (project_stage_id);

CREATE TABLE IF NOT EXISTS projects.stage_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    assignee_type assignment_type NOT NULL,
    freelancer_profile_id uuid NULL REFERENCES org.freelancer_profiles (id) ON DELETE SET NULL,
    team_id uuid NULL REFERENCES org.teams (id) ON DELETE SET NULL,
    assigned_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    status text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_stage_assignments_assignee CHECK (
        (
            assignee_type = 'freelancer'
            AND freelancer_profile_id IS NOT NULL
            AND team_id IS NULL
        )
        OR (
            assignee_type = 'team'
            AND team_id IS NOT NULL
            AND freelancer_profile_id IS NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_stage_assignments_stage ON projects.stage_assignments (project_stage_id);

CREATE INDEX IF NOT EXISTS idx_stage_assignments_freelancer ON projects.stage_assignments (freelancer_profile_id)
WHERE
    freelancer_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stage_assignments_team ON projects.stage_assignments (team_id)
WHERE
    team_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS projects.stage_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    submitted_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stage_submissions_stage_created ON projects.stage_submissions (
    project_stage_id,
    created_at DESC
);

CREATE TABLE IF NOT EXISTS projects.stage_revision_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    requested_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    type text NOT NULL,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_stage_revision_requests_stage ON projects.stage_revision_requests (project_stage_id);

CREATE INDEX IF NOT EXISTS idx_stage_revision_requests_status ON projects.stage_revision_requests (status);

CREATE TABLE IF NOT EXISTS projects.maintenance_contracts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    freelancer_profile_id uuid NOT NULL REFERENCES org.freelancer_profiles (id) ON DELETE RESTRICT,
    business_profile_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    currency text NOT NULL,
    interval text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_contracts_project ON projects.maintenance_contracts (project_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_contracts_business ON projects.maintenance_contracts (business_profile_id);

CREATE TABLE IF NOT EXISTS projects.project_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    profile_type profile_type NOT NULL,
    profile_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_project_participants_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_project_participants_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_participants_project_profile ON projects.project_participants (
    project_id,
    profile_type,
    profile_id
);

CREATE INDEX IF NOT EXISTS idx_project_participants_profile ON projects.project_participants (profile_type, profile_id);

CREATE TABLE IF NOT EXISTS projects.project_activity (
id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
project_id    uuid        NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
actor_user_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
kind          text        NOT NULL, 
payload       jsonb       NOT NULL DEFAULT '{}'::jsonb,
entity_table  text        NOT NULL,
entity_id     uuid        NOT NULL,
created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_activity_project_created ON projects.project_activity (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_activity_entity ON projects.project_activity (entity_table, entity_id);

COMMIT;