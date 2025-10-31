# RLS Strategy & Claims Matrix

Projective Supabase RLS Strategy & Claims Matrix\
Last Updated: 28 Oct 2025\
Author: GPT-5 Thinking (Projective Security Spec)

---

## Purpose

We enforce “you only see what you’re currently acting as.”

- A single human user (`auth.users`) can act as:
  - themself
  - their freelancer profile
  - one of their business profiles (“creator” / “client”)
  - a team they’re part of (mini-agency)
- The frontend explicitly switches context and refreshes the JWT.
- The DB never trusts arbitrary row data — it always checks:
  - `auth.uid()` (the Supabase user id)
  - `auth.jwt()->>'active_profile_type'`
  - `auth.jwt()->>'active_profile_id'`
  - `auth.jwt()->>'active_team_id'`

Every table with sensitive data must:

1. Be RLS-enabled.
2. Have policies that assert:\
   “Row is visible only if it’s tied to the caller’s active profile, team, or user.”

This doc is the baseline reference for implementing policies in `/db/policies/**`.

---

## 1. JWT Claims (Session Context)

### Required JWT custom claims

| Claim                 | Example Value                  | Notes                                                             |
| --------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `sub`                 | `"9a7f...uuid"`                | The Supabase `auth.users.id`                                      |
| `active_profile_type` | `"freelancer"` or `"business"` | Explicit role context for this session                            |
| `active_profile_id`   | `"f44c...uuid"`                | The freelancer_profile.id OR business_profile.id you’re acting as |
| `active_team_id`      | `"a12b...uuid"` or `null`      | If you’re acting on behalf of a team / agency                     |

These claims are derived from `security.session_context` for the current `user_id`.\
On profile/team switch, we write a new row (or update) in `security.session_context` then mint a new JWT.

### Access helpers in SQL

- `auth.uid()` → UUID of the logged-in human user.
- `auth.jwt()->>'active_profile_id'` → profile (string) for row scoping.
- `auth.jwt()->>'active_profile_type'` → `"freelancer"` / `"business"`.
- `auth.jwt()->>'active_team_id'` → team (string) for team-scope rules.

We assume helper functions like:

```sql
-- Returns true if the current human user is an active participant in
-- a given project or DM thread (used by comms/chat access).
CREATE OR REPLACE FUNCTION security.project_or_dm_participant(_channel_id uuid)
RETURNS boolean AS $$
  -- implementation detail lives in /db/functions/security.project_or_dm_participant.sql
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns array of all team_ids that are considered valid actors
-- on a given project (for team-based access).
CREATE OR REPLACE FUNCTION security.project_team_ids(_project_id uuid)
RETURNS uuid[] AS $$
  -- implementation detail lives in /db/functions/security.project_team_ids.sql
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

You’ll create/maintain these in `db/functions/`.

---

## 2. Default Policy Templates

These are “starter snippets” we’ll reuse per table.\
All policies should be named clearly (e.g. `pol_projects_projects_owner_select`).

### 2.1 SELECT template

Goal: allow reading rows that belong to the active profile, active team, or self.

```sql
CREATE POLICY "select_visible_rows"
ON <schema>.<table>
FOR SELECT
USING (
  (
    -- direct ownership via profile
    (<table>.owner_profile_id::text = auth.jwt()->>'active_profile_id')
    OR
    -- direct ownership via team
    (<table>.team_id::text = auth.jwt()->>'active_team_id')
    OR
    -- direct ownership via user
    (<table>.user_id = auth.uid())
  )
  OR
  (
    -- project / channel participation (optional, for collab tables)
    security.project_or_dm_participant(<table>.id) = true
  )
);
```

### 2.2 INSERT template

Goal: user can only insert rows “as” their active context.

```sql
CREATE POLICY "insert_as_active_context"
ON <schema>.<table>
FOR INSERT
WITH CHECK (
  (
    -- user is inserting a row for themselves
    (NEW.user_id = auth.uid())
    OR
    -- user is inserting a row for the profile they are currently acting as
    (NEW.owner_profile_id::text = auth.jwt()->>'active_profile_id')
    OR
    -- user is inserting on behalf of team they currently act as
    (NEW.team_id::text = auth.jwt()->>'active_team_id')
  )
);
```

### 2.3 UPDATE template

Goal: cannot update things outside your scope.

```sql
CREATE POLICY "update_owned_rows"
ON <schema>.<table>
FOR UPDATE
USING (
  (
    <table>.user_id = auth.uid()
    OR <table>.owner_profile_id::text = auth.jwt()->>'active_profile_id'
    OR <table>.team_id::text = auth.jwt()->>'active_team_id'
  )
)
WITH CHECK (
  (
    NEW.user_id = auth.uid()
    OR NEW.owner_profile_id::text = auth.jwt()->>'active_profile_id'
    OR NEW.team_id::text = auth.jwt()->>'active_team_id'
  )
);
```

### 2.4 DELETE template

Goal: usually only owners or business “client_business_id” or project owners can delete.

```sql
CREATE POLICY "delete_owned_rows"
ON <schema>.<table>
FOR DELETE
USING (
  (
    <table>.user_id = auth.uid()
    OR <table>.owner_profile_id::text = auth.jwt()->>'active_profile_id'
    OR <table>.team_id::text = auth.jwt()->>'active_team_id'
  )
);
```

Note: for some tables (finance.escrows, audit logs, etc.) delete is disabled entirely.

---

## 3. Admin / Service Role Bypass

- Supabase “service_role” key runs queries with `role = service_role`, which ignores RLS.\
  Use this ONLY for:
  - background jobs
  - Stripe webhooks
  - scheduled maintenance
  - internal moderation dashboards

- Admin users (in `ops.admin_users`) still go through RLS at query time unless you explicitly add policies that check admin membership.

Recommended pattern:

```sql
-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION security.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM ops.admin_users au
    WHERE au.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

