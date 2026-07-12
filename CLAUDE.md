# Projective — Root Context & Rules

Projective is a stage-based freelancing marketplace built as a modular monolith (Deno + Fresh 2 +
Supabase/Postgres) in a package-per-domain workspace. The authoritative product spec is
`documentation/business/brain.md` and `brain2.md`; nested `CLAUDE.md` files (`apps/web/CLAUDE.md`,
`documentation/CLAUDE.md`, `documentation/business/CLAUDE.md`) carry local rules that still apply.

---

## RULE — Keep `project_management/` in Sync With the Code (Mandatory)

`project_management/` is the live status board for this platform. It **must never drift from the
actual state of the repository.**

**Whenever you add, modify, or delete code in this repo, in the same change you MUST update the
matching status in `project_management/`:**

- **[project_management/EPICS.md](project_management/EPICS.md)** — epic-level board.
- **[project_management/FEATURES.md](project_management/FEATURES.md)** — per-epic feature Kanbans.
- **[project_management/USER_STORIES.md](project_management/USER_STORIES.md)** — per-story
  acceptance-criterion boards.
- **[project_management/README.md](project_management/README.md)** — the Master Epic Board and the
  snapshot counts.

Concretely, this means:

- **Adding/finishing a feature** → move its card to the correct lane
  (`⬜ Todo → 🟡 In Progress → ✅ Done`) and, if it completes an acceptance criterion, move that AC
  to the **Met** lane in `USER_STORIES.md`.
- **Wiring a frontend mock to a real backend** → update the note and, where warranted, the lane
  (many items are `🟡 In Progress` _specifically because_ they render from frontend seed data).
- **Deleting or deprecating code** → remove the corresponding card, or move it to the
  `⛔ Blocked / Deprecated` lane. Do not leave a card describing code that no longer exists.
- **Adding a whole new capability** not yet on any board → add a card in the right epic (and a new
  epic/feature/story entry if needed), then update the snapshot counts in `README.md`.

Treat the PM update as part of "done." A code change that leaves `project_management/` describing
the old reality is an incomplete change.

### CRITICAL CONSTRAINT — No Changelogs, No History

This project is being built from scratch, so the PM files track **current state only**. When you
update them:

- **Edit the status in place. Replace the old state cleanly.** Move the card to its new lane; do not
  annotate the move.
- **Do NOT add** any "Changelog", "History", "Recent Changes", "Updated on", "Previously", or dated
  entry — anywhere in `project_management/`.
- **Do NOT strike through, comment out, or keep old statuses "for reference."** The old state is
  simply overwritten.
- The only tense these files use is the **present**: what _is_ true of the codebase right now.

If you ever find a history/changelog section in `project_management/`, delete it and fold the
current truth into the boards.

---

## Related Sync Rules (Already in Effect)

These pre-date this file and remain mandatory — do not let them conflict with the rule above:

- **Business-logic / workflow / financial-rule changes** must be reflected in
  `documentation/business/brain.md` (or the relevant satellite doc) in the same pass — see
  `documentation/business/CLAUDE.md`.
- **CSS variable changes** belong in `apps/web/styles/themes/variables/`, not in prose docs — see
  `apps/web/CLAUDE.md`.

Rule of thumb: **code = truth; `project_management/` = its live status; `documentation/` = its
durable spec.** A single change may need to touch all three, and should.

---

## RULE — Design System & Component Architecture (Immutable Guardrails)

The Projective design language and component layer are governed by a single authoritative spec:
**[`documentation/design-system/DESIGN_SYSTEM.md`](documentation/design-system/DESIGN_SYSTEM.md)** and
its companions (`00-architecture.md`, `01-tokens.md`, `02-context-theming.md`,
`03-state-variant-model.md`, `components/`). These rules are **not optional** and are not overridable
by convenience. **Reject any change (including your own generated code) that breaks them.**

### Tokens are the only source of colour, radius, and motion

- **NEVER hard-code a colour.** No `#hex`, `rgb()/rgba()`, or raw `hsl()/hsla()` literal in a component
  (`.tsx`) or a component stylesheet. Reach for a semantic token (`--status-*`, `--surface-*`,
  `--text-*`, `--primary`, …). This includes colours passed to Canvas/D3/PixiJS — route them through
  the chart `theme-bridge`, never a string literal.
