# Projective API Specification

**Base URL:** `/api/v1`  
**Auth:** Bearer JWT (short-lived access)  
**Refresh:** Opaque token rotation  
**CAPTCHA:** Cloudflare Turnstile for anonymous POSTs  
**Storage:** Supabase signed URLs (60s TTL)  
**Rate Limiting:** Per-IP and per-user  
**RLS Context:** `active_profile_id`, `active_team_id`

---

## 🧩 Auth & Session

| Method | Endpoint                 | Description                                 |
| ------ | ------------------------ | ------------------------------------------- |
| POST   | `/auth/signup`           | Create account (email/password + Turnstile) |
| POST   | `/auth/login`            | Login, returns access + refresh tokens      |
| POST   | `/auth/refresh`          | Rotate refresh → new access token           |
| POST   | `/auth/logout`           | Revoke refresh token                        |
| GET    | `/auth/me`               | Get current user context                    |
| POST   | `/auth/turnstile/verify` | Verify CAPTCHA token                        |
| POST   | `/auth/switch-profile`   | Switch between freelancer/business profiles |
| POST   | `/auth/switch-team`      | Switch active team                          |

---

### Emails

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| GET    | `/account/emails`             | List linked emails         |
| POST   | `/account/emails`             | Add email (sends verify)   |
| GET    | `/account/emails/:id`         | Check verification         |
| PATCH  | `/account/emails/:id/primary` | Make primary               |
| DELETE | `/account/emails/:id`         | Remove (guards if primary) |

---

## 👤 Users & Profiles

### Users

| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| GET    | `/users/:id` | Public user info      |
| PATCH  | `/users/:id` | Update profile (self) |

### Freelancer Profiles

| Method | Endpoint           | Description                                   |
| ------ | ------------------ | --------------------------------------------- |
| GET    | `/freelancers/:id` | Get freelancer details                        |
| POST   | `/freelancers`     | Create freelancer profile                     |
| PATCH  | `/freelancers/:id` | Update freelancer info                        |
| DELETE | `/freelancers/:id` | Delete freelancer profile                     |
| GET    | `/freelancers`     | Discover freelancers (filter by skills, rate) |

### Business Profiles

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| GET    | `/businesses/:id` | Get business details    |
| POST   | `/businesses`     | Create business profile |
| PATCH  | `/businesses/:id` | Update business         |
| DELETE | `/businesses/:id` | Delete business profile |
| GET    | `/businesses`     | List user’s businesses  |

### Skills

| Method | Endpoint                         | Description          |
| ------ | -------------------------------- | -------------------- |
| GET    | `/skills`                        | List skill directory |
| POST   | `/users/:userId/skills`          | Add a skill to user  |
| DELETE | `/users/:userId/skills/:skillId` | Remove skill         |