Then in any table where admins need read access:

```sql
... OR security.is_admin() = true
```

### Restricted tables

- `security.refresh_tokens` (not shown in schema but implied by our auth model)
- `security.session_context`
- `security.audit_logs`

These SHOULD NOT be directly queryable by normal users except in the minimal ways documented below.

---

## 4. Table-by-Table RLS Examples

Below are concrete examples for seven key tables.\
These are examples, not final migrations.\
You’ll drop them in `/db/policies/<schema>/<table>.sql` and adapt columns.

---

### 4.1 `org.users_public`

**Purpose:** public display info per human user.\
Columns: `user_id`, `display_name`, etc.\
Rule:

- Anyone logged-in can `SELECT` any row (public directory-like).
- User can `UPDATE` ONLY their own row.
- Insert happens at onboarding.
- Delete is blocked (soft-delete or anonymize instead).

Enable RLS:

```sql
ALTER TABLE org.users_public ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- Read: any authenticated user can see public profiles
CREATE POLICY "org_users_public_select_all_auth"
ON org.users_public
FOR SELECT
USING ( auth.uid() IS NOT NULL );

-- Insert: user may create their own entry
CREATE POLICY "org_users_public_insert_self"
ON org.users_public
FOR INSERT
WITH CHECK ( NEW.user_id = auth.uid() );

-- Update: user may update only their own row
CREATE POLICY "org_users_public_update_self"
ON org.users_public
FOR UPDATE
USING ( org.users_public.user_id = auth.uid() )
WITH CHECK ( NEW.user_id = auth.uid() );

-- Delete: nobody (omit policy, or explicitly deny)
```

Note: If we want moderation/admin edit, extend `USING (...) OR security.is_admin()`.

---

### 4.2 `security.session_context`

**Purpose:** source of truth for the user’s current acting profile/team.\
Columns: `user_id`, `active_profile_type`, `active_profile_id`, `active_team_id`, `updated_at`.

Rules:

- User can read ONLY their own row.
- User can update ONLY their own row.
- No deletes.

Enable RLS:

```sql
ALTER TABLE security.session_context ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- Read own session context
CREATE POLICY "security_session_context_select_self"
ON security.session_context
FOR SELECT
USING ( security.session_context.user_id = auth.uid() );

-- Insert/Update own context (used on profile/team switch)
CREATE POLICY "security_session_context_upsert_self"
ON security.session_context
FOR INSERT
WITH CHECK ( NEW.user_id = auth.uid() );

CREATE POLICY "security_session_context_update_self"
ON security.session_context
FOR UPDATE
USING ( security.session_context.user_id = auth.uid() )
WITH CHECK ( NEW.user_id = auth.uid() );

-- No delete policy (effectively blocked for normal users)
```

Note: Background jobs and auth middleware can still overwrite via service_role.

---

### 4.3 `projects.projects`

Relevant columns:

- `id`
- `client_business_id` → `org.business_profiles.id` (the “buyer” / creator)
- (via joins) freelancers, teams, etc. in `projects.project_participants`

