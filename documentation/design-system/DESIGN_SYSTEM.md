# Projective Design System — Master Specification

> **Status:** authoritative. This file is the single source of truth for the Projective design
> language, the `@projective/ui` component architecture, and the token contract every surface is
> built on. Code is truth; this spec is its durable design contract. When they disagree, the code is
> the bug — fix the code to match this, or change this in the same PR that changes the code.

**Companion documents**

| File | Purpose |
|------|---------|
| [`00-architecture.md`](00-architecture.md) | The consolidated `@projective/ui` package, its sub-path taxonomy, portability + import rules, dependency graph, migration status. |
| [`01-tokens.md`](01-tokens.md) | The full token reference — every colour, radius, motion, elevation and focus token with its exact value and light/dark behaviour. |
| [`02-context-theming.md`](02-context-theming.md) | `<DesignSystemProvider>` + `useDesignSystem()` — the runtime override engine. |
| [`03-state-variant-model.md`](03-state-variant-model.md) | The canonical status-variant × behavioural-state model every component matrix is written against. |
| [`components/`](components/) | Per-component state + variant matrices (atoms, fields, surfaces, charts, data/time/files). |

---

## 1. Design philosophy — the "High-Utility Kinetic" Teal-Velvet System

Projective is a **High-Utility Kinetic** system: highly interactive, crisp, and addictive to use
because of tactile interaction states and balanced visual geometry — **never** because of artificial
aesthetic layers. We explicitly reject the generic "AI-startup" visual traps: unnecessary gradients,
background glowing orbs, and heavy decorative blurs. Depth and delight come from motion, tone,
elevation, and responsive feedback, not from cosmetic overlays.

It blends two industrial design languages into one coherent middle ground:

- **Google Material 3 expressive enclosures** — soft, confident outer radii (12–22px), springy
  micro-interactions with a slight overshoot, and expressive structural motion. This is our
  `--motion-micro` (250ms · `cubic-bezier(0.34, 1.56, 0.64, 1)`), the soft end of the radius ladder,
  and `--motion-structural` (620ms · `cubic-bezier(0.19, 1, 0.22, 1)`) for large-scale layout shifts.
- **IBM Carbon / Microsoft Fluent high-density workspace layouts** — sharp inner controls (4–6px),
  tight data surfaces, disciplined type scale, and a data grid that reads like a spreadsheet, not a
  marketing page. This is the density knob and the "sharp inner control" half of the radius rule.

The synthesis is captured in one rule of thumb: **soft outer containers, sharp inner controls,
tactile kinetic feedback, teal brand, velvet-indigo social accent, everything on tokens — and no
decorative gradients, orbs, or blurs standing in for real structure.**

---

## 2. Colour — the Teal-Velvet palette

Every colour in the system is an **HSL primitive** in `colour.css` composed into **semantic tokens**
in `system.css`. Nothing is authored as a hex/hsl literal at the component level — ever.

### 2.1 Canvas & workspace surfaces

The surface ladder lifts content off a soft ground. Light mode grounds the app at 98% and elevates
to white; dark mode inverts so the most-elevated surface is the *lightest* near-black.

| Semantic token | Aliases | Light (H S L) | Dark (H S L) | Use |
|----------------|---------|---------------|--------------|-----|
| `--surface-0`    | `--bg`     | `0 0% 98%`  | `0 0% 12%` | Base app canvas |
| `--surface-1`    | `--mid`    | `0 0% 99%`  | `0 0% 9%`  | Recessed / alternate canvas — row striping, wells |
| `--surface-2`    | `--header` | `0 0% 100%` | `0 0% 6%`  | Elevated chrome — top nav, sticky bars, toolbars |
| `--surface-card` | `--card`   | `0 0% 100%` | `0 0% 13%` | Primary content surface — cards, panels, sheets, modals |
| `--surface-sunken` | — | `--bg` −20% L | `--bg` +20% L | Pressed wells, track grooves |
| `--surface-overlay` | `--card` | — | — | Menus / popovers / tooltips — pair with `--elevation-3` |

