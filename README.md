# Projective

**A stage-based freelancing marketplace where businesses hire entire teams — not just individuals —
with escrow-backed, programmatically-enforced trust.**

Projective decomposes work into atomic **Stages** (categorized by the **CREATE** framework), funds
each stage through a state-aware **escrow** engine, and lets solo freelancers and "Virtual Agency"
teams collaborate under shared wallets — without incorporation, joint bank accounts, or off-platform
payment risk.

The authoritative product specification lives in
[`documentation/business/brain.md`](documentation/business/brain.md) and
[`brain2.md`](documentation/business/brain2.md). The live build status is tracked as text Kanbans in
[`project_management/`](project_management/README.md).

---

## Tech Stack

| Layer | Choice | Why |
| :--- | :--- | :--- |
| **Runtime** | Deno 2.x | Secure-by-default, native TypeScript, zero-config workspaces. |
| **Framework** | Fresh 2.x (Vite) | Islands Architecture — zero-JS by default, selective hydration for dashboards. |
| **Language** | TypeScript (strict) | Non-negotiable for workload-intensity math and financial-ledger integrity. |
| **Database** | Supabase / PostgreSQL | Relational integrity for escrow/wallets + built-in Row-Level Security & Realtime. |
| **Search** | Postgres + pgvector | Weighted ranking engine fusing vector, full-text, and cross-schema signals in one round trip. |
| **Architecture** | Modular Monolith | Deno Workspaces: physical integration, logical isolation, shared types. |
| **Styling** | Pure CSS + BEM | Native nesting/variables, no CSS-in-JS build overhead. |

The financial core (escrow hold/release, team payout splits, platform fees, fair-exit logic) is
implemented as `SECURITY DEFINER` functions in Postgres — see
[`project_management/EPICS.md`](project_management/EPICS.md) (E6).

---

## Repository Layout

```text
Projective/
├── apps/web/              # Fresh app: routes, islands, API handlers, feature folders
│   └── features/          # Domain feature folders (auth, dashboard, public, …)
├── packages/              # Deno workspace packages (shared, versioned locally)
│   ├── backend/           #   business-logic services + auth (PKCE, Supabase clients)
│   ├── types/             #   centralized Zod schemas & TS interfaces (single source of truth)
│   ├── ui/                #   in-house Preact component library (EntityCard, Splitter, Toast, …)
│   ├── fields/            #   form controls (TextField, MoneyField, FileDrop, …)
│   ├── data/             #   data-display engines (virtualized tables, grids, carousels, ChatList)
│   ├── charts/            #   D3/Canvas charts (Gantt, finance/wallet visualizations)
│   ├── files/             #   chunked file upload + picker
│   ├── time/              #   calendar, availability scheduler, timezone-aware clocks
│   ├── utils/             #   shared helpers (CSRF, Result type, …)
│   └── wasm/              #   Rust WASM (image ops)
├── supabase/              # Migrations, config, seed, email templates
│   └── migrations/        #   the implemented database (RLS, escrow, projects, search, …)
├── documentation/         # Durable product spec (brain.md is source of truth)
├── project_management/    # Live build-status Kanbans (epics / features / user stories)
├── infra/                 # Deploy notes (Cloudflare, Deno Deploy, GitHub, Stripe)
└── scripts/               # Tooling (name validation, packing)
```

Feature folders in `apps/web/features/` use a consistent shape — `components/`, `contexts/`,
`contracts/`, `islands/`, `routes/`, `services/`, `styles/` — so routes stay thin ("thin
controllers → fat services").

---

## Getting Started

### Prerequisites

- [Deno 2.x](https://docs.deno.com/runtime/getting_started/installation)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for the local database)
- Docker (Supabase local stack)

### Setup

```bash
# 1. Configure environment (see .env, .env.development, .env.production)
#    On Windows, setup.ps1 can bootstrap local config.

# 2. Start the local Supabase stack + apply migrations
supabase start
supabase db reset          # applies supabase/migrations/*

# 3. Run the app in development (Vite dev server on :3000)
deno task dev
```

### Common Tasks

| Command | What it does |
| :--- | :--- |
| `deno task dev` | Start the Vite dev server (`:3000`, HMR, islands). |
| `deno task build` | Production build. |
| `deno task start` | Serve the built app. |
| `deno task check` | Format check + lint + typecheck + name validation (run before committing). |
| `deno task test` | Run the test suite with coverage. |
| `deno task db:reset` | Reset the local database. |
| `deno task db:smoke` | Run the DB smoke-test query. |

> **Islands note:** Vite discovers islands at startup — **restart the dev server after adding a new
> `*.island.tsx` file**. Islands never import the Supabase client directly; all data access goes
> through server-side services (see `documentation/business/brain2.md` §2).

---

## Core Concepts

- **Stages & the CREATE framework** — every unit of work is a stage typed as **C**reate, **R**un,
  **E**ducate, **A**dvise, **T**est, or **E**mpower, driving payout triggers and workload weighting.
- **Escrow-first** — no work begins without funding; no payout releases without verification. Locks
  and releases are tied to ticket claim/approval and enforced in the database.
- **Virtual Agencies** — teams collaborate under a shared wallet with automated per-member payout
  splits, no legal entity required.
- **Two-sided discovery** — a Postgres ranking engine (pgvector + weighted signals) surfaces talent
  and projects; a Reliability Index (planned) rewards output over pay-to-win.

---

## Documentation & Status

- **What the platform is / how it should work:** [`documentation/`](documentation/README.md) —
  `business/brain.md` is the overriding source of truth.
- **What's actually built right now:** [`project_management/`](project_management/README.md) —
  epics, features, and user stories as text Kanbans.
- **Database contracts:** [`documentation/database/`](documentation/database/README.md) — per-schema
  Tables / Functions / Policies.
- **Agent rules:** [`CLAUDE.md`](CLAUDE.md) (root) plus nested `CLAUDE.md` files under `apps/web/`
  and `documentation/`.

---

## License

See [LICENSE](LICENSE).
