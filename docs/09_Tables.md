# Projective Database Schema (Relational Model)
Format: Table-per-entity with columns, types, PK/FK notes  
Date: 25 Oct 2025  
Status: UPDATED (includes maintenance contracts, revision requests, dispute messages, subscriptions, portfolios, column refinements)

---

## ENUMS

### `profile_type`
| Value        | Description                          |
|-------------|--------------------------------------|
| `freelancer`| A freelancer profile context         |
| `business`  | A business / creator profile context |

### `assignment_type`
| Value        | Description                     |
|--------------|---------------------------------|
| `freelancer` | Stage is assigned to a freelancer profile |
| `team`       | Stage is assigned to a team     |

### `visibility`
| Value         | Description                                  |
|---------------|----------------------------------------------|
| `public`      | Visible in search / market                   |
| `invite_only` | Only visible to invited collaborators/teams  |

### `project_status`
| Value        | Description                                      |
|--------------|--------------------------------------------------|
| `draft`      | Project created but not yet active               |
| `active`     | In progress                                      |
| `on_hold`    | Paused                                           |
| `completed`  | Finished and archived                            |
| `cancelled`  | Killed before completion                         |

### `stage_status`
| Value          | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `open`         | Stage exists but not yet staffed                                            |
| `assigned`     | Someone has been assigned but hasn't accepted / started                     |
| `in_progress`  | Actively being worked on                                                    |
| `submitted`    | Work / session delivered for approval                                      |
| `approved`     | Buyer/creator approved deliverable                                         |
| `revisions`    | Creator requested changes / corrections                                    |
| `paid`         | Escrow released / payout processed                                         |

### `dispute_status`
| Value           | Description                          |
|-----------------|--------------------------------------|
| `open`          | Dispute filed                        |
| `under_review`  | Moderator actively mediating         |
| `resolved`      | Outcome decided                      |
| `refunded`      | Payout refunded (full or partial)    |

---

## 1. Supabase built-ins (`auth`, `storage`)

### Table: `auth.users`
| Column        | Type         | Notes                         |
|---------------|--------------|-------------------------------|
| id            | uuid         | PK                            |
| email         | text         | Unique per user (Supabase)    |
| phone         | text         |                               |
| created_at    | timestamptz  |                               |
| updated_at    | timestamptz  |                               |

### Table: `auth.identities`
| Column         | Type         | Notes                                              |
|----------------|--------------|----------------------------------------------------|
| id             | uuid         | PK                                                 |
| user_id        | uuid         | FK → `auth.users.id`                               |
| provider       | text         | e.g. `email`, `github`, `google`, etc.             |
| identity_data  | jsonb        | Provider payload                                   |
| created_at     | timestamptz  |                                                    |

### Table: `storage.buckets`
| Column      | Type        | Notes         |
|-------------|-------------|---------------|
| id          | text        | PK            |
| name        | text        |               |
| created_at  | timestamptz |               |

### Table: `storage.objects`
| Column      | Type         | Notes                                                                 |
|-------------|--------------|-----------------------------------------------------------------------|
| id          | uuid         | PK                                                                    |
| bucket_id   | text         | FK → `storage.buckets.id`                                            |
| name        | text         | Full path inside bucket (unique per bucket)                          |
| owner       | uuid         | Owner user_id or profile id depending on policy                      |
| metadata    | jsonb        | sha256, mime_type, etc.                                              |
| created_at  | timestamptz  |                                                                       |
| updated_at  | timestamptz  |                                                                       |

---

## 2. Security Schema (`security`)

### Table: `security.session_context`
| Column               | Type          | Notes                                                                                  |
|----------------------|---------------|----------------------------------------------------------------------------------------|
| user_id              | uuid          | PK, FK → `auth.users.id`                                                               |
| active_profile_type  | profile_type  | `freelancer` or `business`                                                             |
| active_profile_id    | uuid          | The currently active freelancer_profile or business_profile                            |
| active_team_id       | uuid          | Active team context (if acting "as team")                                             |
| updated_at           | timestamptz   | Last context switch                                                                   |

### Table: `security.audit_logs`
| Column             | Type         | Notes                                                                                                          |
|--------------------|--------------|----------------------------------------------------------------------------------------------------------------|
| id                 | uuid         | PK                                                                                                             |
| user_id            | uuid         | FK → `auth.users.id`                                                                                           |
| action             | text         | e.g. `stage.approved`, `profile.updated`, `dispute.opened`                                                     |
| entity_table       | text         | Logical target table name (`projects.project_stages`, etc.)                                                    |
| entity_id          | uuid         | Entity row id                                                                                                  |
| metadata           | jsonb        | Arbitrary contextual data                                                                                      |
| ip                 | inet         | Calling IP                                                                                                     |
| created_at         | timestamptz  | Timestamp                                                                                                      |
| request_id         | uuid         | (NEW) Correlates platform logs / trace id                                                                      |
| actor_profile_id   | uuid         | (NEW) Active profile the user was acting as at the time (mirrors RLS context)                                  |
| actor_team_id      | uuid         | (NEW) Active team context (if any)                                                                             |
| user_agent         | text         | (NEW) Captured UA / client info for abuse/fraud audit                                                          |

### Table: `security.turnstile_verifications`
| Column        | Type         | Notes                                           |
|---------------|--------------|-------------------------------------------------|
| id            | uuid         | PK                                              |
| user_id       | uuid         | FK-ish (nullable before auth)                   |
| ip            | inet         | IP of request                                   |
| token_prefix  | text         | Partial token for reference                     |
| success       | boolean      | CAPTCHA success                                |
| created_at    | timestamptz  | Timestamp                                      |