### 2.2 Brand & social accents

| Token | Role | Light HSL | Hex (light) | Dark HSL |
|-------|------|-----------|-------------|----------|
| `--primary` / `--status-primary` | **Brand teal** | `186 57% 36%` | `#288690` | `186 57% 36%` |
| `--violet` / `--status-social` | **Social velvet-indigo** — people, feed, community | `258 85% 66%` | — | `258 90% 72%` |
| `--mint` | Discovery green (adjacent to teal, hue 160) | `160 70% 42%` | — | `160 84% 52%` |
| `--ocean` / `--status-info` | Informational | `199 89% 48%` | — | `199 92% 58%` |
| `--amber` / `--warning` | Warning | `37 95% 55%` / `37 90% 45%` | — | `37 100% 60%` |
| `--danger` | Destructive / error | `0 70% 55%` | — | `0 70% 55%` |
| `--success` / `--forest` | Success | `160 65% 40%` / `142 71% 42%` | — | up-saturated |
| `--neutral` / `--status-neutral` | Muted / inactive | `220 9% 46%` | — | `220 12% 62%` |

The **teal (186)** and **violet (258)** hues are load-bearing brand decisions:

- **Teal** is the product's primary. It is the default focus-ring hue, the primary button fill, the
  active/selected accent. Its exact value `#288690` reappears as the `#28869066` focus glow.
- **Violet (258)** is reserved for **social** surfaces — profiles, the feed, community, people
  rosters. A component that renders *people or their content* may run its `DesignSystemProvider` on
  `accent="violet"`; a workspace/data surface must not.

### 2.3 Teal-Velvet structural sub-palette (the `/home` feed + workspace)

A structural teal/velvet layer sits on top for the feed + high-density workspace surfaces. These are
plain **structural** tokens — a workspace accent, a pale tint, and a deep dark-workspace surface — with
no metallic or "luxury" framing:

| Token | Light HSL | Meaning |
|-------|-----------|---------|
| `--accent-mist` | `174 40% 88%` | Cool pale tint (alternate feed accent) |
| `--accent-teal` | `178 62% 40%` | Workspace accent (teal lane, off-186 primary / off-160 mint) |
| `--accent-teal-strong` | `182 66% 32%` | Stronger accent — text/icon on light |
| `--surface-dark-workspace` | `252 24% 12%` | Deep velvet-indigo surface for dense panels / media |
| `--border-subtle` | `text / .12` | Clean, context-aware utility border (replaces the old glass hairline) |
| `--surface-subtle` | `text / .04` | Clean, transparent utility fill (replaces the old glass/sheen layers) |

Each accent ships a matching `-surface` soft-fill (`--accent-teal-surface`, `--accent-mist-surface`)
for tactile badge/pill/hover states. **There is no metal, sheen, or "glass-luxe" layer** — depth comes
from the elevation ladder (§5-adjacent shadows) and tone, not from artificial aesthetic overlays.

### 2.4 Status accent map

The seven semantic status variants and their token bindings — the palette the whole component matrix
is drawn from:

| Variant | Solid token | Soft surface | Hue family |
|---------|-------------|--------------|------------|
| `primary`   | `--status-primary`   | `--status-primary-surface`   | Teal 186 |
| `secondary` | `--status-secondary` | `--status-secondary-surface` | Slate (text-secondary) |
| `success`   | `--status-success`   | `--status-success-surface`   | Emerald 160 |
| `warning`   | `--status-warning`   | `--status-warning-surface`   | Amber 37 |
| `danger`    | `--status-danger`    | `--status-danger-surface`    | Red 0 |
| `info`      | `--status-info`      | `--status-info-surface`      | Ocean 199 |
| `neutral`   | `--status-neutral`   | `--status-neutral-surface`   | Grey 220 |
| `social`    | `--status-social`    | `--status-social-surface`    | Violet 258 |

