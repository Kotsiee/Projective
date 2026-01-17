DROP POLICY IF EXISTS "Manage own revisions" ON projects.stage_revision_requests;

CREATE POLICY "Manage own revisions" ON projects.stage_revision_requests FOR ALL TO public USING ((requested_by = auth.uid ()));

DROP POLICY IF EXISTS "View revisions" ON projects.stage_revision_requests;

CREATE POLICY "View revisions" ON projects.stage_revision_requests FOR
SELECT TO public USING (
        (
            (requested_by = auth.uid ())
            OR (
                EXISTS (
                    SELECT 1
                    FROM (
                            projects.project_stages s
                            JOIN projects.projects p ON ((p.id = s.project_id))
                        )
                    WHERE (
                            (
                                s.id = stage_revision_requests.project_stage_id
                            )
                            AND (p.owner_user_id = auth.uid ())
                        )
                )
            )
        )
    );