### Attachments

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/attachments`     | Get signed upload URL   |
| GET    | `/attachments/:id` | Get attachment metadata |
| DELETE | `/attachments/:id` | Delete attachment       |

---

## 🧑‍🤝‍🧑 Teams & Organizations

| Method | Endpoint     | Description               |
| ------ | ------------ | ------------------------- |
| GET    | `/teams/:id` | Get team profile          |
| POST   | `/teams`     | Create new team           |
| PATCH  | `/teams/:id` | Update team               |
| DELETE | `/teams/:id` | Delete team               |
| GET    | `/teams`     | List owned & joined teams |

### Memberships

| Method | Endpoint                           | Description        |
| ------ | ---------------------------------- | ------------------ |
| POST   | `/teams/:id/members`               | Invite/add member  |
| PATCH  | `/teams/:id/members/:membershipId` | Update member role |
| DELETE | `/teams/:id/members/:membershipId` | Remove member      |

### Roles

| Method | Endpoint                   | Description |
| ------ | -------------------------- | ----------- |
| GET    | `/teams/:id/roles`         | List roles  |
| POST   | `/teams/:id/roles`         | Create role |
| PATCH  | `/teams/:id/roles/:roleId` | Update role |
| DELETE | `/teams/:id/roles/:roleId` | Delete role |

### Invitations

| Method | Endpoint                          | Description                     |
| ------ | --------------------------------- | ------------------------------- |
| POST   | `/org/invitations`                | Create invitation (email token) |
| POST   | `/org/invitations/:token/accept`  | Accept invitation               |
| POST   | `/org/invitations/:token/decline` | Decline invitation              |

---

## 🧱 Projects & Stages

| Method | Endpoint        | Description                                        |
| ------ | --------------- | -------------------------------------------------- |
| POST   | `/projects`     | Create a new project for a business or client      |
| GET    | `/projects/:id` | Get project details                                |
| PATCH  | `/projects/:id` | Update project information                         |
| DELETE | `/projects/:id` | Delete a project                                   |
| GET    | `/projects`     | List projects (filtered by role, status, or owner) |

### Stages

| Method | Endpoint                       | Description                                   |
| ------ | ------------------------------ | --------------------------------------------- |
| POST   | `/projects/:id/stages`         | Create stage(s) for a project                 |
| GET    | `/projects/:id/stages`         | List all stages for a project                 |
| PATCH  | `/stages/:stageId`             | Update a stage (status, name, etc.)           |
| PUT    | `/stages/:stageId/budget-rule` | Define pricing model (fixed, hourly, capped)  |
| POST   | `/stages/:stageId/assign`      | Assign freelancer or team to a stage          |
| DELETE | `/stages/:stageId/assign`      | Unassign freelancer or team                   |
| POST   | `/stages/:stageId/submissions` | Submit deliverables for approval              |
| GET    | `/stages/:stageId/submissions` | View stage submissions                        |
| POST   | `/stages/:stageId/approve`     | Approve the stage submission                  |
| GET    | `/projects/:id/activity`       | View recent activity or updates for a project |

### Participants & Activity

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| POST   | `/projects/:id/participants` | Add project collaborator   |
| GET    | `/projects/:id/participants` | List participants          |
| GET    | `/projects/:id/activity`     | View project activity feed |

---

## 💬 Collaboration & Messaging

### 🧱 Project Channels

Project-based chats between the project owner and assigned freelancers/teams.  
Each project can have multiple channels — for stages, roles, or general discussion.

| Method | Endpoint                                    | Description                                                |
| ------ | ------------------------------------------- | ---------------------------------------------------------- |
| POST   | `/projects/:id/channels`                    | Create a new project channel (`#general`, `#design`, etc.) |
| GET    | `/projects/:id/channels`                    | List all channels within a project                         |
| POST   | `/project-channels/:channelId/messages`     | Send a message to a project channel                        |
| GET    | `/project-channels/:channelId/messages`     | Get messages in a project channel (paginated)              |
| GET    | `/project-channels/:channelId/files`        | View all files uploaded or shared in this channel          |
| POST   | `/project-channels/:channelId/participants` | Add or remove channel participants (by profile/team)       |

---

### 💬 Private Chats (DMs)

One-to-one or group conversations between any users on the platform.  
Ideal for team discussions or networking — fully separate from project communications.

| Method | Endpoint                          | Description                                      |
| ------ | --------------------------------- | ------------------------------------------------ |
| POST   | `/dms/threads`                    | Start a new DM or group chat with selected users |
| GET    | `/dms/threads`                    | List all your private DM threads                 |
| POST   | `/dms/threads/:threadId/messages` | Send a message to a DM thread                    |
| GET    | `/dms/threads/:threadId/messages` | Get messages in a DM thread (paginated)          |
| GET    | `/dms/threads/:threadId/files`    | View all files shared in this DM thread          |

---

### 🔔 Notifications

System and in-app alerts for messages, mentions, and activity.

| Method | Endpoint                  | Description                                             |
| ------ | ------------------------- | ------------------------------------------------------- |
| GET    | `/notifications`          | Get all notifications for the current user              |
| PATCH  | `/notifications/:id/read` | Mark notification(s) as read                            |
| GET    | `/notification-prefs`     | Retrieve notification preferences (email, push, digest) |
| PUT    | `/notification-prefs`     | Update notification preferences                         |
| POST   | `/device-tokens`          | Register a device for push notifications                |
| DELETE | `/device-tokens/:id`      | Remove registered device token                          |

