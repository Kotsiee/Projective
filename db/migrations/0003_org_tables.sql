-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE org.attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_profile_id uuid NOT NULL,
  bucket text NOT NULL,
  path text NOT NULL,
  original_filename text NOT NULL,
  display_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  sha256 text,
  status text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT attachments_pkey PRIMARY KEY (id)
);

CREATE TABLE org.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  name text NOT NULL,
  legal_name text,
  logo_url text,
  country text,
  billing_email text NOT NULL,
  plan text NOT NULL DEFAULT 'free'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  headline text NOT NULL DEFAULT ''::text,
  bio text NOT NULL DEFAULT ''::text,
  languages ARRAY NOT NULL DEFAULT '{}'::text[],
  timezone text,
  default_currency text,
  CONSTRAINT business_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT business_profiles_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

CREATE TABLE org.freelancer_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  hourly_rate integer,
  skills ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  bio text NOT NULL DEFAULT ''::text,
  headline text NOT NULL DEFAULT ''::text,
  languages ARRAY NOT NULL DEFAULT '{}'::text[],
  timezone text,
  country text,
  visibility text NOT NULL DEFAULT 'public'::text,
  CONSTRAINT freelancer_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT freelancer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE org.org_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inviter_user_id uuid NOT NULL,
  target_email text NOT NULL,
  team_id uuid,
  business_profile_id uuid,
  token text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT org_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT org_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES auth.users(id),
  CONSTRAINT org_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id),
  CONSTRAINT org_invitations_business_profile_id_fkey FOREIGN KEY (business_profile_id) REFERENCES org.business_profiles(id)
);

CREATE TABLE org.portfolios (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    freelancer_profile_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    cover_url text,
    attachment_id uuid,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT portfolios_pkey PRIMARY KEY (id),
        CONSTRAINT portfolios_freelancer_profile_id_fkey FOREIGN KEY (freelancer_profile_id) REFERENCES org.freelancer_profiles (id),
        CONSTRAINT portfolios_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES org.attachments (id)
);

CREATE TABLE org.profile_links (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    profile_type text NOT NULL,
    profile_id uuid NOT NULL,
    kind text NOT NULL,
    url text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT profile_links_pkey PRIMARY KEY (id)
);

CREATE TABLE org.skills (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    slug text NOT NULL UNIQUE,
    label text NOT NULL,
    CONSTRAINT skills_pkey PRIMARY KEY (id)
);

CREATE TABLE org.team_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'freelancer'::text,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_memberships_pkey PRIMARY KEY (id),
  CONSTRAINT team_memberships_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id),
  CONSTRAINT team_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE org.team_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  title text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT team_roles_pkey PRIMARY KEY (id),
  CONSTRAINT team_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id)
);

CREATE TABLE org.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  visibility text NOT NULL DEFAULT 'invite_only'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

CREATE TABLE org.user_emails (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    email text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    verified_at timestamp
    with
        time zone,
        created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT user_emails_pkey PRIMARY KEY (id),
        CONSTRAINT user_emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT user_emails_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES org.users_public (user_id)
);

CREATE TABLE org.user_skills (
    user_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    proficiency smallint,
    CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id),
    CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES org.skills (id)
);

CREATE TABLE org.users_public (
  user_id uuid NOT NULL,
  avatar_url text,
  country text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  headline text NOT NULL DEFAULT ''::text,
  bio text NOT NULL DEFAULT ''::text,
  languages ARRAY NOT NULL DEFAULT '{}'::text[],
  timezone text,
  visibility text NOT NULL DEFAULT 'unlisted'::text,
  first_name text,
  last_name text,
  username text NOT NULL UNIQUE,
  dob date NOT NULL,
  CONSTRAINT users_public_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_public_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);