# Architecture — the consolidated `@projective/ui` package

> Part of the [Design System Master Specification](DESIGN_SYSTEM.md). This document defines the
> package topology, the sub-path taxonomy, the portability contract, and the migration state.

## 1. Goal

Consolidate every standalone, **app-independent** UI package into a single overarching parent
package — `@projective/ui` — exposed through modern multi-export **sub-paths**, so that:

1. Consumers import cleanly namespaced surfaces (`@projective/ui/atoms`, `@projective/ui/fields`, …).
2. The whole folder is **copy-paste portable** — dropping `packages/ui/` into another Deno/Vite app
   works out of the box, with no dependency on Projective app code.
3. There is one configuration root, one theme contract, one place to reason about the component layer.

## 2. Sub-path taxonomy

| Import specifier | Entry file | Contents |
|------------------|-----------|----------|
| `@projective/ui` | `packages/ui/mod.ts` | Composite **surfaces** — cards, `EntityCard`, panels, feed, roster, accordion, splitter, stepper, toast, overlay, popover, tooltip, ledger, channel/nav tabs, PII notice, wizard chrome, skeletons — plus the `DesignSystemProvider`. |
| `@projective/ui/atoms` | `packages/ui/atoms.ts` | **Pure presentation primitives** — Button family, IconButton, Icon/FileTypeIcon, Badge/StatusBadge, Tag/TagList, Ripple, Progress, Media, Logo, ThemeSwitcher. Zero business logic. |
| `@projective/ui/fields` | `packages/ui/fields.ts` | **Input-aware mechanics** — TextField, HandleField, SearchInput, SelectField, ComboboxField, MoneyField, DateField, Checkbox, **Switch**, StatusSlider, SliderField, TagInput, FileDrop, RichTextField, MenuSelect, FilterTags, ViewToggle + the structure wrappers. |
| `@projective/ui/charts` | `packages/ui/charts.ts` | Gantt, Kanban, rating, WorkloadCapacityGauge, D3 finance (pipeline/forecast/finance). |
| `@projective/ui/charts/finance` | `packages/ui/charts-finance.ts` | The heavier D3 finance entry, split out. |
| `@projective/ui/data` | `packages/ui/data.ts` | Virtualized `DataDisplay`, `Table`, `LedgerTable`, `ChatList`, `Carousel`, `MasonryGrid` + data hooks. |
| `@projective/ui/time` | `packages/ui/time.ts` | The boundless-velocity calendar viewport + schedule minimap. **`Calendar` / `TimeClock` relocate here from `fields`.** |
| `@projective/ui/files` | `packages/ui/files.ts` | `UploadFile`, `HandoverLibrary`, file grid / details / directory-tree + library store. |
| `@projective/ui/types` | `packages/ui/types.ts` | The folded UI-facing **presentation** types (card models, ledger entries, file metadata, `DateTime`). |
| `@projective/ui/utils` | `packages/ui/utils.ts` | Framework-agnostic string / math / date-math / colour helpers. |
| `@projective/ui/system` | `packages/ui/system.ts` | `DesignSystemProvider` + `useDesignSystem()`. |
| `@projective/ui/skeletons` | `packages/ui/skeletons.ts` | Loading skeletons (pre-existing). |

Resolution is registered in three coordinated places (they must stay in sync):

1. **`deno.json` `imports`** — the Deno import map (exact keys per sub-path).
2. **`packages/ui/deno.json` `exports`** — the package's self-describing export map (portability).
3. **`vite.config.ts`** — `resolve.alias` (specific-path-first ordering) + `optimizeDeps.exclude`.

## 3. Taxonomy rules — what goes where

- **Atoms** = pure presentation. A component belongs in `/atoms` iff it renders a self-contained
  visual with no input state, no data layer, no business logic (Button, Icon, Badge, Tag, Logo).