Text/iconography on a **solid** status fill uses `--on-accent` (`#fff`).

---

## 3. Geometry — the radius ladder & nesting rule

> **Soft outer containers, sharp inner controls.**

The radius ladder is fixed. Every corner in the product resolves to one of these six steps (primitive
in `ui.css`, semantic alias in `system.css`):

| Semantic token | Primitive | Value | Applies to |
|----------------|-----------|-------|------------|
| `--radius-control` | `--border-radius__xsmall` | **4px**  | Checkbox box, chip, swatch, tag, square switch |
| `--radius-field`   | `--border-radius__small`  | **6px**  | Text / select / number / search fields |
| `--radius-button`  | `--border-radius__small`  | **6px**  | Buttons, segmented controls |
| `--radius-card`    | `--border-radius__large`  | **12px** | Standard cards, tiles, list rows |
| `--radius-stage`   | `--border-radius__xlarge` | **16px** | Project-stage containers, panels |
| `--radius-feed`    | `--border-radius__xxlarge`| **22px** | Social feed cards / reels |
| `--radius-pill`    | —                         | **999px**| Pills, avatars, status dots, switch tracks |

### 3.1 The concentric nesting rule (mandatory)

A nested element's radius is **always ≤ its container's radius**, and ideally follows the concentric
formula so corners stay parallel:

```
radius(inner) = radius(outer) − padding(gap between them)
```

Worked example — a button inside a card inside a stage:

```
Project stage   → --radius-stage  (16px)
  └ Card        → --radius-card   (12px)   [16 − 4px inset]
      └ Field   → --radius-field  (6px)
      └ Button  → --radius-button (6px)
          └ Checkbox → --radius-control (4px)
```

You may **never** put a larger radius inside a smaller one (e.g. a 22px feed card inside a 6px
button). Reviewers reject radius inversions.

---

## 4. The Separation Hierarchy — borders are a last resort

> **A full four-sided border is the loudest, heaviest way to separate two things. It is the
> *last* tool we reach for, never the default.** Wrapping every section in a box makes the product
> feel rigid, cramped, and uninspired. We separate content with *space first, tone second, a single
> line third, and a full envelope only when an element earns it.*

The system defines **four tiers of separation**, ordered from lightest to heaviest. A designer (or a
generated component) must always **start at Tier 1 and only step down the ladder when the lighter
tool genuinely fails to establish the hierarchy.** Reaching straight for Tier 4 to "make it look
contained" is the exact anti-pattern this section exists to kill.

### 4.1 The four tiers

| Tier | Tool | Token vocabulary | Use it to separate… |
|------|------|------------------|---------------------|
| **1 — Space** | Asymmetric whitespace / padding rhythm | `rem`-scaled `gap`, `padding`, `margin` (grid/flex) | Adjacent **groups of secondary information** — the default. Related things sit closer; unrelated things sit further apart. Let breathing room, not a line, do the work. |
| **2 — Tone** | Alternating surface tints | `--surface-0` ⇄ `--surface-1` ⇄ `--surface-2` (`--card`, `--mid`, `--header`); `-surface` accent washes | **Secondary dashboard widgets, wells, and layout columns.** Shift the ground plane instead of drawing an outline around it. Row striping, recessed panels, alternating columns. |
| **3 — Line** | A single hair-line divider | `border-bottom: 1px solid var(--hairline)` (or `--border-color` / `--border-subtle`) | **Linear, repeating items** — list rows, table rows, feed items, stacked settings. One razor-thin *side*, never four. The last item drops its rule (`:last-child { border: none }`). |
| **4 — Envelope** | A full four-sided border | `border: 1px solid var(--hairline)` + a radius off the ladder | **Only functional, interactive, or state-driven elements** (see 4.3). The border is doing a *job* — it marks a hit-target, a container of live state, or a movable object — not merely fencing off static content. |

### 4.2 The decision test

Before you write `border: 1px solid …` around a container, answer **in order**:

