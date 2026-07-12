# Local Context: apps/web/

This app is early scaffolding (`client.ts`, `deno.json` only, as of this writing) — the guardrails
below apply as routes/islands/features get built out.

## Islands Architecture Boundary (from `documentation/business/brain2.md` §2)

- **Islands are dumb.** Components in `islands/` (or any `*.island.tsx`) must **never** import the
  Supabase client or query the database directly. They call internal API routes via `fetch`.
- **Thin routes, fat services.** Files under `routes/api/...` are only for HTTP parsing, Zod
  validation, and auth guarding. Business logic and database mutations belong in `packages/backend`
  Services, not in route handlers.
- **State hydration flows one way:** Route → Service call (server-side) → resolved data passed to
  the Island as props (e.g. `initialData`) → Island hydrates into local `@preact/signals` state.
  Never fetch inside an Island on mount as a substitute for this.
- **Feature Folder pattern:** new features go under
  `apps/web/features/[feature-group]/[sub-feature]/` with `components/`, `contexts/`, `contracts/`,
  `islands/`, `routes/`, `services/`, `styles/` sub-folders. The top-level `/routes` directory
  should just import/export from here — don't let it grow "fat" itself.
- **Path aliases only** — never relative-path traverse (`../../../`) across workspace boundaries.
  For the UI layer use the consolidated `@projective/ui` sub-paths (`@projective/ui/atoms`,
  `@projective/ui/fields`, `@projective/ui/charts`, `@projective/ui/data`, `@projective/ui/time`,
  `@projective/ui/files`, `@projective/ui/system`); the bare `@projective/fields` · `@projective/charts`
  · `@projective/data` · `@projective/time` · `@projective/files` · `@projective/utils` aliases are
  deprecated shims. App-side, use `@server/services`, `@features/*`, etc.

## Keep CSS Variables and Documentation in Sync

- **GUARDRAIL — High-Utility Kinetic, no luxury/metal, no decorative layers.** REJECT any code updates
  (including your own generated code) that introduce luxury/metallic variable names (`--champagne`,
  `--gold`, `--obsidian`, any `-luxe` token, or a decorative `--*premium*` token), artificial
  background glowing orbs / aurora blobs, or non-functional decorative gradients. All code MUST use the
  structured, semantic **High-Utility Kinetic** variable palette — `--accent-teal` / `--accent-mist`
  (accents), `--surface-dark-workspace` (dense/media surface), `--border-subtle` / `--surface-subtle`
  (clean utility border + fill), `--glow-teal`, `--grad-teal-velvet`, `--grad-brand*`,
  `--surface-showcase*`, and the motion tokens `--dur-cinematic` / `--ease-expressive`. The system is
  crisp, tactile, and high-density (Material 3 expressive enclosures × Carbon/Fluent workspace
  density); depth comes from motion, tone, and the elevation ladder — never from cosmetic overlays.
- **CSS variables live in `apps/web/styles/themes/variables/`** — primitives in `colour.css`,
  `fields.css`, `font.css`, `ui.css`, `data.css`, and the **semantic design-system layer** in
  `system.css` (surfaces, radius/motion aliases, focus glow, status map, `[data-ds-*]` provider
  scopes). Any time work adds a new variable or changes what an existing one maps to, update the
  appropriate file there directly — don't leave a new token only referenced in a component's own
  stylesheet, and never inline a raw hex/px/ms (or a `var(--token, <hardcoded fallback>)`). The full
  token contract + guardrails live in
  [`documentation/design-system/`](../../documentation/design-system/DESIGN_SYSTEM.md) and the root
  `CLAUDE.md` "Design System & Component Architecture" rule — both are binding here.
- **Business rule changes must be reflected in the documentation markdown**, not just implemented in
  code. If a change here (a new ticket status, a new escrow trigger, a new permission check) encodes
  or alters a business rule, update `documentation/business/brain.md` (or the relevant satellite
  doc) in the same change — see `documentation/business/CLAUDE.md`.

## Source of Truth

- `documentation/business/brain.md` — business logic, routes/sitemap, tech stack, visual identity.
- `documentation/business/brain2.md` — these Islands/architecture rules in full, plus package APIs,
  security, caching, and integration blueprints.
- `codebase_context.md` (repo root) — actual component source and UI API reference.

Do not restate these elsewhere in this app's code comments; link back to them if context is needed.
