# Projective Design System

The durable design contract for Projective's UI: the token system, the consolidated `@projective/ui`
component architecture, and the per-component state/variant matrices.

> **Rule of thumb:** code = truth · this folder = its durable design spec · `project_management/` = its
> live status. A change to a component or token should update the code **and** the relevant doc here in
> the same pass.

## Read in this order

1. **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** — the master specification. Philosophy, colour, geometry,
   motion, elevation, focus, architecture summary, and the enforced guardrails. **Start here.**
2. **[00-architecture.md](00-architecture.md)** — the `@projective/ui` package, sub-path taxonomy,
   portability contract, dependency graph, and migration state.
3. **[01-tokens.md](01-tokens.md)** — the exhaustive token reference (every value, light + dark).
4. **[02-context-theming.md](02-context-theming.md)** — `<DesignSystemProvider>` + `useDesignSystem()`.
5. **[03-state-variant-model.md](03-state-variant-model.md)** — the canonical status-variant ×
   behavioural-state grid the component matrices are written against.

## Per-component matrices — [`components/`](components/)

| Sheet | Namespace | Covers |
|-------|-----------|--------|
| [atoms.md](components/atoms.md) | `@projective/ui/atoms` | Button family, Icon, Badge/StatusBadge, Tag, Ripple, Progress, Media, Logo, ThemeSwitcher |
| [fields.md](components/fields.md) | `@projective/ui/fields` | Text/Select/Combobox/Money/Date fields, Checkbox, **Switch**, StatusSlider, Slider, TagInput, FileDrop, RichText, wrappers |
| [surfaces.md](components/surfaces.md) | `@projective/ui` | Card, EntityCard, Panel, Metric, Roster, Feed, Accordion, Splitter, Stepper, Toast, Overlay, Popover, Tooltip, Ledger, tabs |
| [charts.md](components/charts.md) | `@projective/ui/charts` | Gantt, Kanban, Rating, WorkloadCapacityGauge, D3 finance charts |
| [data-time-files.md](components/data-time-files.md) | `@projective/ui/data · /time · /files` | Tables, lists, chat, carousel, masonry · calendar + minimap · file library |

## Token → CSS source of truth

The design tokens live in `apps/web/styles/themes/variables/` — primitives in `colour.css` / `ui.css`
/ `fields.css` / `data.css` / `font.css`, and the **semantic layer** in `system.css`. Never inline a
colour/radius/duration in a component; add or reuse a token there. See
[apps/web/CLAUDE.md](../../apps/web/CLAUDE.md) and the root [CLAUDE.md](../../CLAUDE.md) for the
enforced guardrails.

## Audit note

The component matrices were produced from a source-level audit that also logged **existing** inline
hard-coded values already in the tree (colours, radii, durations) and a handful of undefined/broken
tokens. Those are recorded per component as `⚠ Guardrail violations found` and are **migration debt** —
new code must not add to them.

**Migration progress:** the **atoms and fields layers are migrated** (`components/atoms.md`,
`components/fields.md`) — every atomic primitive and every input/wrapper now runs purely on the token
system (verified by a raw-value `grep` sweep). Still pending: surfaces, charts, data/time/files —
highest remaining concentrations are chart canvas fills, `upload-file.css`, and raw `box-shadow`/`999px`
literals across the surface stylesheets.