---

## 🧠 Templates (Guided Hiring)

| Method | Endpoint                                             | Description               |
| ------ | ---------------------------------------------------- | ------------------------- |
| POST   | `/templates`                                         | Create template           |
| GET    | `/templates/:id`                                     | Get template              |
| PATCH  | `/templates/:id`                                     | Update template           |
| DELETE | `/templates/:id`                                     | Delete template           |
| GET    | `/templates`                                         | Browse templates          |
| POST   | `/templates/:id/stages`                              | Add template stage        |
| PATCH  | `/templates/stages/:templateStageId`                 | Update stage              |
| PUT    | `/templates/stages/:templateStageId/recommendations` | Add AI recommendations    |
| PUT    | `/templates/stages/:templateStageId/price`           | Set suggested price       |
| POST   | `/templates/:id/apply-to-project/:projectId`         | Apply template to project |

---

## 💰 Finance

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/wallets/mine`             | Get wallet by profile/team |
| GET    | `/wallets/:id/transactions` | Transaction history        |
| POST   | `/escrows`                  | Create escrow for stage    |
| POST   | `/escrows/:id/release`      | Release payment            |
| POST   | `/escrows/:id/refund`       | Refund payment             |
| GET    | `/escrows/:id`              | Get escrow details         |
| GET    | `/stages/:stageId/escrow`   | Get escrow for stage       |
| POST   | `/invoices`                 | Create invoice             |
| GET    | `/invoices/:id`             | Get invoice                |
| PATCH  | `/invoices/:id`             | Update invoice             |
| POST   | `/disputes`                 | Create dispute             |
| PATCH  | `/disputes/:id`             | Update dispute status      |
| POST   | `/ratings`                  | Submit rating              |
| POST   | `/webhooks/stripe`          | Stripe webhook endpoint    |

---

## 🛍️ Marketplace

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | `/assets`                 | Upload new asset          |
| GET    | `/assets/:id`             | Get asset info            |
| PATCH  | `/assets/:id`             | Update asset              |
| DELETE | `/assets/:id`             | Delete asset              |
| POST   | `/assets/:id/versions`    | Add asset version         |
| GET    | `/assets`                 | Browse marketplace assets |
| POST   | `/assets/:id/purchase`    | Purchase asset            |
| GET    | `/purchases/:id/download` | Download purchased asset  |
| POST   | `/assets/:id/ratings`     | Rate asset                |

---

## 🔍 Search

| Method | Endpoint              | Description                                  |
| ------ | --------------------- | -------------------------------------------- |
| GET    | `/search`             | Search freelancers, teams, templates, assets |
| POST   | `/search/filters`     | Save search filter                           |
| GET    | `/search/filters`     | List saved filters                           |
| DELETE | `/search/filters/:id` | Delete saved filter                          |

---

## 🛠️ Admin & Ops

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| GET    | `/admin/users`                    | Admin list users          |
| POST   | `/admin/moderation/flags`         | Create content flag       |
| PATCH  | `/admin/moderation/flags/:id`     | Update moderation flag    |
| GET    | `/admin/webhook-outbox`           | List outbound webhooks    |
| POST   | `/admin/webhook-outbox/:id/retry` | Retry webhook delivery    |
| POST   | `/admin/email-queue`              | Queue transactional email |
| GET    | `/admin/rate-limits/:bucketKey`   | Inspect rate limit bucket |
| GET    | `/admin/audit-logs`               | Filter audit events       |

---

## 📈 Analytics

| Method | Endpoint                                | Description                   |
| ------ | --------------------------------------- | ----------------------------- |
| POST   | `/analytics/events`                     | Record client analytics event |
| GET    | `/analytics/daily`                      | View daily metrics            |
| GET    | `/analytics/earnings-by-stage/:stageId` | View stage earnings report    |

---

## ⚙️ Meta & Health

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/health`            | Health check          |
| GET    | `/ready`             | Readiness probe       |
| GET    | `/version`           | Current API version   |
| GET    | `/feature-flags`     | Get feature flags     |
| POST   | `/csp-report`        | Report CSP violation  |
| GET    | `/rate-limit-status` | Show user rate limits |