### Table: `security.feature_flags`
| Column      | Type        | Notes                              |
|-------------|-------------|------------------------------------|
| key         | text        | PK (flag key)                      |
| enabled     | boolean     | Feature on/off                     |
| payload     | jsonb       | Extra config for rollout           |
| updated_at  | timestamptz |                                    |

---

## 3. Org Schema (`org`)  
Users, freelancer profiles, business profiles, teams, memberships, skills, attachments, email addresses, and portfolios.

### Table: `org.users_public`
| Column        | Type         | Notes                                               |
|---------------|--------------|-----------------------------------------------------|
| user_id       | uuid         | PK, FK → `auth.users.id`                            |
| display_name  | text         | Public-facing name                                  |
| avatar_url    | text         | Signed URL / storage ref                           |
| country       | text         | Optional                                           |
| created_at    | timestamptz  |                                                    |

### Table: `org.freelancer_profiles`
| Column         | Type          | Notes                                                                 |
|----------------|---------------|-----------------------------------------------------------------------|
| id             | uuid          | PK                                                                    |
| user_id        | uuid          | FK → `auth.users.id`, UNIQUE (1 freelancer profile per human user)    |
| headline       | text          | Short pitch                                                           |
| bio            | text          | Profile description                                                   |
| hourly_rate    | integer       | Optional, rough signaling                                            |
| visibility     | visibility    | `public` or `invite_only`                                            |
| skills         | text[]        | Skill tags / fast filter                                             |
| created_at     | timestamptz   |                                                                       |

### Table: `org.business_profiles`
| Column         | Type         | Notes                                                                 |
|----------------|--------------|-----------------------------------------------------------------------|
| id             | uuid         | PK                                                                    |
| owner_user_id  | uuid         | FK → `auth.users.id`                                                  |
| name           | text         | Public / brand display                                               |
| legal_name     | text         | Legal entity name (optional MVP)                                     |
| logo_url       | text         | Storage ref                                                          |
| country        | text         | Billing country / jurisdiction                                       |
| billing_email  | text         | Invoice recipient                                                     |
| plan           | text         | (NEW) Current tier or plan label (`free`, `pro`, `enterprise`, etc.) |
| created_at     | timestamptz  |                                                                       |

### Table: `org.teams`
| Column          | Type         | Notes                                                                          |
|-----------------|--------------|--------------------------------------------------------------------------------|
| id              | uuid         | PK                                                                             |
| name            | text         | Team brand / label                                                             |
| owner_user_id   | uuid         | FK → `auth.users.id` (ultimate controller)                                     |
| description     | text         | Pitch / positioning                                                            |
| visibility      | visibility   | `public` or `invite_only`                                                      |
| created_at      | timestamptz  |                                                                                |

### Table: `org.team_memberships`
| Column      | Type        | Notes                                                                                       |
|-------------|-------------|---------------------------------------------------------------------------------------------|
| id          | uuid        | PK                                                                                          |
| team_id     | uuid        | FK → `org.teams.id`                                                                          |
| user_id     | uuid        | FK → `auth.users.id`                                                                         |
| role        | text        | e.g. `freelancer`, `team_lead`, `admin`                                                      |
| status      | text        | e.g. `active`, `invited`, `left`                                                             |
| created_at  | timestamptz |                                                                                              |
| UNIQUE(team_id, user_id)  | enforced via index                                                                           |

### Table: `org.team_roles`
| Column        | Type        | Notes                                                        |
|---------------|-------------|--------------------------------------------------------------|
| id            | uuid        | PK                                                           |
| team_id       | uuid        | FK → `org.teams.id`                                          |
| title         | text        | e.g. "Designer", "PM", "QA Lead"                             |
| permissions   | jsonb       | Serialized permission map for that role                     |

### Table: `org.org_invitations`
| Column               | Type         | Notes                                                                                     |
|----------------------|--------------|-------------------------------------------------------------------------------------------|
| id                   | uuid         | PK                                                                                        |
| inviter_user_id      | uuid         | FK → `auth.users.id`                                                                      |
| target_email         | text         | Invitation target                                                                         |
| team_id              | uuid         | FK → `org.teams.id` (optional depending on invite type)                                  |
| business_profile_id  | uuid         | FK → `org.business_profiles.id` (optional)                                               |
| token                | text         | Secure/random token                                                                      |
| status               | text         | `pending`, `accepted`, `declined`, `expired`                                             |
| created_at           | timestamptz  |                                                                                           |

### Table: `org.skills`
| Column   | Type | Notes                     |
|----------|------|---------------------------|
| id       | uuid | PK                        |
| slug     | text | Unique machine-readable   |
| label    | text | Human-readable display    |

### Table: `org.user_skills`
| Column        | Type    | Notes                                                |
|---------------|---------|------------------------------------------------------|
| user_id       | uuid    | FK → `auth.users.id`                                 |
| skill_id      | uuid    | FK → `org.skills.id`                                 |
| proficiency   | smallint| User self-rating / level                             |
| PRIMARY KEY(user_id, skill_id) | Composite PK                                  |

