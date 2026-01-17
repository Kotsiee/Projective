DROP POLICY IF EXISTS "Manage seats own" ON projects.stage_open_seats;

CREATE POLICY "Manage seats own" ON projects.stage_open_seats FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_open_seats.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View seats public or own" ON projects.stage_open_seats;

CREATE POLICY "View seats public or own" ON projects.stage_open_seats
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_open_seats.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));