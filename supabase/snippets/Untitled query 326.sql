--------------------------------------------------------
-- SCHEMA: SEARCH (Simple ILIKE Fallback Functions)
-- Description: Temporary search functions using basic text 
-- matching and metadata filtering. Designed to be hot-swapped
-- with vector HNSW logic later without breaking backend contracts.
--------------------------------------------------------

-- #region 1. TEAMS SEARCH
CREATE OR REPLACE FUNCTION search.simple_search_teams(
    search_query text DEFAULT '',
    match_count int DEFAULT 20,
    min_rate int DEFAULT 0,
    max_rate int DEFAULT 999999
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER -- Executes as admin to bypass restricted schema rules
SET search_path = '' -- Security best practice to prevent path hijacking
AS $$
BEGIN
    RETURN QUERY
    SELECT
        si.team_id AS id,
        1.0::float AS similarity
    FROM search.teams_index si
    JOIN org.teams t ON t.id = si.team_id
    WHERE si.is_active = true
      AND si.hourly_rate_avg BETWEEN min_rate AND max_rate
      AND (
          search_query = '' 
          OR t.name ILIKE '%' || search_query || '%' 
          OR t.description ILIKE '%' || search_query || '%'
      )
    ORDER BY si.avg_rating DESC, t.created_at DESC
    LIMIT match_count;
END;
$$;
-- #endregion


-- #region 2. FREELANCERS SEARCH
CREATE OR REPLACE FUNCTION search.simple_search_freelancers(
    search_query text DEFAULT '',
    match_count int DEFAULT 20,
    min_rate int DEFAULT 0,
    max_rate int DEFAULT 999999,
    required_skills text[] DEFAULT '{}'::text[]
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        si.user_id AS id,
        1.0::float AS similarity
    FROM search.freelancers_index si
    JOIN org.users_public u ON u.user_id = si.user_id
    WHERE (si.hourly_rate IS NULL OR si.hourly_rate BETWEEN min_rate AND max_rate)
      -- Changed from cardinality() to exact empty-array match for absolute null-safety
      AND (required_skills = '{}'::text[] OR si.skills @> required_skills)
      AND (
          search_query = '' 
          OR u.first_name ILIKE '%' || search_query || '%' 
          OR u.last_name ILIKE '%' || search_query || '%' 
          OR u.headline ILIKE '%' || search_query || '%'
      )
    ORDER BY si.avg_rating DESC, u.created_at DESC
    LIMIT match_count;
END;
$$;
-- #endregion


-- #region 3. USERS SEARCH (Social/People)
CREATE OR REPLACE FUNCTION search.simple_search_users(
    search_query text DEFAULT '',
    match_count int DEFAULT 20,
    target_country text DEFAULT NULL
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        si.user_id AS id,
        1.0::float AS similarity
    FROM search.users_index si
    JOIN org.users_public u ON u.user_id = si.user_id
    WHERE si.is_active = true
      AND (target_country IS NULL OR si.country = target_country)
      AND (
          search_query = '' 
          OR u.first_name ILIKE '%' || search_query || '%' 
          OR u.last_name ILIKE '%' || search_query || '%' 
          OR u.username ILIKE '%' || search_query || '%'
      )
    ORDER BY u.created_at DESC
    LIMIT match_count;
END;
$$;
-- #endregion


-- #region 4. BUSINESSES SEARCH
CREATE OR REPLACE FUNCTION search.simple_search_businesses(
    search_query text DEFAULT '',
    match_count int DEFAULT 20,
    target_country text DEFAULT NULL
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        si.business_id AS id,
        1.0::float AS similarity
    FROM search.businesses_index si
    JOIN org.business_profiles b ON b.id = si.business_id
    WHERE (target_country IS NULL OR si.country = target_country)
      AND (
          search_query = '' 
          OR b.name ILIKE '%' || search_query || '%' 
          OR b.headline ILIKE '%' || search_query || '%'
      )
    ORDER BY b.created_at DESC
    LIMIT match_count;
END;
$$;
-- #endregion


-- #region 5. SERVICES SEARCH (Portfolios)
CREATE OR REPLACE FUNCTION search.simple_search_services(
    search_query text DEFAULT '',
    match_count int DEFAULT 20
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        si.service_id AS id,
        1.0::float AS similarity
    FROM search.services_index si
    JOIN org.portfolios p ON p.id = si.service_id
    WHERE si.is_public = true
      AND (
          search_query = '' 
          OR p.title ILIKE '%' || search_query || '%' 
          OR p.description ILIKE '%' || search_query || '%'
      )
    ORDER BY si.avg_rating DESC, p.created_at DESC
    LIMIT match_count;
END;
$$;
-- #endregion


-- #region 6. PROJECTS SEARCH
CREATE OR REPLACE FUNCTION search.simple_search_projects(
    search_query text DEFAULT '',
    match_count int DEFAULT 20,
    target_industry_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        si.project_id AS id,
        1.0::float AS similarity
    FROM search.projects_index si
    JOIN projects.projects p ON p.id = si.project_id
    WHERE si.is_active = true
      AND (target_industry_id IS NULL OR si.industry_id = target_industry_id)
      AND (
          search_query = '' 
          OR p.title ILIKE '%' || search_query || '%' 
          -- Casting description to text just in case you stored it as JSONB based on the project table schema
          OR p.description::text ILIKE '%' || search_query || '%' 
      )
    ORDER BY p.created_at DESC
    LIMIT match_count;
END;
$$;
-- #endregion