### Table: `org.attachments`
| Column              | Type         | Notes                                                                                                          |
|---------------------|--------------|----------------------------------------------------------------------------------------------------------------|
| id                  | uuid         | PK                                                                                                             |
| owner_profile_id    | uuid         | The freelancer/business profile that "owns" this attachment                                                   |
| bucket              | text         | FK → `storage.buckets.id` (e.g. `attachments`, `chat`, etc.)                                                   |
| path                | text         | Object path in bucket                                                                                          |
| original_filename   | text         | Client-side filename at upload time                                                                           |
| display_name        | text         | User-editable "pretty name"                                                                                   |
| mime_type           | text         | Sanitized / validated                                                                                         |
| size_bytes          | bigint       |                                                                                                                |
| sha256              | text         | File integrity                                                                                                 |
| status              | text         | e.g. `draft`, `uploaded`, `quarantined`, `clean`                                                               |
| created_at          | timestamptz  |                                                                                                                |
| updated_at          | timestamptz  |                                                                                                                |

### Table: `org.user_emails`
| Column        | Type         | Notes                                                         |
|---------------|--------------|---------------------------------------------------------------|
| id            | uuid         | PK                                                            |
| user_id       | uuid         | FK → `auth.users.id`                                          |
| email         | text         | Secondary / alternate emails                                 |
| is_primary    | boolean      | Exactly one per user should be primary                       |
| verified_at   | timestamptz  | Null until verified                                          |
| created_at    | timestamptz  |                                                               |
| UNIQUE(user_id, email) | Prevent duplicates                                                |

### Table: `org.portfolios` (NEW)
| Column                   | Type         | Notes                                                                                   |
|--------------------------|--------------|-----------------------------------------------------------------------------------------|
| id                       | uuid         | PK                                                                                      |
| freelancer_profile_id    | uuid         | FK → `org.freelancer_profiles.id`                                                       |
| title                    | text         | "Landing Page Redesign for Client X"                                                   |
| description              | text         | What was done / why it matters                                                         |
| cover_url                | text         | Screenshot / hero image (signed URL / preview)                                        |
| attachment_id            | uuid         | FK → `org.attachments.id` for source files / proof / output                            |
| is_public                | boolean      | Publicly viewable on freelancer profile                                                |
| created_at               | timestamptz  |                                                                                        |

---

## 4. Projects Schema (`projects`)
Projects, stages, assignments, revisions, submissions, maintenance contracts, activity log.

### Table: `projects.projects`
| Column              | Type            | Notes                                                                 |
|---------------------|-----------------|-----------------------------------------------------------------------|
| id                  | uuid            | PK                                                                    |
| client_business_id  | uuid            | FK → `org.business_profiles.id` (the hiring creator / buyer)          |
| title               | text            | Project name / headline                                              |
| description         | text            | Goals / scope                                                        |
| status              | project_status  | `draft`, `active`, `completed`, etc.                                 |
| created_at          | timestamptz     |                                                                       |

### Table: `projects.project_stages`
| Column          | Type           | Notes                                                                                              |
|-----------------|----------------|----------------------------------------------------------------------------------------------------|
| id              | uuid           | PK                                                                                                 |
| project_id      | uuid           | FK → `projects.projects.id`                                                                        |
| name            | text           | e.g. "UI Design", "Coaching Call", "PM Oversight - Sprint 1"                                      |
| "order"         | int            | Display order within the project                                                                  |
| description     | text           | Scope / deliverables / agenda                                                                     |
| status          | stage_status   | `open`, `in_progress`, `submitted`, `approved`, `paid`, etc.                                      |
| due_date        | timestamptz    | (NEW) Target completion date                                                                      |
| completed_at    | timestamptz    | (NEW) When stage was actually approved / closed                                                   |
| stage_type      | text           | (Recommended) "file_based", "session", "group_session", "management", "maintenance"               |
| ip_mode         | text           | (Recommended) "exclusive_transfer", "licensed_use", "template_only", "internal_only"              |
| created_at      | timestamptz    |                                                                                                   |

> `stage_type` and `ip_mode` are important for UI behavior, payouts, disputes, and later licensing enforcement.

### Table: `projects.stage_budget_rules`
| Column              | Type         | Notes                                                                                 |
|---------------------|--------------|---------------------------------------------------------------------------------------|
| id                  | uuid         | PK                                                                                    |
| project_stage_id    | uuid         | FK → `projects.project_stages.id`                                                     |
| type                | text         | `fixed`, `cap`, `free`                                                                |
| amount_currency     | text         | e.g. `USD`, `GBP`                                                                     |
| amount_cents        | bigint       | Budget / cap / fee for that stage                                                    |
| notes               | text         | Any custom pricing explanation (e.g. "First 2h free, then 50/hr up to £300")          |

### Table: `projects.stage_assignments`
| Column                   | Type             | Notes                                                                                   |
|--------------------------|------------------|-----------------------------------------------------------------------------------------|
| id                       | uuid             | PK                                                                                      |
| project_stage_id         | uuid             | FK → `projects.project_stages.id`                                                       |
| assignee_type            | assignment_type  | `freelancer` or `team`                                                                  |
| freelancer_profile_id    | uuid             | FK → `org.freelancer_profiles.id` (nullable if assigned to team)                        |
| team_id                  | uuid             | FK → `org.teams.id` (nullable if assigned to single freelancer)                         |
| assigned_by              | uuid             | FK → `auth.users.id` (the creator/buyer or team lead who made the assignment)           |
| status                   | text             | (NEW) `invited`, `accepted`, `declined`, `active`                                      |
| created_at               | timestamptz      |                                                                                         |