---

## ✉️ Notifications & Emails

| Method | Endpoint                        | Description             |
| ------ | ------------------------------- | ----------------------- |
| POST   | `/emails/test`                  | Send test email         |
| POST   | `/notifications/broadcast`      | Admin broadcast message |
| POST   | `/notifications/digest/preview` | Preview digest email    |

---

## 📦 Storage & Files

Users can manage their personal file library, rename files before upload, and re-use files in chats or projects without re-uploading.

### 🗂️ User File Library

| Method | Endpoint              | Description                                                                         |
| ------ | --------------------- | ----------------------------------------------------------------------------------- |
| GET    | `/files`              | List all files in the user’s personal library (filterable by status, type, or name) |
| POST   | `/files/initiate`     | Begin a new file upload (returns signed upload URL)                                 |
| PATCH  | `/files/:id/rename`   | Rename a file before or after upload                                                |
| PATCH  | `/files/:id/finalize` | Mark a file as uploaded and available for reuse                                     |
| GET    | `/files/:id`          | Get file metadata and signed download URL                                           |
| DELETE | `/files/:id`          | Delete a file from the user’s library                                               |

---

### 📎 Chat File Reuse

| Method | Endpoint                               | Description                                         |
| ------ | -------------------------------------- | --------------------------------------------------- |
| POST   | `/project-messages/:msgId/attachments` | Attach an existing file to a project message        |
| POST   | `/dm-messages/:msgId/attachments`      | Attach an existing file to a private DM message     |
| GET    | `/project-channels/:channelId/files`   | View all files shared in a specific project channel |
| GET    | `/dms/threads/:threadId/files`         | View all files shared in a private DM thread        |

---

## 🔔 Realtime

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| GET    | `/realtime/auth`     | Get Supabase Realtime auth token |
| POST   | `/realtime/presence` | Announce realtime presence       |

---

## 🌐 Webhooks (Outbound)

| Method | Endpoint                                                                                                | Description               |
| ------ | ------------------------------------------------------------------------------------------------------- | ------------------------- |
| POST   | `/hooks`                                                                                                | Register external webhook |
| DELETE | `/hooks/:id`                                                                                            | Remove webhook            |
| Topics | `project.updated`, `stage.status_changed`, `payment.released`, `dispute.opened`, `asset.purchased`, ... |

---

## 🧩 Non-CRUD Action Endpoints

| Method | Endpoint                   | Description                        |
| ------ | -------------------------- | ---------------------------------- |
| POST   | `/auth/switch-profile`     | Switch active profile              |
| POST   | `/auth/switch-team`        | Switch active team                 |
| POST   | `/stages/:stageId/submit`  | Submit work (alias for submission) |
| POST   | `/stages/:stageId/approve` | Approve stage (shortcut)           |
| POST   | `/escrows/:id/release`     | Release escrow funds               |
| POST   | `/escrows/:id/refund`      | Refund escrow funds                |
| POST   | `/assets/:id/purchase`     | Purchase marketplace asset         |
| GET    | `/purchases/:id/download`  | Download purchased item            |

## 🔌 Integrations & Plugins

Future-ready integration endpoints to connect tools such as GitHub, Trello, Notion, or AI assistants.

| Method | Endpoint                        | Description                                                         |
| ------ | ------------------------------- | ------------------------------------------------------------------- |
| GET    | `/integrations/providers`       | List all available integration providers                            |
| POST   | `/integrations/connections`     | Connect an external account (OAuth or API key)                      |
| GET    | `/integrations/connections`     | List connected integrations for the current user/profile            |
| DELETE | `/integrations/connections/:id` | Disconnect an integration                                           |
| POST   | `/integrations/installs`        | Install or enable a connected integration in a workspace or project |
| GET    | `/integrations/installs`        | List integrations installed in the current workspace/project        |

---

**Last Updated:** October 2025  
**Generated For:** Projective Platform v1  
**Author:** GPT-5 (Projective System Docs)
