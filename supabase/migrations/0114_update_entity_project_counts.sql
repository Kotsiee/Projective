CREATE OR REPLACE FUNCTION projects.update_entity_project_counts()
RETURNS TRIGGER AS $$
DECLARE
    v_owner_id uuid;
    v_owner_type text;
BEGIN
    -- Determine the owner and type based on the project's columns
    -- Assumes projects table has owner_user_id, client_business_id, or team_id
    IF NEW.client_business_id IS NOT NULL THEN
        v_owner_id := NEW.client_business_id;
        v_owner_type := 'business';
    ELSIF NEW.team_id IS NOT NULL THEN
        v_owner_id := NEW.team_id;
        v_owner_type := 'team';
    ELSE
        v_owner_id := NEW.owner_user_id;
        v_owner_type := 'user';
    END IF;

    -- Update counts based on the entity type
    IF v_owner_type = 'user' THEN
        UPDATE org.users_public 
        SET total_project_count = (SELECT count(*) FROM projects.projects WHERE owner_user_id = v_owner_id),
            active_project_count = (SELECT count(*) FROM projects.projects WHERE owner_user_id = v_owner_id AND status = 'active')
        WHERE user_id = v_owner_id;
    ELSIF v_owner_type = 'business' THEN
        UPDATE org.business_profiles 
        SET total_project_count = (SELECT count(*) FROM projects.projects WHERE client_business_id = v_owner_id),
            active_project_count = (SELECT count(*) FROM projects.projects WHERE client_business_id = v_owner_id AND status = 'active')
        WHERE id = v_owner_id;
    ELSIF v_owner_type = 'team' THEN
        UPDATE org.teams 
        SET total_project_count = (SELECT count(*) FROM projects.projects WHERE team_id = v_owner_id),
            active_project_count = (SELECT count(*) FROM projects.projects WHERE team_id = v_owner_id AND status = 'active')
        WHERE id = v_owner_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_project_counts
AFTER INSERT OR UPDATE OF status OR DELETE ON projects.projects
FOR EACH ROW EXECUTE FUNCTION projects.update_entity_project_counts();