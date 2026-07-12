# Atoms — Component State & Variant Matrices

This document is the exhaustive behavioral reference for the atomic primitives in `@projective/ui`
(`packages/ui/src/components/`): every visual variant crossed with every interaction state, sourced
directly from each component's `.tsx` and its paired stylesheet in
`packages/ui/src/styles/components/*.css`. It exists so a future engineer can build or restyle a
primitive without re-reading the source — every cell below is a fact read out of code, not an
assumption. Where a state genuinely isn't styled, the cell says so explicitly ("inherits default")
rather than inventing a value; where the source hard-codes a raw hex/hsl/px/ms instead of reaching
for a design token, it is called out under "⚠ Guardrail violations found" with the exact `file:line`
and the token that should replace it.

> **✅ Migration status — foundational atoms MIGRATED.** The atomic primitives below now consume the
> semantic token system. Every `⚠ Guardrail violations found` block is retained as the **pre-migration
> audit record** and has been **resolved** — each cited raw value was replaced with the token named
> beside it (`#ffffff`/`#fff`→`--on-accent`, `9999px`/`999px`→`--radius-pill`, `--border-radius*`
> fallbacks→`--radius-button`/`--radius-field`/`--radius-card`/`--radius-control`, `--focus-ring`
> fallback→`--focus-glow`, raw-ms transitions→`--motion-*`, `translateY(-1/-2px)`→`--hover-lift`).
> The `theme-toggle` sky/night/starfield palette moved into `--tt-*` tokens in `colour.css`;
> `FILE_TONE_COLORS` now references `--mint`/`--danger`/`--violet`/`--neutral`; `Logo` defaults to
> `currentColor`. **Intentionally kept as literals:** keyframe *loop* durations (spinner `1s`, ripple
> ink `600ms` — functional animation timings, not transition tokens) and Avatar's procedural
> per-identity hue (a deliberate generative exception).

---

### Button
- **Import:** `import { Button } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/button/Button.tsx` · **Style:** `packages/ui/src/styles/components/button.css`
- **Radius:** `--radius-button` (6px) — *aspirational; CSS actually reads `var(--border-radius, 8px)`, see guardrails* · **Elevation:** none at rest; `--shadow-md`-equivalent on `premium` hover (`var(--glow-primary)`) · **Motion:** `--motion-standard`-equivalent (150ms) — *CSS hard-codes `150ms` rather than the alias*
- **Purpose:** The primary interactive control — polymorphic (`<button>` or `<a>` via `href`), with loading/disabled states, a self-contained ripple, and an optional trailing `ButtonBadge`.
- **Variants:** `primary` (default) · `secondary` · `success` · `warning` · `danger` · `info` · `link` · `premium`. Orthogonal modifiers: `size` (`small`/`medium`/`large`), `outlined`, `ghost`, `rounded`, `fullWidth`, `loading`, `disabled`.

**Variant × State matrix**

| Variant | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| primary | bg `var(--primary)`, text `#ffffff` ⚠, border transparent, height `--btn-height-md`(2.5rem) | bg `var(--primary-hover)` | `+ box-shadow var(--focus-ring, 0 0 0 3px rgba(66,153,225,.5))` ⚠ (functionally `--focus-glow`) | bg `var(--primary-active)` (no `translateY`/`--press-translate`) | — | bg `var(--disabled-bg, rgba(0,0,0,.1))` ⚠, text `var(--text-disabled)`, border transparent, opacity .6, `cursor:not-allowed`, shadow none |
| secondary | bg `var(--input-bg, rgba(0,0,0,.05))` ⚠, text `var(--text-main)` | bg `hsla(var(--text-hue),var(--text-saturation),var(--text-lightness),.1)` | same focus ring as above | bg `hsla(...,.15)` | — | same shared disabled block |
| success | bg `var(--success)`, text `#ffffff` ⚠ | `filter: brightness(0.95)` (no bg swap) | same focus ring | inherits default (no `.btn--success:active` rule) | — | same shared disabled block |
| warning | bg `var(--warning)`, text `#ffffff` ⚠ | `filter: brightness(0.95)` | same focus ring | inherits default (no dedicated rule) | — | same shared disabled block |
| danger | bg `var(--danger)`, text `#ffffff` ⚠ | `filter: brightness(0.9)` | same focus ring | inherits default (no dedicated rule) | — | same shared disabled block |
| info | **no `.btn--info` rule exists** — silently renders identical to `primary` (bg `var(--primary)`) | same as primary | same focus ring | same as primary | — | same shared disabled block |
| link | bg transparent, text `var(--primary)`, `text-decoration: underline`, `height:auto`, `padding:0` | `color: var(--primary-hover)` | same focus ring | inherits default | — | shared disabled block still applies (visually odd: forces a bg fill onto a link-styled button) |
| premium | bg transparent + `background-image: var(--grad-brand-diag)` (180% sweep), text `#ffffff` ⚠, `box-shadow: var(--shadow-md)` | bg-position → 100% 50%, `box-shadow: var(--glow-primary)`, `transform: translateY(-1px)` ⚠ | same focus ring | `transform: translateY(0)` | — | same shared disabled block |

**Anatomy & tokens:** heights `--btn-height-sm`=2rem(small) / `--btn-height-md`=`var(--input-height,2.5rem)`(medium) / `--btn-height-lg`=3rem(large); padding `0 .75rem`/`0 1rem`/`0 1.5rem`; font `.75rem`/`.875rem`/`1rem`, weight 500; border `1px solid var(--btn-border)` (transparent by default); icon-only variant (`.btn--icon-only`, used by `IconButton`) forces `width = height`, no padding; `rounded` modifier sets `border-radius: 9999px !important` ⚠; badge (`ButtonBadge`) sits after the label with `margin-left:.5rem`.