### Table: `projects.stage_submissions`
| Column              | Type         | Notes                                                                                                      |
|---------------------|--------------|------------------------------------------------------------------------------------------------------------|
| id                  | uuid         | PK                                                                                                         |
| project_stage_id    | uuid         | FK → `projects.project_stages.id`                                                                          |
| submitted_by        | uuid         | FK → `auth.users.id` (who actually clicked submit)                                                         |
| notes               | text         | Context: "Final files attached", "Recording of session", "Maintenance summary for this billing period"    |
| created_at          | timestamptz  |                                                                                                            |

> Files linked to a submission will exist via `org.attachments` and tables like `comms.message_attachments` or a future `stage_submission_files` join.

### Table: `projects.stage_revision_requests` (NEW)
| Column              | Type         | Notes                                                                                                                       |
|---------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------|
| id                  | uuid         | PK                                                                                                                          |
| project_stage_id    | uuid         | FK → `projects.project_stages.id`                                                                                           |
| requested_by        | uuid         | FK → `auth.users.id` (usually creator/business-side)                                                                       |
| type                | text         | `minor` or `major` (also drives potential extra budget or escalation)                                                      |
| reason              | text         | "The copy tone isn't what we agreed"; "You missed section 3"; "Session didn't cover X"                                     |
| status              | text         | `open`, `in_progress`, `resolved`                                                                                           |
| created_at          | timestamptz  |                                                                                                                             |
| resolved_at         | timestamptz  |                                                                                                                             |

### Table: `projects.maintenance_contracts` (NEW)
| Column                   | Type         | Notes                                                                                                              |
|--------------------------|--------------|--------------------------------------------------------------------------------------------------------------------|
| id                       | uuid         | PK                                                                                                                 |
| project_id               | uuid         | FK → `projects.projects.id`                                                                                        |
| freelancer_profile_id    | uuid         | FK → `org.freelancer_profiles.id`                                                                                  |
| business_profile_id      | uuid         | FK → `org.business_profiles.id`                                                                                   |
| amount_cents             | bigint       | Recurring cost per billing interval                                                                              |
| currency                 | text         | e.g. `USD`, `GBP`                                                                                                 |
| interval                 | text         | `weekly`, `monthly`, `quarterly`                                                                                  |
| status                   | text         | `active`, `paused`, `ended`                                                                                       |
| created_at               | timestamptz  |                                                                                                                   |

> This covers ongoing "Maintenance Based" work such as retainer-style upkeep.

### Table: `projects.project_participants`
| Column          | Type           | Notes                                                                                                                   |
|-----------------|----------------|-------------------------------------------------------------------------------------------------------------------------|
| id              | uuid           | PK                                                                                                                      |
| project_id      | uuid           | FK → `projects.projects.id`                                                                                             |
| profile_type    | profile_type   | `freelancer` or `business`                                                                                              |
| profile_id      | uuid           | Refers to `org.freelancer_profiles.id` OR `org.business_profiles.id` depending on `profile_type`                        |
| role            | text           | `viewer`, `collaborator`, maybe `owner`                                                                                |
| UNIQUE(project_id, profile_type, profile_id) | Ensures no duplicate role rows per profile                                    |

### Table: `projects.project_activity`
| Column           | Type         | Notes                                                                                                                            |
|------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------|
| id               | uuid         | PK                                                                                                                               |
| project_id       | uuid         | FK → `projects.projects.id`                                                                                                      |
| actor_user_id    | uuid         | FK → `auth.users.id`                                                                                                             |
| kind             | text         | `status_change`, `file_upload`, `comment`, `budget_update`, etc.                                                                |
| payload          | jsonb        | Arbitrary structured metadata (e.g. old_status/new_status, attachment refs, message ids)                                       |
| entity_table     | text         | (NEW) Which entity this activity is about (`projects.project_stages`, `projects.stage_submissions`, etc.)                       |
| entity_id        | uuid         | (NEW) The specific row in that entity                                                                                            |
| created_at       | timestamptz  |                                                                                                                                  |

---

## 5. Communication Schema (`comms`)
Project channels, DM threads, messages, and notification infrastructure.

### Table: `comms.project_channels`
| Column        | Type         | Notes                                                                                              |
|---------------|--------------|----------------------------------------------------------------------------------------------------|
| id            | uuid         | PK                                                                                                 |
| project_id    | uuid         | FK → `projects.projects.id`                                                                        |
| name          | text         | `#general`, `#design`, etc. Must be unique per project                                            |
| stage_id      | uuid         | FK → `projects.project_stages.id` (optional: a stage-specific room like `#stage-2`)               |
| visibility    | text         | `project_all` or `owner_and_assignees`                                                            |
| created_at    | timestamptz  |                                                                                                   |
| UNIQUE(project_id, name)     | Prevent duplicate channel names inside same project                                               |

### Table: `comms.project_channel_participants`
| Column         | Type           | Notes                                                                                                          |
|----------------|----------------|----------------------------------------------------------------------------------------------------------------|
| id             | uuid           | PK                                                                                                             |
| channel_id     | uuid           | FK → `comms.project_channels.id`                                                                               |
| profile_type   | profile_type   | `freelancer` or `business`                                                                                     |
| profile_id     | uuid           | The profile in that channel                                                                                   |
| role           | text           | `viewer`, `participant`, `moderator`                                                                          |
| created_at     | timestamptz    |                                                                                                                |
| UNIQUE(channel_id, profile_type, profile_id) | Ensures no duplicate memberships in same channel                                  |

