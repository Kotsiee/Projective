# Fields — Input State & Variant Matrices

> **✅ Migration status — fields layer MIGRATED (all 62 audited violations resolved).** Every field
> stylesheet now consumes the semantic token system: dead `var(--token, <literal>)` fallbacks dropped;
> genuinely-undefined tokens either **defined** in `fields.css` (`--field-font-size`, `--field-gap`,
> `--field-icon-size`, `--field-ring-width`) or mapped to canonical tokens
> (`--bg-overlay`→`--surface-overlay`, `--bg-brand-solid`→`--primary`, `--text-on-brand`→`--on-accent`,
> `--gray-900`→`--surface-dark-workspace`, `--gray-0`→`--on-accent`, `--error-500`→`--danger`); `#fff`→`--on-accent`,
> `999px`→`--radius-pill`, input chips→`--radius-control`, floating menus→`--elevation-3`,
> `--focus-ring`→`--focus-glow`, toggle transitions→`--motion-micro`. A11y: the missing focus ring was
> added to the toolbar trigger. New tokens `--scrim` / `--on-accent-muted` / `--on-accent-subtle` were
> added to `system.css`, and `--field-radius` now aligns to the 6px `--radius-field`. The
> `⚠ Guardrail violations found` blocks below are the **pre-migration audit record** — a `grep` sweep
> confirms zero raw hex/rgba/`999px`/legacy-focus-ring/dead-fallback remain in
> `packages/fields/src/styles`. (Correction to the audit: `--text-brand`, `--text-primary`,
> `--bg-surface-subtle/-active`, `--border-subtle` are defined in `data.css` and were never truly
> undefined.)

`@projective/fields` (source: `packages/fields/src/`) is the platform's form-primitive package —
every text/select/date/money/file input in the app is composed here, then re-exported through
`@projective/ui/fields`. The package follows a strict **wrapper-composition model**: each visible
input is a thin orchestration of shared, headless wrapper components rather than a monolith that
reimplements label/message/adornment/ripple chrome per-field. `LabelWrapper` renders the
(optionally floating) `<label>` + required marker + inline help tooltip; `MessageWrapper` renders
the single highest-priority helper/error/warning/info line beneath the control; `AdornmentWrapper`
renders a prefix/suffix icon or action slot inside the field's border; `EffectWrapper` layers the
focus-glow ring and click ripple *inside* the control's clipped border-radius; `SkeletonWrapper`
renders a loading placeholder in place of a field; `FieldArrayWrapper` repeats an arbitrary field
as an add/remove list. Every field composes `useFieldState` (signal-or-plain value normalization +
required validation) and `useInteraction` (focused/hovered/active tracking) rather than
reimplementing controlled-input bookkeeping. Styling is 100% token-driven off two layers:
`apps/web/styles/themes/variables/fields.css` (the field-specific token map — `--field-bg`,
`--field-border-*`, `--field-text-*`, `--field-height`, …) and
`apps/web/styles/themes/variables/system.css` (the semantic layer — `--radius-*`, `--motion-*`,
`--focus-glow*`, `--status-*`). Component stylesheets should reference only these tokens; where a
stylesheet instead hardcodes a hex/hsl/raw-px/raw-ms fallback inside a `var(--token, <fallback>)`
call, or a bespoke non-canonical variable, it is flagged under that component's **Guardrail
violations** line.

---

## Inputs

