CREATE TABLE org.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  legal_name text,
  logo_url text,
  country text,
  billing_email text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  headline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  timezone text,
  default_currency text
);

CREATE TABLE org.freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  hourly_rate integer,
  skills text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  timezone text,
  country text,
  visibility text NOT NULL DEFAULT 'public', 
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    slug text NOT NULL UNIQUE,
    label text NOT NULL
);

CREATE TABLE org.user_skills (
    user_id uuid NOT NULL REFERENCES auth.users (id),
    skill_id uuid NOT NULL REFERENCES org.skills (id),
    proficiency smallint,
    PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE org.users_public (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  avatar_url text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  headline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  timezone text,
  visibility text NOT NULL DEFAULT 'unlisted',
  first_name text,
  last_name text,
  username text NOT NULL UNIQUE
);

CREATE TABLE org.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL,
    owner_user_id uuid NOT NULL REFERENCES auth.users (id),
    description text NOT NULL DEFAULT '',
    visibility text NOT NULL DEFAULT 'invite_only',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org.team_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    team_id uuid NOT NULL REFERENCES org.teams (id),
    user_id uuid NOT NULL REFERENCES auth.users (id),
    role text NOT NULL DEFAULT 'freelancer',
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (team_id, user_id)
);

CREATE TABLE org.team_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    team_id uuid NOT NULL REFERENCES org.teams (id),
    title text NOT NULL,
    permissions jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE org.user_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES auth.users (id),
    email text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    verified_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, email)
);

CREATE TABLE org.attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_profile_id uuid NOT NULL,
    bucket text NOT NULL,
    path text NOT NULL,
    original_filename text NOT NULL,
    display_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    sha256 text,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org.attachments
ADD CONSTRAINT fk_attachments_owner_freelancer FOREIGN KEY (owner_profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE org.attachments
ADD CONSTRAINT fk_attachments_owner_business FOREIGN KEY (owner_profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE org.portfolios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    freelancer_profile_id uuid NOT NULL REFERENCES org.freelancer_profiles (id),
    title text NOT NULL,
    description text NOT NULL,
    cover_url text,
    attachment_id uuid REFERENCES org.attachments (id) ON DELETE SET NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org.profile_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    profile_type text NOT NULL,
    profile_id uuid NOT NULL,
    kind text NOT NULL,
    url text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org.profile_links
ADD CONSTRAINT fk_profile_links_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE org.profile_links
ADD CONSTRAINT fk_profile_links_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE org.org_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    inviter_user_id uuid NOT NULL REFERENCES auth.users (id),
    target_email text NOT NULL,
    team_id uuid REFERENCES org.teams (id) ON DELETE CASCADE,
    business_profile_id uuid REFERENCES org.business_profiles (id) ON DELETE CASCADE,
    token text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);