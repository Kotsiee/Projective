# Sitemap Documentation

## Hierarchy

`brain.md`'s "Sitemap and Route Overview" table (in `../business/brain.md`) is the authoritative
flat index of every route path in the app — what exists, at a glance.

This folder is the **per-route detail expansion** layer: file paths, API endpoint tables with
permission enums, component wiring, and session/audit mechanics for each route group. Use
`brain.md` to find *what route* handles something; use this folder to find *how* it's built.

## Structure

- [Auth.md](Auth.md) — the `(auth)` route group: onboarding, login, reset, verification, and the
  `/api/v1/auth/*` endpoint table.
- [dashboard/](dashboard/README.md) — the authenticated dashboard, split per domain:
  - [Business.md](dashboard/Business.md)
  - [Communications.md](dashboard/Communications.md)
  - [Projects.md](dashboard/Projects.md)
  - [Teams.md](dashboard/Teams.md)

## Known Gap

`dashboard/README.md` references `finance/` and `account/` (Settings) sub-modules that don't yet
exist as separate files in this folder. If you're adding dashboard documentation, check whether
those are still missing before assuming the reference is stale — populate them rather than
removing the reference if the routes are real (they appear in `brain.md`'s sitemap table under
`/wallet` and `/settings`).

## For Future Agents

See [../CLAUDE.md](../CLAUDE.md) for the full brain-hierarchy guardrails.
