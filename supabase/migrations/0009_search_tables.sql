--------------------------------------------------------
-- SCHEMA: SEARCH (Unified Hybrid Vector Discovery)
--------------------------------------------------------

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- #region 1. TABLE DEFINITIONS & INDEXES

-- 1A. THE "PEOPLE" PILLAR: Unified Profiles Index
-- Consolidates Teams, Businesses, Freelancers, and Users into one table.
CREATE TYPE search.profile_entity_type AS ENUM ('user', 'freelancer', 'business', 'team');

CREATE TABLE search.profiles_index (
    entity_id uuid NOT NULL,
    entity_type search.profile_entity_type NOT NULL,
    display_name text NOT NULL,
    headline text,
    fts tsvector, -- For rapid full-text keyword matching
    embedding vector(1536), -- For semantic similarity
    metadata jsonb DEFAULT '{}'::jsonb, -- Stores type-specific data (hourly_rate, plan, skills)
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (entity_id, entity_type)
);

-- Indexes for hybrid search on profiles
CREATE INDEX idx_profiles_vector ON search.profiles_index USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_profiles_fts ON search.profiles_index USING GIN (fts);

CREATE INDEX idx_profiles_type ON search.profiles_index (entity_type);

-- 1B. THE "PROJECTS" PILLAR
CREATE TABLE search.projects_index (
    project_id uuid PRIMARY KEY REFERENCES projects.projects (id) ON DELETE CASCADE,
    title text NOT NULL,
    fts tsvector,
    embedding vector (1536),
    industry_category_id uuid,
    status text,
    is_active boolean DEFAULT false,
    updated_at timestamp
    with
        time zone DEFAULT now()
);

CREATE INDEX idx_projects_vector ON search.projects_index USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_projects_fts ON search.projects_index USING GIN (fts);

-- 1C. THE "SERVICES" PILLAR (Portfolios / Marketplace Assets)
CREATE TABLE search.services_index (
    service_id uuid PRIMARY KEY REFERENCES org.portfolios (id) ON DELETE CASCADE,
    title text NOT NULL,
    fts tsvector,
    embedding vector (1536),
    is_public boolean DEFAULT true,
    avg_rating numeric(3, 2) DEFAULT 0.0,
    updated_at timestamp
    with
        time zone DEFAULT now()
);

CREATE INDEX idx_services_vector ON search.services_index USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_services_fts ON search.services_index USING GIN (fts);

-- #endregion

-- #region 2. SYNC TRIGGERS

-- 2A. TEAMS SYNC
CREATE OR REPLACE FUNCTION search.sync_team_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.profiles_index (entity_id, entity_type, display_name, fts, metadata, is_active, updated_at)
    VALUES (
        NEW.id,
        'team',
        NEW.slug, -- Or team name if added to org.teams
        to_tsvector('english', coalesce(NEW.slug, '')),
        jsonb_build_object('payout_model', NEW.payout_model),
        true,
        now()
    )
    ON CONFLICT (entity_id, entity_type) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        fts = EXCLUDED.fts,
        metadata = search.profiles_index.metadata || EXCLUDED.metadata,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_team_search
AFTER INSERT OR UPDATE ON org.teams
FOR EACH ROW EXECUTE FUNCTION search.sync_team_to_index();

-- 2B. FREELANCERS SYNC
CREATE OR REPLACE FUNCTION search.sync_freelancer_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.profiles_index (entity_id, entity_type, display_name, fts, metadata, updated_at)
    VALUES (
        NEW.user_id,
        'freelancer',
        'Freelancer Profile', -- Display name synced from users_public in a robust setup
        to_tsvector('english', array_to_string(NEW.skills, ' ')),
        jsonb_build_object('hourly_rate', NEW.hourly_rate, 'skills', NEW.skills),
        now()
    )
    ON CONFLICT (entity_id, entity_type) DO UPDATE SET
        fts = EXCLUDED.fts,
        metadata = search.profiles_index.metadata || EXCLUDED.metadata,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_freelancer_search
AFTER INSERT OR UPDATE ON org.freelancer_profiles
FOR EACH ROW EXECUTE FUNCTION search.sync_freelancer_to_index();

-- 2C. USERS (PUBLIC) SYNC
CREATE OR REPLACE FUNCTION search.sync_user_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.profiles_index (entity_id, entity_type, display_name, headline, fts, metadata, is_active, updated_at)
    VALUES (
        NEW.user_id,
        'user',
        coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, ''),
        NEW.headline,
        to_tsvector('english', coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, '') || ' ' || coalesce(NEW.headline, '')),
        jsonb_build_object('username', NEW.username),
        CASE WHEN NEW.visibility = 'public' THEN true ELSE false END,
        now()
    )
    ON CONFLICT (entity_id, entity_type) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        headline = EXCLUDED.headline,
        fts = EXCLUDED.fts,
        metadata = search.profiles_index.metadata || EXCLUDED.metadata,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_user_search
AFTER INSERT OR UPDATE ON org.users_public
FOR EACH ROW EXECUTE FUNCTION search.sync_user_to_index();

-- 2D. BUSINESSES SYNC
CREATE OR REPLACE FUNCTION search.sync_business_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.profiles_index (entity_id, entity_type, display_name, fts, metadata, updated_at)
    VALUES (
        NEW.id,
        'business',
        NEW.name,
        to_tsvector('english', coalesce(NEW.name, '')),
        jsonb_build_object('plan', NEW.plan),
        now()
    )
    ON CONFLICT (entity_id, entity_type) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        fts = EXCLUDED.fts,
        metadata = search.profiles_index.metadata || EXCLUDED.metadata,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_business_search
AFTER INSERT OR UPDATE ON org.business_profiles
FOR EACH ROW EXECUTE FUNCTION search.sync_business_to_index();

-- 2E. PROJECTS SYNC
CREATE OR REPLACE FUNCTION search.sync_project_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.projects_index (project_id, title, fts, industry_category_id, status, is_active, updated_at)
    VALUES (
        NEW.id,
        'Project Title',
        to_tsvector('english', NEW.status::text),
        NEW.industry_category_id,
        NEW.status::text,
        CASE WHEN NEW.visibility = 'public' AND NEW.status != 'draft' THEN true ELSE false END,
        now()
    )
    ON CONFLICT (project_id) DO UPDATE SET
        industry_category_id = EXCLUDED.industry_category_id,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_project_search
AFTER INSERT OR UPDATE ON projects.projects
FOR EACH ROW EXECUTE FUNCTION search.sync_project_to_index();

-- #endregion