CREATE OR REPLACE FUNCTION projects.create_project(
  payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_project_id uuid;
  stage_record jsonb;
  new_stage_id uuid;
  role_record jsonb;
  seat_record jsonb;
  attachment_id text;
  
  -- UUID Mapping array for dependency resolution
  stage_uuids uuid[] := '{}';
  i integer;
  _dep_raw text;
  _dep_idx integer;
  _dep_uuid uuid;
  
  _id uuid;
  _title text;
  _desc jsonb;
  _thumb text;
  _client_biz uuid;
  _industry uuid;
  _vis visibility;
  _curr text;
  _start_date timestamp with time zone;
  _preset timeline_preset;
  _legal_screening jsonb;
  
BEGIN
  -- 1. Extract Project Level Data
  _id := COALESCE((payload->>'id')::uuid, gen_random_uuid());
  _title := payload->>'title';
  _desc := payload->'description';
  _thumb := payload->>'thumbnail_url';
  _client_biz := (payload->>'client_business_id')::uuid;
  _industry := (payload->>'industry_category_id')::uuid;
  _vis := (payload->>'visibility')::visibility;
  _curr := payload->>'currency';
  _start_date := (payload->>'target_project_start_date')::timestamp with time zone;
  _preset := (payload->>'timeline_preset')::timeline_preset;
  _legal_screening := payload->'legal_and_screening';

  -- 2. Insert Project Header
  INSERT INTO projects.projects (
    id,
    owner_user_id,
    client_business_id,
    title,
    description,
    thumbnail_url,
    industry_category_id,
    visibility,
    currency,
    target_project_start_date,
    timeline_preset,
    ip_ownership_mode,
    nda_required,
    portfolio_display_rights,
    screening_questions,
    location_restriction,
    language_requirement
  )
  VALUES (
    _id,
    auth.uid(),
    _client_biz,
    _title,
    _desc,
    _thumb,
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

  -- 3. Insert Global Attachments
  IF payload ? 'global_attachments' THEN
    FOR attachment_id IN SELECT * FROM jsonb_array_elements_text(payload->'global_attachments')
    LOOP
      INSERT INTO projects.project_attachments (project_id, attachment_id)
      VALUES (new_project_id, attachment_id::uuid);
    END LOOP;
  END IF;

  -- 4. Pre-generate UUIDs for all stages to handle cross-stage dependencies
  IF payload ? 'stages' THEN
    FOR i IN 0 .. jsonb_array_length(payload->'stages') - 1 LOOP
      stage_uuids := array_append(stage_uuids, gen_random_uuid());
    END LOOP;
  END IF;

  -- 5. Loop through Stages and Insert
  i := 0;
  FOR stage_record IN SELECT * FROM jsonb_array_elements(payload->'stages')
  LOOP
    -- Grab the pre-generated ID for this iteration
    new_stage_id := stage_uuids[i + 1];

    -- Resolve the frontend array index to the matching pre-generated UUID
    _dep_raw := stage_record->>'start_dependency_stage_id';
    IF _dep_raw IS NOT NULL AND _dep_raw != '' THEN
      _dep_idx := _dep_raw::int;
      _dep_uuid := stage_uuids[_dep_idx + 1];
    ELSE
      _dep_uuid := NULL;
    END IF;

    INSERT INTO projects.project_stages (
      id,
      project_id,
      name,
      description,
      sort_order,
      stage_type,
      start_trigger_type,
      fixed_start_date,
      start_dependency_stage_id,
      start_dependency_lag_days,
      hire_trigger_active,
      file_revisions_allowed,
      file_duration_mode,
      file_duration_days,
      file_due_date,
      session_duration_minutes,
      session_count,
      session_preferred_days,
      session_end_date,
      management_contract_mode,
      maintenance_cycle_interval,
      ip_ownership_override
    )
    VALUES (
      new_stage_id,
      new_project_id,
      stage_record->>'title',
      stage_record->'description',
      (stage_record->>'sort_order')::int,
      (stage_record->>'stage_type')::stage_type_enum,
      (stage_record->>'start_trigger_type')::start_trigger_type,
      (stage_record->>'fixed_start_date')::timestamp with time zone,
      _dep_uuid,
      COALESCE((stage_record->>'start_dependency_lag_days')::int, 0),
      COALESCE((stage_record->>'hire_trigger_active')::boolean, true),
      (stage_record->>'file_revisions_allowed')::int,
      stage_record->>'file_duration_mode',
      (stage_record->>'file_duration_days')::int,
      (stage_record->>'file_due_date')::timestamp with time zone,
      (stage_record->>'session_duration_minutes')::int,
      COALESCE((stage_record->>'session_count')::int, 1),
      (
        CASE 
          WHEN stage_record->'session_preferred_days' IS NOT NULL AND jsonb_typeof(stage_record->'session_preferred_days') = 'array' 
          THEN (SELECT array_agg(x)::text[] FROM jsonb_array_elements_text(stage_record->'session_preferred_days') t(x))
          ELSE NULL 
        END
      ),
      (stage_record->>'session_end_date')::timestamp with time zone,
      stage_record->>'management_contract_mode',
      stage_record->>'maintenance_cycle_interval',
      (stage_record->>'ip_ownership_override')::ip_option_mode
    );

    -- Insert Staffing Roles
    IF stage_record ? 'staffing_roles' THEN
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
    END IF;

    -- Insert Open Seats
    IF stage_record ? 'open_seats' THEN
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
    END IF;

    i := i + 1;
  END LOOP;

  RETURN new_project_id;
END;
$$;