### Table: `comms.project_messages`
| Column           | Type         | Notes                                                                                                    |
|------------------|--------------|----------------------------------------------------------------------------------------------------------|
| id               | uuid         | PK                                                                                                       |
| channel_id       | uuid         | FK → `comms.project_channels.id`                                                                         |
| sender_user_id   | uuid         | FK → `auth.users.id`                                                                                     |
| body             | text         | Message text                                                                                             |
| created_at       | timestamptz  |                                                                                                          |
| edited_at        | timestamptz  | (NEW) Null unless edited                                                                                 |
| deleted_at       | timestamptz  | (NEW) Soft-delete flag for moderation / audit                                                            |
| INDEX(channel_id, created_at)   | For chronological pagination                                                                            |

### Table: `comms.dm_threads`
| Column              | Type         | Notes                                               |
|---------------------|--------------|-----------------------------------------------------|
| id                  | uuid         | PK                                                  |
| created_by_user_id  | uuid         | FK → `auth.users.id`                                |
| created_at          | timestamptz  |                                                     |

### Table: `comms.dm_participants`
| Column        | Type         | Notes                                             |
|---------------|--------------|---------------------------------------------------|
| id            | uuid         | PK                                                |
| thread_id     | uuid         | FK → `comms.dm_threads.id`                        |
| user_id       | uuid         | FK → `auth.users.id`                              |
| joined_at     | timestamptz  |                                                   |
| UNIQUE(thread_id, user_id)   | Prevent duplicate joins for same user/thread      |

### Table: `comms.dm_messages`
| Column          | Type         | Notes                                           |
|-----------------|--------------|-------------------------------------------------|
| id              | uuid         | PK                                              |
| thread_id       | uuid         | FK → `comms.dm_threads.id`                      |
| sender_user_id  | uuid         | FK → `auth.users.id`                            |
| body            | text         | Message text                                    |
| created_at      | timestamptz  |                                                 |
| INDEX(thread_id, created_at)   | Pagination                                      |

### Table: `comms.message_attachments`
| Column          | Type   | Notes                                                                                                                 |
|-----------------|--------|-----------------------------------------------------------------------------------------------------------------------|
| id              | uuid   | PK                                                                                                                    |
| message_table   | text   | `'comms.project_messages'` or `'comms.dm_messages'`                                                                  |
| message_id      | uuid   | References the row in whichever message table `message_table` names                                                  |
| attachment_id   | uuid   | FK → `org.attachments.id`                                                                                             |
| created_at      | timestamptz |                                                                                                                  |
| UNIQUE(message_table, message_id, attachment_id) | Avoid attaching same file twice to same message                                             |

> This allows any message to link to uploaded files (designs, deliverables, audit logs, etc.).

### Table: `comms.channel_files`
| Column        | Type         | Notes                                                                                                                    |
|---------------|--------------|--------------------------------------------------------------------------------------------------------------------------|
| id            | uuid         | PK                                                                                                                       |
| channel_type  | text         | `'project'` or `'dm'`                                                                                                    |
| channel_id    | uuid         | `comms.project_channels.id` OR `comms.dm_threads.id` depending on `channel_type`                                        |
| attachment_id | uuid         | FK → `org.attachments.id`                                                                                                |
| created_at    | timestamptz  |                                                                                                                          |
| UNIQUE(channel_type, channel_id, attachment_id) | Each file appears once in a channel-level gallery                                                   |

### Table: `comms.notifications`
| Column        | Type         | Notes                                                                                   |
|---------------|--------------|-----------------------------------------------------------------------------------------|
| id            | uuid         | PK                                                                                      |
| user_id       | uuid         | FK → `auth.users.id`                                                                    |
| type          | text         | e.g. `message.new`, `stage.submitted`, `payment.released`                               |
| title         | text         | Short summary                                                                          |
| body          | text         | Longer description                                                                     |
| entity_table  | text         | Where this event originated                                                            |
| entity_id     | uuid         | The row ID in that entity                                                              |
| read_at       | timestamptz  | Null until read                                                                        |
| created_at    | timestamptz  |                                                                                        |

### Table: `comms.notification_prefs`
| Column        | Type         | Notes                                                    |
|---------------|--------------|----------------------------------------------------------|
| user_id       | uuid         | PK, FK → `auth.users.id`                                 |
| email         | boolean      | Email alerts?                                            |
| push          | boolean      | Push/mobile alerts?                                     |
| in_app        | boolean      | In-app notifications?                                  |
| digest        | boolean      | Summary digests allowed?                               |
| quiet_hours   | tstzrange    | Time range where pushes are muted                      |

### Table: `comms.device_tokens`
| Column        | Type         | Notes                                            |
|---------------|--------------|--------------------------------------------------|
| id            | uuid         | PK                                               |
| user_id       | uuid         | FK → `auth.users.id`                             |
| provider      | text         | `apns`, `fcm`, `webpush`                         |
| token         | text         | Push token                                      |
| created_at    | timestamptz  |                                                 |

---

## 6. Finance Schema (`finance`)
Wallets, escrows, payments, invoices, disputes, ratings, subscriptions.

### Table: `finance.wallets`
| Column         | Type     | Notes                                                                                  |
|----------------|----------|----------------------------------------------------------------------------------------|
| id             | uuid     | PK                                                                                     |
| owner_type     | text     | `freelancer`, `team`, `business`                                                       |
| owner_id       | uuid     | The profile/team/business this wallet belongs to                                      |
| currency       | text     | `USD`, `GBP`, etc.                                                                     |
| balance_cents  | bigint   | Current balance                                                                        |
| created_at     | timestamptz |                                                                                      |
| UNIQUE(owner_type, owner_id) | One wallet per owner per currency (if you support multi-currency then adjust)      |

