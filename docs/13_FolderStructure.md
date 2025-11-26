# Projective Monorepo — Folder Structure & Naming Conventions

This structure is a pragmatic foundation for a Deno Fresh + Supabase (Postgres + RLS) + Rust WASM
project. It keeps the edge app, API routes, database, and packages tidy, is CI-friendly, and scales
from MVP to multi-team.

---

## 1) Top-Level Layout

```text
projective/
├─ apps/
│  └─ web/                     # Fresh (Deno) app: UI + API routes
├─ packages/
│  ├─ backend/                 # Backend helpers (Auth, JWT, Cookies, Rate Limiting)
│  ├─ shared/                  # Isomorphic TS utilities (Validation, Client-side CSRF)
│  ├─ ui/                      # Shared UI (components, utils/ThemeSwitcher)
│  └─ wasm/                    # Rust crates compiled to WebAssembly (e.g., image_ops)
├─ db/
│  ├─ migrations/              # SQL migrations (0001_init_schemas.sql, etc.)
│  ├─ seeds/                   # Non-essential seed data
│  ├─ policies/                # RLS policies split by schema/table
│  ├─ functions/               # SQL & plpgsql functions (e.g., auth helpers)
│  ├─ views/                   # Views/materialized views
│  └─ scripts/                 # Local helpers (dump/restore, diff)
├─ supabase/
│  ├─ config/                  # Supabase CLI config, access roles
│  ├─ storage-rules/           # Storage (policy) snippets per bucket
│  └─ edge-functions/          # (Optional) Supabase Edge Functions
├─ docs/                       # Project documentation, architecture, APIs, product
├─ scripts/                    # Cross-repo task runners (validate_names.ts)
├─ deno.json                   # Deno config (tasks, imports, workspace)
└─ README.md
└─ LICENSE
```

---

## 2) `apps/web` (Fresh App) Structure

```text
apps/web/
├─ routes/                     # Fresh routes: pages + API endpoints
│  ├─ (public)/                # Authless pages (/login, /explore, /)
│  ├─ (auth)/                  # /login, /signup, /verify, /onboarding
│  ├─ (dashboard)/             # Authenticated areas (/dashboard, /projects, /teams)
│  ├─ api/                     # Fresh API routes (edge)
│  │  └─ v1/                   # /api/v1/*
│  └─ _app.tsx                 # App shell
├─ islands/                    # Preact interactive islands (NavBar.tsx, Login.tsx)
├─ components/                 # Presentational components (fields, buttons)
├─ contracts/                  # Request/Response data shapes (auth, public)
├─ server/                     # Server-side business logic
│  ├─ auth/                    # Auth logic (email, oauth, refresh, onboarding)
│  ├─ core/                    # Core clients (supabaseClient), utils, error handling
│  └─ env.ts                   # Environment variable loading
├─ styles/                     # CSS files (themes, components, layouts)
├─ tests/                      # Unit & API integration tests
├─ static/                     # Assets served as static files (logo.svg)
└─ utils.ts                    # Fresh context & state definition (`define`, `State`)
```

**API route filenames** mirror endpoint paths. Example:

- `/api/v1/projects/[id].ts` → `GET, PATCH, DELETE` handlers
- `/api/v1/stages/[stageId]/approve.ts` → action endpoints\
  Keep one file per resource or action for discoverability.

---

## 3) `packages` (Shared Code)

```text
packages/
├─ backend/                   # Node/Deno server-side helpers (not frontend safe)
│  ├─ auth/                   # JWT creation, token/cookie handling, configs
│  ├─ config.ts               # Env variable access (`Config`)
│  ├─ cookies.ts              # Deno cookie helpers (setAuthCookies, getAuthCookies)
│  ├─ crypto.ts               # Hashing (`hashArgon2id`), token generation
│  └─ rateLimiter.ts          # Per-isolate rate limiting utility
├─ shared/                    # Isomorphic TS (can be imported by frontend or backend)
│  ├─ validation/auth.ts      # Auth validators (`AuthValidator`)
│  └─ cookies.ts              # Client-side CSRF token getter (`getCsrfToken`)
├─ ui/
│  └─ utils/ThemeSwitcher.ts  # Theme signaling logic
└─ wasm/
```

**Naming**

- Packages: `kebab-case`.
- Exports: prefer named exports; default export only for React components.
- WASM crates: `snake_case` (Rust convention); built artifacts published to
  `packages/wasm/<crate>/dist/`.

---

## 4) Database Files (`/db`)