- **NEVER bypass the CSS-variable system.** New colours/radii/durations land as tokens in
  `apps/web/styles/themes/variables/` (`colour.css`, `ui.css`, `fields.css`, `data.css`, `font.css`,
  and the semantic layer `system.css`) — never as inline magic numbers, and never as a
  `var(--token, <hardcoded fallback>)` where the fallback is a raw hex/px/ms. If a token isn't
  defined, **define it** in the right variables file; do not lean on a dead fallback.
- **Geometry — the radius ladder is fixed:** `--radius-control` 4px (checkbox/switch/chip) ·
  `--radius-field` / `--radius-button` 6px · `--radius-card` 12px · `--radius-stage` 16px ·
  `--radius-feed` 22px · `--radius-pill`. **Soft outer container, sharp inner control.** A nested
  element's radius must be **≤ its container's** (concentric nesting). Reject radius inversions and any
  raw px radius off the ladder.
- **Motion — compose from `--motion-*`:** `--motion-structural` (620ms luxe expo — layout/reveals) ·
  `--motion-micro` (250ms spring — clicks/toggles/press) · `--motion-standard` (150ms — default).
  No raw `ms`/`cubic-bezier()` in components.
- **Focus is sacred:** interactive elements show `--focus-glow` (3px teal halo) on `:focus-visible`
  (`--focus-glow-danger`/`-violet` in those contexts). **Never** `outline: none` without a replacement
  ring.

### Separation — borders are a last resort (the Separation Hierarchy)

Full container borders are the heaviest way to separate content and are **not** the default. Separate
with the lightest tool that works, stepping down this ladder only when the lighter one fails (full
detail + allowlist in `documentation/design-system/DESIGN_SYSTEM.md` §4):

1. **Space** — asymmetric `rem`-scaled padding/gap between groups of secondary information. The default.
2. **Tone** — alternating surface tints (`--surface-0`/`--surface-1`/`--surface-2`, `-surface` washes)
   for secondary dashboard widgets, wells, and layout columns — instead of an outline.
3. **Line** — a single razor-thin hair-line (`border-bottom: 1px solid var(--hairline)`) for linear,
   repeating items: list rows, table rows, feed items. One side, never four; last item drops its rule.
4. **Envelope** — a full four-sided border **only** on functional / interactive / state-driven
   elements: field inputs (`TextField`, `Checkbox`, `Switch`), active dropdowns/menus/popovers/modals,
   draggable `KanbanCard` modules, state-bearing roster seats, and clickable cards whose border shifts
   on hover/focus/selected.

**REJECT any component implementation that defaults to boxing a static layout section in a full
four-sided border. Force the code to use layout spacing, colour blocking, or typographic weight and
size contrasts to establish hierarchy first.** Lead with type weight/size and deliberate spacing so
that "minimal" never reads as "boring."

### Component architecture — the consolidated `@projective/ui`

- **Import from the namespaced sub-paths.** New/touched code imports from `@projective/ui`,
  `@projective/ui/atoms`, `/fields`, `/charts`, `/data`, `/time`, `/files`, `/types`, `/system`,
  `/utils`. The legacy `@projective/fields` · `@projective/charts` · `@projective/data` ·
  `@projective/time` · `@projective/files` · `@projective/utils` specifiers are **deprecated shims** —
  do not add new usages.
- **Respect the taxonomy.** Atoms (`/atoms`) are pure presentation (Button, Icon, Badge, Tag, Logo).
  Input mechanics (Checkbox, Switch, TextField, StatusSlider) live in `/fields` and compose the
  structure wrappers (`LabelWrapper`, `MessageWrapper`, `AdornmentWrapper`). Date/time pickers +
  scheduling live in `/time`. Collection presentation lives in `/data`.
- **Do NOT mix fields with structural data.** A `/data` table/list must not embed a bespoke input —
  compose a `/fields` component; a `/fields` component must not reimplement a data grid. Keep the two
  namespaces separate.
