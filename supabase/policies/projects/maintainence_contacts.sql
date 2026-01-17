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