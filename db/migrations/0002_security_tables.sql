-- db/migrations/0002_security_tables.sql

-- session_context: who am I acting as right now?
CREATE TABLE security.session_context (
  user_id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_profile_type profile_type NOT NULL,
  active_profile_id   uuid         NOT NULL,
  active_team_id      uuid         NULL,
  updated_at          timestamptz  NOT NULL DEFAULT now()
);

-- audit trail of important actions
CREATE TABLE security.audit_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action           text        NOT NULL,
  entity_table     text        NOT NULL,
  entity_id        uuid        NOT NULL,
  metadata         jsonb       NOT NULL DEFAULT '{}',
  ip               inet        NULL,
  user_agent       text        NULL,
  request_id       uuid        NULL,
  actor_profile_id uuid        NULL,
  actor_team_id    uuid        NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- turnstile_verifications: record CAPTCHA checks (before/after login)
CREATE TABLE security.turnstile_verifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ip           inet        NOT NULL,
  token_prefix text        NOT NULL,
  success      boolean     NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- feature_flags: rollout & gating
CREATE TABLE security.feature_flags (
  key        text PRIMARY KEY,
  enabled    boolean     NOT NULL DEFAULT false,
  payload    jsonb       NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- refresh_tokens: hashed opaque refresh tokens for sessions
-- NOTE: we didn't have this in 09_Tables.md explicitly, but it's described in Security.md
--       short-lived access JWT + rotated opaque refresh (Argon2id hash). :contentReference[oaicite:2]{index=2}
CREATE TABLE security.refresh_tokens (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash       text        NOT NULL,
  revoked          boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  replaced_by      uuid        NULL REFERENCES security.refresh_tokens(id)
);

-- helper index for "is this refresh token still valid?"
CREATE INDEX idx_refresh_tokens_user_revoked
  ON security.refresh_tokens (user_id, revoked);
