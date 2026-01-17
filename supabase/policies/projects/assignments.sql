DROP POLICY IF EXISTS "Owner manage assignments" ON projects.stage_assignments;

CREATE POLICY "Owner manage assignments" ON projects.stage_assignments FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_assignments.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View assignments" ON projects.stage_assignments;

CREATE POLICY "View assignments" ON projects.stage_assignments
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_assignments.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));