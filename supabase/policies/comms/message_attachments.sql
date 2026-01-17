DROP POLICY IF EXISTS "view_attachments_if_member" ON comms.message_attachments;

CREATE POLICY "view_attachments_if_member" ON comms.message_attachments
    FOR SELECT
    TO authenticated
    USING (
        (
            (message_table = 'comms.project_messages'::text) AND 
            (EXISTS ( 
                SELECT 1
                FROM (comms.project_messages pm
                JOIN comms.project_channels pc ON ((pm.channel_id = pc.id)))
                WHERE ((pm.id = message_attachments.message_id) AND projects.has_project_access(pc.project_id))
            ))
        ) 
        OR 
        (
            (message_table = 'comms.dm_messages'::text) AND 
            (EXISTS ( 
                SELECT 1
                FROM comms.dm_participants dp
                WHERE (
                    (dp.thread_id = ( SELECT dm_messages.thread_id FROM comms.dm_messages WHERE (dm_messages.id = message_attachments.message_id))) 
                    AND (dp.user_id = auth.uid())
                )
            ))
        )
    );