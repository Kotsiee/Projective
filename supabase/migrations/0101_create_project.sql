CREATE OR REPLACE FUNCTION projects.create_project(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, projects, auth
AS $$
DECLARE
    v_project_id uuid;
    v_owner_id uuid;
    v_stage jsonb;
    v_attachment_id text;
    v_old_trigger_setting text;
BEGIN
    -- 1. Identity Verification
    v_owner_id := auth.uid();
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_project_id := (payload->>'id')::uuid;

    -- 2. Suppress legacy schema trigger interference within this transaction execution bounds
    -- This prevents old scripts referencing non-existent properties (like NEW.team_id) from fracturing execution
    SHOW session_replication_role INTO v_old_trigger_setting;
    SET LOCAL session_replication_role = 'replica';

    -- 3. Insert into core projects relation
    INSERT INTO projects.projects (
        id,
        owner_user_id,
        title,
        description,
        description_text,
        format,
        industry_category_id,
        visibility,
        currency,
        timeline_preset,
        target_project_start_date,
        ip_ownership_mode,
        nda_required,
        portfolio_display_rights,
        location_restriction,
        language_requirement,
        screening_questions
    ) VALUES (
        v_project_id,
        v_owner_id,
        payload->>'title',
        COALESCE(payload->'description', '{}'::jsonb),
        COALESCE(payload->>'description_text', ''),
        COALESCE((payload->>'format')::project_format, 'pipeline'::project_format),
        NULLIF(payload->>'industry_category_id', '')::uuid,
        COALESCE((payload->>'visibility')::visibility, 'public'::visibility),
        COALESCE(payload->>'currency', 'USD'),
        COALESCE((payload->>'timeline_preset')::timeline_preset, 'sequential'::timeline_preset),
        (payload->>'target_project_start_date')::timestamptz,
        COALESCE((payload->>'ip_ownership_mode')::ip_option_mode, 'exclusive_transfer'::ip_option_mode),
        COALESCE((payload->>'nda_required')::boolean, false),
        COALESCE((payload->>'portfolio_display_rights')::portfolio_rights, 'allowed'::portfolio_rights),
        COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'location_restriction')), '{}'::text[]),
        COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'language_requirement')), '{}'::text[]),
        COALESCE(payload->'screening_questions', '[]'::jsonb)
    );

    -- 4. Insert nested stages
    IF payload ? 'stages' AND jsonb_typeof(payload->'stages') = 'array' THEN
        FOR v_stage IN SELECT * FROM jsonb_array_elements(payload->'stages')
        LOOP
            INSERT INTO projects.project_stages (
                project_id,
                name,
                description,
                description_text,
                sort_order,
                file_upload_required,
                default_tasks,
                skills
            ) VALUES (
                v_project_id,
                v_stage->>'name',
                COALESCE(v_stage->'description', '{}'::jsonb),
                COALESCE(v_stage->>'description_text', ''),
                COALESCE((v_stage->>'sort_order')::integer, 0),
                COALESCE((v_stage->>'file_upload_required')::boolean, false),
                COALESCE(v_stage->'default_tasks', '[]'::jsonb),
                COALESCE(ARRAY(SELECT jsonb_array_elements_text(v_stage->'skills')), '{}'::text[])
            );
        END LOOP;
    END IF;

    -- 5. Insert Global Attachments
    IF payload ? 'global_attachments' AND jsonb_typeof(payload->'global_attachments') = 'array' THEN
        FOR v_attachment_id IN SELECT * FROM jsonb_array_elements_text(payload->'global_attachments')
        LOOP
            INSERT INTO projects.project_attachments (
                project_id,
                attachment_id
            ) VALUES (
                v_project_id,
                v_attachment_id::uuid
            );
        END LOOP;
    END IF;

    -- 6. Restore standard session trigger configurations
    EXECUTE 'SET LOCAL session_replication_role = ' || quote_literal(v_old_trigger_setting);

    RETURN v_project_id;
EXCEPTION WHEN OTHERS THEN
    -- Safety anchor to preserve system settings configuration integrity in case of structural fault
    EXECUTE 'SET LOCAL session_replication_role = ' || quote_literal(v_old_trigger_setting);
    RAISE;
END;
$$;