# Token Reference

> Part of the [Design System Master Specification](DESIGN_SYSTEM.md). The exhaustive list of design
> tokens, their exact values, and where they live. **Primitives** carry raw HSL/values; **semantic**
> tokens alias primitives and are what components consume.

**Source files** (all under `apps/web/styles/themes/`):

| File | Owns |
|------|------|
| `variables/colour.css` | Colour primitives + generated colours, shadows, glows, glass, teal-velvet palette. |
| `variables/ui.css` | Radius ladder, durations, easings, z-index, layout metrics. |
| `variables/fields.css` | Field-component structural tokens. |
| `variables/data.css` | Data-package semantic bridge (tables/grids/lists). |
| `variables/font.css` | Type family + root size. |
| `variables/system.css` | **The semantic layer** — surfaces, radius aliases, motion pairs, focus glow, elevation, status map, `[data-ds-*]` overrides. |

---

## 1. Colour primitives (HSL parts) — `colour.css`

Colours are authored as **H / S / L parts** then composed, so themes flip by overriding parts.

| Family | Hue | Sat | Light (light theme) | Light (dark theme) |
|--------|-----|-----|---------------------|--------------------|
| header | 0 | 0% | 100% | 6% |
| mid | 0 | 0% | 99% | 9% |
| bg | 0 | 0% | 98% | 12% |
| card | 0 | 0% | 100% | 13% |
| text | 0 | 0% | 10% | 100% |
| **primary (teal)** | **186** | **57%** | **36%** | 36% |
| danger | 0 | 70% | 55% | 55% |
| warning | 37 | 90% | 45% | 50% |
| success | 160 | 65% | 40% | 45% |
| violet (social) | 258 | 85% | 66% | 72% (90% sat) |

Interaction deltas: `--hover-delta` −8% (light) / +6% (dark) · `--active-delta` −12% / +10% ·
`--darker-delta` −20% / +20% · `--lighter-delta` +20% / −20%.

### Generated / semantic colours

| Token | Definition |
|-------|-----------|
| `--primary` | `hsl(186 57% 36%)` = **`#288690`** |
| `--primary-hover` | primary + `--hover-delta` |
| `--primary-active` | primary + `--active-delta` |
| `--primary-surface` | `hsla(186 57% 36% / .12)` — soft fill |
| `--primary-half` | `hsla(186 57% 36% / .25)` |
| `--card-hover` / `--card-active` | card ± hover/active delta |
| `--text-main` | `hsl(0 0% 10%)` (light) / `100%` (dark) |
| `--text-secondary` | text + lighter delta |
| `--text-muted` | `text / .6` |
| `--text-disabled` / `--text-tertiary` | `text / .35` |
| `--border-color` | `text / .15` |
| `--hairline` | `text / .1` · `--hairline-strong` `text / .18` |

### Discovery & extended accents

`--mint` `hsl(160 70% 42%)` · `--violet` `hsl(258 85% 66%)` · `--amber` `hsl(37 95% 55%)` ·
`--ocean` `hsl(199 89% 48%)` · `--ember` `hsl(330 81% 60%)` · `--forest` `hsl(142 71% 42%)` ·
`--neutral` `hsl(220 9% 46%)`. Each ships a `-surface` translucent fill at `~.14` alpha. All
up-saturate under dark.

### Auth / aurora-glass, brand showcase, teal-velvet

`--aqua` `hsl(168 78% 66%)` · `--grad` / `--grad-brand` / `--grad-teal-velvet` (teal→mint→aqua /
teal→violet) · `--glass-panel` / `--glass-panel-strong` / `--glass-blur` (18px) / `--glass-hairline`.
Teal-velvet structural set: `--accent-mist` `hsl(174 40% 88%)` · `--accent-teal` `hsl(178 62% 40%)` ·
`--surface-dark-workspace` `hsl(252 24% 12%)` · `--border-subtle` · `--surface-subtle` · `--glow-teal`.
(Structural workspace tokens — no metallic/luxury framing.)

