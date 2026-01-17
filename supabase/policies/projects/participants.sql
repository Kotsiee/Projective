DROP POLICY IF EXISTS "Owner manage participants" ON projects.project_participants;

CREATE POLICY "Owner manage participants" ON projects.project_participants FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM projects.projects p
            WHERE (
                    (
                        p.id = project_participants.project_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View participants" ON projects.project_participants;

CREATE POLICY "View participants" ON projects.project_participants
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM projects.projects p
      WHERE ((p.id = project_participants.project_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));