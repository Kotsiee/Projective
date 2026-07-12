# Surfaces, Containers & Overlays — State & Variant Matrices

> **✅ Migration status — surfaces layer MIGRATED (raw-value-clean).** All ~30 surface/container/overlay
> stylesheets now run on the semantic token system: raw `box-shadow` literals → `--elevation-1..4`
> (cards→1/2, popovers/dropdowns/toasts→3, modals/lightbox→4); `999px`/`50px`/`9999px` → `--radius-pill`;
> card/panel/feed radii → `--radius-card`/`--radius-stage`/`--radius-feed`; chips → `--radius-control`;
> raw white-on-accent → `--on-accent`/`--on-accent-muted`/`--on-accent-subtle`; modal/media/drag scrims →
> `--scrim` (+ new `--scrim-strong` for media-overlay buttons); entity-card type accents unified onto
> `--ocean`/`--ember`/`--forest`/`--neutral`; raw-ms transitions → `--motion-*`; backdrop blurs →
> `--glass-blur*`; `--focus-ring`→`--focus-glow` (added missing focus rings, e.g. the splitter gutter).
> A `grep` sweep confirms zero raw hex/rgba/`999px`/legacy-focus-ring/dead-fallback remain in
> `packages/ui/src/styles/components` (intentional keeps: keyframe loop durations, the Avatar generative
> hue, the theme-neutral skeleton shimmer). The `⚠ Guardrail violations found` blocks below are the
> **pre-migration audit record**. Correction: one audit claim (status colours → `#fff` in dark mode via
> `themes/dark.css:26-28`) is a **false alarm** — that legacy theme file is unimported dead code (theming
> runs through `colour.css`'s `:root[data-theme='dark']`).

This document is the exhaustive behavioral reference for the surface, container, and overlay
components in `@projective/ui` (`packages/ui/src/components/`): every visual variant crossed with
every interaction state, sourced directly from each component's `.tsx` and its paired stylesheet in
`packages/ui/src/styles/components/*.css`. It exists so a future engineer can build or restyle a
surface without re-reading the source — every cell below is a fact read out of code, not an
assumption. Where a state genuinely isn't styled, the cell says so explicitly ("inherits default" or
"—") rather than inventing a value; where the source hard-codes a raw hex/hsl/px/ms instead of
reaching for a design token, or reaches for a token whose literal fallback value doesn't match the
token's real resolved value, it is called out under "⚠ Guardrail violations found" with the exact
`file:line` and the token that should replace it. Token names in prose are given in the canonical
semantic vocabulary (`--radius-card`, `--elevation-2`, `--motion-standard`, `--status-danger`, …)
defined in `apps/web/styles/themes/variables/system.css`; where the source actually reads the older
primitive it aliases (`--border-radius__large`, `--shadow-md`, `--fast`, `--danger`, …) that literal
is quoted alongside it so the mapping is traceable.

---