- **Portability contract.** Nothing under `@projective/ui` may import app code (`@server/*`,
  `@features/*`, `@/*`, `@components/*`, `@islands/*`). Its only cross-package dependency is
  `@projective/types` (folding into `@projective/ui/types`). Copying `packages/ui/` into another app
  must work out of the box — keep it self-contained.
- **Contextual overrides go through `<DesignSystemProvider>`** (density/radius/accent/motion/surface),
  not per-component hacks. Don't hard-code an accent hue to "match" a violet/social surface — set
  `accent="violet"` on a provider. Provider CSS (`[data-ds-*]` in `system.css`) and JS
  (`packages/ui/src/system/`) must stay in lock-step.

### Keep the spec in sync (same-change rule)

Adding/changing a component, token, variant or state **must** update the matching design-system doc in
the same change: a new token → `01-tokens.md` (+ the variables file); a new/changed component →
its `components/*.md` matrix; a new provider knob → `02-context-theming.md`. A code change that leaves
`documentation/design-system/` describing the old reality is an incomplete change — the same standard
as the `project_management/` rule above.

**A PR is rejected if it:** hard-codes a hex/rgb/hsl colour · bypasses the CSS-variable token system ·
mixes `/fields` with `/data` structural concerns · violates the container→control radius nesting ·
**defaults to boxing a static layout section in a full four-sided border instead of using spacing /
surface tint / a single hair-line / type contrast (the Separation Hierarchy)** · **introduces
luxury/metallic variable names (`--champagne`, `--gold`, `--obsidian`, `-luxe`, or any "premium"
decorative token) instead of the structural High-Utility Kinetic palette (`--accent-teal`,
`--accent-mist`, `--surface-dark-workspace`, `--border-subtle`, `--surface-subtle`, `--grad-brand`)**
· **adds artificial background glowing orbs, aurora blobs, or non-functional decorative gradients**
· imports app code into a package · removes focus without a replacement · hard-codes motion off the
`--motion-*` tokens · or lands component/token changes without the matching design-system doc update.

### High-Utility Kinetic — no decorative aesthetic layers

The design language is **High-Utility Kinetic**: crisp, tactile, high-density, and addictive because of
*interaction* (motion, tone, elevation, tactile press states), **not** because of cosmetic overlays. It
blends Google Material 3's expressive enclosures with IBM Carbon / Microsoft Fluent high-density
workspace layouts. **Do not** reach for the generic "AI-startup" visual traps — free-floating glowing
orbs, aurora blobs, gratuitous gradients, or heavy decorative blurs standing in for real structure.
Colour comes only from the structural, semantic token palette; depth comes from the elevation ladder,
tone, and motion. There is no `--gold`/`--champagne`/`--obsidian`/`glass-luxe` layer — those tokens
were removed and must not be reintroduced under any name.

---

## Build & Test Commands

Run these from the repo root:

- `deno task test` — run the full test suite
  (`deno test --fail-fast --coverage=coverage -A --trace-leaks`).
- `deno test --allow-all tests/` — run just the `tests/` suite directly.
- `PJV_TEST_DB=1 deno test --allow-all tests/` — also run the opt-in live-DB layer (local Supabase
  must be up).
- `deno task check` — format, lint, typecheck, and name-validate before committing.
- `deno task coverage:html` — render the coverage report after a test run.

## Testing Conventions

- **Use Deno's native runner only** — `Deno.test` + `jsr:@std/assert`. Do NOT add Jest, Vitest, or
  any external runner.
- **Name test files `*.test.ts`** and place them under `tests/`; shared harnesses go in
  `tests/support/`.
- **Every completed user story gets a test.** Name cases by story + acceptance criterion (e.g.
  `US-007 AC2 · ...`) so coverage maps to `project_management/USER_STORIES.md`.
- **Integration runs must never commit.** Use `MockDb.begin()/rollback()` for the in-memory layer,
  and wrap live-DB cases in `BEGIN … ROLLBACK` via `tests/support/live_db.ts`.
- **Keep the default run green with no database.** Gate live-DB cases behind `PJV_TEST_DB=1` with
  `Deno.test({ ignore: !isLiveDbEnabled(), ... })`.