### Table: `finance.transactions`
| Column                | Type         | Notes                                                                                                   |
|-----------------------|--------------|---------------------------------------------------------------------------------------------------------|
| id                    | uuid         | PK                                                                                                      |
| wallet_id             | uuid         | FK → `finance.wallets.id`                                                                              |
| direction             | text         | `credit` or `debit`                                                                                    |
| amount_cents          | bigint       | Movement amount                                                                                        |
| currency              | text         | Currency code                                                                                          |
| reason                | text         | `escrow_release`, `refund`, `payout`, etc.                                                             |
| ref_table             | text         | Origin reference (e.g. `finance.escrows`)                                                              |
| ref_id                | uuid         | Origin row ID                                                                                          |
| balance_after_cents   | bigint       | (NEW) Snapshot of wallet after this transaction (for ledger reconcile)                                |
| created_at            | timestamptz  |                                                                                                        |
| INDEX(wallet_id, created_at) | For statements / history                                             |

### Table: `finance.escrows`
| Column                | Type             | Notes                                                                                                                       |
|-----------------------|------------------|-----------------------------------------------------------------------------------------------------------------------------|
| id                    | uuid             | PK                                                                                                                          |
| project_stage_id      | uuid             | FK → `projects.project_stages.id`                                                                                           |
| payer_business_id     | uuid             | FK → `org.business_profiles.id` (who funded the stage)                                                                      |
| payee_type            | assignment_type  | `freelancer` or `team`                                                                                                      |
| payee_id              | uuid             | Points to either `org.freelancer_profiles.id` OR `org.teams.id` depending on `payee_type`                                   |
| amount_cents          | bigint           | Escrowed amount                                                                                                             |
| currency              | text             |                                                                                                                             |
| status                | text             | `funded`, `released`, `refunded`, `disputed`                                                                                |
| created_at            | timestamptz      |                                                                                                                             |

### Table: `finance.payout_accounts`
| Column        | Type   | Notes                                                                                          |
|---------------|--------|------------------------------------------------------------------------------------------------|
| id            | uuid   | PK                                                                                             |
| owner_type    | text   | `freelancer`, `team`, etc.                                                                     |
| owner_id      | uuid   | Profile / team / business referencing who gets paid                                          |
| provider      | text   | `stripe`, etc.                                                                                |
| account_id    | text   | External payout account reference                                                             |
| status        | text   | `active`, `pending_verification`, `disabled`, etc.                                            |
| UNIQUE(provider, account_id) | Avoid duplicate bindings                                                                  |

### Table: `finance.invoices`
| Column                  | Type         | Notes                                                                                                   |
|-------------------------|--------------|---------------------------------------------------------------------------------------------------------|
| id                      | uuid         | PK                                                                                                      |
| project_stage_id        | uuid         | FK → `projects.project_stages.id`                                                                       |
| issue_to_business_id    | uuid         | FK → `org.business_profiles.id` (buyer)                                                                 |
| issue_from_profile      | uuid         | The freelancer profile / team / business that is issuing this invoice                                  |
| amount_cents            | bigint       |                                                                                                         |
| currency                | text         |                                                                                                         |
| status                  | text         | `draft`, `sent`, `paid`, `void`                                                                         |
| created_at              | timestamptz  |                                                                                                         |

### Table: `finance.disputes`
| Column              | Type             | Notes                                                                                                             |
|---------------------|------------------|-------------------------------------------------------------------------------------------------------------------|
| id                  | uuid             | PK                                                                                                                |
| escrow_id           | uuid             | FK → `finance.escrows.id` (the pot of money being fought over)                                                    |
| opened_by_profile   | uuid             | The profile_id (business or freelancer/team) who opened the dispute                                              |
| reason              | text             | Human-readable complaint                                                                                          |
| status              | dispute_status   | `open`, `under_review`, `resolved`, `refunded`                                                                    |
| resolution_notes    | text             | Moderator notes / final decision                                                                                  |
| created_at          | timestamptz      |                                                                                                                   |

### Table: `finance.dispute_messages` (NEW)
| Column            | Type         | Notes                                                                                                       |
|-------------------|--------------|-------------------------------------------------------------------------------------------------------------|
| id                | uuid         | PK                                                                                                          |
| dispute_id        | uuid         | FK → `finance.disputes.id`                                                                                  |
| sender_user_id    | uuid         | FK → `auth.users.id`                                                                                         |
| body              | text         | Message / statement / evidence summary                                                                      |
| created_at        | timestamptz  |                                                                                                             |

> This is the internal "conversation" log for mediation / escalation during a dispute.

### Table: `finance.ratings`
| Column              | Type         | Notes                                                                                                         |
|---------------------|--------------|---------------------------------------------------------------------------------------------------------------|
| id                  | uuid         | PK                                                                                                            |
| project_id          | uuid         | FK → `projects.projects.id`                                                                                   |
| rater_profile       | uuid         | The profile who is leaving the rating                                                                         |
| ratee_type          | text         | `freelancer`, `team`, `business`                                                                             |
| ratee_id            | uuid         | Profile/team/business being rated                                                                            |
| score               | smallint     | 1-5 stars                                                              |
| comment             | text         | Public / semi-public feedback                                                                                 |
| created_at          | timestamptz  |                                                                                                               |