### Card
- **Import:** `import { Card, CardSkeleton } from '@projective/ui'`
- **Source:** `packages/ui/src/components/card/Card.tsx` (+ `CardSkeleton.tsx`) · **Style:** `packages/ui/src/styles/components/card.css`
- **Radius:** `--radius-card` intended — CSS reads `var(--border-radius__large, 20px)` ⚠ (fallback `20px` doesn't match the real 12px value) · **Elevation:** none of the four steps — raw `box-shadow` literals, no `--elevation-*`/`--shadow-*` token at all ⚠ · **Motion:** none of the three — hardcoded `transition: all 0.2s ease` (200ms) ⚠, not `--motion-standard`/`--motion-micro`
- **Purpose:** The original grid/list media card (banner image, owner chip, tags, footer meta) — the older of two coexisting card systems in this package (see `EntityCard` below for the newer one).
- **Variants:** `layout`: `'grid'` (default) · `'list'` · `'masonry'` (declared in the type but has **no distinct CSS branch** — renders identically to `'grid'`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| grid (default) | bg `var(--card)`, `box-shadow: 0 2px 8px rgba(0,0,0,.1)` ⚠, radius `var(--border-radius__large, 20px)` ⚠ | bg `var(--card-hover)`, `box-shadow: 0 4px 16px rgba(0,0,0,.25)` ⚠, `cursor:pointer`; banner foreground `scale(1.02)`, banner backdrop `blur(32px)` + `scale(1.02)` + `opacity:.9`; owner chip nudges up-left by `4px` | — (no `:focus-visible` rule in card.css; root has no `tabIndex`) | — (no JS-toggled active/expanded class) | — | — (no `disabled` prop/state exists) |
| list (`card--list`) | same visual treatment, `flex-direction:row`, fixed `height:220px` ⚠, header column `width:300px` ⚠ | inherits grid's hover deltas (same nested rules) | — | — | — | — |

**Anatomy & tokens:** `--image-height:200px` / `--image-padding:.75rem` (component-local raw px vars); owner chip `background: hsla(var(--bg-hue),var(--bg-saturation),var(--bg-lightness),.65)`, `border-radius:50px` ⚠ (should be `--radius-pill`); owner avatar `32px` circle, `outline:1px solid var(--primary)`; tag pill `background:var(--primary-half)`, `outline:1px solid var(--primary)`, `border-radius:50px` ⚠. No `backdrop-filter`.
**Behavioral notes:** Root `<div onClick>` with no `role`/`tabIndex`/`onKeyDown` — clickable but not keyboard-operable. Inner interactive elements (owner link, action/menu buttons, tag buttons) call `e.stopPropagation()` to avoid double-firing the card's own `onClick`. `props.type` (an arbitrary consumer string) is injected directly as a raw class name alongside `card`/`card--list`. `CardSkeleton` mirrors the same `card`/`card--list` root classes with `aria-hidden='true'` and composes `<Skeleton>` primitives (see **Skeleton** below) for banner/owner/title/description placeholders — it does not introduce any new CSS of its own.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/card.css`):
- `:5` — `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)` — raw rgba, no `--elevation-1` token.
- `:6, :95` — `border-radius: var(--border-radius__large, 20px)` (×2) — fallback `20px` doesn't match the real `--radius-card` value (12px).
- `:8, :42, :96` — `transition: all 0.2s ease` (×3) — raw `200ms`, not `--motion-standard`(150ms)/`--motion-micro`(250ms).
- `:16, :20` — `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25)` (×2, base hover + banner foreground hover) — raw rgba, no elevation token.
- `:25` — `filter: blur(32px)` — raw px blur (banner backdrop hover intensifies from the base 24px).
- `:50, :155` — `border-radius: 50px` (owner chip, tag pill) — raw px pill; should be `--radius-pill`.
- `:100` — `filter: blur(24px)` — raw px blur (banner backdrop resting state).

---

### ListCard
- **Import:** `import { ListCard, ListCardSkeleton } from '@projective/ui'`
- **Source:** `packages/ui/src/components/card/ListCard.tsx` (+ `ListCardSkeleton.tsx`) · **Style:** `packages/ui/src/styles/components/list-card.css`
- **Radius:** none at root (flat divider row); dead hover rule references `var(--border-radius__small, 8px)` — see notes · **Elevation:** none · **Motion:** `--motion-standard` (`var(--fast, 150ms) ease`, clean match)
- **Purpose:** A dense, borderless list row (thumbnail + title/subtitle/description/footer) for feed-style listings — no image slot is actually rendered by the live component.
- **Variants:** single visual — no `variant`/`size`/`tone` prop exists.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| single visual | flex row, `border-bottom:1px solid var(--border-color)`, `background:transparent`, full width | **dead CSS**: `.list-card[role='button']:hover` sets `background:var(--input-bg)`, radius `var(--border-radius__small, 8px)`, negative margins — but the component hardcodes `role='article'`, never `role='button'`, so this rule never fires ⚠ | same dead selector as hover (`[role='button']:focus-visible`) — never fires | — | — | — |

**Anatomy & tokens:** root is a real `<a href>` with `role='article'` (hardcoded) and native `onClick`; `list-card__image` (commented out of the live JSX — dead layout reserved for `ListCardSkeleton`) would be `120px × 120px`, `border-radius: var(--border-radius__large, 16px)` (→ `--radius-stage`, not `--radius-card`); responsive `@media (max-width:768px)` stacks to column, image `180px` tall (raw). No `backdrop-filter`.
**Behavioral notes:** No `variant` prop at all. `role='article'` is a static, non-interactive semantic despite the row being a clickable `<a>` — the `[role='button']` hover/focus rules in the CSS are legacy/dead code from an earlier implementation and never apply to the current markup. `ListCardSkeleton` renders the (dead-in-prod) image-container structure to reserve layout space, composing `<Skeleton>` primitives; no independent CSS.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/list-card.css`):
- `:13-27` — entire `.list-card[role='button']` hover/focus block is dead code (selector never matches the component's actual `role='article'` markup) — not a token violation per se, but a real drift/dead-CSS issue worth flagging.
- `:39` — `border-radius: var(--border-radius__large, 16px)` on `.list-card__image` — resolves to `--radius-stage` (16px), inconsistent with the card family's usual `--radius-card` (12px), and moot anyway since the image markup is commented out.

---

### EntityCard
- **Import:** `import { EntityCard, ServiceCard, ProfileCard, ProjectCard, ProductCard } from '@projective/ui'` (`ServiceCard`/`ProfileCard`/`ProjectCard`/`ProductCard` are one-line wrappers: `<EntityCard {...props} variant='…' />` — no `compact` wrapper exists, it's only reachable by calling `EntityCard` directly)
- **Source:** `packages/ui/src/components/cards/EntityCard.tsx` (386 lines) · **Style:** `packages/ui/src/styles/components/cards/entity-card.css`
- **Radius:** `--radius-card` (`var(--border-radius__large)`, no fallback — clean) · **Elevation:** `--elevation-3` on hover (`var(--shadow-lg, …)`); resting flat · **Motion:** mixed — `transform`/`border-color` use `--motion-standard`-duration (`var(--fast) ease`, non-canonical plain easing); `box-shadow` uses `--motion-micro`-duration (`var(--medium) ease`, non-spring easing)
- **Purpose:** The unified entity/discovery card foundation — one component rendering five structurally distinct layouts (service, profile, project, product, compact) driven by `variant`, with a shared accent system, sponsored badge, save/share/kebab action cluster, and hover-lift interaction.
- **Variants:** `variant`: `'service'` (default) · `'profile'` · `'project'` · `'product'` · `'compact'`. Orthogonal: `accent` (8-way: `mint`/`violet`/`amber`/`primary` token-driven, `ocean`/`ember`/`forest`/`neutral` hardcoded HSL literals ⚠), `active`, `entity.is_sponsored`, `entity.availability` (profile only: `available`/`busy`/`unavailable`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| service / profile (fallback branch) | bg `var(--card)`, border `1px solid var(--hairline)`, radius `--radius-card`; profile banner `92px` tall vs. service's `116px` (raw px) | `translateY(-4px)`, border → `var(--accent)`, `box-shadow: --elevation-3, 0 0 0 1px var(--accent-surface)`; `.entity-card__actions` fades in (`opacity:1`) via ancestor `:hover` | `border-color:var(--accent)`, `box-shadow:var(--focus-ring)` (functionally `--focus-glow`) | `.is-active` → border+shadow pinned to `var(--accent)` (`0 0 0 1px var(--accent), 0 14px 40px -18px rgba(0,0,0,.6)` ⚠ hand-duplicated shadow, not `--elevation-3`) | same as active/expanded (no separate selected state) | — (no disabled prop) |
| project | `flex-direction:row`-free block layout; `.entity-card__actions` **always visible** (`opacity:1`, overrides the hover-reveal since there's no banner to hover over) | same lift/border/shadow as base | same focus ring | `.is-active` same base treatment | — | — |
| product | `background:transparent; border:none` (no card chrome — all framing lives on the inner `.entity-card__poster`) | `translateY(-3px)` (shallower than base `-4px`), `box-shadow:none` on the card itself; poster gets `border-color:var(--hairline-strong)` + `box-shadow:0 16px 44px -18px rgba(0,0,0,.7)` ⚠ | inherits base rule (poster has no distinct focus style) | `.is-active` inherits base | — | — |
| compact | `flex-direction:row; align-items:center; height:auto; padding:.55rem .7rem` | **no lift**: `transform:none; box-shadow:none; border-color:var(--hairline-strong)` only | inherits base focus ring | `.is-active` → `border-color:var(--accent); background:var(--accent-surface); box-shadow:none`; indicator icon recolors to `var(--accent)`; root also sets `aria-current` (only variant that does) | — | — |

**Anatomy & tokens:** accent pairs `--accent`/`--accent-surface` per `accent-{mint\|violet\|amber\|primary}` (token-driven) vs. `accent-{ocean\|ember\|forest\|neutral}` (raw `hsl()`/`hsla()` literals ⚠, `entity-card.css:71-86`); sponsored badge `color:var(--amber); background:var(--amber-surface); border:1px solid var(--sponsored-frame); border-radius:999px` (raw, `--radius-pill` value unwrapped); taxonomy flag `color:#fff ⚠; background:rgba(0,0,0,.42) ⚠; backdrop-filter:blur(4px)` (no `-webkit-` prefix, no blur token); face-action button `30px` circle, `color:#fff ⚠; background:rgba(0,0,0,.42) ⚠; backdrop-filter:blur(6px)` (no prefix, no token); kebab menu popover `min-width:172px`, `box-shadow:0 18px 44px -16px rgba(0,0,0,.7)` ⚠; availability dot: `available` → `var(--mint)` + `0 0 0 3px var(--mint-surface)` ring, `busy` → `var(--amber)` + ring, `unavailable` → `var(--danger)` with **no ring** (asymmetric).
**Behavioral notes:** All variant roots render `<article onClick={activate} tabIndex={0}>` with **no `onKeyDown`** — focusable via Tab but Enter/Space do not activate it (keyboard-operability gap). `activate()` calls `onSelect(entity)` if provided, else navigates `href` directly via `globalThis.location.href`. Owner-link and tag-button clicks call `stopPropagation()`. `entity-card--selectable` class is added whenever `onSelect` is passed but **has no matching CSS rule anywhere** — dead hook class. `.is-active` is overloaded: means "this card is the selected entity" at the card root, but also drives the Save button's pressed look at `.entity-card__action.is-active` — same class name, two unrelated semantics disambiguated only by which element it's on. `CardActions` (see below) is the face-action cluster rendered inside every variant.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/cards/entity-card.css`):
- `:39` — `box-shadow: var(--shadow-lg, 0 14px 40px -18px rgba(0, 0, 0, 0.65))` — literal rgba fallback.
- `:50-51` — `.is-active` box-shadow hand-rolled as `0 0 0 1px var(--accent), 0 14px 40px -18px rgba(0, 0, 0, 0.6)` instead of composing `--elevation-3`.
- `:71-86` — `accent-ocean`/`accent-ember`/`accent-forest`/`accent-neutral` set `--accent`/`--accent-surface` to raw `hsl()`/`hsla()` literals instead of referencing `--ocean`/`--ember`/`--forest`/`--neutral` tokens (which exist in `colour.css`).
- `~145-158` — `.entity-card__flag`: `color:#fff`, `background:rgba(0,0,0,.42)`, `border:1px solid rgba(255,255,255,.32)`, `backdrop-filter:blur(4px)` with no `-webkit-backdrop-filter` fallback and no blur token.
- `~187-200` — `.entity-card__action`: same `color:#fff` / `rgba(0,0,0,.42)` / `backdrop-filter:blur(6px)` pattern, no prefix, no token.
- `~213-257` — kebab menu: `box-shadow:0 18px 44px -16px rgba(0,0,0,.7)`; `min-width:172px` raw.
- `~365 (status--danger)` — `background: rgba(0, 0, 0, 0.04)` — near-transparent black instead of a `--status-danger-surface` token.
- `~453-509 (product hover)` — `box-shadow: 0 16px 44px -18px rgba(0, 0, 0, 0.7)` on poster hover.
- `entity-card--selectable` — dead CSS hook, class emitted with zero matching rule.

---

### CardActions
- **Import:** `import { CardActions } from '@projective/ui'`
- **Source:** `packages/ui/src/components/cards/CardActions.tsx` · **Style:** `packages/ui/src/styles/components/cards/entity-card.css` (`.entity-card__actions`/`__action`/`__menu*` — no dedicated stylesheet of its own)
- **Radius:** `--radius-pill` (999px, action buttons/menu chip) mixed with `var(--border-radius)` (8px, unaliased primitive, menu popover) · **Elevation:** menu popover only, raw `box-shadow` literal ⚠, no elevation token · **Motion:** `--motion-standard`-ish (`var(--fast) ease`)
- **Purpose:** The Save / Share / kebab-menu action cluster embedded in every `EntityCard` variant — a controlled/uncontrolled toggle for "saved" plus a click-outside menu popover.
- **Variants:** single visual — save/share/kebab buttons are always the same three; only their `is-active`/`aria-expanded` state varies.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| Save button | `color:#fff ⚠; background:rgba(0,0,0,.42) ⚠` (inherits `.entity-card__action`) | `background:rgba(0,0,0,.62) ⚠; transform:scale(1.08)` | inherits `EntityCard`'s ancestor focus-reveal (no dedicated ring on the button itself) | `aria-pressed=true` → `.is-active`: `color:var(--primary); background:rgba(0,0,0,.6) ⚠` | — | — |
| Share button | same base as Save | same hover | — | — (stateless, calls `navigator.share`/clipboard fallback) | — | — |
| Kebab button | same base | same hover | — | `aria-expanded=true` when menu open (no distinct visual, only the popover mounting) | — | — |
| Menu item | `color:var(--text-main)` implicit | `background:var(--button-hover, rgba(255,255,255,.08))` ⚠ | — | — | — | — |
| Menu item (danger) | `color:var(--danger)` (→ `--status-danger`) | inherits item hover | — | — | — | — |

**Anatomy & tokens:** root `<div class='entity-card__actions' onClick={stop}>` stops all propagation so nothing inside triggers the parent card's `activate()`. Save button: `aria-pressed`/dynamic `aria-label` (correct toggle semantics). Kebab: `aria-haspopup='menu'`, `aria-expanded`. Menu: `role='menu'`, items `role='menuitem'`; backdrop is a full-viewport click-catcher with **no Escape-key handler**.
**Behavioral notes:** `isSaved = saved ?? internalSaved.value` — controlled/uncontrolled fallback via `@preact/signals`. `share()` tries `navigator.share`, falls back to clipboard write, both errors silently swallowed (`.catch(() => {})`). Default menu item when `menuItems` omitted: single `{ label:'Report Listing', danger:true, onSelect:() => {} }` — a no-op by default.
**⚠ Guardrail violations found:** inherits all of `EntityCard`'s `.entity-card__action`/`.entity-card__menu*` violations listed above (raw `#fff`/`rgba()`/unprefixed `backdrop-filter`) — not re-cited here to avoid duplication.

---

### RosterCard
- **Import:** `import { RosterCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/cards/RosterCard.tsx` (162 lines) · **Style:** `packages/ui/src/styles/components/cards/roster-card.css`
- **Radius:** `--radius-card` (`var(--card, var(--background))` … `var(--border-radius__large, 12px)`, fallback matches — clean) · **Elevation:** none (no shadow token anywhere in file) · **Motion:** mixed `--motion-standard` (`var(--fast, 150ms)` border-color) + `--medium, 300ms` ⚠ (box-shadow fallback doesn't match the real 250ms value)
- **Purpose:** A stage-seat roster tile — required skills, budget, and either an applicant queue (with Assign action) or the filled assignee, driven entirely by a `status` prop.
- **Variants:** `status`: `'open'` · `'filled'` · `'closed'` — the sole variant axis, applied as `roster-card--{status}` (not toggled by hover/focus, but by the data itself).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| open | border `1px solid var(--hairline, var(--border-color))`; status pill `color:var(--primary); background:var(--primary-surface, color-mix(…))` | `border-color:var(--hairline-strong, var(--border-color))` — **only `open` has a hover rule** | — (no `:focus-visible` in file) | — | — | Assign/Apply buttons: `disabled` HTML attr → `opacity:.55; cursor:not-allowed` |
| filled | `border-color: color-mix(in srgb, var(--complete, var(--success, var(--primary))) 40%, var(--border-color))`; status pill `color:var(--complete,…)` | **no hover rule** (inherits default border) | — | assignee row replaces applicant list | — | — |
| closed | status pill `color:var(--text-muted, var(--text-secondary)); background:color-mix(…, var(--text-muted, gray) …)` ⚠ (deepest fallback is the raw named color `gray`) | **no hover rule** | — | — | — | — |

**Anatomy & tokens:** skill chip `border-radius:var(--border-radius__xsmall, 4px)` (→ `--radius-control`, clean); team-avatar chip `28px`, `border-radius:8px` (raw, unaliased); Assign/Apply buttons `color:#fff` ⚠ (hardcoded, not `--on-accent`), `background:var(--primary)`, hover `filter:brightness(1.06)` (literal factor, not a token-driven state). Applicant status badges: only `--accepted` is styled (`color:var(--complete,…)`); `--rejected`/`--withdrawn` fall back to the base color, no distinct treatment.
**Behavioral notes:** No `role`/`tabIndex`/`aria-*` anywhere — purely a display card with two native `<button>`s (Assign, Apply) using real `disabled` HTML semantics. Assign button only renders when `canAssign && applicant.status==='pending' && onAssign`. Apply footer only renders when `onApply && status==='open'`.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/cards/roster-card.css`):
- `~closed status` — deepest fallback chain resolves to the raw named color `gray`, not a token.
- `~__assign, ~__apply` — `color: #fff` hardcoded instead of `--on-accent`.
- `~status pill` — box-shadow-adjacent transition fallback `var(--medium, 300ms)` doesn't match the real `--medium` value (250ms).

---

### FileHandoverCard
- **Import:** `import { FileHandoverCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/cards/FileHandoverCard.tsx` · **Style:** `packages/ui/src/styles/components/file-handover-card.css`
- **Radius:** `--radius-card` (`var(--border-radius__large, 12px)`, fallback matches — clean) · **Elevation:** `--elevation-3` resting (`var(--shadow-lg)`) · **Motion:** none of the three cleanly — bespoke keyframe choreography with raw durations ⚠
- **Purpose:** A celebratory "IP/files unlocked" handover panel shown at project completion — diagonal sheen sweep, icon pop, and staggered row entrance on mount.
- **Variants:** single visual — no `variant` prop; all sections are conditional on data presence (`ipMode`, `fileCount`, `unlockedAt`, `onDownloadAll`), not a variant axis.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| single visual | bg `var(--card)`, border `1px solid var(--hairline)`, `box-shadow:var(--shadow-lg)`; `::before` diagonal sheen animates once on mount (`1.6s` ⚠, `.35s` delay ⚠); hero icon "pops" in (`var(--slow, 500ms)`, spring-fallback curve); each `.handover-card__row` staggers in at `90ms` increments ⚠ (`nth-of-type`-keyed, fragile if a row is conditionally absent) | download button: `translateY(-1px); box-shadow:0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent); background:color-mix(in srgb, var(--primary) 88%, var(--mint))` | download button: `box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 40%, transparent)` (functionally `--focus-glow`, but hand-built rather than referencing the token) | — | — | — |

**Anatomy & tokens:** hero icon `52px`, `background:linear-gradient(135deg, color-mix(…,var(--primary) 88%, var(--mint)), var(--mint))`, `color:hsl(0,0%,100%)` (literal white via `hsl()`, not `#fff` and not `--on-accent`); headline uses gradient-text-clip (`background-clip:text` + `-webkit-text-fill-color:transparent`) from `var(--primary)`→`var(--mint)`; IP badge `background:color-mix(in srgb, var(--mint) 14%, transparent)`. `@media (prefers-reduced-motion:reduce)` explicitly disables all four animations/transitions — the one card in this set with full reduced-motion coverage.
**Behavioral notes:** No `role`/`aria-*`/`tabIndex` besides `aria-hidden='true'` on decorative icons. `ipModeLabel()` humanizes unknown `ipMode` keys via `split('_')` + capitalize fallback. Download button is a plain `<button onClick={onDownloadAll}>`.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/file-handover-card.css`):
- `~handover-sheen` — `animation: handover-sheen 1.6s var(--ease-out, ease-out) 0.35s both` — raw `1.6s` duration and `0.35s` delay, not tokenized.
- `~__row` — four `nth-of-type` `animation-delay` values (`90ms`,`180ms`,`270ms`,`360ms`) hand-authored as raw literals.
- `~__hero-icon` — `color: hsl(0, 0%, 100%)` literal white instead of `--on-accent`.
- `~__download` — `color: hsl(0, 0%, 100%)` same pattern.

---

### GlassPanel
- **Import:** `import { GlassPanel } from '@projective/ui'`
- **Source:** `packages/ui/src/components/panel/GlassPanel.tsx` · **Style:** `packages/ui/src/styles/components/glass-panel.css`
- **Radius:** `--radius-card` intended — `var(--border-radius__large, 16px)` ⚠ (16px fallback is actually `--radius-stage`'s value, not `--radius-card`'s 12px) · **Elevation:** `--elevation-2` base (`var(--shadow-md, …)`) → `--elevation-3` on `strong` tone (`var(--shadow-lg, …)`) · **Motion:** none — fully static surface, no transitions anywhere
- **Purpose:** The reference frosted-glass container — the only component in this package that pairs `backdrop-filter` with its `-webkit-` prefix and a real blur token. Structural header/body layout for dashboards and workspace panels.
- **Variants:** `tone`: `'panel'` (default, no dedicated CSS rule — styled purely via the base selector) · `'strong'` (heavier glass fill + deeper shadow). Orthogonal: `flush` (removes body padding).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| panel (default) | `background:var(--glass-panel, hsla(210,20%,100%,.65))`, `border:1px solid var(--glass-hairline, hsla(0,0%,100%,.12))`, `box-shadow:--elevation-2`, `backdrop-filter:blur(var(--glass-blur, 18px)) saturate(140%)` + `-webkit-` pair, `::before` premium top sheen (`var(--grad-brand-soft, …)`, `opacity:.6`) | — (non-interactive) | — | — | — | — |
| strong | `background:var(--glass-panel-strong, hsla(210,20%,100%,.85))`, `box-shadow:--elevation-3` — **only property change**; blur/border stay identical to `panel` despite the doc-comment implying "frost intensity" also changes | — | — | — | — | — |

**Anatomy & tokens:** `isolation:isolate` creates its own stacking context so the `::before` sheen layers correctly beneath header/body content (both explicitly `z-index:1`); header `padding:1.15rem 1.35rem .9rem`, `border-bottom:1px solid var(--glass-hairline, hsla(0,0%,100%,.1))` (note: `.1` alpha here vs `.12` on the outer border — inconsistent fallback alpha for conceptually the same hairline); title `font-weight:650` (non-standard weight step); `flush` prop's only effect is `.glass-panel--flush .glass-panel__body { padding:0 }`.
**Behavioral notes:** Header only renders if `title || subtitle || actions` is truthy — otherwise no `<header>` DOM at all. Pure structural/layout container: no `role`, no interactive handlers, no hover/focus states of any kind.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/glass-panel.css`):
- `:6` — `border-radius: var(--border-radius__large, 16px)` — fallback mismatches the real `--radius-card` value (12px).
- `:5-9` — `hsla(210, 20%, 100%, 0.65)` / `hsla(0, 0%, 100%, 0.12)` / `hsla(0, 0%, 0%, 0.12)` fallback literals on `background`/`border`/`box-shadow`.
- `:24` — `saturate(140%)` — literal, not tokenized.

---

### QuickActionCard
- **Import:** `import { QuickActionCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/panel/QuickActionCard.tsx` · **Style:** `packages/ui/src/styles/components/quick-action-card.css`
- **Radius:** `--radius-card` intended — `var(--border-radius__large, 14px)` ⚠ (14px fallback wrong, real value is 12px) · **Elevation:** hover-only glow, not the elevation ladder (`var(--glow-primary, …)`) · **Motion:** `--motion-micro`-duration but non-spring — `var(--medium, 220ms)` ⚠ (220ms fallback mismatches real 250ms) paired with `var(--ease-out)`
- **Purpose:** A polymorphic quick-launch tile (icon + title + description) rendered as `<a>`, `<button>`, or a non-interactive `<div>` depending on props — used in dashboard/quick-actions rails.
- **Variants:** `accent`: `'primary'` (default, no CSS rule — implicit base) · `'mint'` · `'violet'` · `'amber'`. Orthogonal: `disabled`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| primary (implicit) | `--qa-accent:var(--primary, hsl(186,57%,40%))`; `background:var(--glass-bg, linear-gradient(160deg, hsla(0,0%,100%,.14), hsla(0,0%,100%,.04)))` — translucent, but **no `backdrop-filter`** despite the glass-styled gradient | `translateY(-2px); box-shadow:var(--glow-primary, 0 10px 28px -10px hsla(186,57%,40%,.5))` | inherited from `RippleSurface` (not inspected here — no rule in this file) | — | — | `.quick-action--disabled { opacity:.5; cursor:not-allowed; pointer-events:none }` **and** the JS renders a plain `<div aria-disabled='true'>` instead of the interactive element — double-enforced |
| mint | `--qa-accent:var(--mint,…); --qa-surface:var(--mint-surface,…)` | same hover lift, glow color follows accent implicitly (icon chip only; the glow itself is always `--glow-primary`, not accent-matched) | — | — | — | — |
| violet | `--qa-accent:var(--violet,…); --qa-surface:var(--violet-surface,…)` | same | — | — | — | — |
| amber | `--qa-accent:var(--amber,…); --qa-surface:hsla(38,92%,55%,.15)` ⚠ (no token wrapper at all, unlike mint/violet) | same | — | — | — | — |

**Anatomy & tokens:** icon chip `2.4rem` square, `border-radius:12px` (raw, unaliased, though numerically = `--radius-card`); description single-line truncated (`text-overflow:ellipsis`, unlike `EntityCard`'s 2-line clamp).
**Behavioral notes:** Element type is chosen by `href ? 'a' : 'button'` **regardless of whether `onClick` is also provided** — the doc-comment ("Ignored when `onClick` is provided") doesn't match this code (`href` always wins the element-type decision). Delegates the actual ripple/press effect to `RippleSurface` (`premium` prop), not inspected in this file.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/quick-action-card.css`):
- `:4-5` — `--primary, hsl(186, 57%, 40%)` / `--primary-surface, hsla(186, 57%, 40%, .12)` fallback literals (the same hand-duplicated "brand teal" appears 3× across this file and `glass-panel.css`).
- `:7` — `border-radius: var(--border-radius__large, 14px)` — mismatched fallback (should be 12px).
- `:35` — `.quick-action--amber { --qa-surface: hsla(38, 92%, 55%, 0.15) }` — no token reference at all, inconsistent with mint/violet's `var(--{accent}-surface, …)` pattern.
- `:72` — `box-shadow: var(--glow-primary, 0 10px 28px -10px hsla(186, 57%, 40%, 0.5))` — literal fallback repeating the brand-teal hardcode.
- No `:focus-visible` rule in this file (relies entirely on `RippleSurface`, unverified here).

---

### MetricCard
- **Import:** `import { MetricCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/metric/MetricCard.tsx` · **Style:** `packages/ui/src/styles/components/metric-card.css`
- **Radius:** `--radius-card` (`var(--border-radius__large, 12px)`, fallback matches — clean) · **Elevation:** `--elevation-1` resting (`var(--shadow-sm)`) → `--elevation-2` hover (`var(--shadow-md)`) · **Motion:** `--motion-standard` (`var(--fast, 150ms) ease` ×3, clean duration)
- **Purpose:** A KPI tile — left accent bar, icon chip, value, and an optional up/down/flat delta pill — polymorphic root (`<a>`/`<button>`/`<div>`) depending on `href`/`onClick`.
- **Variants:** `accent`: `'primary'` (default — has its own explicit, redundant modifier class) · `'mint'` · `'violet'` · `'amber'` · `'success'` · `'danger'` · `'neutral'` (7-way, all 7 explicitly styled — the only accent-driven surface in this set with zero missing modifier classes).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| primary / mint / violet / amber / success / danger / neutral | `--metric-accent` set per accent (all 7 token-driven, e.g. `var(--danger)`, `var(--mint)`); left `::before` accent bar `3px` wide, `opacity:.85`; icon chip `30px`, `background:color-mix(in srgb, var(--metric-accent) 15%, transparent)` | *(only if `interactive`, i.e. `href`/`onClick` present)*: `translateY(-2px); box-shadow:--elevation-2; border-color:color-mix(in srgb, var(--metric-accent) 40%, var(--hairline))` | *(interactive only)*: `box-shadow:var(--focus-ring)` (functionally `--focus-glow`) | — | — | — (no disabled prop) |
| delta pill (sub-element) | tone resolved from `delta.tone ?? (direction==='up'?'success':direction==='down'?'danger':'neutral')`, class `metric-card__delta--{tone}` | — | — | — | — | — |

**Anatomy & tokens:** non-interactive render (no `href`/`onClick`) is a plain `<div>` with `cursor:default` — no `role` added in either case (relies on native `<a>`/`<button>` semantics when interactive). Delta icon: `IconArrowUpRight`/`IconArrowDownRight`/`IconArrowRight` by direction, `aria-hidden='true'`.
**Behavioral notes:** `interactive = !!href || !!onClick` gates both the `cursor:pointer`/hover-lift class and the polymorphic element choice.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/metric-card.css`):
- `:13` — `border-radius: var(--border-radius__large, 12px)` fallback is correct, no issue — listed for completeness only.
- `:61-63` — three `var(--fast, 150ms)` fallbacks — correct values, no drift, but still fallback-on-a-token that should be guaranteed to exist.
- `:90` — `border-radius: var(--border-radius__small, 6px)` on icon chip — fallback correct.
- Otherwise clean — this is the most token-disciplined accent surface documented in this file.

---

### MetricPlaceholder
- **Import:** `import { MetricPlaceholder } from '@projective/ui'`
- **Source:** `packages/ui/src/components/metric/MetricPlaceholder.tsx` · **Style:** `packages/ui/src/styles/components/metric-placeholder.css`
- **Radius:** `--radius-card` intended — `var(--border-radius__large, 14px)` ⚠ (same 14px mismatch as `QuickActionCard`) · **Elevation:** none · **Motion:** none of the three — raw `1.6s` shimmer keyframe ⚠, not tokenized
- **Purpose:** A fully decorative, `aria-hidden` "instrumenting…" placeholder tile for org-health metrics not yet wired to real data — diagonal gradient wash + two shimmering skeleton bars.
- **Variants:** `accent`: `'primary'` (default, implicit — **no explicit modifier class**, unlike `MetricCard`'s redundant one) · `'mint'` · `'violet'` · `'amber'`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| primary / mint / violet / amber | `--mp-accent`/`--mp-surface` per accent; `::before` diagonal wash `linear-gradient(150deg, var(--mp-surface), transparent 62%)`; two shimmer bars (`lg` 70% width, `md` 45%) animate `metric-placeholder-shimmer 1.6s ease-in-out infinite` ⚠ | — (fully non-interactive, `aria-hidden='true'` root) | — | — | — | — |

**Anatomy & tokens:** icon chip `2rem`, `border-radius:10px` (raw); shimmer bar `border-radius:6px` (raw) with a raw-literal gradient (`hsla(0,0%,50%,.10/.18/.10)`, no tokens at all); `.metric-placeholder--amber` sets `--mp-surface: hsla(38, 92%, 55%, 0.15)` with **no `var()` wrapper**, unlike mint/violet's `var(--{accent}-surface, …)` pattern (mirrors the same inconsistency seen in `QuickActionCard`). `@media (prefers-reduced-motion:reduce)` disables the shimmer.
**Behavioral notes:** Entirely decorative — root is `<div aria-hidden='true'>`, no interactive semantics of any kind.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/metric-placeholder.css`):
- `:12` — `border-radius: var(--border-radius__large, 14px)` — mismatched fallback (should be 12px).
- `:26-28` — `.metric-placeholder--amber { --mp-surface: hsla(38, 92%, 55%, 0.15) }` — raw literal, no token reference.
- `:74-80` — shimmer bar gradient is fully raw `hsla()` stops, no design token involved.
- `:54` — icon chip `border-radius: 10px` — raw, unaliased.
- `:82` — `animation: metric-placeholder-shimmer 1.6s ease-in-out infinite` — raw duration, doesn't match `Skeleton`'s own (also-raw) `1.5s` pulse — two different un-tokenized shimmer speeds exist side by side in this package.

---

### EntityRoster
- **Import:** `import { EntityRoster } from '@projective/ui'`
- **Source:** `packages/ui/src/components/roster/EntityRoster.tsx` · **Style:** `packages/ui/src/styles/components/entity-roster.css`
- **Radius:** `--radius-card` intended but hardcoded raw `12px` ⚠ (not wrapped in `var()` at all) on both row and avatar chip · **Elevation:** none · **Motion:** `--motion-standard` (`var(--fast, 150ms) var(--ease-out, ease)`, clean) on background/border-color
- **Purpose:** A high-density vertical list of active/selectable entities (freelancers, teams) — avatar, name/handle, tier badge, optional draft pill, single active-row highlight.
- **Variants:** `accent`: `'primary'` (default, implicit — no explicit modifier class, same pattern as `MetricPlaceholder`) · `'mint'` · `'violet'` · `'amber'`. `status`: only `'draft'` has any rendering effect (`active`/`archived`/other strings are accepted but unused).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| primary / mint / violet / amber | `--ri-accent`/`--ri-surface` per accent; row `border-radius:12px` ⚠ raw, `border:1px solid transparent` | `background:var(--surface-hover, hsla(0,0%,50%,.06))` | **— (no `:focus-visible` rule exists anywhere in this file — a real gap)** | `roster-item--active`: `background:var(--ri-surface); border-color:color-mix(in srgb, var(--ri-accent) 45%, transparent)`; also sets `aria-current='true'` | same as active (single-select list, no separate multi-select state) | — |
| tier badge: free / pro / enterprise / draft | `free` → raw `hsla(0,0%,50%,.12)` ⚠; `pro` → `var(--violet-surface, …)`; `enterprise` → `color:#fff` ⚠ + `background:var(--grad-brand-diag, …)`; `draft` → raw `hsla(38,92%,55%,.16)` ⚠ | — (static badges) | — | — | — | — |

**Anatomy & tokens:** row uses `RippleSurface as='li'` with `onClick`; avatar chip `2.5rem` square, `border-radius:12px` (raw); badge pill `border-radius:999px` (raw, `--radius-pill` value unwrapped).
**Behavioral notes:** No `role`, no `tabIndex`, no `onKeyDown` on the row — keyboard operability relies entirely on whatever `RippleSurface` provides (only `onPointerDown` for the ripple ink, not a keyboard handler) — likely not keyboard-activatable. Any `tier` string outside `{free,pro,enterprise}` gets a badge class with zero matching CSS (silent fallback to the unstyled base badge).
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/entity-roster.css`):
- `:25` — `.roster-item { border-radius: 12px }` — raw px, not `var(--radius-card)` even though the value happens to match.
- `:60` — `.roster-item__avatar { border-radius: 12px }` — same raw-px issue.
- `:120` — `.roster-item__badge--draft { background: hsla(38, 92%, 55%, 0.16) }` — raw literal, no token.
- `:124` — `.roster-item__badge--tier-free { background: hsla(0, 0%, 50%, 0.12) }` — raw literal.
- `:131` — `.roster-item__badge--tier-enterprise { color: #fff }` — hardcoded hex instead of `--on-accent`.
- No `:focus-visible` styling anywhere in the file — a real accessibility gap on a keyboard-focusable list.

---

### ActivityFeed
- **Import:** `import { ActivityFeed } from '@projective/ui'`
- **Source:** `packages/ui/src/components/feed/ActivityFeed.tsx` · **Style:** `packages/ui/src/styles/components/activity-feed.css`
- **Radius:** link-row hover only, raw `10px` ⚠ (not tokenized) · **Elevation:** none · **Motion:** `--motion-standard`-ish (`var(--fast, 150ms) var(--ease-out, ease-out)`, link-hover only)
- **Purpose:** A purely presentational timeline — a continuous rail (`::before` line) threading a vertical list of tone-coded event nodes with timestamps; "feed it an already aggregated, sorted list" per its own docstring. No pagination/infinite-scroll logic lives here.
- **Variants:** `tone` (per item, `ActivityTone`): `'primary'` · `'mint'` · `'violet'` · `'amber'` · `'danger'` · `'neutral'` (default) — **`'neutral'` has no matching CSS rule** ⚠, silently falls back to the base node's default fill.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| primary / mint / violet / amber / danger | `--node-accent`/`--node-surface` per tone, all with raw `hsl()`/`hsla()` **fallback** literals (real tokens do exist, so fallbacks are dormant); node `1.5rem` circle, `border:2px solid var(--card-bg, hsl(0,0%,100%))` | *(only if item has `href`, rendered as `<a>`)*: `background:var(--surface-hover, hsla(0,0%,50%,.06))`, row `border-radius:10px` ⚠ | **— (no `:focus-visible` rule in this file)** | — | — | — |
| neutral (default, unmapped) | ⚠ **no `.activity-feed__node--neutral` rule exists** — class is applied in the DOM but has zero matching CSS, falls back to the base `.activity-feed__node` fill | same link-hover as above | — | — | — | — |

**Anatomy & tokens:** rail line via `::before`, `width:2px`, `background:var(--glass-hairline, hsla(0,0%,50%,.18))`, positioned with raw magic-number offsets (`top:1.9rem; bottom:-.35rem`), hidden on `:last-child`.
**Behavioral notes:** Row is `<a>` (with `href`) or plain `<li>` — no `role`/`tabIndex` beyond native anchor semantics. Icon wrapper `aria-hidden='true'`; timestamp in `<time>`.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/activity-feed.css`):
- No `.activity-feed__node--neutral` selector exists despite `'neutral'` being the type union's default tone.
- `~row--link:hover` — `border-radius: 10px` raw, not `--radius-field`/`--radius-card`.
- Node tone modifiers carry raw `hsl()`/`hsla()` fallback literals for every one of primary/mint/violet/amber/danger (dormant since the real tokens exist, but still non-compliant with the "never hard-code a fallback" spirit of the guardrail).
- No `:focus-visible` rule anywhere in the file.

---

### FeedTextCard
- **Import:** `import { FeedTextCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/feed/FeedTextCard.tsx` · **Style:** `packages/ui/src/styles/components/feed-cards.css`
- **Radius:** `--radius-feed` (`var(--border-radius__xxlarge)`, no fallback — clean, 22px) · **Elevation:** `--elevation-2` resting (`var(--shadow-md)`) → `--elevation-3` hover (`var(--shadow-lg)`) · **Motion:** `--motion-structural` (`var(--dur-cinematic) var(--ease-expressive)`, exact clean pair) for transform/shadow; border-color uses `var(--medium) var(--ease-expressive)` (250ms duration, expressive curve — not a clean canonical pair)
- **Purpose:** A glass feed card for insight/quote/prompt/milestone text posts — 10-way shared accent-resolution system (`.accent-*`) reused across all feed surfaces.
- **Variants:** `tone`: `'insight'` (default) · `'quote'` · `'prompt'` · `'milestone'` — maps to an icon + a default accent (`insight→mint, quote→violet, prompt→teal, milestone→amber`), overridable via `accent` prop; only `quote` gets a dedicated visual override (`font-style:italic`) beyond its accent color.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| insight / quote / prompt / milestone | glass shell: `background:radial-gradient(…, var(--fc-surface) …), var(--glass-panel)`, `backdrop-filter:blur(var(--glass-blur))` + `-webkit-` pair, `box-shadow:--elevation-2`, `1px solid var(--hairline)`; accent seam `::before` `3px` wide, `opacity:.7`; `quote` adds `font-style:italic; font-weight:550` to the title | *(gated `@media (hover:hover)`)*: `translateY(-2px); box-shadow:--elevation-3; border-color:var(--hairline-strong)` | **— (no `:focus-visible` rule for `.feed-text` at all)** | — | — | — |

**Anatomy & tokens:** 10 `.accent-*` classes (`mint, violet, amber, ocean, ember, forest, neutral, teal, mist, primary`) each set `--fc-accent`/`--fc-surface`; any accent string outside this list silently falls back to the base `.feed-text, .feed-sponsored` default (primary). CTA hover animates `gap` (not transform): `gap:.6rem` on `:hover`, `transition:gap var(--fast) var(--ease-expressive)`.
**Behavioral notes:** Root is a non-interactive `<article>`; only the CTA is a real `<a>` (native focus/keyboard support) — the card shell itself has no focus-visible treatment despite being visually hoverable.
**⚠ Guardrail violations found:** None found directly in `.feed-text`'s own rules (fully token-driven glass + elevation + motion) — the one clean, fully-tokenized surface in the feed family. See **SponsoredCard** below for this file's actual violations.

---

### SponsoredCard
- **Import:** `import { SponsoredCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/feed/SponsoredCard.tsx` · **Style:** `packages/ui/src/styles/components/feed-cards.css`
- **Radius:** `--radius-feed` (`var(--border-radius__xxlarge)`, clean, shared rule with `.feed-text`) on outer frame; inner `__frame` uses `calc(var(--border-radius__xxlarge) - 1px)` · **Elevation:** `--elevation-2` resting → glow + `--elevation-3` hover (`var(--glow-teal), var(--shadow-lg)`) · **Motion:** `--motion-structural` (`var(--dur-cinematic) var(--ease-expressive)`, clean)
- **Purpose:** A gradient-ring-framed sponsored slot (media + copy) using a 1px padding trick for the accent border, distinct from `FeedTextCard`'s solid-border glass shell.
- **Variants:** `accent`: default `'teal'`, otherwise the same 10-way `.accent-*` system as `FeedTextCard` (shared CSS block).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| gold (default) / any `.accent-*` | outer frame: `padding:1px; background:linear-gradient(135deg, var(--border-subtle), transparent 55%, var(--border-subtle)); box-shadow:--elevation-2`; inner `__frame`: `background:var(--glass-panel-strong); backdrop-filter:blur(var(--glass-blur))` + `-webkit-` pair, 2-column grid | *(gated `@media (hover:hover)`)*: `translateY(-2px); box-shadow: var(--glow-teal), --elevation-3` | — (no dedicated rule; root is `<article>`, only inner CTA is focusable) | — | — | — |

**Anatomy & tokens:** `__media` min-height `148px`, background `var(--grad-teal-velvet), linear-gradient(135deg, var(--surface-dark-workspace), var(--surface-dark-workspace-deep))`; `__badge` (top-left "sponsored" tag) is the file's own violation — see below.
**Behavioral notes:** Same accent-resolution and CTA-hover pattern as `FeedTextCard` (shared `feed-cards.css` selectors for `__avatar`/`__cta`).
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/feed-cards.css`):
- `~__badge` — `background: rgba(255, 255, 255, 0.82)` raw rgba instead of a surface token, plus `backdrop-filter: blur(4px)` — raw px, **not** `var(--glass-blur)`, and no `-webkit-backdrop-filter` — a second, un-tokenized glass instance sitting inside a card whose every other surface correctly uses `var(--glass-blur)`.

---

### FeedComposer
- **Import:** `import { FeedComposer } from '@projective/ui'`
- **Source:** `packages/ui/src/components/feed/FeedComposer.tsx` · **Style:** `packages/ui/src/styles/components/feed-composer.css`
- **Radius:** `--radius-feed` (`var(--border-radius__xxlarge)`, matches the feed-card family) · **Elevation:** `--elevation-1` resting (`var(--shadow-sm)`) → `--elevation-2` on disabled-hover (`var(--shadow-md)`) · **Motion:** border-color only, not independently verified against the three canonical durations
- **Purpose:** An intentionally **inert** "coming soon" composer placeholder — looks like a real post-composer input but is fully non-functional by design (`disabled` defaults to `true`).
- **Variants:** `disabled`: `true` (default) — there is effectively no "enabled" visual state shipped, since the component is always disabled unless a future caller explicitly overrides it.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| disabled (default) | glass shell `background:var(--surface-subtle), var(--glass-panel)`, `backdrop-filter:blur(var(--glass-blur))` + `-webkit-` pair, `box-shadow:--elevation-1`; fake `role='textbox'` field `aria-readonly='true' tabIndex={-1}` (deliberately untabbable) | *(gated `@media (hover:hover)`, applies even while disabled)*: `border-color:var(--border-subtle); box-shadow:--elevation-2` | — (nothing in the component is focusable — `tabIndex={-1}` on the fake field, action chips are `aria-hidden` spans) | — | — | `aria-disabled='true'` on root; `.feed-composer__field { cursor:not-allowed }` |

**Anatomy & tokens:** "Coming soon" tag `color:var(--accent-teal-strong); background:var(--accent-teal-surface); border:1px solid var(--border-subtle)` — fully token-driven, no raw literals. Action chips `background:var(--hairline); opacity:.85` — `aria-hidden` decorative spans, not real buttons despite looking clickable.
**Behavioral notes:** The fake input is `role='textbox' aria-readonly='true' tabIndex={-1}` — cannot receive focus or be typed into, by design.
**⚠ Guardrail violations found:** None — this file is fully token-driven (glass, elevation, and the teal-tag treatment all reach for real tokens).

---

### ChannelTabs
- **Import:** `import { ChannelTabs } from '@projective/ui'`
- **Source:** `packages/ui/src/components/channel-tabs/ChannelTabs.tsx` · **Style:** `packages/ui/src/styles/components/channel-tabs.css`
- **Radius:** `--radius-control` intended — `var(--border-radius__small, 4px)` ⚠ (fallback 4px doesn't match the real `--border-radius__small` value of 6px, i.e. it mismatches `--radius-field`/`--radius-button`); underline pill raw `999px` (`--radius-pill` value, unwrapped) · **Elevation:** none · **Motion:** `--motion-standard` (`var(--fast, 150ms) var(--ease-out, ease-out)`, clean) throughout
- **Purpose:** A locked-aware channel tab strip for stage rooms — each tab draws its own animated underline (`scaleX` from center) so switching tabs reads as a slide with no JS measurement.
- **Variants:** per-tab `locked: boolean` (not a `variant` prop — a data flag) driving a dimmed, `disabled`, non-interactive look.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| unlocked, inactive | `color:var(--text-muted)`; underline `::after` `transform:scaleX(0)` | `color:var(--text-main)` (`:hover:not(:disabled)`) | `outline:none; box-shadow:inset 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); border-radius:var(--border-radius__small, 4px)` ⚠ | — | `--active`: `color:var(--primary)`; underline `::after` `transform:scaleX(1)` | — |
| locked | `opacity:.55; cursor:not-allowed`; native `disabled` attribute (excludes from tab order automatically) | `:hover:not(:disabled)` never matches | inherited focus ring still applies if reached, but native `disabled` makes it unreachable by keyboard | — | — | same as locked default (locked ⇒ disabled) |

**Anatomy & tokens:** wrapper `overflow-x:auto`, `border-bottom:1px solid var(--hairline)`; underline `height:2px`, `border-radius:999px` (raw); `@media (prefers-reduced-motion:reduce)` disables both tab-color and underline transitions.
**Behavioral notes:** `role='tablist'`/`role='tab'`/`aria-selected` correctly wired; locked tabs render a lock icon and rely on native `disabled` for keyboard exclusion (no manual `onKeyDown`). State is conveyed via a BEM `--active` class (contrast with `NavTabs`' `data-active` attribute pattern below).
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/channel-tabs.css`):
- `:53` — `border-radius: var(--border-radius__small, 4px)` — fallback mismatches the real 6px value.
- `:37` — `.channel-tabs__tab::after { border-radius: 999px }` — raw pill radius, not `var(--radius-pill)`.
- Three `var(--fast, 150ms)` fallbacks (`:28, :42-43`) — correct value, but still fallback-dependent rather than guaranteed.

---

### NavTabs
- **Import:** `import { NavTabs } from '@projective/ui'`
- **Source:** `packages/ui/src/components/nav-tabs/NavTabs.tsx` · **Style:** `packages/ui/src/styles/components/nav-tabs.css`
- **Radius:** `--radius-field`/`--radius-button` (`var(--border-radius__small) var(--border-radius__small) 0 0`, no fallback — clean, top corners only) · **Elevation:** none · **Motion:** `--motion-standard`-ish (`var(--fast) ease`, clean duration/plain easing) for color/bg; underline uses `var(--medium) ease` (250ms = `--motion-micro` duration, non-spring curve)
- **Purpose:** A navigation-optimized tab strip — sliding accent underline via `[data-active='true']` attribute selector (not a BEM class), whole surface ripples on tap via `RippleSurface`.
- **Variants:** per-tab active/inactive, conveyed via `data-active` attribute rather than a modifier class (contrast with `ChannelTabs`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| inactive | `color:var(--text-muted)`, `font-weight:550`; underline `::after` `transform:scaleX(0)` | `color:var(--text-main); background:var(--button-hover, rgba(255,255,255,.05))` ⚠ | `outline:none; box-shadow:var(--focus-ring)` (functionally `--focus-glow`, clean token reference — no hand-rolled fallback unlike `ChannelTabs`) | — | `[data-active='true']`: `color:var(--text-main); font-weight:650`; underline `::after` `transform:scaleX(1)` | — |

**Anatomy & tokens:** wrapper `overflow-x:auto; scrollbar-width:none` + `::-webkit-scrollbar{display:none}` (cross-browser scrollbar hiding); underline `height:2px; border-radius:2px 2px 0 0` (raw, decorative, not a radius-ladder use case).
**Behavioral notes:** Polymorphic per-tab element: `as={tab.href ? 'a' : 'button'}`; anchors navigate natively, buttons `preventDefault()` (no-op) and rely purely on `onSelect`. Uses `RippleSurface` for the tap-ripple effect.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/nav-tabs.css`):
- `:42` — `background: var(--button-hover, rgba(255, 255, 255, 0.05))` — raw rgba fallback.
- `:37` — `.nav-tabs__tab { transition: color var(--fast) ease, background var(--fast) ease }` — bare `var(--fast)` with no easing-curve token (plain `ease`, not `--ease-standard`).

---

### PiiNotice
- **Import:** `import { PiiNotice } from '@projective/ui'`
- **Source:** `packages/ui/src/components/pii-notice/PiiNotice.tsx` · **Style:** `packages/ui/src/styles/components/pii-notice.css`
- **Radius:** `--radius-control` intended — `var(--border-radius__small, 4px)` ⚠ (same mismatch as `ChannelTabs` — fallback 4px vs real 6px); chip pill raw `999px` · **Elevation:** none · **Motion:** entrance-only, `--motion-micro`-duration intended — `var(--medium, 350ms)` ⚠ (350ms fallback mismatches real 250ms) with `var(--ease-out, ease-out)`
- **Purpose:** An inline amber warning chip shown under a masked message during the E7 protected phase (PII redaction notice) — a single `--pii-accent` custom property drives icon, border, and chip tint.
- **Variants:** `compact: boolean` — the sole density variant (not a full tone/variant union).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| default (non-compact) | `--pii-accent:var(--amber, var(--warning))`; `background:color-mix(in srgb, var(--pii-accent) 12%, transparent)`; `border-left:2px solid var(--pii-accent)`; plays an entrance animation **unconditionally** on every mount (`translateY(-2px) scale(.985) → translateY(0) scale(1)`) | — (non-interactive, `role='note'`) | — | — | — | — |
| compact | `flex-wrap:nowrap; gap:.35rem; padding:.22rem .5rem; font-size:.72rem`; text truncates with ellipsis | — | — | — | — | — |

**Anatomy & tokens:** category chips `background:color-mix(in srgb, var(--pii-accent) 16%, transparent); border-radius:999px` (raw); unknown category keys fall back to the raw key string via `CATEGORY_LABELS[category] ?? category`. `@media (prefers-reduced-motion:reduce)` disables the entrance animation.
**Behavioral notes:** Root `role='note'` — non-interactive, no hover/focus states of any kind (correctly so, since it's an inline informational chip).
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/pii-notice.css`):
- `:15` — `border-radius: var(--border-radius__small, 4px)` — fallback mismatches the real 6px value.
- `:18` — `animation: pii-notice-in var(--medium, 350ms) var(--ease-out, ease-out) both` — 350ms fallback mismatches the real `--medium` value (250ms).
- `:53` — `.pii-notice__chip { border-radius: 999px }` — raw pill radius.

---

### LedgerCard
- **Import:** `import { LedgerCard } from '@projective/ui'`
- **Source:** `packages/ui/src/components/ledger/LedgerCard.tsx` · **Style:** `packages/ui/src/styles/components/ledger.css`
- **Radius:** `--radius-card` (`var(--border-radius__large)`, no fallback — clean) on card shell; status pill raw `50px` ⚠ · **Elevation:** none — no shadow token anywhere in the file · **Motion:** `--motion-standard`-ish (`var(--fast) ease`, clean duration, plain easing) on interactive-row background
- **Purpose:** A generic bordered ledger surface — header + a stack of rows, each row a grid of labeled cells with tone-colored values; rows are optionally clickable.
- **Variants:** per-cell `tone`: `'default'` (no CSS rule — falls back to base value color ⚠) · `'primary'` · `'success'` · `'warning'` · `'danger'`, orthogonal `emphasis: boolean`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| non-interactive row | plain `<div>`, `border-top:1px solid var(--border-color)` | — | — | — | — | — |
| interactive row | `<button>`, `cursor:pointer` | `background-color:var(--primary-half)` | `outline:2px solid var(--primary); outline-offset:-2px` ⚠ (hardcoded `2px` outline width, not a token; functionally close to `--focus-glow` but not the same technique) | — | — | — |
| cell tone: default | ⚠ no `.ledger-cell--default` rule — falls through to base `.ledger-cell__value` color | — | — | — | — | — |
| cell tone: primary / success / warning / danger | `color:var(--primary)` / `var(--complete)` / `var(--warning)` / `var(--danger)` | — | — | — | — | — |
| emphasis | `.ledger-cell--emphasis .ledger-cell__value { font-weight:700; color:var(--primary) }` — **cascade collision**: if both a tone class and `--emphasis` are applied, the tone rule (declared later in file order) wins the `color` property since both target the same selector at equal specificity — `--emphasis`'s intended color-override is silently overridden by any non-default tone | — | — | — | — | — |

**Anatomy & tokens:** dense modifier `.ledger-row--dense` tightens gap/padding; status pill `border-radius:50px` ⚠ (should be `--radius-pill`).
**Behavioral notes:** `interactive = typeof row.onClick === 'function'` decides `<button>` vs `<div>` at the element-type level — real semantic correctness (not a fake clickable div).
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/ledger.css`):
- `:95` — `.ledger-row__status { border-radius: 50px }` — raw px, not `--radius-pill`.
- `:59-61` — `.ledger-row--interactive:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px }` — hand-rolled `2px` outline instead of `box-shadow: var(--focus-glow)`.
- No `.ledger-cell--default` rule despite `'default'` being a valid tone.
- `--emphasis`/tone cascade collision (`:123-142`) — a real correctness bug, not just a token issue: styling intent (bold + primary color on emphasis) is undermined whenever a non-default tone is also applied.

---

### TransactionLedger
- **Import:** `import { TransactionLedger } from '@projective/ui'`
- **Source:** `packages/ui/src/components/ledger/TransactionLedger.tsx` · **Style:** `packages/ui/src/styles/components/transaction-ledger.css`
- **Radius:** `--radius-field`/`--radius-button` (`var(--border-radius__small, 6px)`, fallback matches — clean) on search field; chip pill raw `999px` · **Elevation:** none · **Motion:** `--motion-standard` (`var(--fast, 150ms) ease`, clean) on search/chip borders
- **Purpose:** A toolbar (search + status-filter chips) over a dense transaction table (delegated to `LedgerTable` from `@projective/data`), plus an expandable per-row detail panel and kind/amount cell styling.
- **Variants:** status filter chips: `'all'` + whichever `LedgerEntryStatus` values are actually present in the data (`settled`/`pending`/`processing`/`failed`/`held`), each with a distinct `StatusBadge` tone (`success`/`warning`/`info`/`danger`/`amber`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| search field | `background:var(--card); border:1px solid var(--hairline)` | — | `:focus-within` (on the wrapping `<label>`, not the `<input>` itself): `border-color:var(--primary); box-shadow:var(--focus-ring)` | — | — | — |
| status chip (inactive) | `background:var(--card); border:1px solid var(--hairline); color:var(--text-secondary)` | `border-color:color-mix(in srgb, var(--primary) 40%, var(--hairline)); color:var(--text-main)` | — (no `:focus-visible` on chips) | — | `--active`: `background:var(--primary-surface); border-color:var(--primary); color:var(--primary)` | — |
| kind cell | `payout`/`bonus` → `var(--success)`; `escrow_hold` → `var(--amber)`; `withdrawal`/`platform_fee` → `var(--text-muted)`; `refund`/`topup` → `var(--primary)` | — | — | — | — | — |
| amount cell | `pos` → `var(--success)`; `neg` → `var(--text-main)` | — | — | — | — | — |

**Anatomy & tokens:** monospace reference field `font-family:var(--font-mono, ui-monospace, 'SF Mono', monospace)`; status column renders `<StatusBadge tone={…} size='sm' dot>` (separate component, not documented here). Detail panel uses semantic `<dl>/<dt>/<dd>` markup.
**Behavioral notes:** All filtering (search text + status chip) is local React state, purely client-side, no debounce. Status chip toolbar only shows statuses actually present in the data.
**⚠ Guardrail violations found:** `.txledger__chip { border-radius: 999px }` — raw pill radius, not `--radius-pill` — otherwise this file is clean and fully token-driven.

---

### Skeleton
- **Import:** `import { Skeleton } from '@projective/ui'` (+ `import { ListCardSkeleton } from '@projective/ui/skeletons'` — a deliberately separate entry point, see notes)
- **Source:** `packages/ui/src/components/skeleton/Skeleton.tsx` · **Style:** `packages/ui/src/styles/components/skeleton.css`
- **Radius:** variant-dependent — `--radius-control` (`var(--border-radius__xsmall)`, text/icon variants, clean) up to raw `999px` (badge, unwrapped) and `50%` (avatar) · **Elevation:** none (flat placeholder) · **Motion:** neither canonical duration — raw `1.5s` pulse/wave keyframes ⚠, **no `prefers-reduced-motion` guard** (gap)
- **Purpose:** The base loading-placeholder primitive — 7 shape variants, 3 animation modes, and a special `multiline` paragraph-simulation branch.
- **Variants:** `variant`: `'text'` (default) · `'multiline'` · `'avatar'` · `'image'` · `'button'` · `'badge'` · `'icon'`. `animation`: `'pulse'` (default) · `'wave'` · `'none'`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| text | `height:1em; width:100%; border-radius:var(--border-radius__xsmall)` (→ `--radius-control`) | — | — | — | — | — |
| multiline | special branch: renders `Math.max(1,lines)` (default 3) individual text-skeleton `<div>`s; last line auto-shrinks to `70%` width unless an explicit `width` is passed | — | — | — | — | — |
| avatar | `border-radius:50%; width:3rem; height:3rem` (raw) | — | — | — | — | — |
| image | `min-height:150px` (raw), `border-radius:var(--border-radius)` (unaliased 8px primitive) | — | — | — | — | — |
| button | `height:var(--input-height, 2.5rem); width:100px` (raw), `border-radius:var(--border-radius)` | — | — | — | — | — |
| badge | `height:1.5rem; width:60px; border-radius:999px` (raw) | — | — | — | — | — |
| icon | `width/height:1.5rem; border-radius:var(--border-radius__xsmall)` | — | — | — | — | — |
| animation: pulse | `animation: skeleton-pulse 1.5s ease-in-out infinite` ⚠ (opacity 1↔.5) | — | — | — | — | — |
| animation: wave | raw-literal `linear-gradient` shimmer (`hsla(text-hue,…,.05/.15/.05)`), `animation: skeleton-wave 1.5s ease-in-out infinite` ⚠ | — | — | — | — | — |
| animation: none | static fill only | — | — | — | — | — |

**Anatomy & tokens:** base fill `background-color: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.1)` (composed from theme HSL components, not a flat token). All render branches set `aria-hidden='true'` unconditionally — always decorative.
**Behavioral notes:** `CardSkeleton`/`ListCardSkeleton` (see **Card**/**ListCard** above) compose `<Skeleton>` instances with inline `style` overrides (e.g. forcing a circular `variant='icon'` via `style={{borderRadius:'50%'}}`, or overriding `image`'s `min-height:150px` default) rather than adding new CSS variants — neither passes an `animation` prop, so both always render the default `pulse`, never `wave`. `packages/ui/skeletons.ts` deliberately re-exports only `ListCardSkeleton` **outside** the main `@projective/ui` barrel (`mod.ts`) to avoid a `data → ui → data` import cycle (the barrel pulls in `TransactionLedger`, which imports `@projective/data`).
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/skeleton.css`):
- `~avatar` — `width:3rem; height:3rem` raw (no size-token ladder for skeleton dimensions).
- `~image` — `min-height:150px` raw.
- `~button` — `width:100px` raw; `height:var(--input-height, 2.5rem)` fallback OK but width has no token equivalent at all.
- `~badge` — `width:60px; border-radius:999px` raw.
- `animation: skeleton-pulse 1.5s …` / `animation: skeleton-wave 1.5s …` — both raw `1.5s`, not derived from any motion token.
- No `@media (prefers-reduced-motion:reduce)` guard in this file — inconsistent with `MetricPlaceholder`/`PiiNotice`/`ChannelTabs`/`FileHandoverCard`, which all disable their own animations under reduced motion.

---

### Overlay (Modal · Side · Mobile)
- **Import:** `import { Overlay, Modal, ModalLayout, Side, Mobile, OverlayPortal } from '@projective/ui'`
- **Source:** `packages/ui/src/components/overlay/{Overlay,Modal,ModalLayout,Side,Mobile,OverlayPortal}.tsx` · **Style:** `packages/ui/src/styles/components/overlay.css` (single shared file for all three surface types)
- **Radius:** Modal `--radius-card` intended (`var(--border-radius__large, 12px)`, clean) · Mobile `--radius-stage` intended (`var(--border-radius__xlarge, 16px)`, clean, top corners only) · Side: none (edge-to-edge, square) · **Elevation:** none of the four canonical steps anywhere — every surface hand-rolls its own raw `rgba()` box-shadow ⚠, plus the shared backdrop's `blur(4px)` ⚠ is un-tokenized · **Motion:** none of the three cleanly — Modal/Side entrance is `var(--medium)`(250ms) + a hand-rolled `cubic-bezier(0.16,1,0.3,1)` curve (not `--ease-spring`, so not a clean `--motion-micro`); Mobile drag-snap is a raw `300ms` ⚠ with its own bounce curve
- **Purpose:** `Overlay` is a polymorphic dispatcher (`type: 'modal'|'side'|'mobile'`) that auto-swaps to `Mobile` under a `768px` breakpoint (`useIsMobile(768)`) unless `preventAutoSwitch` is set; `Modal`/`Side`/`Mobile` are the three concrete surface renderers, all portaled via `OverlayPortal`.
- **Variants:** `type`: `'modal'` (default) · `'side'` · `'mobile'`; `Side.side`: `'left'` · `'right'` (default). `Modal.fullScreen: boolean`. `Mobile.snapPoints: number[]` (default `[0.5, 0.95]`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| backdrop | `background-color:hsla(text-hue,text-sat,10%,.5)` ⚠ (literal `10%`/`.5`), `backdrop-filter:blur(4px)` ⚠ (raw, no `-webkit-` pair), `z-index:var(--z-overlay, 9999)`, one-shot `animation:overlay-fade-in var(--fast) ease-out forwards` | — | — | — | — | — |
| Modal | `background:var(--card); border-radius:var(--border-radius__large, 12px); box-shadow:0 8px 24px rgba(0,0,0,.15)` ⚠; entrance `scale(.95)→scale(1)` via `animation:modal-enter var(--medium) cubic-bezier(0.16,1,0.3,1) forwards` | — (static once open) | — (no `:focus-visible` rule; focus-trap handled by `useOverlayA11y`, not CSS) | `fullScreen`: inline styles force `100vw/100vh`, `margin:0; border-radius:0` (no `.overlay-modal--fullscreen` CSS selector exists despite the class being emitted ⚠) | — | — |
| Side (left/right) | `background:var(--card); box-shadow:0 8px 24px rgba(0,0,0,.15)` ⚠ (identical literal to Modal); `right`: `transform:translateX(100%)→0` via `slide-in-right`; `left`: mirrored `slide-in-left` | — | — | — | — | — |
| Mobile | `background:var(--card); border-top-radius:var(--border-radius__xlarge, 16px); box-shadow:0 -4px 24px rgba(0,0,0,.15)` ⚠ (upward-facing, distinct literal from Modal/Side); height driven **inline** by a drag signal; `.overlay-mobile--animating` toggles `transition:height 300ms cubic-bezier(0.175,.885,.32,1.275)` ⚠ (spring/overshoot, stripped during active drag for 1:1 finger tracking) | handle-area `:hover` swaps handle fill `var(--border-color)→var(--text-muted)` | — | dragging (`isDragging` signal) removes the transition entirely for 1:1 tracking; fling velocity `>0.8px/ms` or position `<50%` of the first snap point triggers dismiss | — | — |

**Anatomy & tokens:** shared header/title/body rules span both Modal and Side via comma-grouped selectors (`.overlay-modal__header, .overlay-side__header {…}`); Mobile handle pill `48px × 6px`, `border-radius:9999px` (raw); footer block (`overlay.css:216-233`) contains a **dead, commented-out earlier version** of `.overlay-modal__footer` left in place directly above the live rule (right-aligned `flex-end`+`gap`+`background:var(--input-bg)` vs. the live `space-between`, no bg) — a verbatim migration artifact, not functional CSS. `.overlay-content-wrapper { outline:none }` is defined but **never referenced by any of the .tsx files** (dead class).
**Behavioral notes:** Only Modal/Side/Mobile use the shared `useOverlayA11y` focus-trap+Escape hook; all three set `role='dialog' aria-modal='true' tabIndex={-1}` on their container. `OverlayPortal` gates backdrop-click-to-close on `e.target === e.currentTarget` (must land directly on the backdrop, not bubble from a child) and is disabled entirely by the `isSticky` prop. **No exit animations exist anywhere** — every surface unmounts instantly on close (conditional render), only entrance is CSS-animated. Mobile's pointer-drag engine (not Toast-style touch events) implements rubber-band overscroll (`0.2` damping factor past the last snap point), velocity-based fling-to-dismiss (`>0.8px/ms`), and position-based dismiss (`<50%` of first snap point) — see `Mobile.tsx:62-121`.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/overlay.css`):
- `:19` — backdrop `backdrop-filter: blur(4px)` — raw px, no token, no `-webkit-` prefix.
- `:18` — backdrop `background-color: hsla(var(--text-hue), var(--text-saturation), 10%, 0.5)` — literal `10%` lightness / `.5` alpha.
- `:48, :111, :150` — three distinct hand-rolled `box-shadow: 0 8px 24px rgba(0,0,0,.15)` / `0 8px 24px rgba(0,0,0,.15)` / `0 -4px 24px rgba(0,0,0,.15)` literals — no `--elevation-4` token used anywhere despite modals being exactly the "modals, command palette, dialogs" use-case that token exists for.
- `:162` — Mobile `transition: height 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)` — raw duration + raw spring curve.
- `Modal.tsx` emits `overlay-modal--fullscreen` but **no such selector exists in overlay.css** — fullscreen is achieved entirely via inline styles, making the class dead CSS.
- `:216-233` — dead, commented-out prior version of `.overlay-modal__footer` left in the file.

---

### Popover
- **Import:** `import { Popover } from '@projective/ui'`
- **Source:** `packages/ui/src/components/Popover.tsx` · **Style:** `packages/ui/src/styles/components/popover.css`
- **Radius:** `--radius-field`/`--radius-button` intended (`var(--field-radius, 8px)`, resolves to the unaliased `--border-radius` primitive — 8px, not on the canonical ladder) · **Elevation:** none of the four — raw `box-shadow:0 10px 15px -3px rgba(0,0,0,.1)` ⚠ · **Motion:** neither canonical duration — raw `100ms` ⚠ fallback (doesn't match the real `--fast`=150ms) on opacity/transform
- **Purpose:** An in-place (non-portaled) trigger+content popover with auto-flip vertical placement — the only overlay-family component in this set that does **not** render via `createPortal`.
- **Variants:** `position`: `'bottom-left'` · `'bottom-right'` · `'top-left'` · `'top-right'` — or auto-computed (`'bottom'`/`'top'` based on available viewport space below the trigger, hardcoded `contentHeight = 350` estimate).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| closed | `opacity:0; pointer-events:none; transform:translateY(4px)`, stays mounted (no unmount) | — | — | — | — | — |
| open (`--open`) | `opacity:1; pointer-events:auto; transform:translateY(0)`; `background:var(--bg-overlay, #ffffff)` ⚠ — `--bg-overlay` is **not defined anywhere in the theme layer**, so this always resolves to the literal `#ffffff` fallback regardless of theme | — | — (no ARIA `role` at all on the popover — not `role='dialog'`, nothing) | dismissed via `mousedown` outside the container or `Escape` (document-level listeners, no focus trap) | — | — |
| `--top` / `--right` modifiers | `--top`: `bottom:100%; top:auto`; `--right`: `right:0` — **`--bottom`/`--left` have no dedicated rules** (implicit via base positioning) | — | — | — | — | — |

**Anatomy & tokens:** `z-index:50` — drastically lower than every other overlay-family z-index in this set (`--z-overlay`=9999, `--z-tooltip`=2000, `--z-toast`=10000) — a Popover could visually sit *underneath* a Modal backdrop if both were open simultaneously.
**Behavioral notes:** Auto-flip logic uses a hardcoded `contentHeight = 350` "approx max height of calendar" magic number — implies original design intent was calendar/date-picker-specific. Uses `mousedown` (not `click`) + `Escape` document listeners for outside-detection; **no focus trap**, **no ARIA role**. Unlike Modal/Side/Mobile/Tooltip, does **not** portal to `document.body` — renders in-place with `position:relative` wrapper / `position:absolute` content.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/popover.css`):
- `:10` — `z-index: 50` — raw literal, not `var(--z-*)`, far below the rest of the stacking system.
- `:12` — `background: var(--bg-overlay, #ffffff)` — `--bg-overlay` is undefined in any theme file; always resolves to the raw `#ffffff` fallback.
- `:16` — `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)` — raw, no elevation token.
- `:19` — `transition: opacity var(--fast, 100ms) ease-out, transform var(--fast, 100ms) ease-out` — `100ms` fallback mismatches the real `--fast` value (150ms).
- No `.popover-content--bottom`/`--left` selectors exist despite being valid `position` values.

---

### Toast
- **Import:** `import { Toast, ToastProvider, toast } from '@projective/ui'`
- **Source:** `packages/ui/src/components/toast/{Toast,ToastProvider}.tsx` (+ `packages/ui/src/core/toast.ts` singleton) · **Style:** `packages/ui/src/styles/components/toast.css`
- **Radius:** `--radius-field`/`--radius-button` intended (`var(--field-radius, 8px)`, same unaliased-8px situation as `Popover`) · **Elevation:** none — raw `box-shadow:0 4px 12px rgba(0,0,0,.1)` ⚠ · **Motion:** neither canonical — raw `0.35s` ⚠ entrance with its own unique `cubic-bezier(0.21,1.02,0.73,1)` curve
- **Purpose:** A stacked, positionable toast notification system — hover-pause + touch-swipe-to-dismiss auto-timer, 6-position viewport, dedup on identical message+type.
- **Variants:** `type` (`ToastType`): `'success'` · `'error'` · `'warning'` · `'info'` · `'loading'` · `'neutral'` — **`'neutral'` and `'loading'` have no matching `.toast--{type}` CSS modifier** ⚠ and no icon case (both silently render the un-toned default). `position` (`ToastProvider`): 6-way (`top/bottom` × `left/center/right`), default `'bottom-right'`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| success | `border-left:4px solid var(--success, #43a047)` ⚠ | pauses auto-dismiss timer (`isPaused`) | — (no `:focus-visible` rule; not a focusable element itself, only its action/close buttons are) | swipe-right past `100px` threshold → flies off-screen (`translateX(innerWidth)`), dismisses after `200ms` | — | — |
| error | `border-left:4px solid var(--danger, #e53935)` ⚠ — note the JS `type='error'` maps to CSS class `.toast--error` and token `var(--danger,…)` (naming mismatch between "error" and "danger") | same pause behavior | — | same swipe mechanic | — | — |
| warning | `border-left:4px solid var(--warning, #fb8c00)` ⚠ | same | — | same | — | — |
| info | `border-left:4px solid var(--primary, #186f7e)` ⚠ | same | — | same | — | — |
| loading | ⚠ no `.toast--loading` CSS rule, but icon IS mapped (`IconLoader2` spinning via the **foreign** `stepper__spin` class borrowed from Stepper's CSS); `duration` is always forced to `Infinity` (never auto-dismisses) | same | — | — | — | — |
| neutral | ⚠ no `.toast--neutral` CSS rule **and** no icon case (`getIcon()` falls to `default: return null`) | same | — | — | — | — |

**Anatomy & tokens:** viewport `z-index:var(--z-toast, 10000)`, `pointer-events:none` (individually re-enabled per-toast); 6 position modifiers via `top/left/right/bottom:0` + centered variants using `translateX(-50%)`. `.toast__action` button `border-radius:4px` (raw, inconsistent with the file's own `var(--field-radius,8px)` convention elsewhere).
**Behavioral notes:** Default auto-dismiss `5000ms`, overridable per-toast; hover **and** active touch-swipe both pause the timer (`!isPaused && !isSwiping`). Swipe-to-dismiss is rightward-only, `100px` threshold, `200ms` fly-off delay, opacity fades to 0 by `300px` — three independent magic numbers. `core/toast.ts`'s `promise()` helper shows a `loading` toast (`Infinity` duration) then morphs it (same `id`) into `success` (`4000ms` hardcoded) or `error` (`5000ms` hardcoded) on settle. `ToastData.exiting` field exists in the type but is **never read or set** anywhere — `dismissToast` just filters the array immediately, no exit-animation state machine (any exit visual is purely the swipe's own inline transform/opacity). `aria-live` is `'assertive'` only for `type==='error'`, `'polite'` for everything else including `warning`.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/toast.css`):
- `:34-37` — `border-left: 4px solid var(--success/--danger/--warning/--primary, #43a047/#e53935/#fb8c00/#186f7e)` — four hardcoded hex fallbacks; also moot since `--success`/`--warning`/`--danger` are unconditionally overridden to a flat `#fff` in `apps/web/styles/themes/dark.css:26-28`, meaning all three collapse to white in dark mode.
- `:14` — `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)` — raw, no elevation token.
- `:17` — `animation: toast-slide-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards` — raw duration + a fourth distinct easing curve in this codebase's overlay family.
- `:83-92` — `.toast__action { border-radius: 4px }` — raw, inconsistent with the file's own token usage elsewhere.
- No `.toast--neutral`/`.toast--loading` CSS modifiers despite both being valid `ToastType` values.
- `Toast.tsx` reuses `stepper__spin` (a foreign class from `stepper.css`) for the loading spinner instead of defining its own.

---

### Tooltip
- **Import:** `import { Tooltip } from '@projective/ui'`
- **Source:** `packages/ui/src/components/tooltip/Tooltip.tsx` · **Style:** `packages/ui/src/styles/components/tooltip.css`
- **Radius:** `--radius-field`/`--radius-button` (`var(--border-radius__small, 6px)`, fallback matches — clean, the one radius-clean overlay-family member) · **Elevation:** none — raw `box-shadow:0 4px 12px rgba(0,0,0,.1)` ⚠ (identical literal to Toast's) · **Motion:** `--motion-standard` (`var(--fast, 150ms) ease`, clean) fade-in only, no exit animation
- **Purpose:** A viewport-relative (`position:fixed`, portaled to `document.body`) text-only tooltip bubble, shown on hover **and** keyboard focus, positioned via live `getBoundingClientRect()` math rather than CSS anchoring.
- **Variants:** `position`: `'top'` (default) · `'bottom'` · `'left'` · `'right'`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| top | hidden (unmounted, `coords===null`); shown on `onMouseEnter`/`onFocusIn` of the trigger, placed `gap=8px` above the trigger, anchor-corrected via `transform:translate(-50%,-100%)` | trigger `:hover` shows it (`animation:tooltip-fade-in var(--fast,150ms) ease forwards`, opacity-only, no transform in the keyframe) | trigger `:focus`/`:focus-visible` (via `onFocusIn`) also shows it — keyboard-accessible, not just mouse-hover | — | — | `disabled` prop suppresses `isVisible` entirely — bubble never renders |
| bottom / left / right | same show/hide mechanics, differing only in the `translate()` anchor-correction (`bottom: translate(-50%,0)`; `right: translate(0,-50%)`; `left: translate(-100%,-50%)`) | same | same | — | — | same |

**Anatomy & tokens:** `color:var(--text-medium, var(--text-main))` — a token-referencing-a-token fallback (unusual pattern vs. the rest of the codebase's literal fallbacks; `--text-medium` itself is likely undefined anywhere, so it always resolves through to `--text-main`).
**Behavioral notes:** `role='tooltip'` but **no `aria-describedby`** wiring the trigger to the bubble (no programmatic association, screen readers rely on visual/DOM proximity only). No collision/edge-flip detection (contrast with `Popover`'s auto-flip) — pure directional placement. Hides via instant unmount (`coords=null`), no fade-out exit animation despite having a fade-in entrance.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/tooltip.css`):
- `:33` — `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)` — raw, no elevation token (identical literal duplicated from `toast.css`).
- No `aria-describedby` linkage between trigger and bubble — an accessibility completeness gap, not a token issue, but worth flagging given the doc's behavioral-notes remit.

---

### Accordion
- **Import:** `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@projective/ui'`
- **Source:** `packages/ui/src/components/accordion/{Accordion,AccordionItem,AccordionTrigger,AccordionContent}.tsx` · **Style:** `packages/ui/src/styles/components/accordion.css`
- **Radius:** `--radius-field`/`--radius-button` intended (`var(--field-radius, 8px)`, unaliased primitive again — same 8px situation as Popover/Toast) · **Elevation:** `filled` variant only, raw hsla-composed shadow ⚠, not a token · **Motion:** content-collapse uses `--motion-micro`-duration without its spring easing — `var(--medium)`(250ms) + raw `cubic-bezier(0.87,0,0.13,1)` (not `--ease-spring`)
- **Purpose:** A collapsible section list with single/multiple expand modes, three visual treatments, and a CSS-grid `0fr→1fr` height-transition trick for smooth open/close without measuring content height in JS.
- **Variants:** `type`: `'single'` · `'multiple'`. `variant`: `'outlined'` (default) · `'filled'` · `'ghost'`. `density`: `'compact'` · `'normal'` (default) · `'spacious'`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| outlined (default) | `border:1px solid var(--field-border); border-radius:var(--field-radius); background:var(--field-bg)`; items separated by `border-bottom` (last child none) | trigger `:hover:not(:disabled)`: `background-color:var(--field-bg-hover)` | trigger: `outline:2px solid var(--field-border-focus); outline-offset:-2px; z-index:1` | `data-state='open'`, content `grid-template-rows:1fr; visibility:visible` (from `0fr`/`hidden`); icon rotates `180deg` (same `--medium`+raw-cubic-bezier transition) | — (accordion has no "selected" concept distinct from open) | `.accordion__item--disabled { opacity:.5; pointer-events:none }` |
| filled | `background:var(--input-bg)`; open item gets its own `background:var(--card); box-shadow:0 1px 2px hsla(text-hue,text-sat,text-light,.05)` ⚠ (composed-hsla, not a token) + `margin-bottom:2px` | same trigger hover | same focus ring | same open mechanics | — | same disabled |
| ghost | `background:transparent; border:none`; items separated by `border-bottom:1px solid var(--border-color)` | same | same | same | — | same |

**Anatomy & tokens:** density presets adjust `--accordion-padding-x/-y` only (compact `.5rem/.75rem`, spacious `1.5rem/1.5rem`); trigger `all:unset` reset base, `min-height:24px`; content wrapper `.accordion__content-inner` handles the actual `overflow:hidden` + padding (the outer `.accordion__content` is the grid-row animator).
**Behavioral notes:** Keyboard nav: `ArrowDown`/`ArrowUp` cycle with wraparound, `Home`/`End` jump to first/last, scoped to `[data-accordion-trigger]:not([disabled])`, `stopPropagation()` supports nested accordions. `AccordionTrigger` sets `aria-expanded`/`data-state` but **no `aria-controls`/`id` pairing** to its `AccordionContent` — a dangling ARIA relationship. `AccordionContent`'s `role='region'` similarly has no `aria-labelledby` back-reference. `keepMounted` (default `true`) — setting `false` fully unmounts closed content, which the CSS comments flag as breaking the exit animation.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/accordion.css`):
- `:6-9` — `--accordion-radius: var(--field-radius, 8px)` — resolves to the unaliased `--border-radius` primitive (8px), not a canonical `--radius-*` step.
- `~filled .item--open` — `box-shadow: 0 1px 2px hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.05)` — composed from HSL components rather than a `--elevation-*` token.
- `~content` — `transition: grid-template-rows var(--medium) cubic-bezier(0.87, 0, 0.13, 1)` — raw easing curve, not `--ease-spring`, so the duration alone doesn't make this a clean `--motion-micro`.
- No `aria-controls`/`id` pairing between trigger and content (dangling ARIA relationship, not a CSS token issue but worth flagging).

---

### Splitter
- **Import:** `import { Splitter, SplitterPane, SplitterGutter } from '@projective/ui'`
- **Source:** `packages/ui/src/components/splitter/{Splitter,SplitterPane,SplitterGutter}.tsx` (+ `packages/ui/src/hooks/useSplitter.ts`) · **Style:** `packages/ui/src/styles/components/splitter.css`
- **Radius:** none (edge-to-edge panes/gutter — no radius anywhere in the file) · **Elevation:** none · **Motion:** gutter hover/focus uses `var(--fast, 100ms)` ⚠ (fallback mismatches the real 150ms)
- **Purpose:** A drag-resizable multi-pane layout primitive with percent-based sizing, min/max constraints per pane, collapse/restore via double-click or Enter/Space, keyboard resize (arrow keys, Shift for large step), and a responsive stack-mode below a breakpoint.
- **Variants:** `direction`: `'horizontal'` (default) · `'vertical'` — auto-forced to `'vertical'` (stacked) when the container width drops below `breakpoint` (default `0`, i.e. off by default).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| horizontal | `splitter--horizontal.splitter--resizing`: `cursor:col-resize` on the container; gutter `width:4px` ⚠, `cursor:col-resize` at rest | gutter `:hover`: `background-color:var(--primary, #186f7e)` ⚠ | gutter `:focus-visible`: same `var(--primary, #186f7e)` ⚠ background swap (shared rule with `:hover`, not a distinct ring) | dragging: `splitter--resizing` on root, `user-select:none`, body cursor forced globally | — | — |
| vertical | mirrored `row-resize` cursor variants, gutter `height:4px` ⚠ | same | same | same | — | — |
| pane (collapsed) | `.splitter__pane-wrapper--collapsed { display:none }` | — | — | double-click or Enter/Space on the gutter toggles collapse; pre-collapse size remembered and restored (clamped to the neighbor's `minSize`) | — | — |
| responsive-stack mode | panes forced to `flexBasis:auto; flexGrow:1`; a plain `.splitter__divider-stack` (`height:1px; background:var(--field-border, hsla(0,0%,10%,.15))` ⚠) replaces the interactive gutter entirely | — | — | — | — | — |

**Anatomy & tokens:** `SplitterGutter` renders two undocumented child divs — `.splitter__gutter-handle` and `.splitter__gutter-hitbox` — with **zero CSS anywhere in the repo** (confirmed dead markup, no wider hit-area actually exists beyond the raw `4px` gutter itself). `aria-controls="pane-{index} pane-{index+1}"` on the gutter references ids that **no pane element ever sets** — a dangling ARIA relationship.
**Behavioral notes:** Full pointer + touch + keyboard support: `onMouseDown`/`onTouchStart` (single-touch, deliberately doesn't `preventDefault()` on touch-start so a missed handle still scrolls) start a drag tracked in a ref (not signals, to avoid render churn); `onKeyDown` supports `ArrowLeft/Right` (horizontal) or `ArrowUp/Down` (vertical) with a `2%` step / `10%` with Shift, plus `Enter`/`Space` to toggle collapse. `calculateMove` clamps both neighbors' `minSize`/`maxSize` (default `minPaneSize=10`, `maxSize=100`), pushing overflow onto the adjacent pane. Global `mousemove`/`mouseup`/`touchmove`(`{passive:false}`)/`touchend` listeners set `document.body.style.cursor`/`userSelect` for the drag duration.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/splitter.css`):
- `:40-50` — `background-color: var(--field-border, hsla(0, 0%, 10%, 0.15))` and `transition: background-color var(--fast, 100ms)` — raw hsla fallback and a `100ms` fallback mismatching the real `--fast` value (150ms).
- `:52-55` — `background-color: var(--primary, #186f7e)` on `:hover`/`:focus-visible` — raw hex fallback.
- `:57-67` — gutter `width`/`height: 4px` — raw px hit-width, with the (unstyled) `-hitbox` div implying a wider target was intended but never implemented.
- `:69-73` — `.splitter__divider-stack` repeats the same raw hsla fallback.
- `SplitterGutter.tsx` — dangling `aria-controls` referencing non-existent `pane-N` ids.

---

### Stepper
- **Import:** `import { Stepper, StepperHeader, Step, StepperContent, StepperPanel, StepperFooter } from '@projective/ui'`
- **Source:** `packages/ui/src/components/stepper/{Stepper,Step,StepperHeader,StepperContent,StepperPanel,StepperFooter}.tsx` (+ `packages/ui/src/hooks/useStepper.ts`) · **Style:** `packages/ui/src/styles/components/stepper.css`
- **Radius:** `50%` circular step indicator (geometric, not a radius-ladder token) + raw `2px` connector width · **Elevation:** focus-only glow — `.stepper__step--active .stepper__step-indicator { box-shadow: var(--focus-ring) }` (functionally `--focus-glow`) · **Motion:** `var(--fast) ease` bare (`--motion-standard`-ish) on step opacity/indicator; connector uses `var(--medium) ease` (`--motion-micro`-duration, non-spring)
- **Purpose:** A linear (by default) multi-step flow controller — header rail of numbered/dotted steps, content panel per step, footer nav — with an async `beforeStepChange` validation gate.
- **Variants:** `orientation`: `'horizontal'` (default) · `'vertical'` — **only `'vertical'` has any CSS layout rules; `'horizontal'` is entirely unstyled** ⚠. `variant` (indicator shape): `'circle'` (default) · `'dot'` — **neither has a dedicated CSS rule** ⚠, both render identically via the shared base step-indicator styling. Auto-forces to vertical below a `responsive` breakpoint (default `600px`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| pending step | `opacity:.6`; indicator `border:2px solid var(--step-color)` (`var(--text-disabled)`) | *(if `isClickable`)*: `opacity:1` | — (no `:focus-visible` rule on the step itself; it's a plain `<div onClick>`, not natively focusable) | — | — | `disabled` prop (or non-linear-blocked): `isClickable=false`, no hover-opacity affordance |
| active step | `opacity:1`; indicator `border-color:var(--step-active); color:var(--step-active); box-shadow:var(--focus-ring)` | — | — | — | — | — |
| completed step | `opacity:1`; indicator `background-color:var(--step-active); border-color:var(--step-active); color:white` ⚠ (literal, not `--on-accent`); connector `--active`: `background-color:var(--step-active)` | — | — | — | — | — |
| error step | `hasError` class applied (`stepper__step--error`) but ⚠ **zero matching CSS rule exists** — `--step-error` token is defined at the root but never consumed anywhere in the file | — | — | — | — | — |
| StepperPanel (per-step content) | `role='tabpanel'` (no matching `role='tab'`/id-linkage anywhere — incomplete ARIA relationship); `display:none` when inactive, `aria-hidden={!isActive}` | — | — | `--active`: `display:block` | — | — |

**Anatomy & tokens:** step indicator `32px` circle, `background-color` declared twice (`transparent` then `var(--step-bg)`, redundant); vertical connector positioned with raw `top:32px; left:15px; width:2px` tightly coupled to the 32px indicator size — **no horizontal connector exists at all**.
**Behavioral notes:** `linear` (default `true`) blocks jumping ahead more than one step and gates every forward transition through an optional async `beforeStepChange(current, next)` — `false`/thrown promise blocks the change (`console.error` logged), `isLoading` toggles around the await. `back()` bypasses `beforeStepChange` entirely (asymmetric with `next()`/`goTo()`). `StepperHeader.tsx` has a comment claiming the element was "Changed from `<div>` to `<nav>`" — it is still a `<div>` (comment/code mismatch). `Step` is a plain `<div onClick>` with no `role`, no keyboard handler, no `tabIndex` — not keyboard-operable at all despite being the primary step-navigation affordance.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/stepper.css`):
- `.stepper--horizontal`, `.stepper--dot`, `.stepper--circle` — all three classes are emitted by the component but have **zero CSS rules**; only `.stepper--vertical` has actual layout styling.
- `.stepper__step--error` — class emitted (`hasError`) but unstyled; the `--step-error` root token is defined and orphaned.
- `~completed indicator` — `color: white` literal instead of `--on-accent`.
- Dangling ARIA: `StepperPanel`'s `role='tabpanel'` has no corresponding `role='tab'`/id-linkage on `Step`.
- `Step` root has no `role`/`tabIndex`/keyboard handler — not operable via keyboard.

---

### HScroll
- **Import:** `import { HScroll } from '@projective/ui'`
- **Source:** `packages/ui/src/components/scroller/HScroll.tsx` (239 lines) · **Style:** `packages/ui/src/styles/components/hscroll.css`
- **Radius:** nav buttons raw `999px` → `--radius-pill` value, unwrapped · **Elevation:** `--elevation-2` on nav buttons (`var(--shadow-md)`) · **Motion:** `--motion-structural`-ish (`var(--medium) var(--ease-expressive)` on mask/nav fade — 250ms duration + luxe curve, not a clean canonical pair); momentum decay is physics-driven, not CSS-timed
- **Purpose:** A horizontal-scroll container with pointer-drag (Pointer Events, tap-tolerant), momentum/inertia decay, scroll-snap, edge-fade masking (`mask-image`, not an overlay div), and optional prev/next arrow buttons that hide at scroll boundaries and on touch devices.
- **Variants:** `snap: boolean` (default `true`, sets `scroll-snap-type:x proximity` inline — not `mandatory`), `fade: boolean` (default `true`), `controls: boolean` (default `true`, shows nav buttons).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| track | `cursor:grab`, `scrollbar-width:none` + `::-webkit-scrollbar{display:none}`, `touch-action:pan-y`, mask-image fade at both edges (`--hscroll-fade:40px` raw) | *(`@media (hover:hover)`)*: nav buttons fade in (`opacity:0→1`) only while hovering the whole `.hscroll` container | — (no explicit `:focus-visible` on the track; individual children retain their own focus styling) | `[data-dragging='true']`: `cursor:grabbing; scroll-behavior:auto; user-select:none` (native `scroll-behavior:smooth` suspended during drag) | — | — |
| nav buttons (`controls=true`) | `38px` circle (raw), `background:var(--glass-panel-strong); backdrop-filter:blur(var(--glass-blur-sm))` + `-webkit-` pair, `box-shadow:--elevation-2`, hidden (`opacity:0; pointer-events:none`) until container hover | `:hover`: `background:var(--card); border-color:var(--accent-teal); color:var(--accent-teal-strong)` | — | at scroll boundary: `[data-at-start='true'] .hscroll__nav--prev` / `[data-at-end='true'] .hscroll__nav--next` forced `opacity:0 !important; pointer-events:none` | — | — |
| touch devices | `@media (hover:none) { .hscroll__nav { display:none } }` — nav buttons never render at all, independent of the `controls` prop | — | — | — | — | — |

**Anatomy & tokens:** fade mask uses `linear-gradient(to right, transparent 0, #000 var(--fade-l), #000 calc(100% - var(--fade-r)), transparent 100%)` on `mask-image`/`-webkit-mask-image` — the opaque mask stops are a raw `#000` literal (mask color, not a visible color, but still a hardcoded literal per the guardrail's letter); `[data-at-start/end='true']` retract `--fade-l`/`--fade-r` to `0px` at exhausted edges (attribute-driven, not class-driven).
**Behavioral notes:** All interaction state is conveyed via `data-*` attributes (`data-fade`, `data-at-start`, `data-at-end`, `data-dragging`), not boolean classes. Pointer-drag has a `4px` tolerance before committing (so taps still click-through); momentum decays at `velocity *= 0.93` per animation frame, stopping under `0.15`; a captured click after a drag is swallowed via `onClickCapture` (`preventDefault`+`stopPropagation`) keyed off whether the drag actually moved. `nudge()` (arrow-button scroll) moves by `82%` of one viewport width, not a fixed card width. `scroll-snap-align:start` is applied unconditionally to every child even when `snap={false}` — only the track's `scroll-snap-type` is toggled off in that case.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/hscroll.css`):
- `~fade mask` — `#000` literal mask-stop color (technically a raw color literal, though functionally opacity-only).
- `~.hscroll { --hscroll-fade: 40px }` — a locally-defined raw px "fade width" with no shared token backing it.
- `~.hscroll__nav` — `width/height:38px` raw; `border-radius:999px` raw pill (should be `--radius-pill`).
- `~.hscroll__nav--prev/--next` — `left/right:6px` raw offsets.

---

### Wizard
- **Import:** `import { WizardLayout, WizardFooter } from '@projective/ui'` (plus `WizardStage`/`WizardForm`/`WizardPreview` slot components exported from the same module)
- **Source:** `packages/ui/src/components/layouts/wizard/{WizardLayout,WizardFooter}.tsx` · **Style:** `packages/ui/src/styles/components/wizard.css`
- **Radius:** `--radius-card` intended (`var(--border-radius__large, 12px)`, clean) — only on `.wizard__card` · **Elevation:** none · **Motion:** none (no transitions anywhere in `wizard.css`)
- **Purpose:** Thin chrome around a `Stepper`-driven flow — header (back button + title) and a card shell that intentionally carries no internal padding/gap so the nested `Stepper` owns all spacing.
- **Variants:** single visual — no variant prop; `WizardStage`/`WizardForm`/`WizardPreview` are structural slot components, not visual variants.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| single visual | `.wizard__card { border-radius:var(--border-radius__large, 12px); border:1px solid var(--border-color); background:var(--card); overflow:hidden }` (deliberate mask so the flush-fit `Stepper` keeps rounded corners) | — | — | — | — | — |

**Anatomy & tokens:** `.wizard__header`/`.wizard__title` are the only other styled selectors in the file (flex row, `min-height:2rem`, `font-size:1.25rem; font-weight:600`). **`.wizard__stage`, `.wizard__form`, `.wizard__preview`, `.wizard__footer`, `.wizard__secondary-actions`, `.wizard__nav-buttons` have zero CSS rules anywhere in the codebase** ⚠ — every className these slot components emit is currently unstyled, relying entirely on child `Button`/`ButtonGroup` components for any visual structure.
**Behavioral notes:** **Two independent, disconnected step-state systems coexist**: `useWizardEngine`/`WizardProvider` (`packages/ui/src/hooks/useWizard.tsx`, 1-indexed, used directly by `apps/web/features/auth/components/onboarding/*`) versus `Stepper`'s own `useStepperContext` (0-indexed) — `WizardFooter` is actually wired to the **latter** (`useStepperContext`), not the wizard-named engine, despite living in the `wizard/` folder. `WizardFooter`'s Back button `disabled={isFirst || isLoading}`; Next/Finish button is never disabled, only `loading`-gated.
**⚠ Guardrail violations found:** No raw hex/hsl/px-radius/ms violations in `wizard.css` itself (the two rules present are clean) — the real gap is structural: six of the component's own classNames (`wizard__stage`, `wizard__form`, `wizard__preview`, `wizard__footer`, `wizard__secondary-actions`, `wizard__nav-buttons`) have no CSS backing at all.

---

### ProgressMeter
- **Import:** `import { ProgressMeter } from '@projective/ui/atoms'` (also re-exported from the bare `@projective/ui` barrel via `mod.ts`, but `atoms.ts`'s own header comment says to prefer importing atoms from the `/atoms` sub-path so bundles stay lean)
- **Source:** `packages/ui/src/components/progress/ProgressMeter.tsx` (163 lines) · **Style:** `packages/ui/src/styles/components/progress-meter.css`
- **Radius:** `--radius-pill` (raw `999px` track/fill, unwrapped) · **Elevation:** glow-based, not the elevation ladder (`box-shadow:0 0 12px -2px var(--pm-accent)`) · **Motion:** `--motion-structural` (`var(--dur-cinematic) var(--ease-expressive)`, clean) on fill width / stroke-dashoffset
- **Purpose:** A dual-mode (linear bar or radial SVG ring) progress indicator with an optional milestone marker + caption, used for profile-completion and similar setup trackers.
- **Variants:** `variant`: `'linear'` (default) · `'radial'` (SVG, `stroke-dasharray`/`stroke-dashoffset`). `tone`: `'teal'` (default) · `'primary'` · `'mint'` · `'violet'`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active/expanded | selected | disabled |
|---|---|---|---|---|---|---|
| linear / gold (default) | track `height:6px` (raw), `border-radius:999px` (raw), `background:var(--hairline-strong)`; fill `background:var(--pm-grad)` (`var(--grad-teal-velvet)`), `box-shadow:0 0 12px -2px var(--pm-accent)`, animated `::after` sheen overlay (`var(--surface-subtle)`, `mix-blend-mode:screen`) | — (non-interactive, `role='progressbar'`) | — | width transitions via `transition:width var(--dur-cinematic) var(--ease-expressive)` on every `value` change | — | — |
| linear / primary / mint / violet | `--pm-accent`/`--pm-accent-strong`/`--pm-grad` swapped per tone; `mint`/`violet` build a raw inline `linear-gradient(120deg, …)` instead of referencing a shared `--grad-*` token (unlike `gold`/`primary`, which use `var(--grad-teal-velvet)`/`var(--grad-brand-diag)`) | — | — | — | — | — |
| radial | SVG ring, `stroke:var(--hairline-strong)` (track) / `var(--pm-accent)` (fill), `transition:stroke-dashoffset var(--dur-cinematic) var(--ease-expressive)`, `filter:drop-shadow(0 0 5px var(--pm-accent-strong))` | — | — | same width/offset transition pattern | — | — |
| milestone marker | tick `2px × 12px`, `background:var(--pm-accent-strong)`, faceted diamond bead `::before` (`background:var(--pm-grad)`, `box-shadow:var(--glow-teal, 0 0 8px -1px var(--pm-accent))` ⚠ literal fallback) | — | — | `data-reached='false'`: tick fades to `var(--hairline-strong)` + `box-shadow:none`; bead `::before` swaps to `var(--card-bg, var(--bg, transparent))` with a `1px solid var(--text-muted)` border | — | — |

**Anatomy & tokens:** `stroke = thickness ?? max(3, round(size*0.1))`, `r = (size-stroke)/2`, `c = 2πr`, `offset = c*(1-pct/100)`, rotated `-90deg` so the arc starts at 12 o'clock; `value` is clamped/rounded to `0-100` via a local `clamp()` helper applied to both the main value and the milestone percent.
**Behavioral notes:** Both variants set `role='progressbar'`, `aria-valuenow/min/max`, and `aria-label` (falls back to `'Profile setup'` if neither `ariaLabel` nor `label` is given) — fully accessible as a progress widget. `showMilestoneLabel` is suppressed when there's neither a `label` nor `showValue`, to avoid layout reflow in compact contexts. No segmented-bar variant exists — exactly `linear` and `radial`, nothing else.
**⚠ Guardrail violations found** (`packages/ui/src/styles/components/progress-meter.css`):
- `~track` — `height:6px; border-radius:999px` raw (should reference `--radius-pill`).
- `~mint/violet tones` — inline `linear-gradient(120deg, var(--mint), var(--primary))` / `linear-gradient(120deg, var(--violet), var(--primary))` instead of a shared `--grad-*` token, inconsistent with `teal`/`primary`'s token-referenced gradients.
- `~milestone bead ::before` — `box-shadow: var(--glow-teal, 0 0 8px -1px var(--pm-accent))` raw fallback shadow.
- `~fill` — `box-shadow: 0 0 12px -2px var(--pm-accent)` — a hand-built glow rather than one of the `--glow-*` tokens.
