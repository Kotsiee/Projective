-- db/migrations/0003_org_tables.sql

-- public view of each human user
CREATE TABLE org.users_public (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text        NOT NULL,
  avatar_url   text        NULL,
  country      text        NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- freelancer profile (1:1 with a user)
CREATE TABLE org.freelancer_profiles (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid          NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline      text          NOT NULL DEFAULT '',
  bio           text          NOT NULL DEFAULT '',
  hourly_rate   integer       NULL,
  visibility    visibility    NOT NULL DEFAULT 'public',
  skills        text[]        NOT NULL DEFAULT '{}',
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- business / creator profile (1:many per user)
CREATE TABLE org.business_profiles (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id  uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text         NOT NULL,
  legal_name     text         NULL,
  logo_url       text         NULL,
  country        text         NULL,
  billing_email  text         NOT NULL,
  plan           text         NOT NULL DEFAULT 'free',
  created_at     timestamptz  NOT NULL DEFAULT now()
);

-- teams (mini-agencies)
CREATE TABLE org.teams (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text         NOT NULL,
  owner_user_id  uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description    text         NOT NULL DEFAULT '',
  visibility     visibility   NOT NULL DEFAULT 'invite_only',
  created_at     timestamptz  NOT NULL DEFAULT now()
);

-- memberships: which users are in which teams
CREATE TABLE org.team_memberships (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid         NOT NULL REFERENCES org.teams(id) ON DELETE CASCADE,
  user_id     uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text         NOT NULL DEFAULT 'freelancer', -- 'freelancer' | 'team_lead' | 'admin'
  status      text         NOT NULL DEFAULT 'active',     -- 'active' | 'invited' | 'left'
  created_at  timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT uq_team_memberships UNIQUE (team_id, user_id)
);

-- roles per team (optional granular perms)
CREATE TABLE org.team_roles (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid        NOT NULL REFERENCES org.teams(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  permissions   jsonb       NOT NULL DEFAULT '{}'
);

-- email addresses linked to auth.users
CREATE TABLE org.user_emails (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text         NOT NULL,
  is_primary   boolean      NOT NULL DEFAULT false,
  verified_at  timestamptz  NULL,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_email UNIQUE (user_id, email)
);

-- OPTIONAL now but we'll want it soon:
-- skills directory
CREATE TABLE org.skills (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug   text NOT NULL UNIQUE,
  label  text NOT NULL
);

CREATE TABLE org.user_skills (
  user_id      uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id     uuid      NOT NULL REFERENCES org.skills(id) ON DELETE CASCADE,
  proficiency  smallint  NULL,
  PRIMARY KEY (user_id, skill_id)
);
