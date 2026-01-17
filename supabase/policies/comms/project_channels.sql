DROP POLICY IF EXISTS "view_channels_if_member" ON comms.project_channels;

CREATE POLICY "view_channels_if_member" ON comms.project_channels FOR
SELECT TO authenticated USING (
        projects.has_project_access (project_id)
    );