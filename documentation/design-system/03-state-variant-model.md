# State & Variant Model

> Part of the [Design System Master Specification](DESIGN_SYSTEM.md). This is the canonical grid every
> component matrix under [`components/`](components/) is written against. Read this once; then each
> component sheet only records where it *deviates* from these defaults.

## 1. The two axes

Every interactive component is specified as **status variant × behavioural state**.

### Status variants (the *what*)

| Variant | Solid token | Soft-surface token | Meaning |
|---------|-------------|--------------------|---------|
| `primary`   | `--status-primary`   | `--status-primary-surface`   | The brand action / default emphasis (teal). |
| `secondary` | `--status-secondary` | `--status-secondary-surface` | Lower-emphasis companion action. |
| `success`   | `--status-success`   | `--status-success-surface`   | Confirmations, completed, positive deltas. |
| `warning`   | `--status-warning`   | `--status-warning-surface`   | Caution, needs-attention, pending. |
| `danger`    | `--status-danger`    | `--status-danger-surface`    | Destructive, error, blocked. |
| `info`      | `--status-info`      | `--status-info-surface`      | Neutral information, hints (ocean). |
| `neutral`   | `--status-neutral`   | `--status-neutral-surface`   | Inactive, muted, disabled-adjacent. |
| `social`    | `--status-social`    | `--status-social-surface`    | People, feed, community (violet — social surfaces only). |

Foreground on a **solid** fill is always `--on-accent`. Foreground on a **soft-surface** fill is the
matching solid token (e.g. text `--status-danger` on `--status-danger-surface`).

### Behavioural states (the *how*)

| State | Trigger | Canonical treatment |
|-------|---------|---------------------|
| `default` | resting | Variant's base fill/border/text. |
| `hover` | pointer over | Lightness shifts by `--hover-delta` (−8% light / +6% dark), **or** the soft-surface fill appears. Elevated cards rise by `--hover-lift` (−1px). Transition on `--motion-standard`. |
| `focus` | `:focus-visible` | Adds the **`--focus-glow`** ring (3px teal @ .4). Danger/social swap to `--focus-glow-danger` / `--focus-glow-violet`. **Never removed without a replacement.** |
| `active` | `:active` press | Lightness shifts by `--active-delta` (−12% / +10%) **and** a tactile `translateY(--press-translate)` (1px down). Snappy on `--motion-micro` (spring). |
| `selected` | chosen / on | Solid accent fill, or `-surface` tint + a 1px accent border. Toggles (`Checkbox`, `Switch`) travel on `--motion-micro`. |
| `disabled` | `disabled` | Foreground `--text-disabled`; structural grey fill `--disabled-bg`; `--field-border-disabled`; no shadow; `cursor: not-allowed`; not focusable. |

## 2. The reference matrix — `Button` as exemplar

This is the shape every component sheet follows. (Actual per-component sheets live in `components/`.)

| Variant | default | hover | focus-visible | active | selected | disabled |
|---------|---------|-------|---------------|--------|----------|----------|
| `primary` | bg `--status-primary`, text `--on-accent`, radius `--radius-button`, `--elevation-1` | bg `--primary-hover` | `+ --focus-glow` | bg `--primary-active`, `translateY(--press-translate)` | — | bg `--disabled-bg`, text `--text-disabled`, no shadow |
| `secondary` | bg `--status-secondary-surface`, text `--text-main`, `1px --border-color` | bg `--surface-1` | `+ --focus-glow` | `translateY(--press-translate)` | — | as above |
| `success` | bg `--status-success`, text `--on-accent` | `--success` −8% L | `+ --focus-glow` | `−12% L` + press | — | as above |
| `warning` | bg `--status-warning`, text `--on-accent` | −8% L | `+ --focus-glow` | −12% L + press | — | as above |
| `danger` | bg `--status-danger`, text `--on-accent` | −8% L | `+ --focus-glow-danger` | −12% L + press | — | as above |
| `info` | bg `--status-info`, text `--on-accent` | −8% L | `+ --focus-glow` | −12% L + press | — | as above |
| `neutral` | bg transparent, text `--text-secondary` | bg `--surface-1` | `+ --focus-glow` | `--surface-sunken` + press | — | text `--text-disabled` |

**Ghost / outline modifiers** (orthogonal to variant): `outline` swaps the solid fill for a `1px`
variant-coloured border + transparent bg (text = variant solid); `ghost` drops the border too. Both
still apply the same hover/focus/active/disabled rules.

## 3. Technical detail conventions

Each component sheet records these where they apply:

- **HSL assignments** — every state cell names the exact token; raw HSL only appears in the token
  reference, never a component.
- **Border line widths** — `1px` hairline (`--border-color` / `--hairline`) is the default; `2px` for
  emphasized/selected borders; focus is a *glow* (box-shadow), not a border-width change, so layout
  never shifts on focus.
- **Elevation** — dual-shadow `--elevation-*`. Resting interactive surfaces sit at `--elevation-1`;
  hover promotes one step; overlays live at `--elevation-3`/`4`.
- **Positioning mechanics** — tooltips/popovers anchor to their trigger with a safety inset and flip
  within the viewport; they render on `--surface-overlay` at `--elevation-3` and honour the
  `--z-tooltip` / `--z-dropdown` scale.
- **Tactile press** — `active` = colour delta **plus** `translateY(--press-translate)`; the two
  together read as a physical button press, not just a tint.

## 4. Toggle sub-grid (Checkbox / Switch / ViewToggle)

Binary/selection controls add a `selected` dimension crossed with state:

| | default | hover | focus | disabled |
|--|---------|-------|-------|----------|
| **off** | track `--surface-sunken`, `1px --field-border` | border `--field-border-hover` | `+ --focus-glow` | `--disabled-bg` |
| **on** | track `--status-<tone>`, thumb `--surface-card`, thumb slides on `--motion-micro` | tone −8% L | `+ --focus-glow` | `--disabled-bg`, thumb dimmed |

## 5. Density, radius & motion overrides

The above is the `comfortable / standard / full-motion` baseline. A `<DesignSystemProvider>` ancestor
(see [`02-context-theming.md`](02-context-theming.md)) re-scopes it:

- `density="compact"` → `--input-height` 2.5rem→2rem, tighter padding, 32px table headers.
- `radius="sharp"` → the whole ladder collapses toward 2–10px (Carbon character).
- `motion="reduced"` → every `--motion-*` becomes `1ms linear` (all the matrices' transitions flatten).