### Table: `finance.subscriptions` (NEW)
| Column          | Type         | Notes                                                                                                     |
|-----------------|--------------|-----------------------------------------------------------------------------------------------------------|
| id              | uuid         | PK                                                                                                        |
| profile_id      | uuid         | The paying entity (freelancer_profile, team, or business_profile)                                        |
| plan            | text         | Plan tier, e.g. `free`, `pro`, `team`, `enterprise`                                                       |
| status          | text         | `active`, `canceled`, `expired`                                                                          |
| started_at      | timestamptz  | When billing/benefits started                                                                            |
| ends_at         | timestamptz  | When billing/benefits end if canceled or scheduled to lapse                                             |

---

## 7. Marketplace Schema (`marketplace`)
Digital assets/templates for sale and purchase.

### Table: `marketplace.assets`
| Column             | Type         | Notes                                                                                                             |
|--------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| id                 | uuid         | PK                                                                                                                |
| seller_profile_id  | uuid         | The freelancer/team/business profile selling this asset                                                          |
| title              | text         | Asset name                                                                                                        |
| description        | text         | Marketing copy                                                                                                    |
| preview_url        | text         | Public-ish preview (signed URL or downsample)                                                                    |
| file_ref           | text         | Internal reference to storage path of original asset                                                              |
| category           | text         | For browsing / filtering                                                                                          |
| price_cents        | bigint       |                                                                                                                   |
| currency           | text         |                                                                                                                   |
| license_type       | text         | `full_rights`, `template_only`, etc.                                                                             |
| status             | text         | `draft`, `published`                                                                                              |
| created_at         | timestamptz  |                                                                                                                   |

### Table: `marketplace.asset_versions`
| Column        | Type         | Notes                                                                                         |
|---------------|--------------|-----------------------------------------------------------------------------------------------|
| id            | uuid         | PK                                                                                            |
| asset_id      | uuid         | FK → `marketplace.assets.id`                                                                  |
| version       | int          | Version number                                                                                |
| changelog     | text         | "Updated icons", "Fixed license text", etc.                                                   |
| file_ref      | text         | Storage ref for that specific version                                                         |
| created_at    | timestamptz  |                                                                                               |

### Table: `marketplace.asset_purchases`
| Column                | Type         | Notes                                                                                                                         |
|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------|
| id                    | uuid         | PK                                                                                                                            |
| asset_id              | uuid         | FK → `marketplace.assets.id`                                                                                                  |
| buyer_business_id     | uuid         | FK → `org.business_profiles.id` (buyer). NOTE: consider adding `buyer_profile_id` in future to allow freelancers/teams buying |
| amount_cents          | bigint       | Purchase amount                                                                                                               |
| currency              | text         |                                                                                                                               |
| license_granted       | text         | Snapshot of license terms at purchase time                                                                                   |
| download_token        | text         | Token to enable secure short-lived download                                                                                   |
| created_at            | timestamptz  |                                                                                                                               |

### Table: `marketplace.asset_downloads`
| Column          | Type         | Notes                                                                  |
|-----------------|--------------|------------------------------------------------------------------------|
| id              | uuid         | PK                                                                     |
| purchase_id     | uuid         | FK → `marketplace.asset_purchases.id`                                 |
| downloaded_at   | timestamptz  | Timestamp of download                                                 |
| ip              | inet         | IP for audit / fraud                                                  |

### Table: `marketplace.asset_ratings`
| Column                | Type         | Notes                                                                                                             |
|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| id                    | uuid         | PK                                                                                                                |
| asset_id              | uuid         | FK → `marketplace.assets.id`                                                                                      |
| buyer_business_id     | uuid         | FK → `org.business_profiles.id`                                                                                   |
| score                 | smallint     | Rating (1-5)                                                                                                      |
| comment               | text         | Feedback                                                                                                          |
| created_at            | timestamptz  |                                                                                                                   |

---

## 8. Search Schema (`search`)
Search index and saved filters.

### Table: `search.search_index`
| Column      | Type       | Notes                                                                                       |
|-------------|------------|---------------------------------------------------------------------------------------------|
| id          | uuid       | PK                                                                                          |
| entity      | text       | `freelancer`, `team`, `project_template`, `asset`, etc.                                     |
| entity_id   | uuid       | The row ID in that entity                                                                   |
| text        | tsvector   | Full-text index for Postgres search                                                         |
| updated_at  | timestamptz|                                                                                             |
| UNIQUE(entity, entity_id) | De-duplicate search records per entity instance                                           |

### Table: `search.embeddings`
| Column      | Type       | Notes                                                    |
|-------------|------------|----------------------------------------------------------|
| id          | uuid       | PK                                                       |
| entity      | text       |                                                         |
| entity_id   | uuid       |                                                         |
| embedding   | vector     | pgvector column for semantic similarity                 |
| updated_at  | timestamptz|                                                         |
| UNIQUE(entity, entity_id) |                                                         |

### Table: `search.filters`
| Column          | Type         | Notes                                                         |
|-----------------|--------------|---------------------------------------------------------------|
| id              | uuid         | PK                                                            |
| owner_user_id   | uuid         | FK → `auth.users.id`                                          |
| name            | text         | Human-readable label ("My SEO/Figma freelancers UK")          |
| query           | jsonb        | Serialized filter config                                      |

---

## 9. Ops Schema (`ops`)
Admin/moderation, outbound webhooks, email queue, rate limit tracking.

### Table: `ops.admin_users`
| Column   | Type  | Notes                                                    |
|----------|-------|----------------------------------------------------------|
| user_id  | uuid  | PK, FK → `auth.users.id`                                 |
| role     | text  | `moderator`, `admin`, `superadmin`                       |