**Behavioral notes:**
- Ripple is a **built-in, self-contained copy** (`.btn__ripple`, spawned by the shared `useRipple()` hook) — deliberately duplicated from `RippleSurface`/`ripple.css` so `Button` stays dependency-free (documented in `ripple.css`'s file header). All variants ripple except `link` (`handleClick` explicitly skips `addRipple` when `variant === 'link'`).
- `loading` swaps the content for a spinning `IconLoader2` (`.btn__spinner`, `animation: btn-spin 1s linear infinite`), sets `cursor:wait`, `opacity:.8`, and `handleClick` calls `e.preventDefault()` + returns early — same guard for `disabled`.
- `disabled`/`loading` accept a `Signal<boolean>` as well as a plain `boolean` (unwrapped via `instanceof Signal` check) so callers can bind reactive state directly.
- Polymorphic render: supplying `href` renders an `<a role="button">` (supports `f-partial` for Fresh partial nav); otherwise a native `<button type={htmlType ?? 'button'}>`.
- **Contrast bug:** `outlined` and `ghost` modifiers only override text colour for `primary`/`secondary`/`danger`/`success` (`.btn--outline.btn--{variant}`, `.btn--ghost.btn--{variant}`). For `warning`, `info`, `link`, and `premium`, the modifier strips the background but the text colour stays whatever the base variant set (`#ffffff` for warning/premium) — e.g. `outlined`+`warning` renders **white text on a transparent background**, illegible against light surfaces. Not styled anywhere; a real coverage gap, not a hypothetical.
- `ButtonGroup` clones `variant`/`size`/`fullWidth`/`disabled` onto every child (see below); `SplitButton` composes two `Button`s inside a `Popover`.

**⚠ Guardrail violations found** (`packages/ui/src/styles/components/button.css`):
- `:7` — `--btn-radius: var(--border-radius, 8px)` — raw `8px` fallback on a non-canonical alias; should be `var(--radius-button)`.
- `:8` — `--btn-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1)` — raw `150ms` + raw curve; should be `var(--motion-standard)`.
- `:13, :60, :90, :101, :112, :138` — six occurrences of `--btn-text: #ffffff` (base, primary, success, warning, danger, premium); should be `var(--on-accent)`.
- `:50` — `box-shadow: var(--focus-ring, 0 0 0 3px rgba(66, 153, 225, 0.5))` — raw shadow fallback (duplicates `--focus-glow`'s exact value); should reference `var(--focus-glow)` directly.
- `:74` — `--btn-bg: var(--input-bg, rgba(0, 0, 0, 0.05))` — raw rgba fallback.
- `:146-148` — `background-position var(--slow, 350ms)…`, `box-shadow var(--medium, 250ms)…`, `transform var(--medium, 250ms)…` — three raw ms fallbacks; should be `var(--motion-structural)` / `var(--motion-micro)`.
- `:154` — `transform: translateY(-1px)` — raw px; should be `translateY(var(--hover-lift))`.
- `:178` — `border-radius: 9999px !important` — raw px; should be `var(--radius-pill)`.
- `:303` — `background-color: var(--disabled-bg, rgba(0, 0, 0, 0.1)) !important` — raw rgba fallback.
- `:391` — `animation: btn-spin 1s linear infinite` — raw `1s` duration, not token-derived.
- `:411` — `animation: btn-ripple 600ms linear` — raw `600ms` duration, not token-derived.

---

### IconButton
- **Import:** `import { IconButton } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/button/IconButton.tsx` · **Style:** `packages/ui/src/styles/components/button.css` (`.btn--icon-only`)
- **Radius:** inherits `Button`'s `--btn-radius` (or `9999px` ⚠ if `rounded`) · **Elevation:** inherits `Button` · **Motion:** inherits `Button`
- **Purpose:** A `Button` wrapper constrained to a single centred icon and a strict square footprint; requires `aria-label` since it renders no visible text.
- **Variants:** Same 8 `ButtonVariant`s as `Button`, but defaults differ: `variant='secondary'`, `ghost=true` (vs. `Button`'s `variant='primary'`, `ghost=false`).

**Variant × State matrix**

Identical cell values to `Button`'s matrix (it *is* a `Button` under the hood) — see that table for exact tokens per variant/state. The only structural difference is geometry, not colour:

| Aspect | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| shape (all variants) | square: `width = height = var(--btn-height-{size})`, `padding:0`, `flex-shrink:0` | inherits Button hover for chosen `variant` | inherits Button focus ring | inherits Button active | — | inherits Button disabled |

**Anatomy & tokens:** square sizes `2rem`(small) / `2.5rem`(medium, default) / `3rem`(large) — set by `.btn--small.btn--icon-only` / base `.btn--icon-only` / `.btn--large.btn--icon-only`; icon is passed as `children` (a single `JSX.Element`, typically a Tabler icon) and centred via `.btn__content` flex.
**Behavioral notes:** `rounded` prop (default `false`) turns the square into a circle via the shared `--btn--rounded` `9999px` rule. `aria-label` is a **required** prop (typed as non-optional in `IconButtonProps`), enforcing accessibility at the type level since there's no visible label text.
**⚠ Guardrail violations found:** None in `IconButton.tsx` itself — inherits all of `Button`'s CSS violations listed above (not re-cited here to avoid duplication).

---

### ButtonGroup
- **Import:** `import { ButtonGroup } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/button/ButtonGroup.tsx` · **Style:** `packages/ui/src/styles/components/button.css` (§6 Button Group)
- **Radius:** `--btn-radius` on the group container, `0` on interior children, restored on end-caps · **Elevation:** none · **Motion:** none (structural container, no transitions of its own)
- **Purpose:** A layout/prop-injection primitive — clones `variant`/`size`/`fullWidth`/`disabled` onto every `Button` child and visually joins them into a segmented control.
- **Variants:** `orientation` (`horizontal` default / `vertical`); `fullWidth`; group-level `disabled` (ORs with any child's own `disabled`).

**Variant × State matrix**

Not a rendering surface for colour/variant states itself (it delegates to child `Button`s, whose matrix applies unchanged). Structural states only:

| Aspect | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| horizontal | children `border-radius:0`; first child gets left corners (`--btn-radius`), last child gets right corners; each non-first child `margin-left:-1px` (hairline overlap) | hovered child gets `z-index:5` (lifts its border above neighbours) | focused child gets `z-index:5` (via `:not(:disabled):not(.btn--disabled):focus-visible`) | inherits child's active | — | group `disabled` prop cascades into every child's own disabled state |
| vertical (`.btn-group--vertical`) | `flex-direction:column`; corner-radius rule above is explicitly `:not(.btn-group--vertical)` scoped, so vertical groups do **not** get rounded end-caps (inherits default square corners) | same z-index lift | same | same | — | same cascade |

**Anatomy & tokens:** `display:inline-flex`, `border-radius: var(--btn-radius)` on the wrapper, `isolation:isolate` (creates a stacking context so the z-index lifts above don't leak); `fullWidth` sets `display:flex; width:100%` and each child `flex:1`.
**Behavioral notes:** Prop injection is via `preact`'s `cloneElement` over `toChildArray(children)` — any non-`VNode` child (text/null) passes through unmodified. Group `size`/`variant` only apply when the child hasn't already specified its own (`vnode.props.variant || …` — inverted precedence: **group prop wins over child prop** for `variant`/`size`/`fullWidth`, but for `disabled` the group only forces `true`, never forces `false` back to a child that opted in). `role='group'` for a11y.
**⚠ Guardrail violations found:** None beyond `Button`'s own (see above) — `ButtonGroup` adds no new hard-coded values.

---

### ButtonBadge
- **Import:** `import { ButtonBadge } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/button/ButtonBadge.tsx` · **Style:** `packages/ui/src/styles/components/button.css` (§7, `.btn__badge*`)
- **Radius:** `999px` (raw, ⚠) · **Elevation:** none · **Motion:** none (no transition rule)
- **Purpose:** A small count/status pill rendered inside a `Button`'s content row (e.g. a notification count).
- **Variants:** `primary` (default) · `danger` · `neutral`. Type also declares `success`/`warning` but **no CSS exists for either**.

**Variant × State matrix**

Non-interactive (no hover/focus/active — it's a `<span>`, not a control):

| Variant | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| primary | bg `var(--badge-bg, var(--primary))`, text `#fff` (hard literal, not `--badge-color`) | — | — | — | — | — |
| danger | `--badge-bg: var(--danger)` | — | — | — | — | — |
| neutral | `--badge-bg: var(--text-muted)` | — | — | — | — | — |
| success / warning | **unstyled** — silently falls back to the primary look (`var(--primary)`) since no `.btn__badge--success`/`--warning` rule exists | — | — | — | — | — |

**Anatomy & tokens:** `min-width:1.25rem`, `height:1.25rem`, `padding:0 .25rem`, `font-size:.7rem`, `font-weight:700`, `border-radius:999px`, `margin-left:.5rem`.
**Behavioral notes:** Purely presentational — no interaction handlers, no `role`. Composed automatically by `Button` when its own `badge` prop is set (with a hard-wired rule: `variant === 'danger' ? 'neutral' : 'primary'`, i.e. a badge on a danger button always renders neutral-toned to avoid red-on-red).
**⚠ Guardrail violations found:**
- `button.css:439` (`.btn__badge { … color: #fff; }`) — raw hex; should be `var(--on-accent)`.
- `button.css:427-440` — `border-radius: 999px` — raw px; should be `var(--radius-pill)`.
- Missing `success`/`warning` variant coverage is a functional gap, not a hard-coded-value violation, so it is not counted above — flagged for completeness only.

---

### SplitButton
- **Import:** `import { SplitButton } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/button/SplitButton.tsx` · **Style:** none dedicated — composes `Button` + `Popover`; the wrapper only picks up `button.css` §6 Button Group rules via its `btn-group` class.
- **Radius:** inherits `Button`/`ButtonGroup` · **Elevation:** `Popover`'s own elevation for the dropdown (not documented here — molecule-level) · **Motion:** inherits `Button`
- **Purpose:** Dual-action control — a primary action button fused to a chevron trigger that opens a `Popover` menu.
- **Variants:** Same `ButtonVariant` set as `Button` (default `'primary'`), applied identically to both the main action and the trigger.

**Variant × State matrix**

Cell values for the main-action and trigger buttons are identical to `Button`'s matrix for the chosen `variant` — not reproduced here. Structural/menu-specific states:

| Aspect | default (closed) | hover | focus-visible | active/open | selected | disabled |
|---|---|---|---|---|---|---|
| trigger button | `aria-haspopup="true"`, `aria-expanded="false"`, renders `IconChevronDown` (16px), **no rotation styling on open** | inherits `Button` hover for `variant` | inherits `Button` focus ring | `aria-expanded="true"` when `Popover` opens — purely semantic, no visual delta (chevron does not rotate) | — | `disabled` prop disables both main and trigger buttons independently |
| wrapper | `.btn-group.btn-split` — gets `ButtonGroup`'s joined-border visual for free since both buttons are direct children | — | — | — | — | — |

**Anatomy & tokens:** wrapper `role='group'`, `aria-label='Split button'`; main button gets `className='btn-split__main'`, trigger gets `className='btn-split__trigger'` — **both classes are dead**: no CSS rule anywhere in `packages/ui` or `apps/web` targets `.btn-split__main`/`.btn-split__trigger`, so they currently have zero visual effect (the joined look comes entirely from the inherited `.btn-group > .btn` selectors).
**Behavioral notes:** Clicking the trigger calls `e.stopPropagation()` before toggling `isOpen`, so it never also fires the main button's `onClick`. `loading` is accepted but **only visually reflected on the main button** — the code comment (`// Don't show loading on arrow if main is loading?`) flags this as an unresolved design question; the trigger stays clickable while the main button spins. Menu content is wrapped in a `<div onClick={() => isOpen.value = false}>` so any item click auto-closes the popover.
**⚠ Guardrail violations found:** None new in `SplitButton.tsx` — inherits `Button`'s CSS violations. The dead `.btn-split__main`/`.btn-split__trigger` classNames are a dead-code finding, not a hard-coded-value guardrail violation, so not counted in the tally.

---

### Icon
- **Import:** `import { Icon } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/icon/Icon.tsx` · **Style:** `packages/ui/src/styles/components/icon.css`
- **Radius:** — (not applicable; no background/border) · **Elevation:** none · **Motion:** `1s linear infinite` spin (raw, ⚠) when `spin=true`
- **Purpose:** A unified sizing/colour wrapper around any SVG/Tabler icon so custom SVGs and Tabler glyphs behave identically.
- **Variants:** `color`: `inherit` (default) · `primary` · `secondary` · `muted` · `danger` · `success` · `warning`. Boolean modifier `spin`.

**Variant × State matrix**

`Icon` is decorative-only (`aria-hidden="true"`, no interaction handlers) — it has no hover/focus/active/selected/disabled states of its own; colour is fixed per `color` prop and dimming for a disabled *context* must be applied by the parent control:

| Variant | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| inherit | `color: inherit` | — | — | — | — | — |
| primary | `color: var(--primary)` | — | — | — | — | — |
| secondary | `color: var(--text-main)` | — | — | — | — | — |
| muted | `color: var(--text-muted)` | — | — | — | — | — |
| danger | `color: var(--danger)` | — | — | — | — | — |
| success | `color: var(--success)` | — | — | — | — | — |
| warning | `color: var(--warning)` | — | — | — | — | — |

**Anatomy & tokens:** sizing is inline (`width`/`height`/`font-size` all set to the `size` prop, default `24px`), not CSS-class-driven; `stroke` reads `var(--icon-stroke, currentColor)`, `fill` reads `var(--icon-fill, none)` — both injectable per-instance via `strokeColor`/`fillColor` props (set as inline custom properties). `display:inline-flex; line-height:1; flex-shrink:0`.
**Behavioral notes:** `spin` toggles `.icon-wrapper--spin` (`animation: icon-spin 1s linear infinite`). Children are typically `@tabler/icons-preact` components or raw `<svg>`; the wrapper forces child `svg` to `width:100%; height:100%` so any source icon fills the box uniformly.
**⚠ Guardrail violations found:**
- `icon.css:49` — `animation: icon-spin 1s linear infinite` — raw `1s` duration, not sourced from any motion token.

---

### FileTypeIcon
- **Import:** `import { FileTypeIcon, resolveFileVisual, renderFileGlyph, FILE_TONE_COLORS } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/media/FileTypeIcon.tsx` *(lives under `media/`, not `icon/`, despite being documented here per the task's icon grouping)* · **Style:** `packages/ui/src/styles/components/file-type-icon.css`
- **Radius:** `var(--border-radius__small, 6px)` — should be `--radius-field` · **Elevation:** none · **Motion:** none
- **Purpose:** A colour-coded file-type glyph (tone-filled square or plain glyph) shared by the Files tab, upload picker, and attachment chips so a given file type reads the same colour everywhere.
- **Variants:** `variant`: `filled` (default, white glyph on tone-coloured rounded square) · `plain` (tone-coloured glyph, no background). Orthogonal `tone` (derived, not a prop): `image` · `pdf` · `design` · `audio` · `video` · `archive` · `file`.

**Variant × State matrix**

Non-interactive (`<span>`, no handlers) — states don't apply; the matrix instead crosses `variant` against `tone`:

| Variant \ Tone | image | pdf | design / audio / video | archive / file |
|---|---|---|---|---|
| filled | bg `hsl(160,60%,42%)` ⚠, white glyph (`IconPhoto`) | bg `hsl(4,74%,57%)` ⚠, white glyph (`IconFileText`) | bg `hsl(258,70%,62%)` ⚠, white glyph (`IconBrandFigma`/`IconMusic`/`IconVideo`) | bg `hsl(220,9%,55%)` ⚠, white glyph (`IconFileZip`/`IconFile`) |
| plain | glyph coloured `hsl(160,60%,42%)` ⚠, no bg | glyph coloured `hsl(4,74%,57%)` ⚠ | glyph coloured `hsl(258,70%,62%)` ⚠ | glyph coloured `hsl(220,9%,55%)` ⚠ |

(hover/focus/active/selected/disabled: — not applicable, purely decorative)

**Anatomy & tokens:** `size` prop (default `32px`) sets `width`/`height` on `filled`; glyph itself renders at `size * 0.55` for `filled` (so it reads as an inset icon within the tone square) or full `size` for `plain`; `stroke={1.6}` on all Tabler glyphs; `filled` background comes from an **inline `style` attribute**, not a CSS class, so the tone colour bypasses the cascade entirely.
**Behavioral notes:** `resolveFileVisual()` derives `tone`/`letter`/`color` from any combination of filename extension, MIME type, or a coarse `category` string — callers holding a raw `File`, a server MIME string, or a `FileCategory` enum all resolve to the same visual identity. `FILE_TONE_COLORS` is exported so other surfaces (e.g. a legend or chart) can reuse the exact same 7-colour map.
**⚠ Guardrail violations found:**
- `FileTypeIcon.tsx:19-25` — `FILE_TONE_COLORS` is a **fully hard-coded `hsl()` literal map** (`image: 'hsl(160, 60%, 42%)'`, `pdf: 'hsl(4, 74%, 57%)'`, `design`/`audio`/`video`: `'hsl(258, 70%, 62%)'`, `archive`/`file`: `'hsl(220, 9%, 55%)'`) applied via inline `style`, not CSS custom properties — these do **not** re-theme under `[data-theme='dark']` the way every other status colour in the system does. Should be re-derived from the existing status/accent tokens (e.g. `--success`/`--mint` for image, `--danger` for pdf, `--violet` for design/audio/video, `--neutral` for archive/file) so dark mode and the `[data-ds-accent]` overrides apply automatically.
- `file-type-icon.css:10` — `color: #fff` — raw hex; should be `var(--on-accent)`.
- `file-type-icon.css:11` — `border-radius: var(--border-radius__small, 6px)` — raw px fallback; should reference `var(--radius-field)` directly.

---

### StatusBadge (Badge)
- **Import:** `import { StatusBadge } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/badge/StatusBadge.tsx` · **Style:** `packages/ui/src/styles/components/badge.css`
- **Radius:** `999px` (raw, ⚠; canonical would be `--radius-pill`) · **Elevation:** none · **Motion:** none (no transitions defined)
- **Purpose:** A compact, tone-driven status pill (Held/Released/Pending/Active, etc.) — a single `--badge-color` custom property per tone drives all three visual variants via `color-mix()`, so it re-themes for free between light/dark.
- **Variants:** `tone`: `neutral` (default) · `primary` · `success` · `warning` · `danger` · `info` · `mint` · `violet` · `amber`. `variant`: `soft` (default) · `outline` · `solid`. `size`: `md` (default) · `sm`. Boolean `dot`.

> **⚠ Duplicate component:** `packages/fields/src/components/StatusBadge.tsx` is a **separate, differently-shaped** `StatusBadge` (props keyed on a finance/presence `status` enum — `online`/`released`/`in-escrow`/etc. — with its own icon-per-status logic and `packages/fields/src/styles/fields/status-badge.css`). This document covers only the `@projective/ui` (atoms) tone/variant primitive above as canonical; the two should be consolidated or renamed to avoid import confusion (`StatusBadge` resolves differently depending on which package you import from).

**Variant × State matrix**

Non-interactive (`<span>`, no handlers, no hover/focus/active/selected):

| Variant | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| soft | `background: color-mix(in srgb, var(--badge-color) 14%, transparent)`, `color: var(--badge-color)` | — | — | — | — | — |
| outline | `background: transparent`, `color: var(--badge-color)`, `box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--badge-color) 45%, transparent)` | — | — | — | — | — |
| solid | `background: var(--badge-color)`, `color: hsl(0, 0%, 100%)` ⚠ (neutral tone override: `background: var(--mid)`, `color: var(--text-main)` for legibility) | — | — | — | — | — |

**Tone → `--badge-color` map:** `neutral`→`var(--text-secondary)` · `primary`→`var(--primary)` · `success`→`var(--success)` · `warning`→`var(--warning)` · `danger`→`var(--danger)` · `info`→`var(--text-blue)` · `mint`→`var(--mint)` · `violet`→`var(--violet)` · `amber`→`var(--amber)`.

**Anatomy & tokens:** `md`: `padding:.22rem .6rem`, `font-size:.72rem`; `sm`: `padding:.12rem .45rem`, `font-size:.66rem`, `text-transform:uppercase`; `dot` renders a `6px` circular `.status-badge__dot` (bg `var(--badge-color)`) before the label; `gap:.375rem`, `font-weight:600`.
**Behavioral notes:** Every tone/variant combination is theme-safe by construction (single `--badge-color` custom property driving `color-mix()`), except the two literal-colour spots flagged below. No `role` is set — treat as decorative status text, not an interactive control.
**⚠ Guardrail violations found:**
- `badge.css:10` — `border-radius: 999px` — raw px; should be `var(--radius-pill)`.
- `badge.css:85` — `color: hsl(0, 0%, 100%)` — raw hsl; should be `var(--on-accent)`.

---

### RippleSurface (+ `useRipple`)
- **Import:** `import { RippleSurface } from '@projective/ui/atoms'` · hook: `import { useRipple } from '@projective/ui'` (`packages/ui/src/hooks/useRipple.ts`)
- **Source:** `packages/ui/src/components/ripple/RippleSurface.tsx` · **Style:** `packages/ui/src/styles/components/ripple.css`
- **Radius:** inherited from host (`border-radius: inherit` on the ink layer); `premium` frame uses `var(--border-radius__large, 12px)` ⚠ · **Elevation:** `var(--glow-primary)` on `premium` hover · **Motion:** ripple expands over raw `600ms` ⚠; `premium` transform/shadow over raw `250ms` fallbacks ⚠
- **Purpose:** The shared material-style tap-ink primitive for any surface that isn't `Button` (card borders, list rows, links) — polymorphic via `as`, with an optional animated premium gradient border.
- **Variants:** `as` (`div` default / `a` / `button` / `span` / `li` / `article`); boolean `premium`; `rippleColor` override (defaults to `currentColor`).

**Variant × State matrix**

| Variant | default | hover | focus-visible | active (pointerdown) | selected | disabled |
|---|---|---|---|---|---|---|
| base (`ripple-surface`) | `position:relative; overflow:hidden; isolation:isolate` — no visible chrome of its own | — (none styled; host element's own hover, if any, shows through) | — (not styled; host must supply its own focus ring) | ink circle spawns at pointer position, `18px` circle scaling to `16×` over `600ms` ⚠, `opacity .2 → 0` | — | — (no disabled concept; host must gate `onPointerDown`) |
| premium (`.ripple-surface--premium`) | `border-radius: var(--border-radius__large, 12px)` ⚠; `::before` 1px gradient frame (`var(--grad-brand-diag)`) masked to a border via `mask-composite`, `opacity:.55` | `transform: translateY(-2px)`, `box-shadow: var(--glow-primary)`, frame `::before` opacity → `1` | inherits base (unstyled) | same ink ripple as base, layered under the gradient frame (`z-index:1` on `::before`) | — | — |

**Anatomy & tokens:** ink `18px` circle, `margin:-9px 0 0 -9px` (self-centring on pointer position), `background: var(--ripple-ink, currentColor)`, `opacity:.2`; ripple layer is `position:absolute; inset:0; overflow:hidden; border-radius:inherit; z-index:0` so ink never escapes the host's own corner radius; premium frame uses the CSS mask trick (`linear-gradient` mask + `mask-composite:exclude`) to keep the fill fully transparent while only the 1px border is painted.
**Behavioral notes:** Ripple triggers on `onPointerDown` (not `onClick`), giving more immediate tactile feedback than `Button`'s click-triggered version. `rippleColor` is injected as the `--ripple-ink` custom property directly on the host element's inline `style`, so multiple `RippleSurface`s on a page can each carry a different ink colour without extra classes. This is a **separate implementation** from `Button`'s internal ripple (`.btn__ripple`) — same visual language, two independent code paths, by design (per the CSS file header comment).
**⚠ Guardrail violations found:**
- `ripple.css:30` — `animation: ripple-surface-expand 600ms var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1))` — raw `600ms` + raw cubic-bezier fallback.
- `ripple.css:44` — `border-radius: var(--border-radius__large, 12px)` — raw px fallback; should reference `var(--radius-card)` directly (the semantic alias for this exact primitive).
- `ripple.css:46-47, 66` — `transform`/`box-shadow`/`opacity` transitions all fall back to raw `250ms`; should be `var(--motion-micro)`.
- `ripple.css:72` — `transform: translateY(-2px)` — raw px, and inconsistent with `--hover-lift`'s `-1px` scale used elsewhere in the system.

---

### ProgressMeter (Progress Bar / Ring)
- **Import:** `import { ProgressMeter } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/progress/ProgressMeter.tsx` · **Style:** `packages/ui/src/styles/components/progress-meter.css`
- **Radius:** `999px` (raw, ⚠; canonical `--radius-pill`) on both linear track and fill · **Elevation:** none (uses a glow `box-shadow` instead) · **Motion:** `var(--dur-cinematic) var(--ease-expressive)` — the literal pair `--motion-structural` aliases to, referenced directly rather than via the alias
- **Purpose:** The shared completeness indicator behind every profile-setup tracker — linear bar or radial SVG ring from the same `value`, with an optional fixed-position "go-live" milestone marker (linear only).
- **Variants:** `variant`: `linear` (default) · `radial`. `tone`: `teal` (default) · `primary` · `mint` · `violet`.

> Note: `packages/fields/src/components/ProgressBar.tsx` is a **separate** progress-bar component (its own props/CSS in `packages/fields/src/styles/fields/progress-bar.css`) — not a duplicate of this one in the strict sense (different prop shape, fields-package home), but worth knowing both exist when reaching for "a progress bar."

**Variant × State matrix**

Non-interactive (`role="progressbar"`, no pointer states) — the matrix crosses `variant` against `tone`, since there's no hover/focus/active to speak of:

| Tone | linear (default) | radial |
|---|---|---|
| teal (default) | fill `background: var(--grad-teal-velvet)` (linear-gradient mist→teal→violet), glow `box-shadow: 0 0 12px -2px var(--accent-teal)`, track `background: var(--hairline-strong)` | ring stroke `var(--accent-teal)`, `filter: drop-shadow(0 0 5px var(--accent-teal-strong))`, track stroke `var(--hairline-strong)` |
| primary | fill `var(--grad-brand-diag)`, accent `var(--primary)` | ring stroke `var(--primary)` |
| mint | fill `linear-gradient(120deg, var(--mint), var(--primary))` | ring stroke `var(--mint)` |
| violet | fill `linear-gradient(120deg, var(--violet), var(--primary))` | ring stroke `var(--violet)` |

(hover/focus-visible/active/selected/disabled: — not applicable to any tone/variant combination)

**Anatomy & tokens:** linear track `height:6px` (or `thickness` prop override), `border-radius:999px` ⚠, `background: var(--hairline-strong)`, `overflow:hidden`; fill `border-radius:999px` ⚠ with a `::after` fill overlay (`var(--surface-subtle)`, `mix-blend-mode:screen`) for a subtle depth wash; radial ring is pure SVG (`stroke-dasharray`/`stroke-dashoffset` math, SSR-safe, no DOM measurement), stroke width defaults to `max(3, size*0.1)`; milestone marker is a `2px×12px` tick topped by a `7px` rotated-square "bead," `data-reached` attribute swaps it between a lit accent state and a hollow/muted pending state.
**Behavioral notes:** `value` is clamped 0–100 and rounded (`clamp()` helper). The milestone caption (`showMilestoneLabel`) is only reserved space when the bar already carries a `label` or `showValue` readout, so a compact nav-dropdown bar shows just the tick with no layout reflow. All transitions honour `--dur-cinematic`/`--ease-expressive` (the literal pair backing `--motion-structural`), so width/stroke-offset changes animate with the same expressive easing used for structural layout shifts elsewhere.
**⚠ Guardrail violations found:**
- `progress-meter.css:74` — `.progress-meter__track { border-radius: 999px; }` — raw px; should be `var(--radius-pill)`.
- `progress-meter.css:81` — `.progress-meter__fill { border-radius: 999px; }` — raw px; should be `var(--radius-pill)`.

---

### Tag
- **Import:** `import { Tag } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/taglist/Tag.tsx` · **Style:** `packages/ui/src/styles/components/tag.css`
- **Radius:** `var(--border-radius__small)` (6px) — semantically mismatched, see guardrails; `--rounded` modifier uses raw `999px` ⚠ · **Elevation:** none · **Motion:** `var(--fast) cubic-bezier(0.4, 0, 0.2, 1)` — duration is tokenised, curve is a raw literal duplicate of `--ease-standard`
- **Purpose:** A single label chip — colour × solid/outline/subtle variant, optionally interactive (click-to-expand, used by `TagList`'s overflow button).
- **Variants:** `color`: `primary` · `secondary` (default) · `danger` · `warning` · `success` · `neutral`. `variant`: `solid` · `outline` · `subtle` (default). `size`: `small` · `medium` (default) · `large`.

**Variant × State matrix**

| Color × Variant | default | hover (only if `onClick` supplied → `.tag--interactive`) | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| primary / solid | bg `var(--primary)`, text `#fff` ⚠ | `filter: brightness(0.95)` | — (not styled) | `transform: scale(0.98)` | — | — (no disabled prop) |
| primary / subtle | bg `var(--primary-surface)`, text `var(--primary)` | same | — | same | — | — |
| primary / outline | bg transparent, text `var(--primary)`, `border:1px solid var(--primary)` | same | — | same | — | — |
| secondary / solid | bg `var(--text-main)`, text `var(--bg)` | same | — | same | — | — |
| secondary / subtle | bg `var(--input-bg)`, text `var(--text-main)` | same | — | same | — | — |
| secondary / outline | bg transparent, text `var(--text-main)`, `border:1px solid var(--border-color)` | same | — | same | — | — |
| success / solid | bg `var(--success)`, text `#fff` ⚠ | same | — | same | — | — |
| success / subtle | bg `hsla(var(--success-hue),var(--success-saturation),var(--success-lightness),.12)`, text `var(--success)` | same | — | same | — | — |
| success / outline | bg transparent, text `var(--success)`, `border:1px solid var(--success)` | same | — | same | — | — |
| warning / solid | bg `var(--warning)`, text `#fff` ⚠ | same | — | same | — | — |
| warning / subtle | bg `hsla(var(--warning-hue),…,.12)`, text `var(--warning)` | same | — | same | — | — |
| warning / outline | bg transparent, text `var(--warning)`, `border:1px solid var(--warning)` | same | — | same | — | — |
| danger / solid | bg `var(--danger)`, text `#fff` ⚠ | same | — | same | — | — |
| danger / subtle | bg `hsla(var(--danger-hue),…,.12)`, text `var(--danger)` | same | — | same | — | — |
| danger / outline | bg transparent, text `var(--danger)`, `border:1px solid var(--danger)` | same | — | same | — | — |
| neutral / solid | bg `var(--input-bg)`, text `var(--text-main)` (no `#fff`, deliberately legible) | same | — | same | — | — |

**Anatomy & tokens:** `small`: `height:1.5rem`, `padding:0 .5rem`, `font-size:.75rem`; `medium`: `1.75rem`/`0 .625rem`/`.875rem`; `large`: `2rem`/`0 .75rem`/`1rem`; `font-weight:500`, `line-height:1`, `box-sizing:border-box`; `rounded` overrides to `border-radius:999px` ⚠.
**Behavioral notes:** Only interactive when `onClick` is supplied — then it gets `role="button"`, `tabIndex={0}`, and `.tag--interactive` (cursor pointer + the hover/active rules above). Non-interactive tags (the common case, from `TagList`) render as a plain `<span>` with no `role`/`tabIndex`, and consequently **no focus-visible styling exists anywhere** — a keyboard user tabbing to an interactive tag gets no visible focus ring (the component sets `tabIndex={0}` but the stylesheet never defines `.tag:focus-visible`).
**⚠ Guardrail violations found:**
- `tag.css:7` — `border-radius: var(--border-radius__small)` — not a raw value, but a **semantic mismatch**: `system.css` documents `--radius-control` (4px) as the token for "checkbox, switch, chip, swatch, **tag**," yet `Tag` reaches for the 6px field/button primitive directly instead of the `--radius-control` alias.
- `tag.css:11` — `transition: var(--fast) cubic-bezier(0.4, 0, 0.2, 1)` — raw cubic-bezier duplicating `--ease-standard`; should be `var(--motion-standard)` in full (which already pairs `--fast` with `--ease-standard`).
- `tag.css:16` — `.tag--rounded { border-radius: 999px; }` — raw px; should be `var(--radius-pill)`.
- `tag.css:57, 97, 119, 141` — four occurrences of `color: #fff` (primary/success/warning/danger solid); should be `var(--on-accent)`.

---

### TagList
- **Import:** `import { TagList } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/taglist/TagList.tsx` · **Style:** `packages/ui/src/styles/components/tag-list.css`
- **Radius:** — (layout container, no radius of its own) · **Elevation:** none · **Motion:** none (measurement-driven, not transition-driven)
- **Purpose:** A responsive tag row that either wraps freely (`multi` mode) or truncates to a single line with a "+N" overflow `Tag` sized via a hidden measurement pass (`single`/collapsed mode), expandable on click.
- **Variants:** `mode`: `single` · `multi` (default). Boolean `expandable` (default `true`). Passes `size`/`color`/`variant`/`rounded`/`fontSize` through to every child `Tag` unless a per-tag override is supplied.

**Variant × State matrix**

Structural container — no colour states of its own (delegates entirely to `Tag`'s matrix above):

| Mode | default | hover | focus-visible | active | selected (expanded) | disabled |
|---|---|---|---|---|---|---|
| single (collapsed) | `flex-wrap:nowrap; overflow:hidden`; renders only as many `Tag`s as fit + a "+N" overflow `Tag` (`color='neutral' variant='solid'`) | — (delegates to child `Tag` hover) | — | — | clicking "+N" (if `expandable`) flips to `multi`-style wrapping, `isExpanded.value = true` | — |
| multi / expanded | `flex-wrap:wrap`; renders every tag, no overflow button | — | — | — | — (already expanded, no further state) | — |

**Anatomy & tokens:** `gap:.5rem` (documented as "standard 8px gap"); the measurement layer (`.tag-list__measure`) is `position:absolute; visibility:hidden; z-index:-10; white-space:nowrap`, pulled out of flow so it can be measured without being seen.
**Behavioral notes:** Uses a two-pass `ResizeObserver` algorithm: pass 1 assumes every tag fits and counts how many actually do against the container width; if not all fit, pass 2 re-measures reserving space for the "+N" button itself before counting. The `GAP` constant (`8`) is hard-coded in the measurement math as "an 8px gap (var(--gap) equivalent)" per its own comment — i.e. it's a JS-side duplicate of the CSS `gap:.5rem`, which will silently desync if the CSS gap ever changes without updating this constant.
**⚠ Guardrail violations found:** None in `tag-list.css` itself (all spacing uses `rem`, no hex/hsl/raw-radius/raw-ms present). The hard-coded `GAP = 8` JS constant mirroring the CSS `gap` value is a maintainability risk worth flagging, but it isn't a colour/radius/duration token violation in the sense the guardrail rule targets.

---

### ThemeSwitcher (`ThemeToggle` UI + `ThemeSwitcher.ts` state)
- **Import:** `import { ThemeToggle } from '@projective/ui/atoms'`; state module: `import { theme, setTheme, toggleTheme, matchSystemTheme, systemTheme } from '@projective/ui'` (`packages/ui/src/ThemeSwitcher.ts`)
- **Source:** `packages/ui/src/components/theme/ThemeToggle.tsx` (visual) + `packages/ui/src/ThemeSwitcher.ts` (headless signal/logic module, no JSX) · **Style:** `packages/ui/src/styles/components/theme-toggle.css`
- **Radius:** `999px` (raw, ⚠) on the track, `50%` on the thumb · **Elevation:** ad-hoc `box-shadow` literals (not `--elevation-*`) · **Motion:** raw `350ms`/`250ms` fallbacks throughout (⚠), functionally close to `--motion-structural`/`--motion-micro` but never referencing them
- **Purpose:** `ThemeSwitcher.ts` is the headless reactive core — a `Signal<'light'|'dark'>` mirrored onto `document.documentElement[data-theme]` via an `effect()`, seeded from `localStorage` or `prefers-color-scheme`, and live-updating while no explicit user override exists. `ThemeToggle` is the premium switch UI wired to it: a skeuomorphic sun/moon toggle with a spring-eased thumb and a cross-fading sky/starfield track.
- **Variants:** single control, two states (`light`/`dark`, read from `theme.value`); `compact` boolean modifier (smaller footprint for dense navbars).

**Variant × State matrix**

| State | default | hover | focus-visible | active (mid-toggle) | selected | disabled |
|---|---|---|---|---|---|---|
| light | track: `radial-gradient` sky (`hsl(41,96%,62%)` → `hsl(199,84%,60%)` → `hsl(206,70%,52%)`, all ⚠), border `var(--glass-hairline, rgba(0,0,0,.12))` ⚠, inset shadow `rgba(0,0,0,.18)` ⚠; thumb at `left` position, bg `#fff` ⚠, sun glyph opacity 1 / moon glyph opacity 0 rotated `-90deg` scaled `.4` | **not styled** — no `.theme-toggle:hover` rule exists anywhere; inherits default | `.theme-toggle:focus-visible .theme-toggle__track` gets `box-shadow: var(--focus-ring, 0 0 0 3px rgba(66,153,225,.5)) ⚠, inset 0 1px 3px rgba(0,0,0,.18) ⚠` layered onto the resting inset shadow | thumb/glyph transforms are mid-flight during the `350ms`/`250ms` transitions (spring overshoot via `--ease-spring`) — no distinct `:active` rule, it's purely the transition's own overshoot curve | `dark` is effectively "selected" via `aria-checked` | — (no disabled prop; always interactive) |
| dark (`.theme-toggle--dark`) | track: `radial-gradient` night (`hsl(258,60%,42%)` → `hsl(230,55%,20%)` → `hsl(230,60%,10%)`, all ⚠), starfield `opacity:1` (4-layer `radial-gradient` of `#fff`/`rgba(255,255,255,{.85,.7})` ⚠); thumb slides to `right` (`translateX(calc(tt-w - tt-thumb - pad*2))`), bg `hsl(230,30%,96%)` ⚠, color `hsl(250,45%,40%)` ⚠; moon glyph opacity 1, sun opacity 0 | not styled (same as light) | same focus ring treatment | same transition-overshoot behaviour | `light` is "deselected" | — |

**Anatomy & tokens:** `--tt-w:3.4rem`, `--tt-h:1.8rem`, `--tt-pad:3px`, thumb diameter `= tt-h - pad*2`; `compact` shrinks to `--tt-w:3rem`, `--tt-h:1.6rem`. `role="switch"`, `aria-checked={isDark}`, `aria-label` swaps between "Switch to light theme"/"Switch to dark theme". Respects `prefers-reduced-motion: reduce` by collapsing every transition to `1ms`.
**Behavioral notes:** `ThemeSwitcher.ts` seeds `theme` to `'dark'` at module scope to match SSR output, then reconciles on the client in a `typeof window !== 'undefined'` guard: reads `localStorage['theme']` if present (sets `userOverride=true`), else resolves `prefers-color-scheme`; a `matchMedia` `change` listener keeps following the OS preference until the user's first explicit toggle latches `userOverride`. `toggleTheme()`/`setTheme()` both persist to `localStorage` (wrapped in `try/catch` for private-mode/SSR safety) and flip the signal, which the `effect()` mirrors onto `data-theme` reactively — any consumer reading `theme.value` re-renders on OS-driven changes too, not just explicit ones.
**⚠ Guardrail violations found** (`theme-toggle.css`):
- `:29` — `border-radius: 999px` — raw px; should be `var(--radius-pill)`.
- `:32-34, 43-48` — six raw `hsl()` gradient stops for the day/night sky background — fully decorative, no token reuse at all.
- `:36-37, 81, 126` — raw `rgba()` literals for hairline border / inset shadows (`rgba(0,0,0,.12)`, `rgba(0,0,0,.18)` ×2, `rgba(0,0,0,.28)`, `rgba(255,255,255,.6)`) — should draw from `--elevation-*`/`--hairline*` tokens.
- `:38, 84-86, 98-99` — six raw ms fallbacks (`350ms`×3, `250ms`×3) across the track/thumb/glyph transitions; should be `var(--motion-structural)`/`var(--motion-micro)`.
- `:57-61` — four-layer starfield background using raw `#fff`/`rgba(255,255,255,{.85,.7})` — decorative, non-token.
- `:79, 91-92` — thumb fill/icon-colour raw literals (`#fff`, `hsl(230,30%,96%)`, `hsl(250,45%,40%)`); should be `var(--on-accent)` / token equivalents.
- `:80` — `color: hsl(41, 90%, 45%)` — raw hsl for the light-mode sun glyph tint.
- `:125` — `box-shadow: var(--focus-ring, 0 0 0 3px rgba(66,153,225,.5))` — same stale raw-fallback pattern as `Button`; should be `var(--focus-glow)`.

This component is the single largest concentration of hard-coded colour in the atoms layer — its sky/starfield/thumb palette is entirely bespoke and none of it currently participates in the token system, meaning it will not respond to `[data-ds-accent]` remapping the way every other primitive does.

---

### Avatar (Media)
- **Import:** `import { Avatar } from '@projective/ui/atoms'`
- **Source:** `packages/ui/src/components/media/Avatar.tsx` · **Style:** `packages/ui/src/styles/components/avatar.css`
- **Radius:** `50%` (circle, not on the `--radius-*` ladder — correct as-is, avatars are explicitly pill/circle per the canonical vocabulary note) · **Elevation:** none · **Motion:** none
- **Purpose:** A circular identity chip — renders an image when `src` is supplied (with silent fallback-to-initials on load error), otherwise a deterministically-hued initials badge derived from the person's name.
- **Variants:** single visual (no `variant` prop) — driven entirely by presence/absence of `src`; `size` prop (px diameter, default `36`).

> Note on scope: the task brief names this section "Media / SmartMedia," but no `Media`/`SmartMedia` component exists inside `packages/ui`. `SmartMedia` lives at `apps/web/features/shared/islands/SmartMedia.island.tsx` (an app-level composite, out of the `packages/ui` atoms package). `Avatar` is documented here as the actual atomic media primitive shipped from `packages/ui/src/components/media/` (alongside `AudioPlayer` and `MediaLightbox`, which are composite/molecule-level and out of scope for an atomic-primitives pass).

**Variant × State matrix**

Non-interactive (`<div>`, no handlers) — states don't apply; the matrix instead crosses the two render modes:

| Mode | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| image (`src` present) | `<img>` `object-fit:cover`, fills the circle; on `onError` the `<img>` is hidden via inline `style.display='none'` (leaves an empty circle — **no fallback to initials is actually triggered**, see note below) | — | — | — | — | — |
| initials (`src` absent) | background `linear-gradient(135deg, hsl(var(--avatar-hue),58%,58%), hsl(calc(var(--avatar-hue)+38),62%,46%))` (hue is per-name-deterministic, saturation/lightness are raw literals ⚠), text `#fff` ⚠, `font-weight:600`, `letter-spacing:.02em` | — | — | — | — | — |

**Anatomy & tokens:** diameter set inline via `size` prop (`width`/`height`/`font-size = size*0.4`, all px, all inline styles rather than CSS classes); `--avatar-hue` custom property computed by a simple string hash (`hash = hash*31 + charCode`, `% 360`) so a given name always maps to the same hue; `border-radius:50%; overflow:hidden`.
**Behavioral notes:** The JSDoc explicitly promises "renders an image when available and a deterministically-coloured initials chip otherwise," but the actual `onError` handler only hides the broken `<img>` — it never flips the component to the initials branch (that would require local state the component doesn't have, since `src ? <img> : <span>` is evaluated once per render from the prop, not from load-success state). This is a **doc/implementation mismatch**: a broken image URL currently renders an empty circle, not the initials fallback the description promises.
**⚠ Guardrail violations found:**
- `avatar.css:13` — `color: #fff` — raw hex; should be `var(--on-accent)`.
- `avatar.css:17-18` — `hsl(var(--avatar-hue,200), 58%, 58%)` / `hsl(calc(var(--avatar-hue,200)+38), 62%, 46%)` — the hue channel is legitimately dynamic (per-identity), but the `58%`/`58%` and `62%`/`46%` saturation/lightness pairs are raw literals with no token backing. Treated as a soft/contextual flag: procedural per-user colour generation is a reasonable exception to the token rule, but the two fixed S/L pairs could still be pulled from named constants instead of being inlined twice.

---

### Logo
- **Import:** `import { Logo } from '@projective/ui'`
- **Source:** `packages/ui/src/components/Logo.tsx` · **Style:** none — inline SVG, no companion stylesheet
- **Radius:** — (not applicable, vector mark) · **Elevation:** none · **Motion:** none
- **Purpose:** The Projective brand mark — a static SVG (four corner circles + two connecting swoosh paths in a fixed `0 0 1080 1080` viewBox), scalable and recolourable via props.
- **Variants:** single visual — `size` (number/string, default `1080`) and `color` (fill for the whole mark, default `'#ffffff'` ⚠) are the only knobs; all other SVG attributes pass through via `...props`.

**Variant × State matrix**

Not applicable — a static decorative SVG with no interaction states of any kind:

| Variant | default | hover | focus-visible | active | selected | disabled |
|---|---|---|---|---|---|---|
| single visual | `fill={color}` (default `#ffffff` ⚠) on a single `<g>` wrapping both circles and paths | — | — | — | — | — |

**Anatomy & tokens:** fixed `viewBox='0 0 1080 1080'`; `width`/`height` both driven by the single `size` prop (no independent aspect control); geometry is four `154.5r` circles at the corners plus two `<path>` swooshes forming the connecting mark; all fill colour is applied once via the wrapping `<g fill={color}>`, so recolouring is a single prop, not a multi-element edit.
**Behavioral notes:** Fully presentational — no `aria-hidden`, `role`, or `title` is set, so screen readers will announce it as an unlabeled graphic wherever it's dropped without the consumer adding their own `aria-label`/`role='img'`. Because `color` is a plain SVG `fill` prop rather than a CSS class, callers can already pass `var(--primary)` etc. as a string — the guardrail issue is only the *default* value being a hard hex rather than `currentColor` or an on-accent token reference.
**⚠ Guardrail violations found:**
- `Logo.tsx:10` — `color = '#ffffff'` — raw hex default prop value; should default to `'currentColor'` (or `var(--on-accent)` where the mark is known to sit on a solid fill) so an un-styled `<Logo />` inherits its context instead of always painting white.

---

## Summary of guardrail violations by file

| File | Audited | Status |
|---|---|---|
| `button.css` (incl. `.btn__badge` rules cited under `ButtonBadge`) | 13 | ✅ Resolved |
| `ripple.css` | 4 | ✅ Resolved |
| `icon.css` | 1 | ⏳ Kept — spinner loop duration (`1s`), intentional |
| `FileTypeIcon.tsx` + `file-type-icon.css` | 3 | ✅ Resolved |
| `badge.css` | 2 | ✅ Resolved |
| `progress-meter.css` | 2 | ✅ Resolved |
| `tag.css` | 4 | ✅ Resolved |
| `theme-toggle.css` | 8 | ✅ Resolved (palette → `--tt-*` tokens in `colour.css`) |
| `avatar.css` | 2 | ✅ Resolved (`#fff`→`--on-accent`; per-identity hue kept by design) |
| `Logo.tsx` | 1 | ✅ Resolved (default → `currentColor`) |
| **Total** | **40** | **38 resolved · 2 intentionally kept** (spinner `1s`, generative avatar hue) |

The two kept items are functional/generative timings and colours, not design-token violations in the
sense the guardrail targets: keyframe *loop* durations (spinner, ripple ink) are animation timings,
not UI transitions, and the Avatar hue is procedurally derived per identity.

`tag-list.css`, `ButtonGroup`/`SplitButton`/`IconButton` TSX, and `Icon.tsx`'s colour variants contain no hard-coded hex/hsl/raw-radius/raw-ms values and are excluded.