### Shadows & glows (dual-layer)

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-sm` | `0 1px 2px /.06`, `0 1px 3px /.1` | pure-black `.4/.5` |
| `--shadow-md` | `0 4px 12px /.08`, `0 2px 4px /.06` | `.45/.4` |
| `--shadow-lg` | `0 12px 32px /.12`, `0 4px 10px /.08` | `.55/.45` |
| `--shadow-xl` | `0 24px 60px /.18`, `0 8px 18px /.1` | `.66/.5` |
| `--glow-primary` / `--glow-violet` / `--glow-teal` | `0 10–16px … -8/-12px hsla(accent / .4–.5)` | intensified |

`--focus-ring` (legacy) ≡ `--focus-glow` = `0 0 0 3px hsla(186 57% 36% / .4)`.

---

## 2. Geometry & motion — `ui.css`

| Token | Value | | Token | Value |
|-------|-------|-|-------|-------|
| `--border-radius__xsmall` | 4px | | `--fast` | 150ms |
| `--border-radius__small` | 0.375rem (6px) | | `--medium` | 250ms |
| `--border-radius` | 8px | | `--slow` | 350ms |
| `--border-radius__large` | 12px | | `--dur-cinematic` | 620ms |
| `--border-radius__xlarge` | 16px | | | |
| `--border-radius__xxlarge` | 22px | | | |

| Easing | `cubic-bezier` |
|--------|----------------|
| `--ease-standard` | `0.4, 0, 0.2, 1` |
| `--ease-out` | `0.22, 1, 0.36, 1` |
| `--ease-spring` | `0.34, 1.56, 0.64, 1` |
| `--ease-in-out` | `0.83, 0, 0.17, 1` |
| `--ease-expressive` | `0.19, 1, 0.22, 1` |

Layout metrics: `--header-height` 4rem · `--side-nav-width` 4rem/14rem · `--input-height` 2.5rem ·
`--input-padding-x` 0.75rem · `--scale` 1. Z-index: `--z-nav-content` 10 · `--z-scrollbar` 40 ·
`--z-middle` 50 · `--z-nav` 60 · `--z-dropdown` 1000 · `--z-tooltip` 2000 · `--z-overlay` 9999 ·
`--z-toast` 10000.

Navigation shell geometry (bespoke structural tokens, above the radius ladder): `--nav-shell-radius`
80px — the signature squircle curve of the header ⇄ side-rail ⇄ content masks; `--side-nav-top-clearance`
(= `--nav-shell-radius`) pushes the first side-rail item strictly below where that curve ends.
Contextual middle-rail drag/density: `--nav-splitter-width` 6px · `--middle-side-min` 64px ·
`--middle-side-collapsed-max` 132px (≤ ⇒ **State A** icon-only rail) · `--middle-side-intermediate-max`
232px (≤ ⇒ **State B** icon grid) · `--middle-side-default` 300px (**State C** master-detail) ·
`--middle-side-max` 460px. The Splitter island resolves the live drag width into a
`data-density="collapsed|intermediate|expanded"` on `.navigation__middle-side`; the shared
`.mid-rail__*` blueprint re-flows between the three densities on `--motion-structural`. JS mirrors of
these bounds live in `NavigationContext.tsx` (`MIDDLE_SIDE_MIN/MAX`, `DENSITY_*_MAX`) and must stay in
lock-step.

---

## 3. Semantic layer — `system.css`

### Surfaces

| Token | Aliases | Use |
|-------|---------|-----|
| `--surface-0` | `--bg` | Base canvas |
| `--surface-1` | `--mid` | Recessed / striping |
| `--surface-2` | `--header` | Elevated chrome |
| `--surface-card` | `--card` | Content surface |
| `--surface-sunken` | bg −20% L | Wells / grooves |
| `--surface-overlay` | `--card` | Menus/popovers (+ `--elevation-3`) |

### Radius aliases

`--radius-control` 4px · `--radius-field` 6px · `--radius-button` 6px · `--radius-card` 12px ·
`--radius-stage` 16px · `--radius-feed` 22px · `--radius-pill` 999px.

### Motion pairs

`--motion-structural` = `620ms cubic-bezier(0.19,1,0.22,1)` · `--motion-micro` =
`250ms cubic-bezier(0.34,1.56,0.64,1)` · `--motion-standard` = `150ms cubic-bezier(0.4,0,0.2,1)`.

### Focus, elevation, status, interaction

- Focus: `--focus-glow` (teal .4) · `--focus-glow-danger` · `--focus-glow-violet`.
- Elevation: `--elevation-0` `none` → `--elevation-4` `--shadow-xl`.
- Status: `--status-{primary,secondary,success,warning,danger,info,neutral,social}` + each `-surface`;
  `--on-accent` `#fff`.
