DROP POLICY IF EXISTS "Project owner can view activity" ON projects.project_activity;

CREATE POLICY "Project owner can view activity" ON projects.project_activity FOR
SELECT TO public USING (
        (
            EXISTS (
                SELECT 1
                FROM projects.projects p
                WHERE (
                        (
                            p.id = project_activity.project_id
                        )
                        AND (p.owner_user_id = auth.uid ())
                    )
            )
        )
    );

DROP POLICY IF EXISTS "Users can insert their own activity" ON projects.project_activity;

CREATE POLICY "Users can insert their own activity" ON projects.project_activity FOR
INSERT
    TO public
WITH
    CHECK (auth.uid () = actor_user_id);