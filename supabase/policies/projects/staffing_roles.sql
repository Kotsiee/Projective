DROP POLICY IF EXISTS "Manage roles own" ON projects.stage_staffing_roles;

CREATE POLICY "Manage roles own" ON projects.stage_staffing_roles FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_staffing_roles.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View roles public or own" ON projects.stage_staffing_roles;

CREATE POLICY "View roles public or own" ON projects.stage_staffing_roles
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_staffing_roles.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));