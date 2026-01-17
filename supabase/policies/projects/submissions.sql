DROP POLICY IF EXISTS "Insert own submissions" ON projects.stage_submissions;

CREATE POLICY "Insert own submissions" ON projects.stage_submissions FOR
INSERT
    TO public
WITH
    CHECK (submitted_by = auth.uid ());

DROP POLICY IF EXISTS "View submissions" ON projects.stage_submissions;

CREATE POLICY "View submissions" ON projects.stage_submissions FOR
SELECT TO public USING (
        (
            (submitted_by = auth.uid ())
            OR (
                EXISTS (
                    SELECT 1
                    FROM (
                            projects.project_stages s
                            JOIN projects.projects p ON ((p.id = s.project_id))
                        )
                    WHERE (
                            (
                                s.id = stage_submissions.project_stage_id
                            )
                            AND (p.owner_user_id = auth.uid ())
                        )
                )
            )
        )
    );