- Interaction: `--press-translate` 1px · `--hover-lift` −1px.

### `[data-ds-*]` context overrides

| Selector | Re-scopes |
|----------|-----------|
| `[data-ds-density='compact']` | `--input-height` 2rem, `--input-padding-x` .5rem, header 32px, gap .5rem |
| `[data-ds-density='spacious']` | `--input-height` 3rem, padding 1rem, header 48px, gap 1.5rem |
| `[data-ds-radius='sharp']` | ladder → 2 / 2 / 2 / 4 / 8 / 10 px |
| `[data-ds-radius='soft']` | ladder → 6 / 10 / 10 / 18 / 22 / 28 px |
| `[data-ds-accent='violet']` | `--primary-*` → violet parts |
| `[data-ds-accent='ocean']` | `--primary-*` → `199 89% 48%` |
| `[data-ds-motion='reduced']` | all `--motion-*` → `1ms linear` |

---

## 4. Field tokens — `fields.css`

`--field-bg` (`--card`) · `--field-bg-hover` (`--input-bg`) · `--field-bg-disabled`
(`--disabled-bg`) · `--field-border` (`--border-color`) · `--field-border-hover` (`--text-muted`) ·
`--field-border-focus` (`--primary`) · `--field-border-error` (`--danger`) ·
`--field-border-disabled` · `--field-text` · `--field-text-placeholder` (`--text-muted`) ·
`--field-text-label` · `--field-text-disabled` · `--field-text-error` · `--field-height`
(`--input-height`) · `--field-padding-x` · `--field-radius` (`--border-radius`) · `--field-transition`
· `--field-ring-color` · `--field-ripple-color` (`--primary-surface`) · `--input-bg` · `--disabled-bg`.

> **Migration note:** the component audit found field CSS frequently uses `var(--token, <hardcoded
> fallback>)` with a raw hex/px/ms fallback, plus several **undefined** tokens that always render
> their dead fallback (`--text-brand`, `--bg-overlay`, `--gray-900`, `--field-ring-width`,
> `--field-icon-size`, `--field-gap`, `--error-500`, `--bg-brand-solid`, …). New field tokens must be
> **defined here** — never rely on a fallback. See `components/fields.md` for the cited list.

---

## 5. Data tokens — `data.css`

`--bg-surface` (`--card`) · `--bg-surface-subtle` (`--mid`) · `--bg-surface-active`
(`--card-active`) · `--bg-selection` (`--primary-surface`) · `--text-primary` (`--text-main`) ·
`--text-brand` (`--primary`) · `--border-default` / `--border-subtle` (`--hairline`) ·
`--border-active` / `--border-focus` (`--primary`) · `--data-font-family` · `--data-font-size`
0.875rem · `--data-transition` (`--fast`) · `--data-radius` (`--border-radius`) · `--table-header-bg`
(`--mid`) · `--table-header-height` 40px · `--table-cell-padding` `.5rem .75rem` · `--grid-gap` 1rem.

---

## 6. Typography — `font.css`

`--font-sans` (system stack) · `--font-dyslexia` (`OpenDyslexic, Atkinson, --font-sans`). Root
`font-size: 14px`.
