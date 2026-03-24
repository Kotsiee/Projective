--------------------------------------------------------
-- SCHEMA: SEARCH (Hybrid Vector Discovery)
--------------------------------------------------------

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- #region 1. TABLE DEFINITIONS & INDEXES

-- 1A. TEAMS
CREATE TABLE search.teams_index (
    team_id uuid PRIMARY KEY REFERENCES org.teams(id) ON DELETE CASCADE,
    embedding vector(1536),
    hourly_rate_avg integer DEFAULT 0,
    member_count integer DEFAULT 1,
    avg_rating numeric(3,2) DEFAULT 0.0,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_teams_vector ON search.teams_index USING hnsw (embedding vector_cosine_ops);

-- 1B. FREELANCERS
CREATE TABLE search.freelancers_index (
    user_id uuid PRIMARY KEY REFERENCES org.freelancer_profiles(user_id) ON DELETE CASCADE,
    embedding vector(1536),
    hourly_rate integer,
    availability_status text,
    skills text[] DEFAULT '{}'::text[],
    avg_rating numeric(3,2) DEFAULT 0.0,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_freelancers_vector ON search.freelancers_index USING hnsw (embedding vector_cosine_ops);

-- 1C. USERS (Social/LinkedIn Mode)
CREATE TABLE search.users_index (
    user_id uuid PRIMARY KEY REFERENCES org.users_public(user_id) ON DELETE CASCADE,
    embedding vector(1536),
    country text,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_users_vector ON search.users_index USING hnsw (embedding vector_cosine_ops);

-- 1D. BUSINESSES
CREATE TABLE search.businesses_index (
    business_id uuid PRIMARY KEY REFERENCES org.business_profiles(id) ON DELETE CASCADE,
    embedding vector(1536),
    country text,
    plan text,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_businesses_vector ON search.businesses_index USING hnsw (embedding vector_cosine_ops);

-- 1E. SERVICES (Portfolios)
CREATE TABLE search.services_index (
    service_id uuid PRIMARY KEY REFERENCES org.portfolios(id) ON DELETE CASCADE,
    embedding vector(1536),
    is_public boolean DEFAULT true,
    avg_rating numeric(3,2) DEFAULT 0.0,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_services_vector ON search.services_index USING hnsw (embedding vector_cosine_ops);

-- 1F. PROJECTS
CREATE TABLE search.projects_index (
    project_id uuid PRIMARY KEY REFERENCES projects.projects(id) ON DELETE CASCADE,
    embedding vector(1536),
    industry_id uuid,
    status text,
    is_active boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_projects_vector ON search.projects_index USING hnsw (embedding vector_cosine_ops);

-- #endregion


-- #region 2. SYNC TRIGGERS

-- 2A. TEAMS SYNC
CREATE OR REPLACE FUNCTION search.sync_team_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.teams_index (team_id, is_active, updated_at)
    VALUES (
        NEW.id,
        CASE WHEN NEW.visibility = 'public' THEN true ELSE false END,
        now()
    )
    ON CONFLICT (team_id) DO UPDATE SET
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
    INSERT INTO search.freelancers_index (user_id, hourly_rate, availability_status, skills, updated_at)
    VALUES (
        NEW.user_id,
        NEW.hourly_rate,
        NEW.availability_status,
        NEW.skills,
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        hourly_rate = EXCLUDED.hourly_rate,
        availability_status = EXCLUDED.availability_status,
        skills = EXCLUDED.skills,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_freelancer_search
AFTER INSERT OR UPDATE ON org.freelancer_profiles
FOR EACH ROW EXECUTE FUNCTION search.sync_freelancer_to_index();


-- 2C. USERS SYNC
CREATE OR REPLACE FUNCTION search.sync_user_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.users_index (user_id, country, is_active, updated_at)
    VALUES (
        NEW.user_id,
        NEW.country,
        CASE WHEN NEW.visibility = 'public' THEN true ELSE false END,
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        country = EXCLUDED.country,
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
    INSERT INTO search.businesses_index (business_id, country, plan, updated_at)
    VALUES (
        NEW.id,
        NEW.country,
        NEW.plan,
        now()
    )
    ON CONFLICT (business_id) DO UPDATE SET
        country = EXCLUDED.country,
        plan = EXCLUDED.plan,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_business_search
AFTER INSERT OR UPDATE ON org.business_profiles
FOR EACH ROW EXECUTE FUNCTION search.sync_business_to_index();


-- 2E. SERVICES (PORTFOLIOS) SYNC
CREATE OR REPLACE FUNCTION search.sync_service_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.services_index (service_id, is_public, updated_at)
    VALUES (
        NEW.id,
        NEW.is_public,
        now()
    )
    ON CONFLICT (service_id) DO UPDATE SET
        is_public = EXCLUDED.is_public,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_service_search
AFTER INSERT OR UPDATE ON org.portfolios
FOR EACH ROW EXECUTE FUNCTION search.sync_service_to_index();


-- 2F. PROJECTS SYNC
CREATE OR REPLACE FUNCTION search.sync_project_to_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO search.projects_index (project_id, industry_id, status, is_active, updated_at)
    VALUES (
        NEW.id,
        NEW.industry_category_id,
        NEW.status::text,
        CASE WHEN NEW.visibility = 'public' AND NEW.status != 'draft' THEN true ELSE false END,
        now()
    )
    ON CONFLICT (project_id) DO UPDATE SET
        industry_id = EXCLUDED.industry_id,
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



-- 5. RPC: HYBRID TEAM SEARCH
-- Combines vector similarity with hard metadata filters
-- CREATE OR REPLACE FUNCTION search.search_teams(
--     query_embedding vector(1536),
--     match_threshold float,
--     match_count int,
--     min_rate int DEFAULT 0,
--     max_rate int DEFAULT 999999,
--     required_skills uuid[] DEFAULT '{}'::uuid[]
-- )
-- RETURNS TABLE (
--     team_id uuid,
--     similarity float
-- )
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--     RETURN QUERY
--     SELECT
--         si.team_id,
--         1 - (si.embedding <=> query_embedding) AS similarity
--     FROM search.teams_index si
--     WHERE 1 - (si.embedding <=> query_embedding) > match_threshold
--       AND si.hourly_rate_avg BETWEEN min_rate AND max_rate
--       AND (required_skills = '{}'::uuid[] OR si.skills_ids @> required_skills)
--       AND si.is_active = true
--     ORDER BY si.embedding <=> query_embedding
--     LIMIT match_count;
-- END;
-- $$;

-- -- 6. RPC: RECOMMEND SIMILAR TEAMS
-- -- Pure vector similarity for "More like this" features
-- CREATE OR REPLACE FUNCTION search.get_similar_teams(
--     target_team_id uuid,
--     match_count int DEFAULT 4
-- )
-- RETURNS TABLE (
--     team_id uuid,
--     similarity float
-- )
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--     target_embedding vector(1536);
-- BEGIN
--     SELECT embedding INTO target_embedding FROM search.teams_index WHERE team_id = target_team_id;
    
--     RETURN QUERY
--     SELECT
--         si.team_id,
--         1 - (si.embedding <=> target_embedding) AS similarity
--     FROM search.teams_index si
--     WHERE si.team_id != target_team_id
--     ORDER BY si.embedding <=> target_embedding
--     LIMIT match_count;
-- END;
-- $$;