### Table: `ops.moderation_flags`
| Column        | Type         | Notes                                                                                   |
|---------------|--------------|-----------------------------------------------------------------------------------------|
| id            | uuid         | PK                                                                                      |
| entity_table  | text         | Which table/entity is flagged                                                          |
| entity_id     | uuid         | Row being flagged                                                                      |
| reason        | text         | Why it's flagged                                                                       |
| status        | text         | `open`, `reviewing`, `closed`                                                          |
| created_at    | timestamptz  |                                                                                         |

### Table: `ops.webhook_outbox`
| Column          | Type         | Notes                                                                                                       |
|-----------------|--------------|-------------------------------------------------------------------------------------------------------------|
| id              | uuid         | PK                                                                                                          |
| topic           | text         | Event type e.g. `project.updated`, `payment.released`, etc.                                                 |
| payload         | jsonb        | Serialized payload                                                                                          |
| status          | text         | `pending`, `sent`, `failed`                                                                                |
| retry_count     | int          | Number of retry attempts                                                                                   |
| next_retry_at   | timestamptz  | When to try next                                                                                            |
| created_at      | timestamptz  |                                                                                                             |

### Table: `ops.email_queue`
| Column        | Type         | Notes                                                           |
|---------------|--------------|-----------------------------------------------------------------|
| id            | uuid         | PK                                                              |
| to_email      | text         | Recipient                                                       |
| template      | text         | Template key                                                   |
| vars          | jsonb        | Template variables                                             |
| status        | text         | `pending`, `sent`, `failed`                                    |
| created_at    | timestamptz  |                                                                 |

### Table: `ops.rate_limit_counters`
| Column             | Type         | Notes                                                                                                      |
|--------------------|--------------|------------------------------------------------------------------------------------------------------------|
| id                 | uuid         | PK                                                                                                         |
| bucket_key         | text         | User/IP/bucket identifier (like `user:123-action:sendMessage`)                                            |
| count              | int          | Count in the active rate limit window                                                                      |
| window_starts_at   | timestamptz  | Start timestamp for the rolling / fixed window                                                             |

---

## 10. Analytics Schema (`analytics`)
Event logs + rollups.

### Table: `analytics.event_log`
| Column        | Type         | Notes                                                               |
|---------------|--------------|---------------------------------------------------------------------|
| id            | uuid         | PK                                                                  |
| user_id       | uuid         | FK → `auth.users.id`                                               |
| event         | text         | e.g. `stage.submitted`, `escrow.funded`, `dispute.opened`           |
| props         | jsonb        | Extra analytics data                                               |
| created_at    | timestamptz  | Timestamp                                                           |

### Table: `analytics.daily_rollups`
| Column        | Type   | Notes                                                               |
|---------------|--------|---------------------------------------------------------------------|
| day           | date   | Part of composite PK                                                |
| metric        | text   | Part of composite PK (e.g. `new_projects`, `escrow_volume_gbp`)     |
| value         | bigint | Metric value                                                        |
| PRIMARY KEY(day, metric) |                                                                    |

### View / Materialized View: `analytics.earnings_by_stage_mv`
| Column              | Type         | Notes                                                             |
|---------------------|--------------|-------------------------------------------------------------------|
| project_stage_id    | uuid         | FK → `projects.project_stages.id`                                 |
| total_cents         | bigint       | Sum of released payouts for that stage                           |
| currency            | text         |                                                                   |
| last_refreshed_at   | timestamptz  | When MV was last updated                                         |

(Backed by SQL view / materialized view files in `/db/views/analytics/`.)

---

## 11. Integrations Schema (`integrations`)
External service hookups (GitHub, Trello, Notion, etc.).

### Table: `integrations.providers`
| Column      | Type         | Notes                                                       |
|-------------|--------------|-------------------------------------------------------------|
| id          | text         | PK (`github`, `trello`, `notion`, etc.)                     |
| label       | text         | Display name                                                |
| auth_type   | text         | `oauth2`, `api_key`, `none`                                 |
| scopes      | text[]       | Required perms/scopes                                      |
| created_at  | timestamptz  |                                                             |

### Table: `integrations.connections`
| Column             | Type           | Notes                                                                                             |
|--------------------|----------------|---------------------------------------------------------------------------------------------------|
| id                 | uuid           | PK                                                                                                |
| provider_id        | text           | FK → `integrations.providers.id`                                                                  |
| owner_type         | profile_type   | Which profile context this belongs to (`freelancer`, `business`), or `user` if needed            |
| owner_id           | uuid           | Profile or user this connection belongs to                                                       |
| external_account_id| text           | External provider account identifier                                                             |
| access             | jsonb          | Encrypted tokens/config                                                                          |
| status             | text           | `active`, `revoked`                                                                              |
| created_at         | timestamptz    |                                                                                                   |
| INDEX(provider_id, owner_type, owner_id) | Helpful for "show me all my integrations"                                                      |

### Table: `integrations.installs`
| Column         | Type         | Notes                                                                                             |
|----------------|--------------|---------------------------------------------------------------------------------------------------|
| id             | uuid         | PK                                                                                                |
| connection_id  | uuid         | FK → `integrations.connections.id`                                                                |
| scope          | text         | e.g. `project:{id}` or `workspace`                                                                |
| settings       | jsonb        | Install-level configuration                                                                      |
| created_at     | timestamptz  |                                                                                                   |
