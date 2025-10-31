# Technology Overview

## Frontend

- **Framework:** Deno Fresh + Preact Islands.
- **Runtime:** Deno Deploy (Edge-first).
- **Styling:** Tailwind CSS + Shadcn UI.

## Backend / API

- **Database:** Supabase (PostgreSQL + RLS).
- **Auth:** Supabase Auth (JWT + custom refresh tokens hashed with Argon2id).
- **Realtime:** Supabase Realtime (WebSocket events).
- **Rate Limiting / KV:** Deno KV atomic counters.
- **WASM:** Rust modules compiled to WebAssembly for CPU-heavy work (e.g., image optimization, file processing).
- **Security:**
  - JWT access tokens (short-lived).
  - Hashed refresh tokens (rotated).
  - Strict RLS policies per user/team.
  - CORS & CSP via middleware.
  - Cloudflare Turnstile for bot protection.
  - Signed URLs for all file access.

## Architecture

```text
Frontend (FreshJS Islands)
  |
  ├── Auth + API Gateway (Fresh API routes, Hono optional)
  │     ├── JWT verification
  │     ├── Rate limiting (Deno KV)
  │     ├── Supabase queries (role-based)
  │     └── WASM modules (Rust compute)
  |
  └── Supabase (DB, Auth, Realtime, Storage)
```

## Account Switching Logic

- A single `users` record may own:
  - **One `freelancer_profile`**
  - **Many `business_profiles`**
- The UI includes an **Account Switcher** in the dashboard header.
- When a user switches:
  - Frontend updates the `active_profile_id` in session.
  - Backend JWT claims change (`sub` = user_id, `active_profile` = selected profile).
  - Supabase Row-Level Security filters all queries using `active_profile_id`.
- Context is cached in Deno KV for quick lookups and revocation.

### Example

```text
User (uuid: U1)
├── FreelancerProfile (uuid: F1)
├── BusinessProfile (uuid: B1)
└── BusinessProfile (uuid: B2)

Active session: `{ user_id: U1, active_profile_type: "business", active_profile_id: B2 }`
```

## Team Membership Architecture

- Freelancers can join **multiple teams**.
- Each membership record links a `user_id` to a `team_id` with role-based permissions.
- The UI displays a **Team Selector** (similar to the Account Switcher) showing:
  - Teams owned
  - Teams joined
- Switching between teams updates `active_team_id` in session.
- Supabase RLS filters project data by both `active_profile_id` and `active_team_id`.
- Permissions flow:
  - `freelancer` → can access personal and joined team projects.
  - `team_lead` → can manage members and approve work.
  - `business` → can interact only with teams they hire.