```text
db/
├─ migrations/
│  ├─ 0001_init_schemas.sql        # Core schemas and enums
│  ├─ 0002_security_tables.sql     # Audit, refresh_tokens, session_context
│  ├─ 0003_org_tables.sql          # Profiles, teams, attachments
│  ├─ 0005_projects_tables.sql     # Projects, stages, assignments
│  ├─ 0006_comms_tables.sql        # Messages, channels, participants
│  ├─ 0007_finance_tables.sql      # Wallets, escrows, disputes
│  └─ 0020_helpers_functions.sql   # `security.is_admin`, `security.current_context`
├─ policies/
│  ├─ org/
│  │  ├─ freelancer_profiles.sql
│  │  ├─ business_profiles.sql
│  │  ├─ team_memberships.sql
│  │  └─ attachments.sql
│  ├─ projects/
│  ├─ comms/
│  ├─ finance/
│  ├─ marketplace/
│  └─ storage/
├─ functions/
│  ├─ auth/
│  │  └─ project_or_dm_participant.sql
│  └─ helpers/
│     └─ project_team_ids.sql
├─ views/
│  └─ analytics/
│     ├─ earnings_by_stage_mv.sql
│     └─ refresh_earnings_by_stage.sql
├─ seeds/
│  ├─ 100_skills.sql
│  └─ demo_users.sql
└─ scripts/
   ├─ dump.sh
   ├─ restore.sh
   └─ diff.sh
```

**Migration naming**: `NNNN_descriptive_snake_case.sql` (monotonic, forward-only).\
**Policy files**: one table per file, named exactly as `<schema>/<table>.sql`.\
**Functions/Views**: 1 file per function/view; name equals the function/view.

---

## 5) Supabase Storage Conventions

**Buckets** (all lowercase, singular): `avatars`, `attachments`, `chat`, `project`, `marketplace`,
`previews`, `quarantine`, `integrations`, `tmp`.

**Object path format** (use stable IDs, never user-provided names in path segments):

- `avatars/users/{user_id}/{uuid}.{ext}`
- `attachments/{owner_profile_id}/files/{attachment_id}/{sanitized_filename}`
- `project/{project_id}/artifacts/{stage_id}/{uuid}.{ext}`
- `marketplace/assets/{asset_id}/versions/{version_id}/{filename}`

**Naming**: folder segments `snake_case`, files keep original name sanitized to `kebab-case.ext`.

---

## 6) Code & File Naming Conventions

### 6.1 General

- Directories: `kebab-case`
- Files: `kebab-case`
- TypeScript types: `PascalCase` (`UserProfile`, `ProjectStage`)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Enums (TS): `PascalCase` enum + `SCREAMING_SNAKE_CASE` members if numeric; otherwise `camelCase`
  string unions.

### 6.2 UI & Components

- Components: `PascalCase` files with `.tsx` (`AccountSwitcher.tsx`)
- Hooks: `use-*.ts` (`use-active-profile.ts`)
- Cons: `*-con.ts` (`session-con.ts`)
- Islands: end with `.island.tsx` when needed (`AccountSwitcher.island.tsx`)

### 6.3 API Routes (Fresh)

- Resource handlers in `/api/v1/...` named like the path:
  - `/api/v1/projects/[id].ts` (export `GET`, `PATCH`, `DELETE`)
  - `/api/v1/stages/[stageId]/approve.ts` (export `POST`)
- Do not suffix with `controller` or `handler`; the route file **is** the handler.

### 6.4 Services & Integrations

- Service modules: `*-service.ts` (`stripe-service.ts`, `supabase-service.ts`)
- Repositories (DB access wrappers when needed): `*-repo.ts`
- Validation schemas (zod): `*-schema.ts` (`project-schema.ts`)

### 6.5 Tests

- Unit tests: colocate as `*.test.ts` next to source.
- Integration/e2e: `apps/web/tests/*.test.ts` with helpers under `tests/_helpers/`.

---

## 7) Database Naming Conventions

- Schemas: `security`, `org`, `projects`, `comms`, `finance`, `marketplace`, `search`, `ops`,
  `analytics`, `integrations`.
- Tables: **`snake_case` plural** (`freelancer_profiles`, `project_stages`).
- Columns: `snake_case`. Primary keys named `id` (uuid). Foreign keys reference `<table>.<id>`.
- Enums: `snake_case` values (`draft`, `in_progress`), type names `snake_case`.
- Indexes: `idx_<table>_<col1>[_<col2>]` (e.g., `idx_project_stages_project_id_order`)
- Constraints: `chk_<table>_<column>`, `uq_<table>_<column(s)>`, `fk_<table>_<ref>`
- Policies: `pol_<schema>_<table>_<purpose>` (`pol_projects_projects_owner_access`)
- Triggers: `trg_<table>_<action>` (`trg_stage_submissions_set_timestamp`)
- Functions: `schema.fn_name(argtypes)` with file `schema/fn_name.sql`

**Do not** embed business meaning in primary keys; always use UUIDs.

---

## 8) RLS Policy Organization

- Enable RLS in a single migration early (`0009_rls_enable.sql`).
- One policy file per table in `db/policies/<schema>/<table>.sql`.
- Policy names reflect **who** and **why**:\
  `pol_project_messages_channel_participant_select`,\
  `pol_wallets_owner_select`,\
  `pol_attachments_owner_or_shared_select`.

---

## 9) Env Vars & Secrets

**Naming**: `UPPER_SNAKE_CASE`.\
**Prefixes**:

