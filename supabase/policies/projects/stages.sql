DROP POLICY IF EXISTS "Users can manage stages of own projects" ON projects.project_stages;

CREATE POLICY "Users can manage stages of own projects" ON projects.project_stages FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM projects.projects p
            WHERE (
                    (
                        p.id = project_stages.project_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "Users can view stages of visible projects" ON projects.project_stages;

CREATE POLICY "Users can view stages of visible projects" ON projects.project_stages
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM projects.projects p
      WHERE ((p.id = project_stages.project_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));