CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------------
-- SCHEMA: ORG (Execute First)
--------------------------------------------------------

-- 1. SKILLS
CREATE TABLE org.skills (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    label text NOT NULL,
    CONSTRAINT skills_pkey PRIMARY KEY (id)
);

-- 2. PUBLIC USERS
CREATE TABLE org.users_public (
    user_id uuid NOT NULL,
    username text NOT NULL UNIQUE,
    first_name text,
    last_name text,
    avatar_url text,
    country text,
    timezone text,
    languages text[] NOT NULL DEFAULT '{}'::text[],
    dob date NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    visibility text NOT NULL DEFAULT 'public'::text,
    description jsonb NOT NULL DEFAULT '{}'::jsonb,
    headline text NOT NULL DEFAULT ''::text,
    CONSTRAINT users_public_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_public_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. FREELANCER PROFILES
CREATE TABLE org.freelancer_profiles (
    user_id uuid NOT NULL,
    hourly_rate integer,
    skills text[] NOT NULL DEFAULT '{}'::text[],
    availability_status text DEFAULT 'available',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT freelancer_profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT freelancer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. BUSINESS PROFILES
CREATE TABLE org.business_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    legal_name text,
    logo_url text,
    banner_url text,
    country text,
    billing_email text NOT NULL,
    plan text NOT NULL DEFAULT 'free'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    headline text NOT NULL DEFAULT ''::text,
    description jsonb NOT NULL DEFAULT '{}'::jsonb,
    languages text[] NOT NULL DEFAULT '{}'::text[],
    timezone text,
    default_currency text DEFAULT 'USD',
    tax_id text,
    address_line_1 text,
    address_city text,
    address_zip text,
    CONSTRAINT business_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT business_profiles_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

-- 5. BUSINESS ROLES
CREATE TABLE org.business_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL,
    title text NOT NULL, 
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb, 
    CONSTRAINT business_roles_pkey PRIMARY KEY (id),
    CONSTRAINT business_roles_business_id_fkey FOREIGN KEY (business_id) REFERENCES org.business_profiles(id)
);

-- 6. BUSINESS MEMBERSHIPS
CREATE TABLE org.business_memberships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member'::text, 
    status text NOT NULL DEFAULT 'active'::text, 
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT business_memberships_pkey PRIMARY KEY (id),
    CONSTRAINT business_memberships_business_id_fkey FOREIGN KEY (business_id) REFERENCES org.business_profiles(id),
    CONSTRAINT business_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT business_memberships_unique_user_per_business UNIQUE (business_id, user_id) 
);

-- 7. PORTFOLIOS
CREATE TABLE org.portfolios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    cover_url text,
    attachment_id uuid,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT portfolios_pkey PRIMARY KEY (id),
    CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.freelancer_profiles (user_id) ON DELETE CASCADE
);

-- 8. TEAMS
CREATE TABLE org.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE, 
    avatar_url text,
    banner_url text,
    headline text DEFAULT ''::text,
    description text NOT NULL DEFAULT ''::text,
    visibility text NOT NULL DEFAULT 'invite_only'::text, 
    subscription_tier text NOT NULL DEFAULT 'free'::text, 
    member_limit int NOT NULL DEFAULT 5, 
    payout_model text NOT NULL DEFAULT 'manager_discretion'::text, 
    default_payout_settings jsonb DEFAULT '{}'::jsonb, 
    treasury_wallet_id uuid, 
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT teams_pkey PRIMARY KEY (id),
    CONSTRAINT teams_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
);

-- 9. USER EMAILS
CREATE TABLE org.user_emails (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    email text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    verified_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_emails_pkey PRIMARY KEY (id),
    CONSTRAINT user_emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT user_emails_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES org.users_public (user_id)
);

-- 10. TEAM ROLES
CREATE TABLE org.team_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL,
    title text NOT NULL, 
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb, 
    CONSTRAINT team_roles_pkey PRIMARY KEY (id),
    CONSTRAINT team_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id)
);

-- 11. TEAM MEMBERSHIPS
CREATE TABLE org.team_memberships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member'::text, 
    status text NOT NULL DEFAULT 'active'::text, 
    default_split_share numeric(5,2), 
    invited_by uuid, 
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT team_memberships_pkey PRIMARY KEY (id),
    CONSTRAINT team_memberships_team_id_fkey FOREIGN KEY (team_id) REFERENCES org.teams(id),
    CONSTRAINT team_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT team_memberships_inviter_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
    CONSTRAINT team_memberships_unique_user_per_team UNIQUE (team_id, user_id) 
);

-- 12. ORG INVITATIONS
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

-- 13. PROFILE LINKS
CREATE TABLE org.profile_links (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    profile_type text NOT NULL,
    profile_id uuid NOT NULL,
    kind text NOT NULL,
    url text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT profile_links_pkey PRIMARY KEY (id)
);

-- 14. USER SKILLS
CREATE TABLE org.user_skills (
    user_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    proficiency smallint,
    CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id),
    CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES org.skills (id)
);

-- 15. USER PREFERENCES
CREATE TABLE org.user_preferences (
    user_id uuid NOT NULL,
    theme text DEFAULT 'system',
    notification_email boolean DEFAULT true,
    notification_push boolean DEFAULT false,
    locale text DEFAULT 'en-GB',
    CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);


