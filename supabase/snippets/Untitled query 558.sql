-- 1. Create or Get Project Channel
CREATE OR REPLACE FUNCTION comms.get_or_create_project_channel(
    p_project_id uuid,
    p_stage_id uuid,
    p_name text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, comms, projects, org, auth
AS $$
DECLARE
    v_channel_id uuid;
BEGIN
    -- Try to find existing
    SELECT id INTO v_channel_id
    FROM comms.project_channels
    WHERE project_id = p_project_id AND stage_id = p_stage_id
    LIMIT 1;

    IF v_channel_id IS NOT NULL THEN
        RETURN v_channel_id;
    END IF;

    -- Create new
    INSERT INTO comms.project_channels (project_id, stage_id, name)
    VALUES (p_project_id, p_stage_id, p_name)
    RETURNING id INTO v_channel_id;

    RETURN v_channel_id;
END;
$$;

-- 2. Create or Get DM Thread (Re-added)
CREATE OR REPLACE FUNCTION comms.get_or_create_dm_thread(
    target_user_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, comms, org, auth
AS $$
DECLARE
    v_current_user_id uuid := auth.uid();
    v_thread_id uuid;
BEGIN
    -- Find existing thread where BOTH users are participants
    SELECT t.id INTO v_thread_id
    FROM comms.dm_threads t
    JOIN comms.dm_participants p1 ON p1.thread_id = t.id AND p1.user_id = v_current_user_id
    JOIN comms.dm_participants p2 ON p2.thread_id = t.id AND p2.user_id = target_user_id
    LIMIT 1;

    IF v_thread_id IS NOT NULL THEN
        RETURN v_thread_id;
    END IF;

    -- Create new thread
    INSERT INTO comms.dm_threads (created_by_user_id)
    VALUES (v_current_user_id)
    RETURNING id INTO v_thread_id;

    -- Insert participants
    INSERT INTO comms.dm_participants (thread_id, user_id)
    VALUES (v_thread_id, v_current_user_id), (v_thread_id, target_user_id);

    RETURN v_thread_id;
END;
$$;