CREATE TABLE IF NOT EXISTS comms.project_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    name text NOT NULL,
    stage_id uuid NULL REFERENCES projects.project_stages (id) ON DELETE SET NULL,
    visibility text NOT NULL DEFAULT 'project_all',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_channels_project_name UNIQUE (project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_project_channels_project ON comms.project_channels (project_id);

CREATE INDEX IF NOT EXISTS idx_project_channels_stage ON comms.project_channels (stage_id);

CREATE TABLE IF NOT EXISTS comms.project_channel_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    channel_id uuid NOT NULL REFERENCES comms.project_channels (id) ON DELETE CASCADE,
    profile_type profile_type NOT NULL,
    profile_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'participant',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_projchan_participant_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_projchan_participant_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_project_channel_participant UNIQUE (
        channel_id,
        profile_type,
        profile_id
    )
);

CREATE INDEX IF NOT EXISTS idx_project_channel_participants_channel ON comms.project_channel_participants (channel_id);

CREATE INDEX IF NOT EXISTS idx_project_channel_participants_profile ON comms.project_channel_participants (profile_type, profile_id);

CREATE TABLE IF NOT EXISTS comms.project_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    channel_id uuid NOT NULL REFERENCES comms.project_channels (id) ON DELETE CASCADE,
    sender_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    edited_at timestamptz NULL,
    deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_project_messages_channel_created ON comms.project_messages (channel_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comms.dm_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    created_by_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_threads_creator ON comms.dm_threads (
    created_by_user_id,
    created_at DESC
);

CREATE TABLE IF NOT EXISTS comms.dm_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    thread_id uuid NOT NULL REFERENCES comms.dm_threads (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    joined_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_dm_participants_thread_user UNIQUE (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_participants_user ON comms.dm_participants (user_id);

CREATE TABLE IF NOT EXISTS comms.dm_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    thread_id uuid NOT NULL REFERENCES comms.dm_threads (id) ON DELETE CASCADE,
    sender_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_created ON comms.dm_messages (thread_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comms.message_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    message_table text NOT NULL,
    message_id uuid NOT NULL,
    attachment_id uuid NOT NULL REFERENCES org.attachments (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_message_attachments_table CHECK (
        message_table IN (
            'comms.project_messages',
            'comms.dm_messages'
        )
    ),
    CONSTRAINT uq_message_attachment UNIQUE (
        message_table,
        message_id,
        attachment_id
    )
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON comms.message_attachments (message_table, message_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_attachment ON comms.message_attachments (attachment_id);

CREATE TABLE IF NOT EXISTS comms.channel_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    channel_type text NOT NULL,
    channel_id uuid NOT NULL,
    attachment_id uuid NOT NULL REFERENCES org.attachments (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_channel_files_type CHECK (
        channel_type IN ('project', 'dm')
    ),
    CONSTRAINT uq_channel_files_channel_attachment UNIQUE (
        channel_type,
        channel_id,
        attachment_id
    )
);

CREATE INDEX IF NOT EXISTS idx_channel_files_channel ON comms.channel_files (channel_type, channel_id);

CREATE INDEX IF NOT EXISTS idx_channel_files_attachment ON comms.channel_files (attachment_id);

CREATE TABLE IF NOT EXISTS comms.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    entity_table text NULL,
    entity_id uuid NULL,
    read_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON comms.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON comms.notifications (user_id)
WHERE
    read_at IS NULL;

CREATE TABLE IF NOT EXISTS comms.notification_prefs (
    user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email boolean NOT NULL DEFAULT true,
    push boolean NOT NULL DEFAULT false,
    in_app boolean NOT NULL DEFAULT true,
    digest boolean NOT NULL DEFAULT false,
    quiet_hours tstzrange NULL
);

CREATE TABLE IF NOT EXISTS comms.device_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    provider text NOT NULL,
    token text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_device_tokens_provider_token UNIQUE (provider, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON comms.device_tokens (user_id);

DO $$
BEGIN
PERFORM 1
FROM pg_publication
WHERE pubname = 'supabase_realtime';

IF NOT FOUND THEN
CREATE PUBLICATION supabase_realtime;
END IF;
END;
$$;


ALTER TABLE comms.project_messages REPLICA IDENTITY FULL;

ALTER TABLE comms.dm_messages REPLICA IDENTITY FULL;

ALTER TABLE comms.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime
ADD
TABLE comms.project_messages,
comms.dm_messages,
comms.notifications;