1. **Can spacing carry it?** If pushing the groups apart (Tier 1) reads clearly, stop. Ship that.
2. **Can a tint carry it?** If the block is a secondary widget or a column, drop it onto
   `--surface-1`/`--surface-2` or an accent `-surface` wash (Tier 2). Stop.
3. **Is it a run of linear items?** Use one hair-line divider per item (Tier 3). Stop.
4. **Does the element *do something*** — is it clickable, draggable, focus-able, or holding a
   changing state? Only then does it earn a full envelope (Tier 4).

If you answered "no" to #4, a full border is **wrong** — go back up the ladder.

### 4.3 When a full envelope *is* correct (the Tier-4 allowlist)

A surrounding border is functional — and therefore encouraged — on:

- **Field inputs & controls** — `TextField`, `SelectField`, `Checkbox`, `Switch`, `TagInput`,
  `Slider` tracks. The border is the affordance: it says "type / toggle here."
- **Active floating layers** — open dropdown menus, popovers, tooltips, command palettes, modals
  (paired with `--elevation-3/4`). The border seals a surface lifted off the page.
- **Movable / operational modules** — a draggable `KanbanCard`, a roster **seat** whose border
  encodes open/filled/closed, a selected data-grid card. The border tracks live state.
- **Interactive cards** — an `EntityCard`, a clickable `MetricCard` shortcut, a nav item — where the
  border participates in `hover` / `focus-visible` / `selected` (border-color shift + `--focus-glow`).

A **static** card, panel, dashboard tile, section, column, or list container is **not** on this list.
It separates with space, tone, a divider, or type hierarchy.

### 4.4 Staying visually interesting (minimal ≠ boring)

Removing boxes must not flatten the page into an undifferentiated sheet. Compensate with **contrast
that costs no ink**:

- **Typographic weight & size hierarchy** — a `650`/`700` heading over `--text-secondary` body over an
  uppercase `0.68rem` `--text-muted` eyebrow separates three ideas with zero borders. Lead with type,
  not lines.
- **Asymmetric spatial rhythm** — vary the gaps (`0.35rem` inside a group, `1.5rem` between groups) so
  structure is *felt*. Even padding everywhere reads as monotony; deliberate asymmetry reads as design.
- **Elevation & accent seams** — a `--shadow-sm` lift or a 3px accent left-rule (`::before`) gives a
  tile identity without fencing it. Concentric radius + a surface shift already imply an edge.

The result is the house style: **airy, tonal, and typographically confident — lines and boxes used
sparingly enough that when one *does* appear, it means something.**

---

## 5. Motion

Two signature curves, three duration·curve pairs. **Structural** motion (layout, reveals) is slow and
expressive; **micro** motion (clicks, toggles) is fast and springy. Motion is where the *kinetic* in
"High-Utility Kinetic" lives — it carries depth and feedback so the surfaces themselves stay crisp.

| Token | Duration | Curve | `cubic-bezier` | Use |
|-------|----------|-------|----------------|-----|
| `--motion-structural` | **620ms** | `--ease-expressive` | `0.19, 1, 0.22, 1` (expo-out) | Layout shifts, stage/page/feed reveals, splitter, accordion, sheet open |
| `--motion-micro` | **250ms** | `--ease-spring` | `0.34, 1.56, 0.64, 1` (overshoot) | Clicks, checkbox/switch toggle, tactile press, hover lift |
| `--motion-standard` | **150ms** | `--ease-standard` | `0.4, 0, 0.2, 1` | The default — hover tint, colour, border transitions |

Companion primitives (available, used inside the pairs): `--fast` 150ms, `--medium` 250ms,
`--slow` 350ms, `--dur-cinematic` 620ms; `--ease-out` `0.22,1,0.36,1`, `--ease-in-out` `0.83,0,0.17,1`.

**Rule:** never write a raw `ms`/`cubic-bezier()` in a component. Compose from a `--motion-*` token
(or a `--fast/--medium/--slow` + `--ease-*` pair). The spring curve is reserved for state-change
micro-interactions; the expressive curve for structural change.