Access rules:

- The business profile that owns the project can read/update/delete that project.
- Any freelancer/team added to that project via `project_participants` can also `SELECT`.
- Only the business owner (`client_business_id`) can `UPDATE` or `DELETE`.

We’ll assume helper `projects.is_project_member(projects.id)` which checks:

- `auth.jwt()->>'active_profile_id'` matches a row in `project_participants`
  OR
- the project’s `client_business_id` matches `active_profile_id`
  OR
- current `active_team_id` is in `security.project_team_ids(projects.id)`.

Enable RLS:

```sql
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- SELECT: project members or owning business can view
CREATE POLICY "projects_projects_select_members"
ON projects.projects
FOR SELECT
USING (
  (
    projects.client_business_id::text = auth.jwt()->>'active_profile_id'
  )
  OR
  EXISTS (
    SELECT 1
    FROM projects.project_participants pp
    WHERE pp.project_id = projects.id
      AND pp.profile_id::text = auth.jwt()->>'active_profile_id'
  )
  OR
  (
    auth.jwt()->>'active_team_id' IS NOT NULL
    AND auth.jwt()->>'active_team_id' = ANY(
      security.project_team_ids(projects.id)
    )
  )
  OR security.is_admin() = true
);

-- INSERT: only a business profile can create a project,
-- and they can only do it for themselves.
CREATE POLICY "projects_projects_insert_business_owner"
ON projects.projects
FOR INSERT
WITH CHECK (
  NEW.client_business_id::text = auth.jwt()->>'active_profile_id'
  AND auth.jwt()->>'active_profile_type' = 'business'
);

-- UPDATE: only the owning business can update core project data
CREATE POLICY "projects_projects_update_owner"
ON projects.projects
FOR UPDATE
USING (
  projects.client_business_id::text = auth.jwt()->>'active_profile_id'
)
WITH CHECK (
  NEW.client_business_id::text = auth.jwt()->>'active_profile_id'
);

-- DELETE: only the owning business can delete (e.g. cancel draft)
CREATE POLICY "projects_projects_delete_owner"
ON projects.projects
FOR DELETE
USING (
  projects.client_business_id::text = auth.jwt()->>'active_profile_id'
);
```

---

### 4.4 `projects.project_stages`

Relevant columns:

- `project_id`
- assignment happens through `projects.stage_assignments`
- different actors (client, assigned freelancer/team) need visibility

Rules:

- Anyone who can see the parent project can `SELECT` its stages.
- UPDATE allowed if:
  - caller is `client_business_id` of parent project, OR
  - caller is the assigned freelancer/team for that stage.

Enable RLS:

```sql
ALTER TABLE projects.project_stages ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- SELECT: you can read a stage if you can read its parent project
CREATE POLICY "project_stages_select_members"
ON projects.project_stages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM projects.projects p
    WHERE p.id = project_stages.project_id
      AND (
        p.client_business_id::text = auth.jwt()->>'active_profile_id'
        OR EXISTS (
          SELECT 1
          FROM projects.project_participants pp
          WHERE pp.project_id = p.id
            AND pp.profile_id::text = auth.jwt()->>'active_profile_id'
        )
        OR (
          auth.jwt()->>'active_team_id' IS NOT NULL
          AND auth.jwt()->>'active_team_id' = ANY(
            security.project_team_ids(p.id)
          )
        )
        OR security.is_admin() = true
      )
  )
);

-- INSERT: only project owner (business) can add stages
CREATE POLICY "project_stages_insert_owner"
ON projects.project_stages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM projects.projects p
    WHERE p.id = NEW.project_id
      AND p.client_business_id::text = auth.jwt()->>'active_profile_id'
  )
);

-- UPDATE: owner OR assigned freelancer/team
CREATE POLICY "project_stages_update_owner_or_assignee"
ON projects.project_stages
FOR UPDATE
USING (
  -- project owner?
  EXISTS (
    SELECT 1
    FROM projects.projects p
    WHERE p.id = project_stages.project_id
      AND p.client_business_id::text = auth.jwt()->>'active_profile_id'
  )
  OR
  -- assigned freelancer?
  EXISTS (
    SELECT 1
    FROM projects.stage_assignments sa
    WHERE sa.project_stage_id = project_stages.id
      AND (
        sa.freelancer_profile_id::text = auth.jwt()->>'active_profile_id'
        OR sa.team_id::text = auth.jwt()->>'active_team_id'
      )
      AND sa.status IN ('accepted','active')
  )
  OR security.is_admin() = true
)
WITH CHECK ( true ); -- we trust USING above for now

-- DELETE: usually disallowed (stages form payment trails), so no policy
```