### TextField
- **Import:** `import { TextField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/TextField.tsx` · **Style:** `packages/fields/src/styles/fields/text-field.css`
- **Composes wrappers:** LabelWrapper (floating label) · MessageWrapper · AdornmentWrapper (prefix + suffix) · EffectWrapper (focus ring, no ripple wired) · **Radius:** `--field-radius` (→ `--border-radius`, 8px — NOT the newer `--radius-field` alias) · **Motion:** `--field-transition` (`--fast` = 150ms, `cubic-bezier(0.4,0,0.2,1)` — i.e. `--motion-standard`'s curve, but sourced independently, not via the token)
- **Purpose:** The base single/multi-line text input every other text-shaped field (`HandleField`, `MoneyField`) is built on.
- **Variants / sizes:** `variant`: `default` | `glass` (frosted aurora-glass — self-contained token overrides, taller 54px control, 14px radius, used by the auth flow). `multiline` boolean switches `<input>` → `<textarea>` (with `rows`/`maxRows`). No explicit size scale — single `--field-height`.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | `--field-bg` | `1px --field-border` | `--field-text` | — | container `cursor: text`; clicking anywhere in the container focuses the input |
| hover | `--field-bg-hover` | `--field-border-hover` | inherits default | — | `.field-text__container:hover` |
| focus-visible | `--field-bg-active` | `--field-border-focus` | inherits default | `EffectWrapper` draws `--field-ring-color` glow (not `--focus-glow`) via `.field-focus-ring--active` | label floats up to `--field-label--active` (scale 0.85, bg-masking chip) |
| filled/active | inherits default/hover | inherits | inherits | — | label floats when `active` = focused OR has value OR has placeholder |
| error/invalid | inherits default | `--field-border-error` | label + count turn `--field-text-error` | none (component does not apply `--focus-glow-danger`) | `aria-invalid` set on the input |
| disabled | `--field-bg-disabled` | `--field-border-disabled` | `--field-text-disabled` (via LabelWrapper `field-label--disabled`; input itself has no explicit disabled text-color rule, inherits `--field-text`) | — | `opacity: 0.8`, `cursor: not-allowed` on container |

**Anatomy & tokens:** height `--field-height` (2.5rem / compact 2rem / spacious 3rem via `[data-ds-density]`), padding-x `--field-padding-x`, radius `--field-radius`, prefix/suffix via `AdornmentWrapper` (`--field-icon-size` min-width 20px, `--field-gap` 8px margin), character counter (`showCount` + `maxLength`) renders `field-text__count`, turning `--field-text-error` when over limit.
**Behavioral notes:** Enter (single-line) or Tab (when `nextField` set) calls `focusNextElement` to hop to the next field id/element instead of default tab order. `glass` variant is fully self-contained (redeclares `--field-*` locally) so it renders correctly with no themed ancestor. Textarea gets `padding-top/bottom: 8px` and `maxRows` caps height via inline `maxHeight` em calc.
**⚠ Guardrail violations found:**
- `text-field.css:14-99` — nearly every `var(--field-*, …)` declaration carries a hardcoded hex/px/ms fallback (e.g. `#ffffff`, `#d1d5db`, `8px`, `150ms ease`, `#6b7280`, `#111827`, `14px`). Since `fields.css` already guarantees these custom properties exist, the fallbacks are dead but still count as inlined literals — should be dropped so the file relies purely on the token cascade, e.g. line 14 `background-color: var(--field-bg, #ffffff);` → `background-color: var(--field-bg);`.
- `text-field.css:51` — `font-size: var(--field-font-size, 14px)`; `--field-font-size` is not defined anywhere in `fields.css`/`system.css`, so this *always* falls back to the raw `14px` literal — needs either a real `--field-font-size` token added to `fields.css` or replacement with an existing type-scale token.

---

### HandleField
- **Import:** `import { HandleField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/HandleField.tsx` · **Style:** `packages/fields/src/styles/fields/handle-field.css`
- **Composes wrappers:** none directly — it is a thin preset wrapper around `TextField`, so it inherits LabelWrapper/MessageWrapper/AdornmentWrapper/EffectWrapper transitively. **Radius:** inherited `--field-radius` · **Motion:** inherited `--field-transition`
- **Purpose:** A `@handle` slug input — sanitizes every keystroke (`sanitizeHandle`) to a URL-safe handle and renders a fixed muted `@` prefix.
- **Variants / sizes:** single visual (no variant prop); always `floating={false}` (label never floats — static top label) and `showCount={false}`.

**State matrix**

Identical to `TextField`'s matrix (same container/border/background rules) since `HandleField` renders no DOM of its own besides the `@` prefix span — see TextField above for the full state table.

**Anatomy & tokens:** `@` prefix is a `<span class="handle-field__at">` inside the prefix `AdornmentWrapper`, styled `font-weight: 600`, colour `var(--text-muted, hsl(0, 0%, 55%))`, `font-variant-numeric: tabular-nums`; `padding-inline-end: 0` removes the wrapper's default trailing gap so the `@` sits flush against the caret. Input itself gets `font-variant-ligatures: none; letter-spacing: 0.01em` for legible handle text.
**Behavioral notes:** `sanitizeHandle` (from `../utils/handle.ts`) runs on every `onChange`, so the bound signal is always submit-ready — no separate client-side format validation needed downstream. Re-exports `sanitizeHandle` for callers to pre-validate.
**⚠ Guardrail violations found:** `handle-field.css:9` — `color: var(--text-muted, hsl(0, 0%, 55%))` hardcodes an HSL fallback instead of relying purely on the token (same dead-fallback pattern as TextField).

---

### SearchInput
- **Import:** `import { SearchInput } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/SearchInput.tsx` · **Style:** `packages/fields/src/styles/fields/search-input.css`
- **Composes wrappers:** none of the standard field wrappers — SearchInput is a self-contained pill (no `LabelWrapper`/`MessageWrapper`/`AdornmentWrapper`/`EffectWrapper`; it hand-rolls its own icon/clear/action slots and a bespoke `field-search__sheen` gradient-sweep effect instead of `EffectWrapper`'s ripple/focus-ring). **Radius:** `--fs-radius` local var, default `999px` (pill), `cinematic` variant switches to `--border-radius__xlarge` (16px) · **Motion:** local `--medium`/`--ease-out`/`--ease-spring` durations, not the `--motion-*` aliases
- **Purpose:** The platform's cinematic discovery search field — leading icon that scales on focus, animated gradient sheen sweep, typewriter idle placeholder (`rotatingTerms`), debounced `onChange`, Enter-to-submit `onSearch`.
- **Variants / sizes:** `variant`: `default` | `glass` (frosted, floats over imagery) | `cinematic` (hero centerpiece, up to 640px, `--glass-blur-lg`). `size`: `md` (implicit base) | `lg` | `xl`.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | `--fs-bg` (→ `--field-bg`/`--card`) | `1.5px --fs-border` (→ `--hairline`/`--border-color`) | `--text-main` | — | `role="search"`, container `cursor: text` |
| hover | `--fs-bg-hover` (→ `--input-bg`) | `--field-border-hover` | inherits | — | |
| focus-visible | `--card` | `--primary` | inherits | `0 0 0 4px var(--fs-glow)` (→ `--field-ring-color`) + `--shadow-md` (`cinematic` adds `--glow-primary` too) | icon scales `1.08×`; `field-search__sheen` gradient sweeps once over 1.1s (`field-search-sweep` keyframe) |
| filled/active | inherits default/hover | inherits | inherits | — | shows clear (×) button once `val.length > 0` unless `hideClear` |
| error/invalid | — | — | — | — | SearchInput has no `error` prop / error styling at all |
| disabled | opacity 0.55, `pointer-events: none` | inherits | inherits | — | `.field-search__container--disabled` |

**Anatomy & tokens:** `--fs-height` 2.75rem (`lg` 3.35rem, `xl` 4rem), `--fs-pad`/`--fs-icon-gap`/`--fs-font` scale per size, leading icon (`IconSearch`, 18px / 22px in `cinematic`), trailing clear button (28px circle, `field-search-clear-in` spring-in keyframe using `--ease-spring`), optional trailing `action` slot (rendered only while empty, e.g. a `⌘K` hint).
**Behavioral notes:** Escape clears when there's a value; Enter submits the trimmed query via `onSearch` and cancels any pending debounce timer. Typewriter idle placeholder types/deletes at 80ms/45ms per character with a 1600ms hold and 350ms inter-term pause, fully skipped under `prefers-reduced-motion` (jumps straight to the first term) and guarded for SSR (`typeof document`). All animations/transitions collapse to `1ms`/`none` under `@media (prefers-reduced-motion: reduce)`.
**⚠ Guardrail violations found:**
- `search-input.css:32-35,70,94-95,119,143-144` — durations reference the raw ui.css primitives `var(--medium, 250ms)` / `var(--fast)` / `var(--slow, 350ms)` directly rather than the semantic `--motion-standard` / `--motion-micro` pairs (curve + duration bundled) defined in `system.css`; several also carry redundant hardcoded-ms fallbacks (e.g. `250ms`, `350ms`).
- `search-input.css:148` — `background: var(--danger-surface, rgba(0, 0, 0, 0.08))` — fallback is an arbitrary grey rgba, not even a danger-toned literal; should just drop the fallback.

---

### SelectField
- **Import:** `import { SelectField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/SelectField.tsx` · **Style:** `packages/fields/src/styles/fields/select-field.css`
- **Composes wrappers:** LabelWrapper (floating) · MessageWrapper · EffectWrapper + `useRipple` (manual ripple container, added on every container click) — no `AdornmentWrapper` (icons are hand-rendered arrow/clear/status slots). **Radius:** `--field-radius` for container, `--border-radius__small` for chips/menu items · **Motion:** `--field-transition` for container, raw `150ms`/`--fast` elsewhere
- **Purpose:** Single- or multi-select dropdown with optional inline search, grouped/nested options (tree flattening via `useSelectState`), select-all, loading/clearable affordances.
- **Variants / sizes:** no explicit `variant`/`size` prop. `displayMode`: `chips-inside` | `chips-below` | `count` | `text` (controls how multi-select selections render). `groupSelectMode`: `value` | `members`.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | `--field-bg` | `1px --field-border` | `--field-text` | — | `cursor: pointer` on container |
| hover | `--field-bg-hover` | `--field-border-hover` | inherits | — | |
| focus-visible / open | `--field-bg-active` | `--field-border-focus` | inherits | `EffectWrapper` focus ring (`--field-ring-color`) + manual ripple pulse on click | arrow icon rotates 180° (`field-select__arrow--flip`); menu opens with `opacity/translateY` transition, auto-flips to `field-select--up` when <250px space below |
| filled/active | inherits | inherits | inherits | — | selected chips (`field-select__chip`, `--primary-surface` bg) or single-value text render inside `field-select__content` |
| error/invalid | inherits default | `--field-border-error` | — | — | no distinct error ring; only border changes |
| disabled | `--field-bg-disabled` | `--field-border-disabled` | — | — | `cursor: not-allowed`, `opacity: 0.8` |

**Anatomy & tokens:** container `min-height: --field-height`, `padding-right: 8px` reserved for the arrow; menu `field-select__menu` is `position: absolute`, `--card` bg, `1px --field-border`, hardcoded `box-shadow: 0 4px 12px rgba(0,0,0,0.1)` (see guardrail), `z-index: 50`, `max-height: 250px`; option rows `8px 12px` padding, selected state `--primary-surface` bg; group header rows `font-weight: 600`.
**Behavioral notes:** Full keyboard nav in `useSelectState.handleKeyDown` — `ArrowDown`/`ArrowUp` move `highlightedIndex` (opens menu if closed), `Enter`/`Space` select the highlighted option, `Escape` closes. Click-outside via a `mousedown` document listener closes the menu. `searchable` mode auto-focuses the inner text input on open and filters `filteredOptions`; the 100ms `setTimeout` on blur lets an option's `onMouseDown`(which calls `preventDefault`) fire before the menu unmounts. Nested/grouped options indent `12px` per depth level; `groupSelectMode: 'members'` marks a group "selected" only when every descendant leaf is selected.
**⚠ Guardrail violations found:**
- `select-field.css:115` — `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);` on the floating menu — should be `box-shadow: var(--elevation-3)` (the token system's "popovers, dropdowns, floating panels" alias) instead of a raw rgba shadow.
- `select-field.css:84` — chip `border-radius: var(--border-radius__small)` — per the token vocabulary chips should use `--radius-control` (checkbox/switch/chip/swatch/tag lane), not the field-radius primitive.
- `select-field.css:149` — `color: var(--text-brand)` — `--text-brand` does not exist anywhere in `colour.css`/`system.css`/`ui.css` (only referenced here and in `combobox-field.css`); this resolves to nothing (inherits) in every theme. Should be `--primary` or `--text-main`.
- `select-field.css:156` — `background-color: var(--bg-surface-subtle)` — also undefined anywhere in the token files; should map to `--surface-1` or `--input-bg`.
- `select-field.css:177` — `transition: transform 150ms;` — raw unitless-token-free `150ms`, should read `transition: transform var(--motion-standard);` (or at minimum `var(--fast)`).

---

### SliderField
- **Import:** `import { SliderField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/SliderField.tsx` · **Style:** `packages/fields/src/styles/fields/slider-field.css`
- **Composes wrappers:** LabelWrapper only (`floatingRule` forced to `'never'` — slider labels never float) · MessageWrapper. No AdornmentWrapper/EffectWrapper — the thumb draws its own focus/active shadow. **Radius:** track `--border-radius__xsmall` (4px), thumb `50%` (circular) · **Motion:** thumb `box-shadow` transition on `--fast` (with a hardcoded `100ms` fallback, not `--field-transition`)
- **Purpose:** Single-value or dual-handle range slider with optional marks, snapping, logarithmic scale, vertical orientation.
- **Variants / sizes:** no `size` prop. Boolean modifiers compose: `range` (dual thumb), `marks` (`true` | `number[]` | `SliderMark[]`), `snapToMarks`, `vertical`, `scale: 'linear' | 'logarithmic'`, `passthrough` (allow handles to cross), `minDistance`.

**State matrix**

| State | background (track) | border (thumb) | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | track `--field-bg-disabled` (→ `--border-color`), fill `--primary` | thumb `2px solid --primary` on `--card` bg | mark labels `--text-muted` | — | `touch-action: none`, `user-select: none` |
| hover | inherits (no distinct hover rule on track/thumb) | inherits | inherits | — | — |
| focus-visible (thumb) | inherits | inherits | inherits | `box-shadow: var(--focus-ring)` (the raw `colour.css` primitive, **not** `--focus-glow`) | thumb is a `role="slider"` div, `tabIndex 0` unless disabled |
| active/dragging | inherits | inherits | inherits | `0 0 0 6px var(--field-ring-color, hsla(186,57%,36%,0.15))` | `cursor: grabbing`; `field-slider__thumb--active` also applied on `activeHandleIdx` match |
| error/invalid | — | — | — | — | SliderField has an `error` prop wired only to `MessageWrapper`; no visual state on the track/thumb reacts to it |
| disabled | inherits colors | inherits colors | inherits | — | `field-slider--disabled` class applied to root; no dedicated dim/opacity rule found in CSS beyond the class hook itself — thumbs get `tabIndex={-1}` |

**Anatomy & tokens:** control `min-height: --field-height`, track `height: 6px`, thumb `18×18px` circle, marks render tick (`2×8px`) + optional label (`0.75rem`, `--text-muted`) positioned by `%` along the track (`valueToPercent`/log variant). Vertical mode swaps `left/top` math for `bottom/left`.
**Behavioral notes:** Pointer-capture drag (`setPointerCapture`/`releasePointerCapture`) on the thumb; clicking the track jumps the *closest* handle to that value (`handleTrackClick`). `minDistance` + `passthrough=false` (default) prevents dual handles from crossing/colliding. `snapToMarks` rounds the pointer value to the nearest mark instead of `step`. `aria-valuemin/max/now` kept live on each thumb.
**⚠ Guardrail violations found:**
- `slider-field.css:33` — `background-color: var(--field-bg-disabled, var(--border-color))` — fallback references another token instead of a literal (acceptable pattern-wise but redundant since `--field-bg-disabled` always resolves); low-severity but inconsistent with the rest of the system which drops fallbacks entirely once a token is guaranteed.
- `slider-field.css:93` — `background-color: var(--card, #ffffff)` — hardcoded hex fallback.
- `slider-field.css:98` — `transition: box-shadow var(--fast, 100ms);` — `--fast` is 150ms in `ui.css`; the `100ms` fallback is not just dead but *wrong* (doesn't match the real token value) — should be removed entirely, or read `var(--motion-standard)`.
- `slider-field.css:34` — `border-radius: var(--border-radius__xsmall, 4px)` for the track — semantically fine (this *is* the `--radius-control` primitive) but should reference the semantic alias `--radius-control` rather than the raw primitive, per the canonical vocabulary.

---

### Checkbox
- **Import:** `import { Checkbox } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/Checkbox.tsx` · **Style:** `packages/fields/src/styles/fields/checkbox.css`
- **Composes wrappers:** none — Checkbox is a standalone `<label>` control (visually-hidden native `<input type="checkbox">` + custom `checkbox__box`); no LabelWrapper/MessageWrapper, it renders its own inline `label`/`description` text. **Radius:** `--border-radius__xsmall` (should be `--radius-control` per the canonical vocabulary — see guardrail) · **Motion:** background/border/box-shadow on `--fast, 150ms` (not `--motion-micro`, despite the task brief calling out toggles/checkboxes as the `--motion-micro` use-case)
- **Purpose:** Controlled tri-state (checked / unchecked / indeterminate) checkbox primitive shared by checklists and file-library multi-select.
- **Variants / sizes:** `size`: `sm` | `md`. `tone`: `primary` | `success` (drives the "on" fill colour via local `--cb-color`).

**State matrix — selected × interaction (compact grid)**

| | unchecked | checked | indeterminate |
|---|---|---|---|
| default | box `1px solid --border-color`, bg `--card` | box bg/border `--cb-color` (`--primary` or `--success`), white check icon | box bg/border `--cb-color`, white dash icon |
| hover (`:hover:not(.checkbox--disabled)`) | border → `--cb-color` | border stays `--cb-color` (no additional hover fill) | border stays `--cb-color` |
| focus-visible (native input) | `box-shadow: var(--focus-ring, 0 0 0 2px var(--background), 0 0 0 4px var(--primary))` applied to `.checkbox__box` | same | same |
| disabled | `opacity: 0.55`, `cursor: not-allowed` on the whole label | same | same |

**Anatomy & tokens:** box `18×18px` (`sm`: `15×15px`), icon `IconCheck`/`IconMinus` at 14px (`sm`: 12px, `stroke={3}`), native input visually hidden via the standard clip-rect technique (not `display:none`, preserving a11y), label/description text `0.875rem`/`0.75rem` in `--text-main`/`--text-muted` with `label`+`description` stacked via `checkbox__text`.
**Behavioral notes:** `aria-checked="mixed"` when `indeterminate`; toggling ignores clicks while `disabled`. Entire `<label>` is the hit target (label/description text included), not just the 18px box.
**⚠ Guardrail violations found:**
- `checkbox.css:41` — `border-radius: var(--border-radius__xsmall, 4px)` — should reference the semantic `--radius-control` alias (system.css explicitly names "checkbox" as a `--radius-control` consumer), not the raw primitive + a redundant hardcoded fallback.
- `checkbox.css:42` — `border: 1px solid var(--border-color, hsl(220, 8%, 65%))` — hardcoded HSL fallback.
- `checkbox.css:44` — `color: #fff;` — raw hex instead of `--on-accent`.
- `checkbox.css:46-48,65` — transitions use `var(--fast, 150ms)` rather than the semantic `--motion-micro` (250ms spring) the design brief calls for on toggle/checkbox tactile presses — currently indistinguishable from a plain hover-tint transition.
- `checkbox.css:62` — `box-shadow: var(--focus-ring, …)` uses the legacy `colour.css` `--focus-ring` primitive instead of the newer semantic `--focus-glow` token.
- `checkbox.css:78,87` — `var(--text-main, var(--text-primary))` / `var(--text-muted, var(--text-secondary))` fall back to `--text-primary`/`--text-secondary`-as-fallback-of-fallback chains that don't cleanly resolve to defined tokens the way intended (should just be the bare token).

---

### StatusSlider
- **Import:** `import { StatusSlider } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/StatusSlider.tsx` · **Style:** `packages/fields/src/styles/fields/status-slider.css`
- **Composes wrappers:** none — self-contained segmented control (`role="group"`, `<ol>` of steps). **Radius:** rail `999px` (pill), nodes `50%` circular · **Motion:** rail-fill `width` on `var(--medium, 300ms)`; node colour/border/transform/shadow on `var(--fast, 150ms)`
- **Purpose:** Ordered status-transition control (e.g. open → assigned → active → submitted) — reads as a filled rail with a node per step; read-only without `onChange`, interactive with it (only adjacent steps selectable by default via `canSelect`).
- **Variants / sizes:** `tone`: `primary` | `success` | `warning` | `danger` (also overridable per-step via `step.tone`). `size`: `sm` | `md`. `hideLabels` boolean.

**State matrix — reached × interaction (compact grid)**

| | not reached | reached (past) | current |
|---|---|---|---|
| node fill | `--card` bg, `2px solid color-mix(--ss-color 30%, transparent)` | bg/border solid `--ss-color` | bg/border solid `--ss-color` **+** `box-shadow: 0 0 0 4px color-mix(--ss-color 20%, transparent)` |
| selectable (`canSelect`) hover | `transform: scale(1.15)`, border → `--ss-color` | same (if selectable) | same (if selectable) |
| focus-visible (node button) | `box-shadow: var(--focus-ring, 0 0 0 2px var(--background), 0 0 0 4px var(--primary))` | same | same |
| label | `--text-muted` | `--text-muted` | `--text-main`, `font-weight: 600` |
| disabled node (not selectable) | `cursor: default` (native `disabled` attr blocks pointer entirely) | — | — |

**Anatomy & tokens:** rail `3px` tall, `top: 10px`/`8px` (sm) centred behind nodes, fill colour = `--ss-color` (an internal custom prop aliasing `--primary`/`--complete`/`--in-progress`/`--incomplete` by tone); node `18×18px` (`sm`: `14×14px`); label `0.6875rem`, max `8ch` with ellipsis truncation.
**Behavioral notes:** Default selectability policy is "only immediate neighbours of the current step" (`Math.abs(idx - currentIndex) === 1`), overridable via `canSelect(value)`. `aria-current="step"` on the current node; `aria-label={step.label}` on every node button. Interactive only when both `onChange` is passed and `disabled` is false.
**⚠ Guardrail violations found:**
- `status-slider.css:11,14,17,91,94,97` — tone custom-props fall back through legacy aliases (`var(--complete, var(--success, var(--primary)))`, `var(--in-progress, var(--warning))`, `var(--incomplete, var(--danger))`) rather than reading the canonical `--status-success` / `--status-warning` / `--status-danger` tokens directly — functionally fine (the legacy aliases resolve correctly) but drifts from the "use only the canonical vocabulary" rule.
- `status-slider.css:39,70-73` — durations hardcode `300ms`/`150ms` fallbacks on top of `--medium`/`--fast` instead of using the semantic `--motion-standard` pairing.
- `status-slider.css:111` — `box-shadow: var(--focus-ring, …)` — legacy primitive instead of `--focus-glow`.

---

### DateField
- **Import:** `import { DateField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/DateField.tsx` · **Style:** `packages/fields/src/styles/fields/date-field.css` (shared with TimeField; also renders `Calendar` — see deprecation note below)
- **Composes wrappers:** MessageWrapper directly; LabelWrapper/AdornmentWrapper/EffectWrapper transitively via the inner `TextField` (the popup trigger is a read-only `TextField`). **Radius:** `--field-radius` · **Motion:** `--field-transition`
- **Purpose:** Date picker — `popup` (TextField trigger + `Popover`-anchored `Calendar`) or `inline` (calendar rendered directly in page) variants; `single`/`multiple`/`range` selection modes.
- **Variants / sizes:** `variant`: `popup` | `inline` | `input` (type declares `input` but the component only branches on `inline` vs. default/popup — `input` currently renders identically to `popup`). `selectionMode`: `single` | `multiple` | `range`.

**State matrix**

Popup trigger reuses the full `TextField` state matrix verbatim (same `field-text__container` classes), with these differences: the trigger `TextField` is always `readonly` (no manual typing), and its suffix slot hosts an `IconCalendar` toggle button instead of free content. The popover panel itself:

| State | background | border | shadow | notes |
|---|---|---|---|---|
| closed | — | — | — | `opacity: 0; transform: translateY(-10px); pointer-events: none` |
| open (`field-date__popover--open`) | `var(--bg-overlay, #ffffff)` | `1px --field-border` | `0 4px 6px -1px rgba(0,0,0,0.1)` | `opacity: 1; transform: translateY(0)` |

Calendar day cells (see `Calendar` section) reuse `--field-bg-hover` on hover and `--primary` solid on selected.

**Anatomy & tokens:** popover `top: calc(100% + 4px)`, `padding: 16px`, `z-index: 10`; day cell `border-radius: var(--border-radius__small, 0.375rem)`; selected day `background-color: var(--bg-brand-solid, #3b82f6)` / `color: var(--text-on-brand, #ffffff)` (both undefined tokens — see guardrail).
**Behavioral notes:** `Popover` (from `@projective/ui`) handles outside-click/escape close and auto-flip positioning. Single-selection mode auto-closes the popover and blurs on pick; multiple/range keep it open for further picks. `displayValue` is computed from the field's format string (`toFormat`), rendering `"start - end"` for ranges and `"N dates selected"` for multiple.
**⚠ Guardrail violations found:**
- `date-field.css:18-96` — same pervasive hardcoded hex/px/ms `var(..., fallback)` pattern as `text-field.css` (near-duplicated file) — e.g. line 18 `#ffffff`, line 68 `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)` (should be `var(--elevation-3)`), line 65 `var(--bg-overlay, #ffffff)` (`--bg-overlay` is not a defined token anywhere in the codebase).
- `date-field.css:95-96` — `background-color: var(--bg-brand-solid, #3b82f6)` and `color: var(--text-on-brand, #ffffff)` — **both `--bg-brand-solid` and `--text-on-brand` are undefined tokens**, so the "selected day" cell always renders via the hardcoded hex fallbacks (`#3b82f6` blue, `#ffffff`), never the theme's actual `--primary`. This is a real, user-visible drift from the palette (dark-mode blue instead of the teal `--primary`) — should be `background-color: var(--primary); color: var(--on-accent);`.

---

### TimeField
- **Import:** `import { TimeField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/TimeField.tsx` · **Style:** `packages/fields/src/styles/fields/date-field.css` (shared file — no dedicated time-field.css)
- **Composes wrappers:** MessageWrapper directly; LabelWrapper/AdornmentWrapper/EffectWrapper transitively via the inner `TextField` trigger. **Radius:** `--field-radius` · **Motion:** `--field-transition`
- **Purpose:** Time picker — `popup` (TextField + `Popover`-anchored `TimeClock`) or `inline` variants; `single`/`multiple` selection.
- **Variants / sizes:** `variant`: `popup` | `inline` | `input` (same as DateField, `input` not separately branched). `selectionMode`: `single` | `multiple`.

**State matrix**

Identical structure to `DateField`'s popup trigger + popover panel (same shared CSS file/classes: `.field-date`, `.field-date__container`, `.field-date__popover`) — see DateField above.

**Anatomy & tokens:** Trigger suffix is `IconClock` (18px) instead of `IconCalendar`. `displayValue` formats `HH:mm` for a single value or `"N times selected"` for multiple.
**Behavioral notes:** Single-select auto-closes the popover 100ms after a pick (short delay lets the clock-hand animation register before the popover unmounts) rather than closing immediately like `DateField`. Multi-select mode toggles a time on/off if it already exists in the array (only on pointer *release*, not while dragging, to avoid flicker).
**⚠ Guardrail violations found:** Shares every violation listed under `DateField` (same stylesheet). No additional TimeField-specific literals found in `TimeField.tsx` itself.

---

### FileDrop
- **Import:** `import { FileDrop } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/FileDrop.tsx` · **Style:** `packages/fields/src/styles/fields/file-drop.css`
- **Composes wrappers:** LabelWrapper only. No MessageWrapper (the `error` prop only toggles a CSS class — no error text is rendered by FileDrop itself), no AdornmentWrapper/EffectWrapper (drag/drop chrome is bespoke). **Radius:** `--field-radius` · **Motion:** `--field-transition` on the container; `fadeIn 150ms` (`--fast`) on the drag overlay
- **Purpose:** Drag-and-drop + click-to-browse file uploader with client-side validation (accept/mime, max size, max files), single-file "avatar/banner" preview mode, and a multi-file progress list.
- **Variants / sizes:** `variant`: `split` (two side-by-side actions: "Upload from Device" / "Select from Library") | `single` (one full-width click target, used for avatar/banner replace flows). `listPosition`: `top` | `below`. `actionPosition` (single-file preview only): `below` | `overlay`.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default (empty dropzone) | `--field-bg` | `1px --field-border` | `--field-text-secondary` (split actions) | — | `min-height: 140px` |
| hover (split action) | `--field-bg-hover` | inherits | colour → `--primary` | — | `.file-drop__split-action:hover` |
| active (split action, mousedown) | `--field-bg-disabled` | inherits | inherits | — | `.file-drop__split-action:active` |
| dragging-over (`isDragging`) | translucent primary overlay `hsla(primary, 0.05)` + `2px dashed --primary` | — | `--primary`, `font-weight: 600` | — | full-container overlay, `fadeIn` keyframe scale-in, `pointer-events: none`, `z-index: 20` |
| error/invalid | `hsla(danger, 0.05)` | `--field-border-error` | — | — | `.file-drop__container--error` |
| disabled | `--field-bg-disabled`, `opacity: 0.6` | inherits | — | — | `pointer-events: none` |
| single-variant hover | — | `--primary` | — | — | `.file-drop__container--single:hover` |

**Anatomy & tokens:** split actions `flex:1` each side of a `1px --field-border` `file-drop__divider`; file-list rows (`file-drop__item`) show a thumbnail (image files) or `IconFile`/`IconPhoto`/`IconLoader2` (spinning during `processing`), filename + size + inline progress percentage, and a remove (`IconTrash`) button; upload progress renders as a left-anchored translucent-primary bar (`file-drop__progress-bg`) growing to `file.progress%` with `width 0.3s ease` (not a token). Single-preview mode (`hasSingleFile`) swaps the dropzone for a full-bleed image with either a `overlay` hover-reveal "Change Image" scrim (`rgba(0,0,0,0.5)` + `backdrop-filter: blur(2px)`) or a `below` persistent remove bar.
**Behavioral notes:** Validation pipeline on drop/select: (1) filter by `accept` (extension, `type/*`, or exact mime), rejecting with a `toast.error` per bad file; (2) enforce `maxFiles` (trims + `toast.warning`) or, in single mode, silently keeps only the last dropped file; (3) filter by `maxSize` (default 10MB) with a `toast.error` per oversize file. `handleDragLeave` uses `relatedTarget`/`contains` to avoid flicker when dragging over child elements. Each accepted file is wrapped into a `FileWithMeta` (`status: 'pending'`, `progress: 0`, `id: crypto.randomUUID()`).
**⚠ Guardrail violations found:**
- `FileDrop.tsx:207,218` — inline `style={{ color: 'var(--text-secondary)' }}` and `style={{ color: 'var(--error-500)' }}` written directly in JSX instead of a CSS class; `--error-500` is not a defined token anywhere (should be `--danger`/`--field-text-error`).
- `file-drop.css:293` — `background: rgba(0, 0, 0, 0.5)` on the overlay scrim — raw rgba instead of a token (there is no canonical "scrim" token in the current vocabulary; closest is composing from `--surface-dark-workspace`/`--surface-dark-workspace-deep` with opacity, or this should be added as a semantic `--scrim` token).
- `file-drop.css:240` — `transition: width 0.3s ease;` on the progress bar — raw `0.3s` instead of `var(--motion-standard)`/`var(--medium)`.
- `file-drop.css:294` — `color: #fff;` raw hex instead of `--on-accent`.

---

### TagInput
- **Import:** `import { TagInput } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/TagInput.tsx` · **Style:** `packages/fields/src/styles/fields/tag-input.css`
- **Composes wrappers:** LabelWrapper (floating) · MessageWrapper · EffectWrapper (focus ring only — no ripple wired). No AdornmentWrapper. **Radius:** container `--field-radius`; chips `--border-radius__xlarge` (16px pill-ish) · **Motion:** `--field-transition` container; chips `--fast` (150ms)
- **Purpose:** Free-text tag/chip entry — type + Enter/comma to commit a tag, Backspace on an empty input pops the last tag, per-tag optional custom colour via `tagColor`/`generateTagTheme`.
- **Variants / sizes:** `tagVariant`: `solid` | `transparent` (default `transparent`) — only takes effect when `tagColor` is supplied (drives `generateTagTheme`'s inline style output); the default uncoloured chip always uses the fixed `--primary-surface`/`--text-blue`/`--primary-half` styling regardless of `tagVariant`.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | `--field-bg` | `1px --field-border` | `--field-text` (input) | — | `cursor: text`, `flex-wrap: wrap` chip row |
| hover | `--field-bg-hover` | `--field-border-hover` | inherits | — | |
| focus-visible | `--field-bg-active` | `--field-border-focus` | inherits | `EffectWrapper` `--field-ring-color` glow | |
| filled/active | inherits | inherits | inherits | — | label floats once `focused` OR chips exist OR placeholder present |
| error/invalid | inherits default | `--field-border-error` | — | — | |
| disabled | `--field-bg-disabled` | `--field-border-disabled` | — | — | (no explicit `cursor`/`opacity` rule on the disabled class here, unlike TextField) |

**Anatomy & tokens:** chip `field-tag__chip` — bg `--primary-surface`, text `--text-blue`, border `1px --primary-half`, radius `--border-radius__xlarge` (16px, not the pill `999px`/`--radius-pill`), padding `2px 8px`; remove glyph is an inline `<svg>` X (not a Tabler icon), `opacity: 0.6 → 1` + `color: --danger` on hover.
**Behavioral notes:** Enter or `,` commits the trimmed current input as a new tag (deduped — no-op if already present); Backspace on an empty input removes the last tag. Tab (with `nextField` set) hops focus via `focusNextElement`. Custom per-tag colour (`tagColor` string or `(tag) => string` function) overrides the default styling through `generateTagTheme(colorStr, tagVariant)`, applied as an inline `style` object per chip.
**⚠ Guardrail violations found:**
- `tag-input.css:16-85` — same pervasive hex/px/ms fallback pattern as `text-field.css` (e.g. `#ffffff`, `#d1d5db`, `150ms ease`, `#111827`, `#6b7280`).
- `tag-input.css:53` — chip `border-radius: var(--border-radius__xlarge, 16px)` — per the canonical vocabulary, chip-shaped controls should use `--radius-pill` (or `--radius-control`), not the xlarge card-radius primitive; this makes tag chips visually inconsistent with `field-select__chip` (which uses `--border-radius__small`) and `status-badge`/`allocation-meter` (which use `999px`) — three different chip radii across the package for what should be one shape language.

---

### MoneyField
- **Import:** `import { MoneyField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/MoneyField.tsx` · **Style:** none dedicated — pure composition over `TextField` (inherits `text-field.css`)
- **Composes wrappers:** none directly — delegates 100% to `TextField`, so it inherits LabelWrapper/MessageWrapper/AdornmentWrapper/EffectWrapper transitively. **Radius:** inherited `--field-radius` · **Motion:** inherited `--field-transition`
- **Purpose:** Currency-masked numeric input (`useCurrencyMask`) with a locale-formatted currency-symbol prefix that doubles as a horizontal drag-to-scrub control (pointer-drag left/right adjusts the value with a velocity-based multiplier).
- **Variants / sizes:** none — always renders as a `TextField` with a computed `prefix`.

**State matrix**

Identical to `TextField`'s matrix (no additional DOM/classes of its own) — see TextField above.

**Anatomy & tokens:** currency-symbol prefix rendered as `<span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>` (inline style, see guardrail) inside the prefix `AdornmentWrapper`, with `cursor: ew-resize` and `touchAction: none` wired via `prefixProps` for the drag-to-scrub interaction.
**Behavioral notes:** `useCurrencyMask` strips non-numeric characters on input, collapses multiple decimal points, and formats to 2dp on blur via `Intl.NumberFormat`; on focus it "unmasks" back to a raw editable number string. Dragging the currency-symbol prefix left/right scrubs the value: `delta = dx * 0.2 * speedMultiplier` where `speedMultiplier = 1 + log1p(velocity * 10)`, clamped to a minimum of 0.
**⚠ Guardrail violations found:**
- `MoneyField.tsx:109` — `style={{ fontSize: '0.9em', fontWeight: 'bold' }}` — inline literal styling in JSX instead of a CSS class using type-scale tokens (no dedicated `money-field.css` exists at all; this component has zero stylesheet of its own).

---

### ComboboxField
- **Import:** `import { ComboboxField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/ComboboxField.tsx` · **Style:** `packages/fields/src/styles/fields/combobox-field.css`
- **Composes wrappers:** LabelWrapper (floating) · MessageWrapper · EffectWrapper (focus ring only). No AdornmentWrapper. **Radius:** `--field-radius` container/menu · **Motion:** `--field-transition`
- **Purpose:** Free-typing filterable single-select — types into the same input that also displays/edits the selected label, filtering `options` client-side by substring match; extends `SelectFieldProps<T>` but currently ignores multi-select/searchable-toggle/clearable/loading (those props pass through the type but are unused in the component body).
- **Variants / sizes:** none — single visual.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | `--field-bg` | `1px --field-border` | `--field-text` | — | `cursor: text` |
| hover | inherits default (no `:hover` rule defined on `.field-combobox__container`) | — | — | — | ⚠ unlike every sibling field, `combobox-field.css` has **no hover state rule at all** |
| focus-visible / open | inherits (no distinct focused-background rule either — see guardrail) | — | inherits | `EffectWrapper` `--field-ring-color` glow | menu opens via `field-combobox__menu--open` opacity/translateY transition, auto-flips up when <250px space below |
| filled/active | inherits | inherits | inherits | — | selected option's label pre-fills the input on selection |
| error/invalid | inherits default | `--field-border-error` | — | — | |
| disabled | `--field-bg-disabled` | `--field-border-disabled` | — | — | |

**Anatomy & tokens:** menu identical geometry to `SelectField`'s (`top: calc(100% + 4px)`, `max-height: 250px`, `box-shadow: 0 4px 12px rgba(0,0,0,0.1)` — see guardrail), option rows `8px var(--field-padding-x)`, selected option `--primary-surface` bg.
**Behavioral notes:** Blur closes the menu after a 200ms `setTimeout` (long enough for an option's `onMouseDown`→`preventDefault` to register before the input loses focus and the menu unmounts). Typing re-opens the menu and re-filters; no keyboard arrow-navigation is wired (no `highlightedIndex` concept, unlike `SelectField`) — only mouse selection is supported.
**⚠ Guardrail violations found:**
- `combobox-field.css` — the `.field-combobox__container` block (lines 9-19) defines only `default`/base styling with **no `:hover`, no `--container--focused` background/border change** despite `ComboboxField.tsx` emitting a `field-combobox__container--focused` class — the class is applied but has zero corresponding CSS rule, so focus is visually indistinguishable from default except for the `EffectWrapper` ring. This is a missing-state bug, not just a token violation.
- `combobox-field.css:13-14,26-29` — same hardcoded hex/px/ms fallback pattern (`#ffffff`, `#d1d5db`, `150ms ease`).
- `combobox-field.css:26` — `background-color: var(--bg-overlay, #ffffff)` — `--bg-overlay` undefined (same issue as `date-field.css`).
- `combobox-field.css:29` — `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);` — should be `var(--elevation-3)`.
- `combobox-field.css:58` — `color: var(--text-brand, #1d4ed8)` — `--text-brand` undefined (same issue as `select-field.css`), always renders the hardcoded blue fallback instead of a theme colour.

---

### DateTimeField
- **Import:** `import { DateTimeField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/DateTimeField.tsx` · **Style:** `packages/fields/src/styles/components/datetime-field.css`
- **Composes wrappers:** none directly — wraps a `TextField` trigger (inheriting its wrapper chrome) inside a `Popover` with a two-tab (Date/Time) panel hosting `Calendar` + `TimeClock`. **Radius:** inherited `--field-radius` from `TextField`; tabs/values use ad-hoc radii · **Motion:** inherited `--field-transition`
- **Purpose:** Combined date+time picker — a single text trigger (`DD/MM/YYYY HH:mm`) opening a tabbed popover that switches between a `Calendar` and a `TimeClock`, merging date/time parts into one `DateTime` value without clobbering the other part.
- **Variants / sizes:** none — single visual; no `variant`/`selectionMode` props (always single-value).

**State matrix**

Trigger is a full `TextField` (see TextField matrix). Tab header states:

| State | color | border-bottom | background | notes |
|---|---|---|---|---|
| tab default | `--text-secondary` | transparent | — | |
| tab hover | `--text-primary` (undefined token, see guardrail) | — | `--bg-surface-subtle` (undefined token, see guardrail) | |
| tab active | `--primary` | `--primary` | — | `datetime-field__tab--active` |
| tab value chip | `--text-primary` (undefined) | — | `--bg-surface-active` (undefined) | `datetime-field__tab-val`, e.g. "14 Mar" / "09:30" |

**Anatomy & tokens:** popover hosts a `datetime-field__tabs` header (two buttons, each showing an icon + "Date"/"Time" label + the currently-selected value chip) above a `datetime-field__body` that swaps between `Calendar` and a `datetime-field__clock-wrapper`-boxed `TimeClock`.
**Behavioral notes:** Picking a date auto-advances `activeTab` to `'time'`; picking a time does not auto-close (user must dismiss the popover). Date/time parts are merged independently — `updateDatePart` copies the existing time-of-day onto the new date, and vice versa for `updateTimePart`, so switching tabs never loses the other part. Manual text entry is supported (unlike `DateField`/`TimeField`'s `readonly` triggers) — typed text is parsed via `new DateTime(val, 'dd/MM/yyyy HH:mm', true)`, silently ignored if invalid.
**⚠ Guardrail violations found:**
- `datetime-field.css:8,17-18,26-29` — `var(--border-subtle, #e5e7eb)`, `var(--bg-surface-subtle, #f9fafb)`, `var(--text-primary, #111827)`, `var(--bg-surface-active, #f3f4f6)` — **`--border-subtle`, `--bg-surface-subtle`, `--text-primary`, `--bg-surface-active` are all undefined tokens** in the canonical vocabulary (the real tokens are `--border-color`, `--surface-1`/`--input-bg`, `--text-main`, and probably `--primary-surface`, respectively) — every one of these rules always renders its hardcoded hex fallback, never a themed value. This is the single most token-drifted file in the package.
- `datetime-field.css:22-23` — `color: var(--primary, #3b82f6)` / `border-bottom-color: var(--primary, #3b82f6)` — `--primary` *is* real, but the `#3b82f6` fallback is a different blue than the actual teal `--primary`, so any transient FOUC before CSS vars resolve would flash the wrong hue.

---

### RichTextField
- **Import:** `import { RichTextField } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/RichTextField.tsx` · **Style:** `packages/fields/src/styles/fields/rich-text-field.css`
- **Composes wrappers:** LabelWrapper (`position='top'`, `floatingRule='never'` — static label only) · MessageWrapper. No AdornmentWrapper/EffectWrapper — Quill owns its own toolbar/focus chrome, restyled via `.ql-*` overrides. **Radius:** `--field-radius` · **Motion:** `border-color` transition on `--fast`
- **Purpose:** Quill-backed rich text editor with secure-link sanitization (blocks `javascript:`/`vbscript:`/`data:` protocols), drag-and-drop + toolbar image upload, and delta/HTML/markdown output formats.
- **Variants / sizes:** `variant`: `framed` (default, bordered container) | `inline` (chrome-free, border/background stripped, toolbar fades to 60% opacity until hover/focus). `toolbar`: `'basic'` | `'full'` | custom Quill toolbar config array.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default | `--field-bg` | `1px --field-border` | `--field-text` | — | `framed` only; `inline` has no border/background |
| hover (`framed`) | inherits | `--field-border-hover` | inherits | — | |
| focus-within (`framed`) | inherits | `--field-border-focus` | inherits | — (no `EffectWrapper` glow — Quill's own focus is purely a border-colour change) | `inline` variant fades its toolbar to full opacity on `:hover`/`:focus-within` |
| filled/active | inherits | inherits | inherits | — | — |
| error/invalid | inherits | `--field-border-error !important` | — | — | `!important` needed to beat Quill's own inline/specificity rules |
| warning | inherits | `--warning !important` | — | — | RichTextField is the only field in the package with a dedicated visual *warning* border state (distinct from error) |
| disabled / readOnly | `--field-bg-disabled` | inherits | `ql-container` text `--field-text-disabled`, `opacity: 0.8` | — | toolbar is entirely hidden (`display: none`) rather than dimmed |

**Anatomy & tokens:** toolbar `ql-toolbar.ql-snow` — `--input-bg` background, `1px --border-color` bottom border, `8px` padding; editor body `ql-editor` — `min-height: 100px` (overridable via `minHeight`/`maxHeight` props, inline `style`), `16px` padding, `1.6` line-height; icon strokes/fills recoloured to `--text-muted` default / `--primary` active via `.ql-snow .ql-stroke`/`.ql-fill`; character counter mirrors `TextField`'s pattern (`field-rich-text__count`, turns `--field-text-error` over `maxLength`).
**Behavioral notes:** Quill is lazy-loaded (`await import('quill')`) on mount, client-only (`typeof window === 'undefined'` guard). All toolbar buttons/selects get `tabindex="-1"` post-init so they never intercept the app's own tab order. Accepts `delta` (JSON), `html`, or raw markdown as initial `value` — auto-detected by sniffing for `{`/`[`/`<` prefixes, falling back to a `MarkdownParser`. `secureLinks` (default true) registers a `SecureLink` Quill format subclass that sanitizes `href` and forces `rel="noopener noreferrer" target="_blank"`.
**⚠ Guardrail violations found:**
- `rich-text-field.css:175` — `.ql-snow .ql-picker-options { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }` — raw rgba shadow, should be `var(--elevation-3)`.

---

### MenuSelect
- **Import:** `import { MenuSelect } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/MenuSelect.tsx` · **Style:** `packages/fields/src/styles/fields/toolbar-controls.css`
- **Composes wrappers:** none — this is explicitly a chrome-light *toolbar* control (e.g. `Sort by · Recent`), not a form field; the package docblock says "for full form semantics use `SelectField`". **Radius:** `--border-radius` (8px, container + popover) · **Motion:** `background-color`/`border-color`/`transform` on `--fast`
- **Purpose:** Minimal dropdown trigger + small option popover for toolbar contexts (sort/group-by pickers).
- **Variants / sizes:** none — single visual; `align`: `left` | `right` controls popover anchor edge.

**State matrix**

| State | background | border | text | ring / glow | notes |
|---|---|---|---|---|---|
| default (trigger) | `--field-bg` | `1px --border-color` | `--text-main` | — | |
| hover / focus-visible (trigger) | `--field-bg-hover` | `--field-border-hover` | inherits | none (`outline: none`, no replacement ring — see guardrail) | |
| open | inherits hover | inherits hover | inherits | — | chevron rotates 180° |
| option hover | `--field-bg-hover` | — | inherits | — | |
| option selected | — | — | `--primary` | — | plus a trailing `IconCheck` at `--primary` |

**Anatomy & tokens:** popover `min-width: 100%`, `padding: 0.25rem`, `--card` bg, `1px --border-color`, `box-shadow: 0 8px 24px -6px rgba(0,0,0,0.35)` (raw, see guardrail), option rows `--border-radius__small` radius.
**Behavioral notes:** Click-outside (document `mousedown` listener) closes the popover. `aria-haspopup="listbox"` / `aria-expanded` on the trigger, `role="listbox"`/`role="option"`/`aria-selected` on the menu.
**⚠ Guardrail violations found:**
- `toolbar-controls.css:34` — trigger `:focus-visible` sets `outline: none` with no compensating `box-shadow`/`--focus-glow` ring — a real accessibility regression (keyboard users get no visible focus indicator on the trigger button).
- `toolbar-controls.css:68` — `box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.35);` — should be `var(--elevation-3)`.

---

### FilterTags
- **Import:** `import { FilterTags } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/FilterTags.tsx` · **Style:** `packages/fields/src/styles/fields/toolbar-controls.css`
- **Composes wrappers:** none — a `role="group"` row of pill buttons. **Radius:** `999px` (pill) · **Motion:** `background-color`/`color` on `--fast`
- **Purpose:** Single-select inline filter-pill row (e.g. `All` / `Images` / `Docs`).
- **Variants / sizes:** none — single visual.

**State matrix — selected × interaction (compact grid, this is a toggle-like control)**

| | inactive | active |
|---|---|---|
| default | transparent bg, `1px solid transparent` border, `--text-muted` text | `--primary-surface` bg, `--primary` text, transparent border |
| hover | `--field-bg-hover` bg, `--text-main` text | `--primary-surface` bg (unchanged), `--primary` text (unchanged) |
| focus-visible | inherits (no explicit `:focus-visible` rule — see guardrail) | inherits |

**Anatomy & tokens:** pill padding `0.4rem 0.85rem`, `0.8125rem` font, `aria-pressed` communicates active state.
**Behavioral notes:** Pure single-select — clicking any pill calls `onChange(value)` unconditionally (no deselect-to-none affordance).
**⚠ Guardrail violations found:**
- `toolbar-controls.css` — no `:focus-visible` ring defined for `.filter-tag` at all (same missing-focus-indicator issue as `MenuSelect`'s trigger, but here there isn't even an `outline: none` override — the button simply relies on the browser default outline, which is inconsistent with every other field's `--focus-glow` treatment rather than a hard violation, but worth flagging for consistency).

---

### ViewToggle
- **Import:** `import { ViewToggle } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/ViewToggle.tsx` · **Style:** `packages/fields/src/styles/fields/toolbar-controls.css`
- **Composes wrappers:** none — a `role="group"` two-button segmented switch. **Radius:** outer `--border-radius`, inner buttons `--border-radius__small` · **Motion:** `background-color`/`color` on `--fast`
- **Purpose:** Compact Grid/List layout switch, typically pinned top-right of a toolbar.
- **Variants / sizes:** none — always exactly two buttons (`list`, `grid`).

**State matrix — selected × interaction (compact grid)**

| | inactive | active |
|---|---|---|
| default | transparent bg, `--text-muted` icon | `--primary-surface` bg, `--primary` icon |
| hover | `--text-main` icon (bg stays transparent) | `--primary-surface` bg (unchanged), `--primary` icon (unchanged) |

**Anatomy & tokens:** outer track `--field-bg` bg, `1px --border-color` border, `0.1875rem` padding/gap; buttons `2rem × 1.75rem`, `IconLayoutList`/`IconLayoutGrid` at 17px.
**Behavioral notes:** `aria-pressed` per button, `aria-label` "List view"/"Grid view", group `aria-label="View layout"`.
**⚠ Guardrail violations found:** None beyond the shared `toolbar-controls.css` file's `--elevation-3`/focus-ring notes already listed under `MenuSelect`/`FilterTags` (ViewToggle itself has no shadow/focus rule to flag).

---

### Switch
*(Not yet implemented — placeholder for the primitive currently being added to this package.)*

A new toggle-style control (track + thumb), joining `Checkbox`/`StatusSlider`/`ViewToggle` as the package's fourth selected-state toggle shape. Expected to use `--radius-control` for the track, `--motion-micro` (250ms spring) for the thumb's travel animation, and `--focus-glow` for the keyboard focus ring. Full state matrix, anatomy, and exact track/thumb sizing to be filled in by the implementing author once the component and its stylesheet land.

---

## Display (read-only indicators)

### StatusBadge
- **Import:** `import { StatusBadge } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/StatusBadge.tsx` · **Style:** `packages/fields/src/styles/fields/status-badge.css`
- **Composes wrappers:** none — a standalone `<span>` chip, not an input. **Radius:** `--border-radius__large` (should read `--radius-pill` — the fallback `999px` in the same declaration is what actually renders, see guardrail) · **Motion:** dot pulse `status-badge-pulse 1.8s ease-out infinite`
- **Purpose:** Semantic presence (`online`/`offline`/`active`/`away`) or finance/escrow lifecycle (`released`/`in-escrow`/`pending`/`funding`/`funded`/`disputed`) indicator chip. Presence statuses default to a pulsing dot; finance statuses default to a contextual icon (`IconCircleCheck`/`IconLock`/`IconClock`/`IconAlertTriangle`).
- **Variants / sizes:** `variant`: `solid` | `subtle` (default) | `outline`. `size`: `sm` | `md`. Both `showDot`/`showIcon` are independently overridable booleans.

**State matrix**

StatusBadge is a pure display primitive (no hover/focus/disabled interaction states — it isn't focusable/clickable). Its "state" axis is the `status` → colour mapping instead:

| status | `--sb-color` resolves to |
|---|---|
| `online` / `active` / `released` / `funded` | `--complete` (→ `--primary`) |
| `in-escrow` | `--primary` |
| `away` / `pending` / `funding` | `--in-progress` (→ `--warning`) |
| `disputed` | `--incomplete` (→ `--danger`) |
| `offline` | `--text-muted` |

| variant | background | text/icon | border |
|---|---|---|---|
| `subtle` (default) | `color-mix(in srgb, --sb-color 12%, transparent)` | `--sb-color` | transparent |
| `solid` | `--sb-color` | `--card` (on-colour text — see guardrail re: `--on-accent`) | transparent |
| `outline` | transparent | `--sb-color` | `color-mix(in srgb, --sb-color 45%, transparent)` |

**Anatomy & tokens:** `md`: `4px 10px` padding, `0.8125rem` font; `sm`: `2px 8px`, `0.6875rem`; dot `8px` (`sm`: `6px`) with a `::after` pseudo-element pulse ring (scales to `2.4×`, fades out over 1.8s, `infinite`); icon size `13px`(`sm`)/`15px`(`md`).
**Behavioral notes:** `isPresence` (derived from a fixed `PRESENCE_STATUSES` list) decides the dot-vs-icon default; either can be force-overridden independently. Labels default from a `DEFAULT_LABELS` map, overridable via `label`.
**⚠ Guardrail violations found:**
- `status-badge.css:8` — `border-radius: var(--border-radius__large, 999px)` — this mixes two different radius intents in one declaration: `--border-radius__large` is the 12px *card* radius, but the `999px` fallback (a pill) is what the component visually needs and is what's documented in the props (`variant`s all read as pill chips in practice since `--border-radius__large` would look wrong on an inline chip) — should simply be `border-radius: var(--radius-pill);` with no fallback.
- `status-badge.css:34,83` — `color: var(--card, #fff)` — hardcoded hex fallback; also semantically this should be `--on-accent` (the canonical "text on a solid status fill" token) rather than reusing the card-surface colour, which happens to be white in light mode but is *not* guaranteed to contrast against every `--sb-color` in dark mode.

---

### AllocationMeter
- **Import:** `import { AllocationMeter } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/AllocationMeter.tsx` · **Style:** `packages/fields/src/styles/fields/allocation-meter.css`
- **Composes wrappers:** none — standalone display primitive. **Radius:** dots `50%`, bar track `--border-radius__large` (999px fallback, same pattern as StatusBadge — see guardrail) · **Motion:** dot fill / bar width on `--fast`/`--medium`
- **Purpose:** Visualises filled-vs-available discrete slots ("3/5 seats") as either a dot row or a mini progress bar, with an auto-tone that shifts green → amber → red as slots fill.
- **Variants / sizes:** `variant`: `dots` (default) | `bar`. `size`: `sm` | `md`. `tone`: `primary` | `warning` | `danger` | `auto` (default — resolves to `danger` when full, `warning` when exactly one slot remains, else `primary`).

**State matrix**

Pure display primitive — no interaction states. Tone → colour:

| tone | `--am-color` |
|---|---|
| `primary` | `--complete` (→ `--primary`) |
| `warning` | `--in-progress` (→ `--warning`) |
| `danger` | `--incomplete` (→ `--danger`) |

| variant | filled | empty |
|---|---|---|
| `dots` | `10px` (sm `7px`) circle, solid `--am-color` fill+border | `color-mix(--am-color 22%, transparent)` fill, `color-mix(--am-color 35%, transparent)` border |
| `bar` | fill `--am-color` on a `96px`(sm `72px`) × `8px`(sm `6px`) track | track bg `color-mix(--am-color 16%, transparent)` |

**Anatomy & tokens:** caption text `0.8125rem` (`sm`: `0.6875rem`) `--text-secondary`, e.g. "2/5 seats available" or "slots full"; bar variant is `role="progressbar"` with `aria-valuenow/min/max`; dots variant is `role="img"` with a computed `aria-label`.
**Behavioral notes:** `filled`/`total` are clamped/floored defensively (`Math.max(0, Math.floor(...))`) before rendering, so fractional or negative inputs can't produce a malformed dot count.
**⚠ Guardrail violations found:**
- `allocation-meter.css:57` — `border-radius: var(--border-radius__large, 999px)` — same radius-intent mismatch as `StatusBadge`; should be `var(--radius-pill)`.

---

### ProgressBar
- **Import:** `import { ProgressBar } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/ProgressBar.tsx` · **Style:** `packages/fields/src/styles/fields/progress-bar.css`
- **Composes wrappers:** none — standalone display primitive. **Radius:** `--border-radius__large` (999px fallback — same pattern, see guardrail) · **Motion:** fill `width` on `--medium`, `background-color` on `--fast`
- **Purpose:** General 0..max linear progress indicator (checklist completion, upload progress, "N of M done"), distinct from `AllocationMeter`'s discrete-slot semantics.
- **Variants / sizes:** `size`: `sm` | `md` | `lg`. `tone`: `primary` (default) | `success` | `warning` | `danger` | `auto` (amber <34% → primary → success at 100%). `valueFormat`: `percent` (default) | `fraction`.

**State matrix**

Pure display primitive. Tone → colour:

| tone | `--pb-color` |
|---|---|
| `primary` | `--complete` (→ `--primary`) |
| `success` | `--complete`/`--success`/`--primary` chain |
| `warning` | `--in-progress` (→ `--warning`) |
| `danger` | `--incomplete` (→ `--danger`) |

**Anatomy & tokens:** track height `8px` (`sm`: `6px`, `lg`: `12px`), radius `--border-radius__large`(999px fallback), track bg `color-mix(--pb-color 15%, transparent)`; optional leading `label` (`0.8125rem`, `--text-muted`) and trailing `value` caption (`0.8125rem`, tabular-nums, right-aligned, min-width `2.5em`).
**Behavioral notes:** `role="progressbar"` with live `aria-valuenow/min/max`; `value`/`max` are clamped (`Math.min(Math.max(0, value), safeMax)`) and `max <= 0` is guarded to `1` to avoid a divide-by-zero.
**⚠ Guardrail violations found:**
- `progress-bar.css:37` — `border-radius: var(--border-radius__large, 999px)` — same radius-intent mismatch; should be `var(--radius-pill)`.

---

### MetricGrid
- **Import:** `import { MetricGrid } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/MetricGrid.tsx` · **Style:** `packages/fields/src/styles/fields/metric-grid.css`
- **Composes wrappers:** none — standalone display primitive. **Radius:** `--border-radius` (8px, card-level) · **Motion:** none (static grid, no transitions defined)
- **Purpose:** A bordered, optionally-divided CSS grid of metric cells — icon + prominent value + muted label — for compact multi-stat summaries (e.g. dashboard header counters).
- **Variants / sizes:** `size`: `sm` | `md`. `divided` boolean (thin `1px` left-borders between cells, default true). Per-cell `tone`: `default` | `primary` | `success` | `warning` | `danger` (colours only the numeric value).

**State matrix**

Pure display primitive — no interaction states (cells are not clickable/focusable; `hint` renders as a native `title` tooltip only).

| tone | `--mg-tone` (value colour) |
|---|---|
| `default` | `--text-main` |
| `primary` | `--primary` |
| `success` | `--complete` (→ `--primary`) |
| `warning` | `--in-progress` (→ `--warning`) |
| `danger` | `--incomplete` (→ `--danger`) |

**Anatomy & tokens:** grid `--card` bg, `1px --border-color` border, `overflow: hidden` (clips to the outer radius); cell padding `14px 16px` (`sm`: `10px 12px`); value `1.375rem`/`700` (`sm`: `1.0625rem`); label `0.75rem` `--text-muted` (`sm`: `0.6875rem`); column count defaults to `min(metrics.length, 4)`, overridable via `columns`.
**Behavioral notes:** Dividers are pure CSS (`.metric-grid__cell + .metric-grid__cell { border-left }`), so the first cell in each row never gets a leading divider automatically via the adjacent-sibling selector — but note this only suppresses the very first cell overall, not the first cell of each wrapped row in a multi-row grid (a purely CSS-Grid limitation, not fixable without `:nth-child(n+2)`-per-row logic).
**⚠ Guardrail violations found:** None — this stylesheet is fully clean (every colour/radius/spacing value traces to a real token or a plain rem/px layout number, no hex/hsl literals or undefined tokens found).

---

### HelpTooltip
- **Import:** `import { HelpTooltip } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/components/HelpTooltip.tsx` · **Style:** `packages/fields/src/styles/components/help-tooltip.css`
- **Composes wrappers:** none — it is itself composed *by* `LabelWrapper` (rendered as the `help`/`helpLink` affordance next to any field's label). **Radius:** popup `--border-radius__small` (4px) · **Motion:** popup `opacity`/`transform` on `--field-transition` (150ms)
- **Purpose:** A small `?` glyph (or custom icon) that reveals a dark tooltip bubble on hover, optionally as a clickable external link.
- **Variants / sizes:** none — single visual; renders as `<a>` when `href` is provided, `<span>` otherwise.

**State matrix**

| State | icon color | popup visibility | notes |
|---|---|---|---|
| default | `--text-tertiary` | `opacity: 0; visibility: hidden` | `cursor: help` (`pointer` if `href`) |
| hover | `--primary` (only when it's an `<a>`; bare `<span>` icon never changes colour on hover) | `opacity: 1; visibility: visible`, slides from `translateY(-8px)` → `translateY(-4px)` | popup is always dark (`--gray-900`/`--gray-0`) regardless of light/dark theme — intentional per the CSS comment ("Tooltips usually remain dark even in light mode for contrast") |

**Anatomy & tokens:** popup positioned `bottom: 100%`, centred (`left: 50%`, `translateX(-50%)`), `max-width: 200px`, `0.5rem 0.75rem` padding, `0.75rem` font; a small CSS-triangle arrow (`border-width: 4px` trick) points down at the icon; `z-index: 100`.
**Behavioral notes:** Link variant stops click-propagation (`e.stopPropagation()`) so clicking the help icon doesn't also trigger a parent `<label>`'s click-to-focus behaviour. `target="_blank"` + `rel="noopener noreferrer"` on the link form.
**⚠ Guardrail violations found:**
- `help-tooltip.css:35-36,71` — `background-color: var(--gray-900, #111827)` / `color: var(--gray-0, #ffffff)` / `border-color: var(--gray-900, #111827) transparent…` — **`--gray-900` and `--gray-0` are not defined anywhere** in `colour.css`/`system.css`/`ui.css`, so this tooltip *always* renders its hardcoded hex fallbacks. Functionally this may be intentional (an "always-dark" surface independent of theme), but if so it should be backed by a real token (e.g. a new `--overlay-dark`/`--tooltip-bg` semantic pair) rather than two undefined custom properties that happen to have the right fallback.
- `help-tooltip.css:9` — `color: var(--text-tertiary, #9ca3af)` — hardcoded hex fallback (redundant, `--text-tertiary` is always defined).
- `help-tooltip.css:55` — `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);` — raw shadow, should be `var(--elevation-2)` or `var(--elevation-3)`.

---

## datetime/ (being moved to `@projective/ui/time`)

> **⚠ Deprecation:** `Calendar` is being moved out of `packages/fields` into `@projective/ui/time`. Treat this section as a snapshot of its current (pre-move) implementation — update the import path once the move lands.

### Calendar
- **Import (current):** `import { Calendar } from '@projective/ui/fields'` → **moving to** `@projective/ui/time`
- **Source:** `packages/fields/src/components/datetime/Calendar.tsx` · **Style:** `packages/fields/src/styles/components/calendar.css`
- **Composes wrappers:** none — a fully self-contained day/month/year picker grid (used inside `DateField`'s popover/inline modes and `DateTimeField`'s date tab). **Radius:** `--field-radius` container, `--border-radius__small`/`__xsmall` cells · **Motion:** `--fast` on all cell hover/select transitions
- **Purpose:** Three-scope date grid (`day` → `month` → `year`, drill-up via clicking the header title, drill-down via picking a month/year) with min/max bounds and arbitrary `modifiers.disabled`/`highlighted`/`hidden` predicates.
- **Variants / sizes:** none — fixed `320px` width; `selectionMode`: `single` | `multiple` | `range` (only `single` is actually wired to `onChange` in the current implementation — multiple/range selection classes exist in CSS (`calendar__day--range-start/end/middle`) but `handleDaySelect` only calls `onChange` when `selectionMode === 'single'`, so multiple/range modes currently render but cannot commit a selection through this component alone).

**State matrix (day cells)**

| State | background | text | notes |
|---|---|---|---|
| default | transparent | `--field-text` | |
| hover (`:not(:disabled)`) | `--field-bg-hover` | `--field-text` | also applies to month/year cells |
| today | `hsla(primary, 0.1)` | `--primary`, `font-weight: 600` | |
| selected | `--primary !important` | `#ffffff !important` (hardcoded, see guardrail) | |
| muted (outside current month) | — | `--field-text-disabled` | |
| disabled | — | `--field-text-disabled`, `opacity: 0.4`, `text-decoration: line-through` | via `min`/`max`/`modifiers.disabled` |
| range start/end (defined but unreachable — see variants note) | `--primary` | `#ffffff` | asymmetric radius (flat on the range-facing side) |
| range middle (defined but unreachable) | `hsla(primary, 0.15)` | `--primary` | `border-radius: 0` |

**Anatomy & tokens:** header `32px` tall with prev/next nav buttons (`IconChevronLeft/Right`, `32×32px`) flanking a clickable title (drills scope up); weekday row (`Sun…Sat`, respects `startOfWeek: 0 | 1`); day grid always renders a fixed 42-cell (6-week) grid including lead/trail days from adjacent months; month/year grids are `3-column`, `12`-cell.
**Behavioral notes:** Clicking the header title cycles `day → month → year` (no further "decade" level); picking a month/year drills back down one level. Year grid shows a 12-year window (`startYear - 1` through `startYear + 10`) with out-of-decade years dimmed via `calendar__day--muted`.
**⚠ Guardrail violations found:**
- `calendar.css:12` — `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);` — raw dual-layer shadow duplicating what `--elevation-2`/`--shadow-md` already define — should be `box-shadow: var(--elevation-2);`.
- `calendar.css:141,177,184` — `color: #ffffff !important;` (×3, selected/range-start/range-end day text) — raw hex instead of `--on-accent`.

---

### TimeClock
- **Import (current):** `import { TimeClock } from '@projective/ui/fields'` → **moving to** `@projective/ui/time`
- **Source:** `packages/fields/src/components/datetime/TimeClock.tsx` · **Style:** `packages/fields/src/styles/components/time-clock.css`
- **Composes wrappers:** none — a fully self-contained analog clock-face picker (used inside `TimeField`'s popover/inline modes and `DateTimeField`'s time tab). **Radius:** `--field-radius` container corners, `50%` clock face/numbers/hand-knob · **Motion:** number/hand colour transitions on `--fast`; no easing on the hand-rotation itself (instant `transform` per pointer move)
- **Purpose:** Analog 12-hour clock face for picking hours then minutes (auto-advances hour→minute in single-select mode), with drag-to-select via pointer capture and an AM/PM toggle.
- **Variants / sizes:** none — fixed `230×230px` face. `selectionMode`: `single` | `multiple` (multiple renders extra highlighted numbers via `clock__number--multi` for non-primary selected times, toggling a time on pointer-release if it already exists in the selection).

**State matrix**

| Element | State | styling |
|---|---|---|
| header bar | default | `--primary` bg, white text/icons |
| digital hour/minute value | inactive | `rgba(255,255,255,0.7)` (raw, see guardrail) |
| digital hour/minute value | active (current mode) | `#ffffff` (raw) |
| AM/PM button | inactive | transparent bg, `1px rgba(255,255,255,0.3)` border, `rgba(255,255,255,0.7)` text (all raw) |
| AM/PM button | active | `#ffffff` bg, `--primary` text, `font-weight: bold` |
| clock face | default | `--field-bg-hover` circular fill |
| number | default | `--field-text` |
| number | active/selected | `--primary` bg, `#ffffff` text (raw) |
| hand | — | `--primary` line + knob, `pointer-events: none` so it never blocks number clicks |

**Anatomy & tokens:** body wrapper `1.5rem` padding, `--field-bg`/`--field-border` (bottom radii only — pairs visually under the always-primary header); numbers are `32×32px` circles positioned via computed `translate()` from `getPosition(i, 12, radius=100)`; hand length equals the face radius (`100px`), rotated via `atan2` math, no easing/spring on movement — it's a direct pointer-follow while dragging.
**Behavioral notes:** Pointer-capture drag on the whole face (`onPointerDown` sets capture + immediately updates); `handlePointer` maps `(x,y)` offset from centre to a 12-step (hours) or 60-step (minutes) angle value via `getAngleValue`. Releasing the pointer (`isFinish: true`) commits the value and, in single-select mode while in `hours` view, auto-switches to `minutes` view. AM/PM toggle in single-select mode immediately rewrites the display date's hour by ±12; in multi-select mode it only changes the *context* for future clicks (does not retroactively rewrite existing selections).
**⚠ Guardrail violations found:**
- `time-clock.css:4,20,34,44-47,56-60` — pervasive raw `#ffffff` / `rgba(255,255,255,0.7)` / `rgba(255,255,255,0.3)` literals for text/border on the always-primary-coloured header — none of these route through `--on-accent` or any translucent-on-accent token; there is currently no canonical "70%-opacity text on a solid accent surface" token in the vocabulary, so at minimum the pure-white cases (`#ffffff` on lines 31, 57, 60) should become `--on-accent`.
- `time-clock.css:103` — `color: #ffffff;` on `.clock__number--active` — same, should be `--on-accent`.

---

## Wrappers

### LabelWrapper
- **Import:** `import { LabelWrapper } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/wrappers/LabelWrapper.tsx` · **Style:** `packages/fields/src/styles/wrappers/label-wrapper.css`
- **Purpose:** Renders a field's `<label>` (+ required-asterisk + inline/positioned `HelpTooltip`), with an optional "floating" behaviour (Material-style label that starts as a placeholder and animates up/shrinks on focus-or-filled). Consumed by nearly every input in this doc except `SearchInput`, `StatusSlider`, `Checkbox`, `MenuSelect`/`FilterTags`/`ViewToggle`, and the display primitives.
- **Key props:** `position` (`top`|`left`|`right`|`bottom`), `floatingRule` (`auto`|`always`|`never`), `floatingOrigin` (`top-left`|`center`), `helpPosition` (`inline`|`top-right`|`bottom-right`|`bottom-left`), `active`/`error`/`disabled` (bool or Signal).
- **State matrix**

| State | color | position/transform | notes |
|---|---|---|---|
| default (static) | `--field-text-label` | normal flow, `margin-bottom: 4px` | |
| floating, not active | inherits, transparent bg | `absolute`, vertically centred (`top:50%`, `translateY(-50%)`) over the field | only applies when `position==='top'` and `floatingRule !== 'never'` |
| floating, active (`--active`) | `--field-border-focus` | `top:0`, `translateY(-50%) scale(0.85)`, bg `--field-bg` (masks the field border), `font-weight: 600`, `z-index: 20` | "active" = focused, OR has value, OR `floatingRule==='always'` |
| error | `--field-text-error` | — | independent of active/floating state |
| disabled | `--field-text-disabled` | — | |

**Behavioral notes:** `pointer-events: none` on the label itself (so it never blocks clicks through to the field) except the required-asterisk/help-tooltip which remain interactive. `HelpTooltip` renders inline (moves with the label) when `helpPosition==='inline'`, or as a detached fixed-corner element otherwise.
**⚠ Guardrail violations found:** `label-wrapper.css` — every declaration is a `var(--token, hardcoded-fallback)` pair (`#4b5563`, `150ms ease`, `12px`, `#3b82f6`, `#ffffff`, `#ef4444`, `#9ca3af`) — same systemic pattern as the input stylesheets; none are new/unique issues beyond what's already catalogued for `TextField`.

---

### MessageWrapper
- **Import:** `import { MessageWrapper } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/wrappers/MessageWrapper.tsx` · **Style:** `packages/fields/src/styles/wrappers/message-wrapper.css`
- **Purpose:** Renders exactly one helper/status line beneath a field, by priority: `error` > `warning` > `info` > `hint`. When nothing is set, it still renders an empty `aria-hidden` div (reserves layout height / prevents content jump) rather than `null`.
- **Key props:** `error`/`warning`/`info` (string or `Signal<string|undefined>`), `hint` (plain string only, no Signal support).
- **State matrix**

| type | color | role |
|---|---|---|
| error | `--field-text-error` | `role="alert"` |
| warning | `--warning` | `role="status"` |
| info | `--field-text-placeholder` (i.e. reuses the placeholder-muted colour, not a distinct "info" colour) | `role="status"` |
| hint | inherits base text colour (no `.field-message--hint` class exists — hint gets none of the type modifier classes) | `role="status"` |

**Behavioral notes:** `0.75rem` font, `4px` top margin, `150ms` colour/opacity transition.
**⚠ Guardrail violations found:**
- `message-wrapper.css:17` — `color: var(--warning, #f59e0b)` — hardcoded hex fallback.
- `message-wrapper.css:21` — `color: var(--field-text-placeholder, #9ca3af)` used for the `info` variant — semantically this should probably route to `--status-info` (`--ocean`) per the canonical status-accent map rather than reusing the muted placeholder colour, which makes info messages visually indistinguishable from a plain disabled/placeholder tone.

---

### AdornmentWrapper
- **Import:** `import { AdornmentWrapper } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/wrappers/AdornmentWrapper.tsx` · **Style:** `packages/fields/src/styles/wrappers/adornment-wrapper.css`
- **Purpose:** Renders a prefix/suffix icon or action slot inside a field's border (used by `TextField`, `HandleField`, `MoneyField`, `DateField`, `TimeField`). Returns `null` when no children are passed, so it never leaves an empty gap.
- **Key props:** `position` (`prefix`|`suffix`, required), `onClick`/`onPointerDown` (marks it `--interactive`, adding `cursor:pointer` + hover colour).
- **State matrix**

| State | color | notes |
|---|---|---|
| default | `--field-text-placeholder` | `min-width: --field-icon-size` (20px) |
| interactive + hover | `--field-text` | only when `onClick`/`onPointerDown` supplied |

**Anatomy & tokens:** `--field-gap` (8px) margin on the border-facing side (`margin-right` for prefix, `margin-left` for suffix).
**⚠ Guardrail violations found:** `adornment-wrapper.css:7-8,12,16,22` — hardcoded fallbacks (`#9ca3af`, `20px`, `8px`, `150ms ease`) on otherwise-real tokens; `--field-icon-size`/`--field-gap` themselves are **not defined in `fields.css`** (only referenced via fallback here and in `field-array-wrapper.css`/`skeleton-wrapper.css`), so every consumer always renders the hardcoded `20px`/`8px` fallback rather than a real token — these two should be promoted into `fields.css` as first-class tokens if they're meant to be tunable, or the `var(--undefined-token, value)` indirection should just be removed in favour of the plain value.

---

### SkeletonWrapper
- **Import:** `import { SkeletonWrapper } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/wrappers/SkeletonWrapper.tsx` · **Style:** `packages/fields/src/styles/wrappers/skeleton-wrapper.css`
- **Purpose:** Loading placeholder rendered in place of a field while data is pending. Renders `null` when not loading.
- **Key props:** `loading` (bool or Signal), `variant` (`rect`|`circle`|`pill`), `width`/`height` overrides.
- **State matrix:** Not applicable — this is a single-state (loading-only) display stub; no hover/focus/error/disabled variants exist. `rect` = full field height/width; `circle` = square `--field-height` with `50%` radius; `pill` = fixed `24×60px` with `--border-radius__xlarge`.
**Behavioral notes:** `aria-hidden="true"` — it's a purely visual stub; note the class list documents a `--pulse` shimmer modifier (`field-skeleton--pulse`) but **no `@keyframes` for a pulse animation exists anywhere in `skeleton-wrapper.css`** — the shimmer is currently non-functional (static grey block only).
**⚠ Guardrail violations found:**
- `skeleton-wrapper.css:4-5` — `background-color: var(--field-bg-disabled, #f3f4f6)` / `border-radius: var(--field-radius, 8px)` hardcoded fallbacks.
- Missing `@keyframes` for `field-skeleton--pulse` (behavioral gap, not a token issue, but affects the documented "pulse" variant name being misleading).

---

### EffectWrapper
- **Import:** `import { EffectWrapper, useRipple } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/wrappers/EffectWrapper.tsx` · **Style:** `packages/fields/src/styles/wrappers/effect-wrapper.css`
- **Purpose:** Layers the shared focus-glow ring and click-ripple effect *inside* a field's clipped border-radius (absolutely positioned, `border-radius: inherit`). Also exports the underlying `useRipple()` hook (from `@projective/ui`) for fields that need manual ripple control (e.g. `SelectField` triggers its own `addRipple` on container click rather than relying on `EffectWrapper`'s implicit behaviour).
- **Key props:** `focused` (bool or Signal — drives the ring), `disabled` (bool or Signal — when true, the wrapper renders nothing at all, not even a dimmed ring).
- **State matrix**

| State | ring | notes |
|---|---|---|
| unfocused | `box-shadow: 0 0 0 0 transparent` | present but invisible (kept mounted for a smooth transition) |
| focused | `box-shadow: 0 0 0 var(--field-ring-width, 3px) var(--field-ring-color, …)` | transitions over `--field-transition` (150ms) |
| disabled | wrapper returns `null` entirely | no ring, no ripple container rendered |

**Anatomy & tokens:** ripple spans animate `scale(0) → scale(4)` fading opacity over a hardcoded `600ms linear` (not a `--motion-*` token), coloured `--field-ripple-color`.
**⚠ Guardrail violations found:**
- `effect-wrapper.css:20` — `box-shadow: 0 0 0 var(--field-ring-width, 3px) var(--field-ring-color, rgba(59, 130, 246, 0.12));` — `--field-ring-width` is **not defined anywhere** in `fields.css` (always falls back to the hardcoded `3px`); the colour fallback `rgba(59,130,246,0.12)` is also a hardcoded blue rather than the real teal `--field-ring-color`. Additionally, this hand-rolled ring duplicates what the canonical `--focus-glow` token already defines (`0 0 0 3px hsla(primary, 0.4)`) — the package effectively maintains two parallel "focus ring" systems (`--field-ring-color` here vs. `--focus-glow` in `system.css`) that happen to look similar but are not the same token.
- `effect-wrapper.css:29` — `background-color: var(--field-ripple-color, rgba(0, 0, 0, 0.1))` — hardcoded rgba fallback.
- `effect-wrapper.css:28` — `animation: ripple 600ms linear;` — raw `600ms`, not sourced from any motion token (closest semantic match would be a new "splash/ripple" motion tier — none currently exists between `--motion-micro` 250ms and `--motion-structural` 620ms).

---

### FieldArrayWrapper
- **Import:** `import { FieldArrayWrapper } from '@projective/ui/fields'`
- **Source:** `packages/fields/src/wrappers/FieldArrayWrapper.tsx` · **Style:** `packages/fields/src/styles/wrappers/field-array-wrapper.css`
- **Purpose:** Generic repeat-a-field list (add/remove rows of an arbitrary field), used for structured multi-value inputs beyond `TagInput`'s flat string list (e.g. repeated structured objects). Renders default `+ Add Item` / `×` buttons or accepts custom `renderAddButton`/`renderRemoveButton` render-props.
- **Key props:** `items` (array or Signal), `onAdd`/`onRemove`, `renderItem` (required), `maxItems` (hides the add affordance once reached).
- **State matrix:** Not applicable — purely structural layout wrapper; no visual states of its own (styling is delegated entirely to whatever `renderItem`/custom buttons produce). Default remove button (`field-array__remove-btn`) and add button (`field-array__add-btn`) are unstyled beyond class hooks — **no CSS rules exist for `.field-array__remove-btn` or `.field-array__add-btn` at all** in `field-array-wrapper.css` (only the container/item/action layout is styled), so the default buttons currently render with pure browser-default button chrome unless a consumer supplies custom render props.
**Behavioral notes:** `renderRemoveButton`/`renderAddButton` receive a pre-bound callback (`() => onRemove(index)` / `onAdd`) so custom buttons don't need to manage the index themselves.
**⚠ Guardrail violations found:**
- `field-array-wrapper.css:7,14` — `gap: var(--field-gap, 8px)` — same undefined-`--field-gap`-token issue as `AdornmentWrapper`.
- Missing styling for `.field-array__remove-btn`/`.field-array__add-btn` (see State matrix note) — not a hardcoded-literal violation, but a real gap versus the "every field ships production-ready chrome" expectation set by the rest of the package.

---

## Hooks (brief)

- **`useFieldState<T>`** (`hooks/useFieldState.ts`) — Normalizes a `value`/`Signal<value>` prop into a single internal `Signal<T>`, tracks `error`/`dirty`/`touched`, and exposes `setValue`/`validate`. `validate()` currently only implements a single built-in rule (`required` → "This field is required"); all other validation (format, min/max, custom) is left to the caller via the `error` prop. Used by `TextField`, `DateField`, `TimeField`, `SearchInput`.
- **`useInteraction`** (`hooks/useInteraction.ts`) — Tracks `focused`/`hovered`/`active`/`dirty`/`touched` as signals with paired handlers (`handleFocus`/`handleBlur`/`handleMouseEnter/Leave/Down/Up`/`handleChange`). Purely bookkeeping — emits no DOM/CSS itself; every interactive field composes it to drive its own `--focused`/`--hover` class toggling.
- **`useSliderState`** (`hooks/useSliderState.ts`) — The full drag-slider engine behind `SliderField`: pointer-capture drag math, single/range/multi-handle collision avoidance (`minDistance`/`passthrough`), linear/logarithmic value↔percent conversion, mark-snapping, and derived `handleStyles`/`trackFillStyle` position objects consumed directly as inline `style`.
- **`useCurrencyMask`** (`hooks/useCurrencyMask.ts`) — Powers `MoneyField`'s masked display: shows the raw editable number on focus, reformats to a locale-aware 2-decimal string via `Intl.NumberFormat` on blur, strips invalid characters live, and exposes `setProgrammaticValue` for the drag-to-scrub interaction to bypass the normal typed-input path.
- **`useGlobalDrag`** (`hooks/useGlobalDrag.ts`) — Window-level dragenter/dragleave/dragover/drop listener pair (with a drag-counter to survive bubbling through child elements) that exposes a single `isDragging` signal; backs `GlobalFileDrop`'s app-wide "drop anywhere" overlay, independent of any single `FileDrop` instance's own local drag state.
- **`useMinAmountValidation`** (`hooks/useMinAmountValidation.ts`) — A small validator-factory for money fields: given a minimum in integer minor units (cents) plus currency/locale, returns a memoized `{ minLabel, validate(value) }` pair producing a formatted "Minimum is £5.00"-style error string. Domain-agnostic (the £5 withdrawal floor example lives in the consuming app, not here).