- Public (exposed to client): `PUBLIC_` (e.g., `PUBLIC_TURNSTILE_SITE_KEY`)
- Server-only: no `PUBLIC_` (e.g., `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`)

**Files**:

- `.env.example` committed; `.env` ignored.
- For Deno Deploy: use project secrets UI; mirror keys from `.env.example`.

---

## 10) Commit, Branch & PR Conventions

- Branches: `type/short-description`
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`
  - Example: `feat/account-switcher`, `fix/rls-attachments`
- Commits (Conventional Commits):
  - `feat(projects): add stage approval endpoint`
  - `fix(rls): allow team participants to read channel files`
- PR titles mirror first commit; include “**Scope**” and “**Testing**” sections in description.

---

## 11) Linting, Formatting, and Tasks

- Use Deno’s built-in: `deno lint`, `deno fmt`.
- `deno.json` tasks (examples):

```text json
{
  "tasks": {
    "dev": "deno task -q _dev",
    "_dev": "deno run -A --watch=routes,islands,components main.ts",
    "test": "deno test -A --fail-fast",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "db:migrate": "supabase db reset --db-url $SUPABASE_DB_URL",
    "db:diff": "supabase db diff --linked",
    "typecheck": "deno check apps/web/routes/_app.tsx"
  }
}
```

---

## 12) Error Handling & Response Shapes

- Error objects: `{ error: { code: string, message: string, details?: unknown } }`
- Codes: `auth.invalid_token`, `auth.forbidden`, `validation.failed`, `resource.not_found`,
  `rate.limit_exceeded`
- Never leak internal stack traces to clients.

---

## 13) API Response & File Naming

- JSON fields: `snake_case` or `camelCase`? **Pick one and stick to it.**\
  For Deno + TS frontends, prefer **camelCase in JSON** (DX), keep **snake_case in DB**.
- Download filenames: `kebab-case` + semantic suffixes (`project-export-2025-10-18.zip`).

---

## 14) Logging, Metrics, and Audit

- App logs: `server/logger.ts` with levels `debug|info|warn|error`.
- Audit logs table: `security.audit_logs`.
- Structured log keys: `timestamp`, `level`, `message`, `con` (request id, user id, profile id).

---

## 15) Testing Conventions

- Unit: colocated `*.test.ts`.
- API integration: `apps/web/tests/api/*.test.ts` hitting `/api/v1` with mocked auth.
- DB invariants: SQL assertions in migration follow-ups (e.g., check policies compile).

---

## 16) Example File Names (Grab-bag)

- Component: `apps/web/components/avatar-uploader.tsx`
- Island: `apps/web/islands/account-switcher.island.tsx`
- Hook: `apps/web/features/auth/use-session.ts`
- Route: `apps/web/routes/api/v1/stages/[stageId]/approve.ts`
- Service: `apps/web/services/turnstile-service.ts`
- Policy file: `db/policies/org/attachments.sql`
- Function file: `db/functions/auth/project_or_dm_participant.sql`
- View file: `db/views/analytics/earnings_by_stage_mv.sql`

---

## 17) CI/CD (GitHub Actions)

```text
yaml
name: ci
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1
        with: { deno-version: v1.x }
      - run: deno fmt --check
      - run: deno lint
      - run: deno test -A
```

Deploy workflows live under `infra/github/`. Separate jobs for `preview` and `production`.

---

## 18) Accessibility & i18n

- Components accept `aria-*` props; follow WAI-ARIA roles.
- Strings centralized in `packages/lib/i18n/` (lazy-loaded dictionaries).

---

## 19) Security Defaults

- CSP in middleware: default-deny; allow self + asset CDN; disallow inline except hashed.
- Cookies: `Secure; HttpOnly; SameSite=Lax`.
- JWT: short-lived access; opaque refresh rotated; store refresh in HttpOnly cookie.
- Turnstile for anonymous POST endpoints.
- Signed URLs (60s TTL) for Storage downloads.

---

## 20) Documentation

- API contracts in `docs/api/` (OpenAPI generated from handlers or typed definitions).
- Architecture Decision Records in `docs/architecture/adr-XXXX-title.md` (YYYY-MM-DD).
- Product docs in `docs/product/` (features, user stories, flows).

---

## 21) Versioning & Releases

- Tag format: `vMAJOR.MINOR.PATCH` (e.g., `v0.7.3`).
- Changelog: `docs/CHANGELOG.md` using Keep a Changelog syntax.
- Database: bump with each migration; record in `db/migrations/` and `docs/CHANGELOG.md`.

---

### TL;DR Defaults

- **Directories & files**: `kebab-case`.
- **DB**: schemas/tables/cols `snake_case` plural tables.
- **TS**: `camelCase` for code & JSON; `PascalCase` for types/components.
- **Migrations**: `NNNN_description.sql` (forward-only).
- **Routes**: path-mirrored filenames under `/api/v1`.
- **Policies/Functions/Views**: one object per file, name = object.
- **Env**: `PUBLIC_` for client-exposed, everything else server-only.

This scaffolding + naming playbook prevents bikeshedding and keeps velocity high as the codebase
grows.
