CREATE OR REPLACE FUNCTION projects.create_complete_project(
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
      "order",
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
      (stage_record->>'order')::int,
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