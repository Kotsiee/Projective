# Local Context: apps/web/

This app is early scaffolding (`client.ts`, `deno.json` only, as of this writing) — the guardrails
below apply as routes/islands/features get built out.

## Islands Architecture Boundary (from `documentation/business/brain2.md` §2)

- **Islands are dumb.** Components in `islands/` (or any `*.island.tsx`) must **never** import the
  Supabase client or query the database directly. They call internal API routes via `fetch`.
- **Thin routes, fat services.** Files under `routes/api/...` are only for HTTP parsing, Zod
  validation, and auth guarding. Business logic and database mutations belong in
  `packages/backend` Services, not in route handlers.
- **State hydration flows one way:** Route → Service call (server-side) → resolved data passed to
  the Island as props (e.g. `initialData`) → Island hydrates into local `@preact/signals` state.
  Never fetch inside an Island on mount as a substitute for this.
- **Feature Folder pattern:** new features go under `apps/web/features/[feature-group]/[sub-feature]/`
  with `components/`, `contexts/`, `contracts/`, `islands/`, `routes/`, `services/`, `styles/`
  sub-folders. The top-level `/routes` directory should just import/export from here — don't let
  it grow "fat" itself.
- **Path aliases only** — never relative-path traverse (`../../../`) across workspace boundaries.
  Use `@projective/ui`, `@projective/fields`, `@server/services`, `@features/*`, etc.

## Source of Truth

- `documentation/business/brain.md` — business logic, routes/sitemap, tech stack, visual identity.
- `documentation/business/brain2.md` — these Islands/architecture rules in full, plus package APIs,
  security, caching, and integration blueprints.
- `codebase_context.md` (repo root) — actual component source and UI API reference.

Do not restate these elsewhere in this app's code comments; link back to them if context is
needed.