---

## 6. Elevation & focus

### 6.1 Dual-shadow elevation

Every shadow is **two layers**: a soft **ambient** glow (large blur, low alpha — the object's
light bleed) plus a tighter **occlusion** mask (small blur — the contact shadow). This is what makes
surfaces read as physically lifted rather than drop-shadowed.

| Token | Alias | Use |
|-------|-------|-----|
| `--elevation-0` | `none` | Flush / inset |
| `--elevation-1` | `--shadow-sm` | Resting cards, chips |
| `--elevation-2` | `--shadow-md` | Raised cards, hovered tiles, sticky bars |
| `--elevation-3` | `--shadow-lg` | Popovers, dropdowns, floating panels |
| `--elevation-4` | `--shadow-xl` | Modals, command palette, dialogs |

In dark mode the ambient layer goes pure-black and the accent **glows** (`--glow-primary`,
`--glow-violet`, `--glow-teal`) do the "lift" instead, since translucent black is invisible on a
near-black canvas. These are *functional* elevation glows tied to a lifted surface — not free-floating
decorative orbs, which the system rejects.

### 6.2 Focus — the teal glow halo

Interactive elements show a **3px semi-transparent teal glow** on `:focus-visible`:

```css
--focus-glow: 0 0 0 3px hsla(186, 57%, 36%, 0.4);   /* ≡ #28869066 */
```

Danger and social contexts swap the hue via `--focus-glow-danger` / `--focus-glow-violet`. Focus is
**never** removed without a replacement ring — accessibility guardrail.

---

## 7. Typography & z-index (reference)

- **Type family:** `--font-sans` (system stack: `ui-sans-serif, system-ui, -apple-system, Segoe UI,
  Roboto…`); `--font-dyslexia` swaps in OpenDyslexic under the dyslexia theme. Root `font-size:
  14px` (Carbon/Fluent density).
- **Z-index scale** (single source, no `9999` arms race): `--z-nav-content: 10` · `--z-scrollbar: 40`
  · `--z-middle: 50` · `--z-nav: 60` · `--z-dropdown: 1000` · `--z-tooltip: 2000` ·
  `--z-overlay: 9999` · `--z-toast: 10000`. Always reference the token.

---

## 8. Architecture (summary — full detail in `00-architecture.md`)

All standalone, app-independent packages consolidate under one parent, **`@projective/ui`**, consumed
through modern multi-export sub-paths:

| Namespace | Contents |
|-----------|----------|
| `@projective/ui` | Composite surfaces — cards, panels, feed, roster, accordion, splitter, stepper, toast, overlay, ledger + the `DesignSystemProvider`. |
| `@projective/ui/atoms` | Pure presentation primitives — Button, IconButton, Icon, Badge/StatusBadge, Tag, Logo, Ripple, ThemeSwitcher, Media. |
| `@projective/ui/fields` | Input-aware mechanics — TextField, SelectField, Checkbox, **Switch**, StatusSlider, Slider, TagInput, FileDrop, RichText + the wrappers. |
| `@projective/ui/charts` | Gantt, Kanban, gauges, D3 finance (`…/charts/finance`). |
| `@projective/ui/data` | Virtualized tables, lists, chat, carousel, masonry + data hooks. |
| `@projective/ui/time` | The boundless-velocity calendar viewport + schedule minimap (Calendar/TimeClock relocate here from fields). |
| `@projective/ui/files` | The file library / uploader / handover surfaces. |
| `@projective/ui/types` | The folded UI-facing presentation types. |
| `@projective/ui/utils` | Framework-agnostic string / math / colour helpers. |
| `@projective/ui/system` | `DesignSystemProvider` + `useDesignSystem()`. |

**Portability contract:** nothing under `@projective/ui` may import app code (`@server/*`,
`@features/*`, `@/*`). Its only external dependency is `@projective/types` (pure domain contracts,
folding into `@projective/ui/types`). Copying `packages/ui/` into another project works out-of-box.

