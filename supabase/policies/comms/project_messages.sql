DROP POLICY IF EXISTS "send_messages_if_member" ON comms.project_messages;

CREATE POLICY "send_messages_if_member" ON comms.project_messages FOR
INSERT
    TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM comms.project_channels pc
            WHERE (
                    (
                        pc.id = project_messages.channel_id
                    )
                    AND projects.has_project_access (pc.project_id)
                )
        )
    );

DROP POLICY IF EXISTS "view_messages_if_member" ON comms.project_messages;

CREATE POLICY "view_messages_if_member" ON comms.project_messages FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM comms.project_channels pc
            WHERE (
                    (
                        pc.id = project_messages.channel_id
                    )
                    AND projects.has_project_access (pc.project_id)
                )
        )
    );