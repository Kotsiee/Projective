# Projective Documentation

Projective is a collaborative freelancing marketplace where businesses hire individuals, teams, or
entire "micro-agencies" to deliver structured, stage-based projects with escrow-backed payments.

## Source-of-Truth Hierarchy — Read This First

1. **[business/brain.md](business/brain.md)** and **[business/brain2.md](business/brain2.md)** are
   the absolute, overriding authority for all business logic, database schemas, project workflows,
   and architectural rules. If anything below conflicts with these two files, the brain files win.
2. **[codebase_context.md](../codebase_context.md)** (repo root, not in this folder) is the
   technical reference for UI component APIs, styling variables, and Deno/Fresh system directives.
3. Everything else in `documentation/` is either (a) detail that fills a gap the brain files
   deliberately leave abstract, or (b) content the brain files don't cover at all (investor
   narrative, market data, per-route API tables). None of it should _restate_ what's already in the
   brain files — if you find a file doing that, it's a redundancy bug; consolidate or delete it.

See [CLAUDE.md](CLAUDE.md) for the full guardrails future agents should follow when editing this
folder.

## Directory Structure

### [business/](business/README.md)

Business logic authority (`brain.md`/`brain2.md`), plus supplementary docs: the financial model
(`finance-model.md`), phased feature rollout (`features.md`), positioning/philosophy (`vision.md`),
and investor/market material (`investor-summary.md`, `market-analysis.md`).

### [database/](database/README.md)

Per-domain schema documentation (Tables/Policies/Functions) for 11 domains (org, projects, finance,
comms, files, security, analytics, integrations, marketplace, ops, search), plus the top-level
[Schemas.md](database/Schemas.md) ERD/enum reference. Complements `brain2.md`'s migration/RLS
conventions with actual column-level detail. Many domain files are still scaffolded stubs — see the
database README's coverage table.

### [sitemap/](sitemap/README.md)

Per-route detail expansion of `brain.md`'s flat sitemap table — file paths, API endpoint tables,
permissions, and component wiring for Auth and each dashboard domain.

### [packages/](packages/README.md)

Package-level documentation for `@projective/data` and `@projective/ui`. Note: the former
`packages/fields/` sub-folder was removed — it fully duplicated the component source already dumped
in `codebase_context.md`. If you need Fields API detail, go to `codebase_context.md`.

### [flows/](flows/Projects.md)

Implementation-level workflow detail (state diagrams, stage archetypes) complementing `brain.md`'s
business-level "Projects & Services" description.

### User stories & delivery status → `../project_management/`

User stories and the live implementation-status boards (epics, features, per-story acceptance
criteria) now live in the repo-root [`project_management/`](../project_management/README.md)
directory, not here. That directory tracks _current build state_ as text Kanbans; this folder
remains the durable _spec_. See the root `CLAUDE.md` for the rule that keeps the two in sync.

## Technical Overview

- **Frontend:** Deno Fresh 2.x with Preact Islands (partial hydration) — see `brain2.md` §2 for the
  Islands boundary rules.
- **Database & Auth:** Supabase (PostgreSQL) with mandatory Row-Level Security.
- **Compute:** Rust WASM modules for image/file processing and search performance.

Full stack rationale lives in `brain.md`'s "Tech Stack" section; system directives for agents
touching this stack live in `brain2.md`'s "System Directives" section.
