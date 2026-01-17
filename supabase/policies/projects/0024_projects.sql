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

DROP POLICY IF EXISTS "Owner manage budget rules" ON projects.stage_budget_rules;

CREATE POLICY "Owner manage budget rules" ON projects.stage_budget_rules FOR ALL TO public USING (
    (
        EXISTS (
            SELECT 1
            FROM (
                    projects.project_stages s
                    JOIN projects.projects p ON ((p.id = s.project_id))
                )
            WHERE (
                    (
                        s.id = stage_budget_rules.project_stage_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

DROP POLICY IF EXISTS "View budget rules" ON projects.stage_budget_rules;

CREATE POLICY "View budget rules" ON projects.stage_budget_rules
    FOR SELECT
    TO public
    USING ((EXISTS ( SELECT 1
       FROM (projects.project_stages s
         JOIN projects.projects p ON ((p.id = s.project_id)))
      WHERE ((s.id = stage_budget_rules.project_stage_id) AND ((p.owner_user_id = auth.uid()) OR ((p.status = 'active'::project_status) AND (p.visibility = 'public'::visibility)))))));

DROP POLICY IF EXISTS "Users can view/manage own contracts" ON projects.maintenance_contracts;

CREATE POLICY "Users can view/manage own contracts" ON projects.maintenance_contracts FOR ALL TO public USING (
    (
        freelancer_profile_id IN (
            SELECT freelancer_profiles.id
            FROM org.freelancer_profiles
            WHERE (
                    freelancer_profiles.user_id = auth.uid ()
                )
        )
    )
    OR (
        EXISTS (
            SELECT 1
            FROM projects.projects p
            WHERE (
                    (
                        p.id = maintenance_contracts.project_id
                    )
                    AND (p.owner_user_id = auth.uid ())
                )
        )
    )
);

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

DROP POLICY IF EXISTS "Public can view active published projects" ON projects.projects;

CREATE POLICY "Public can view active published projects" ON projects.projects
    FOR SELECT
    TO public
    USING ((status = 'active'::project_status) AND (visibility = 'public'::visibility));

DROP POLICY IF EXISTS "Users can create projects" ON projects.projects;

CREATE POLICY "Users can create projects" ON projects.projects FOR
INSERT
    TO public
WITH
    CHECK (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects.projects;

CREATE POLICY "Users can delete own projects" ON projects.projects FOR DELETE TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects.projects;

CREATE POLICY "Users can update own projects" ON projects.projects FOR
UPDATE TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can view own projects" ON projects.projects;

CREATE POLICY "Users can view own projects" ON projects.projects FOR
SELECT TO public USING (auth.uid () = owner_user_id);

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