---

## 9. Contextual theming (summary — full detail in `02-context-theming.md`)

`<DesignSystemProvider>` re-scopes the token system for any app / page / subtree at runtime:

```tsx
import { DesignSystemProvider } from '@projective/ui/system';

<DesignSystemProvider density="compact" radius="sharp" accent="teal">
  {/* data-dense workspace: tight controls, crisp corners */}
</DesignSystemProvider>

<DesignSystemProvider accent="violet" surface="card">
  {/* a social feed surface running on the velvet lane */}
</DesignSystemProvider>
```

The provider stamps `data-ds-density | data-ds-radius | data-ds-accent | data-ds-motion` on a
`display:contents` wrapper; the `[data-ds-*]` rules in `system.css` re-scope tokens for the subtree.
Nesting is hierarchical — a child provider merges over its parent. Components read the resolved config
with `useDesignSystem()` to compute modifier classes / fallback styles from their placement.

---

## 10. The state & variant model (summary — full detail in `03-state-variant-model.md`)

Every interactive component is specified against the same grid so behaviour is predictable
system-wide:

- **Status variants:** `primary · secondary · success · warning · danger · info · neutral` (+ `social`).
- **Behavioural states:** `default · hover · focus · active · selected · disabled`.
  - `hover` → −8% lightness delta (`--hover-delta`) or a `-surface` fill.
  - `focus` → `--focus-glow` (3px teal .4 halo), never removed.
  - `active` → −12% delta (`--active-delta`) **+** a `translateY(--press-translate)` tactile press.
  - `selected` → solid accent or `-surface` tint + accent border.
  - `disabled` → `--text-disabled` foreground on a grey structural fill (`--disabled-bg`), no shadow,
    no pointer.

---

## 11. Guardrails (enforced; mirrored in `CLAUDE.md`)

A change is **rejected** in review if it:

1. **Hard-codes a colour** (`#hex`, `rgb()`, `hsl()` literal) in a component — use a token.
2. **Bypasses the CSS-variable system** — new colours/radii/durations must land as tokens in
   `apps/web/styles/themes/variables/`, not inline magic numbers.
3. **Mixes fields with structural data** — input mechanics (`/fields`) and data presentation (`/data`)
   stay in their own namespaces; a data table must not embed a bespoke input, and vice-versa.
4. **Violates the radius nesting rule** — a larger radius nested inside a smaller one, or a raw px
   radius off the ladder.
5. **Imports app code into a package** (`@server/*`, `@features/*`, `@/*`) — breaks portability.
6. **Removes focus** without a replacement ring, or **hardcodes motion** (`ms`/`cubic-bezier`) off the
   `--motion-*` tokens.
7. **Defaults to boxing a static layout section in a full four-sided border** (§4). A static card,
   panel, tile, column, section, or list container must establish hierarchy with **layout spacing,
   colour blocking (surface tint), a single hair-line divider, or typographic weight/size contrast**
   first. A full enclosing border is reserved for functional, interactive, or state-driven elements
   (fields, active dropdowns/menus, draggable modules, clickable cards — the §4.3 allowlist).

> **Migration status:** the extraction audit that produced the component matrices logged ~279 existing
> inline-value violations across the tree. The **atoms and fields layers are now migrated** onto the
> semantic tokens (see [`components/atoms.md`](components/atoms.md) and
> [`components/fields.md`](components/fields.md)): atoms — Button…Logo, with the `theme-toggle`
> decorative palette moved into `--tt-*` tokens in `colour.css`; fields — all inputs/wrappers, with
> newly-defined `--field-*` type-scale/spacing tokens and the `--scrim` / `--on-accent-muted` /
> `--on-accent-subtle` additions to `system.css`. The remaining layers (surfaces, charts,
> data/time/files) are logged per component under `components/` and are the next migration steps — new
> code must not add to them.