- **Fields** = anything that captures or edits a value, plus the wrappers that give it a label /
  helper-text / adornment / validation shell. `Checkbox`, `Switch`, `TextField`, `StatusSlider` are
  fields — never atoms.
- **Time** = anything that reasons about dates / schedules. `Calendar` and `TimeClock` move out of
  `fields` into `/time`; date/time *fields* (`DateField`, `TimeField`) stay in `/fields` but delegate
  their picker popovers to `/time` surfaces.
- **Data** = structural presentation of collections (tables, lists, chat, carousels). Data surfaces
  render rows they are handed; they must **not** embed bespoke inputs — compose a `/fields` component.
- **Charts** = visualization. Colour flows through the package `theme-bridge`, never inline.
- **Surfaces** (the `@projective/ui` root) = composite containers assembled from atoms + fields.

## 4. Portability contract

`@projective/ui` and all its sub-paths **must not** import Projective app code:

- ❌ `@server/*`, `@features/*`, `@/*`, `@components/*`, `@islands/*`, `@contexts/*`, `@hooks/*`
- ✅ `preact`, `@preact/signals`, `@tabler/icons-preact`, `d3-*`, `pixi.js`, std libs
- ✅ Other `@projective/ui/*` sub-paths (intra-package)
- ⚠️ `@projective/types` — the only cross-package dependency, being folded into `@projective/ui/types`.
  The shared **domain/DB contract** types stay in `@projective/types` (consumed by
  `@projective/backend`); the **UI-facing presentation** subset relocates into `@projective/ui/types`.

**Verified:** as of this consolidation, the UI packages contain **zero** imports of `@server/*`,
`@features/*`, or any app alias. The portability contract already holds.

## 5. Internal dependency graph

The consolidated packages inter-depend (all edges resolve *inside* the parent once merged); the only
outward edge is to `@projective/types`. Crucially, **`@projective/backend` depends on none of them** —
so consolidation introduces no backend→ui coupling.

```
          ┌─────────────── @projective/types (shared domain contracts) ───────────────┐
          │                         ▲            ▲             ▲                        │
          ▼                         │            │            │                        ▼
       fields ──▶ ui (Popover, toast, useRipple) │            │                     backend
          │        ▲   │  ▲                        │            │
     utils│        │   ▼  │                     charts ──▶ ui (Button, IconButton)
          ▼        │  data ──▶ ui/skeletons     charts ──▶ fields (SliderField)
       (math,      │   ▲                          │
        colour)    │   │                          ▼
                  files ──▶ ui + fields + data + types
```

Cycles (`ui ↔ data`, `fields → ui`) are pre-existing and become clean intra-package references once
consolidated. ES modules handle them.

## 6. Migration state

This landed as **structure + docs now, mechanical consumer migration deferred** (a conscious,
low-risk cutover for a build whose dev server can't verify at runtime):

- ✅ Sub-path export surface stands up (`@projective/ui/*`) and **typechecks** (`deno check` green).
- ✅ New primitives added: **`Switch`** (`/fields`), **`DesignSystemProvider`** (`/system`).
- ✅ Semantic token layer (`system.css`) added and wired.
- ✅ Old aliases (`@projective/fields`, `@projective/charts`, …) **remain live** as deprecated shims,
  so none of the ~236 existing consumer files break.
- ⏳ **Deferred (migration pass):** (a) rewrite the ~356 existing imports across ~236 files to the new
  `@projective/ui/*` namespaces; (b) physically relocate the sibling package directories under
  `packages/ui/`; (c) collapse the per-package `deno.json` files into the single parent; (d) move
  `Calendar`/`TimeClock` source into `/time`; (e) physically relocate UI types into `/types`;
  (f) delete the deprecated aliases once consumers are migrated.

### New-code rule during migration

New and touched code **must** import from the `@projective/ui/*` namespaces. The old
`@projective/fields` / `@projective/charts` / `@projective/data` / `@projective/time` /
`@projective/files` / `@projective/utils` specifiers are **deprecated** — do not add new usages.