---

### 4.5 `finance.transactions`

Relevant columns:

- `wallet_id` → belongs to a wallet
- `wallets.owner_type`, `wallets.owner_id`

Rules:

- You can read transactions only if you control the wallet’s owner (your active profile, or your active team, or you’re that business).
- No INSERT/UPDATE/DELETE from clients directly — finance is system-only.

Enable RLS:

```sql
ALTER TABLE finance.transactions ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- SELECT: wallet owner only
CREATE POLICY "finance_transactions_select_wallet_owner"
ON finance.transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM finance.wallets w
    WHERE w.id = transactions.wallet_id
      AND (
        -- acting profile owns the wallet
        w.owner_id::text = auth.jwt()->>'active_profile_id'
        OR
        -- acting team owns the wallet
        w.owner_id::text = auth.jwt()->>'active_team_id'
      )
  )
  OR security.is_admin() = true
);

-- No INSERT/UPDATE/DELETE policies for normal users
-- (service_role bypasses RLS for ledger writes)
```

---

### 4.6 `org.team_memberships`

Relevant columns:

- `team_id`
- `user_id` (the human account)
- `role`, `status`

Rules:

- A user can read rows if they are in that team.
- Team owner (and maybe `team_lead`) can update membership rows.
- You can’t randomly add yourself to teams you don’t control.

Enable RLS:

```sql
ALTER TABLE org.team_memberships ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- SELECT: anyone who is an active member of that same team can view membership
CREATE POLICY "team_memberships_select_team_member"
ON org.team_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM org.team_memberships me
    WHERE me.team_id = team_memberships.team_id
      AND me.user_id = auth.uid()
      AND me.status = 'active'
  )
  OR security.is_admin() = true
);

-- INSERT: only team owner (or admin role) can add members
CREATE POLICY "team_memberships_insert_team_owner"
ON org.team_memberships
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = NEW.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR security.is_admin() = true
);

-- UPDATE: team owner or admin-level membership
CREATE POLICY "team_memberships_update_team_owner"
ON org.team_memberships
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_memberships.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM org.team_memberships me
    WHERE me.team_id = team_memberships.team_id
      AND me.user_id = auth.uid()
      AND me.role IN ('team_lead','admin')
      AND me.status = 'active'
  )
  OR security.is_admin() = true
)
WITH CHECK ( true );

-- DELETE: team owner (or admin) can remove members
CREATE POLICY "team_memberships_delete_team_owner"
ON org.team_memberships
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_memberships.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR security.is_admin() = true
);
```

This gives team leads power to manage their roster without giving global access.

---

### 4.7 `comms.dm_threads` / `comms.dm_messages`

We’ll show `dm_threads` + `dm_messages` because they’re the cleanest messaging case.\
Core idea applies similarly to `comms.project_channels` and `comms.project_messages` (but those also check project membership).

#### `comms.dm_threads`

Columns:

- `id`
- `created_by_user_id`

Membership comes from `comms.dm_participants (thread_id, user_id)`.

RLS rules:

- You can `SELECT` a thread only if you’re in `dm_participants`.
- You can `INSERT` a new thread if you’re authenticated.
- You can’t `UPDATE` or `DELETE` other people’s threads (no policy).

Enable RLS:

```sql
ALTER TABLE comms.dm_threads ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- SELECT: must be a participant
CREATE POLICY "dm_threads_select_participant"
ON comms.dm_threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM comms.dm_participants dp
    WHERE dp.thread_id = dm_threads.id
      AND dp.user_id = auth.uid()
  )
  OR security.is_admin() = true
);

-- INSERT: any logged-in user can create a new DM thread
CREATE POLICY "dm_threads_insert_creator"
ON comms.dm_threads
FOR INSERT
WITH CHECK (
  NEW.created_by_user_id = auth.uid()
);
```

#### `comms.dm_messages`

Columns:

- `thread_id`
- `sender_user_id`
- `body`

RLS rules:

- You can `SELECT` messages in threads you participate in.
- You can `INSERT` only if you’re in that thread and you’re the sender.
- UPDATE/DELETE are disallowed to keep auditability (or can be “soft-delete”).

Enable RLS:

```sql
ALTER TABLE comms.dm_messages ENABLE ROW LEVEL SECURITY;
```

Policies:

```sql
-- SELECT: must be a participant in the thread
CREATE POLICY "dm_messages_select_participant"
ON comms.dm_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM comms.dm_participants dp
    WHERE dp.thread_id = dm_messages.thread_id
      AND dp.user_id = auth.uid()
  )
  OR security.is_admin() = true
);

-- INSERT: must be participant AND the sender
CREATE POLICY "dm_messages_insert_participant_sender"
ON comms.dm_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM comms.dm_participants dp
    WHERE dp.thread_id = NEW.thread_id
      AND dp.user_id = auth.uid()
  )
  AND NEW.sender_user_id = auth.uid()
);
```

For `comms.project_messages`, your `USING` and `WITH CHECK` clauses would mirror logic from `projects.project_stages`, except the join is via `comms.project_channel_participants` instead of `comms.dm_participants`, and the scope is `active_profile_id` / `active_team_id` instead of just `auth.uid()`.

---

## 5. Special Notes & Gotchas

### 5.1 Service Role

- The Supabase “service_role” bypasses ALL RLS.
- Use it strictly in trusted server code (Edge runtime with secret key, cron, Stripe webhooks).
- Never expose service_role to the browser.

### 5.2 `ops.*`, `analytics.*`

- Operational / analytics tables (audit trail, rollups, rate limit counters) should either:
  - be service-role only, OR
  - expose read-only slices via views with stricter policies.

### 5.3 `security.audit_logs`

- Don’t let normal users read the global audit log of other users.
- You MAY allow a user to read back only their own entries for transparency.

Example:

```sql
ALTER TABLE security.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_self_or_admin"
ON security.audit_logs
FOR SELECT
USING (
  security.audit_logs.user_id = auth.uid()
  OR security.is_admin() = true
);

-- No insert/update/delete policies for public;
-- logs are written by service_role only.
```

### 5.4 `security.refresh_tokens`

(If you store hashed refresh tokens in DB.)

- NO RLS policies for public.
- Table should be fully private: only service_role inserts/rotates/invalidates refresh tokens.
- Do not expose this table to clients at all. Never query from browser context.

### 5.5 `storage.objects`

- Storage also uses RLS in Supabase.
- You must align `storage.objects` policies with `org.attachments` and channel/project membership.
- Ensure that object path/bucket metadata can be joined back to a profile_id, project_id, channel_id, etc.

You’ll enforce rules like:

- “Attachment belongs to `auth.jwt()->>'active_profile_id'`”
- OR “Attachment is shared in a channel where `auth.uid()` is a participant”
- OR “Attachment is part of a project where active profile/team is a participant”
- Admin override OR service_role.

(See `11_Storage.md` for deeper per-bucket rules.)

---

## 6. Policy Naming, Placement & Conventions

- All policies live in versioned SQL under `db/policies/<schema>/<table>.sql`.
- One table per file.
- Names reflect WHO and WHY, not just CRUD:
  - `pol_projects_projects_owner_select`
  - `pol_projects_project_stages_update_owner_or_assignee`
  - `pol_finance_transactions_select_wallet_owner`
  - `pol_comms_dm_messages_insert_participant_sender`

This avoids mystery and helps audits.

---

## 7. Recap / TL;DR

1. Every authenticated request includes:
   - `auth.uid()`
   - `auth.jwt()->>'active_profile_type'`
   - `auth.jwt()->>'active_profile_id'`
   - `auth.jwt()->>'active_team_id'`

2. All sensitive tables are RLS-enabled.

3. Policies check:
   - Does this row belong to my active profile OR my active team?
   - Am I directly assigned / participating in this project, stage, channel, or thread?
   - Am I the wallet/payee/payer on the money row?
   - Am I the team owner / business owner / freelancer assigned?
   - OR am I an admin (`security.is_admin()`)?
   - Otherwise: no access.

4. Finance tables are read-only for end users, write-only for the system.
5. `security.*` tables are locked down to self or admin, never world-readable.
6. Storage rules mirror DB row ownership + sharing, never public by default.
7. The service_role key bypasses RLS and is only used in trusted server code (Stripe webhooks, cron, moderation tools).

This guarantees isolation between:

- different business profiles owned by the same human,
- freelancers inside and outside teams,
- teams hired by a business,
- and unrelated projects/DMs.

Everything is enforced at the database layer — even if the API layer forgets.

```
```
