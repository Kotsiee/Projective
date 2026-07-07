-- US-001 · Multi-Persona Onboarding — AC4 & AC6
--
-- Hardens the onboarding success path (public.handle_new_user, the trigger that
-- atomically commits a new account's profile rows) so that every newly-created
-- account:
--   AC4 — has its security.session_context initialised with the resolved active
--         profile, in the same transaction as profile creation.
--   AC6 — has a 'user.onboarded' entry written to security.audit_logs confirming
--         successful completion of onboarding.
--
-- Both writes live here rather than in the TypeScript backend on purpose:
--   * session_context is a cross-cutting RLS dependency and must be set the moment
--     the profile exists — doing it in the definer trigger makes it atomic and
--     immune to a half-completed app-layer flow.
--   * security.audit_logs is NOT granted to the `authenticated` role (see 0205),
--     so an app-layer insert would be rejected by privileges/RLS. It can only be
--     written from a SECURITY DEFINER context, which this trigger is.
--
-- The app-layer propagation is unchanged: CreateAccountBackendService passes
-- `objective`/`skills`/etc. via auth.signUp metadata → auth.users.raw_user_meta_data
-- → this trigger consumes it.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_is_freelancer boolean := false;
    v_first_name text;
    v_last_name text;
    v_username text;
    v_dob date;
    v_objective text;
    v_skills text[];
    v_interests text[];
    v_active_profile_type public.profile_type;
    v_active_profile_id uuid;
BEGIN
    -- Extract safe metadata strings
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_username := NEW.raw_user_meta_data->>'username';
    v_dob := (NEW.raw_user_meta_data->>'dob')::date;
    v_objective := NEW.raw_user_meta_data->>'objective';

    IF v_objective = 'freelancer' OR v_objective = 'seller' THEN
        v_is_freelancer := true;
    END IF;

    -- Safely extract JSON arrays to Postgres Text Arrays
    IF NEW.raw_user_meta_data ? 'skills' AND jsonb_typeof(NEW.raw_user_meta_data->'skills') = 'array' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'skills')) INTO v_skills;
    ELSE
        v_skills := '{}'::text[];
    END IF;

    IF NEW.raw_user_meta_data ? 'interests' AND jsonb_typeof(NEW.raw_user_meta_data->'interests') = 'array' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests')) INTO v_interests;
    ELSE
        v_interests := '{}'::text[];
    END IF;

    -- 1. Insert Core Profile
    INSERT INTO org.users_public (
        user_id, first_name, last_name, username, dob, visibility, interests, is_freelancer
    ) VALUES (
        NEW.id, v_first_name, v_last_name, v_username, v_dob, 'unlisted', v_interests, v_is_freelancer
    );

    -- 2. Insert Email Relationship (Handles NULL verification times automatically)
    INSERT INTO org.user_emails (
        user_id, email, is_primary, verified_at
    ) VALUES (
        NEW.id, NEW.email, true, NEW.email_confirmed_at
    );

    -- 3. Persona Routing → resolve the account's initial active profile
    IF v_is_freelancer THEN
        INSERT INTO org.freelancer_profiles (user_id, skills)
        VALUES (NEW.id, v_skills);

        -- Freelancer profiles are keyed by user_id, so the active profile id is the user id.
        v_active_profile_type := 'freelancer';
        v_active_profile_id := NEW.id;
    ELSE
        -- Client/buyer persona: no owned profile exists yet (a Business is created
        -- later in US-002), so the account starts with no active profile selected.
        v_active_profile_type := NULL;
        v_active_profile_id := NULL;
    END IF;

    -- AC4 — Initialise session context with the resolved active profile.
    -- Idempotent so re-running the onboarding path can never leave a stale context.
    INSERT INTO security.session_context (
        user_id, active_profile_type, active_profile_id, active_team_id, updated_at
    ) VALUES (
        NEW.id, v_active_profile_type, v_active_profile_id, NULL, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        active_profile_type = EXCLUDED.active_profile_type,
        active_profile_id = EXCLUDED.active_profile_id,
        active_team_id = NULL,
        updated_at = NOW();

    -- AC6 — Write the immutable onboarding audit entry. actor_profile_id mirrors
    -- the profile active in session_context at the time of the event (per the
    -- persona-consistency rule in documentation/database/security/Tables.md).
    INSERT INTO security.audit_logs (
        user_id, action, entity_table, entity_id, metadata, actor_profile_id
    ) VALUES (
        NEW.id,
        'user.onboarded',
        'org.users_public',
        NEW.id,
        jsonb_build_object(
            'objective', v_objective,
            'is_freelancer', v_is_freelancer,
            'username', v_username,
            'active_profile_type', v_active_profile_type
        ),
        v_active_profile_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-affirm the trigger binding (idempotent).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
