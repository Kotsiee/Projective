# Charts — Visualization State & Variant Matrices

`packages/charts` ships two rendering families that resolve design tokens in fundamentally
different ways, and understanding which family a component belongs to explains almost every
guardrail violation below. **SVG and DOM/CSS components** (`AreaLineChart`, `ForecastRunwayChart`,
`RatingBreakdownChart`, `WorkloadCapacityGauge`'s dial, `Kanban*`, `ChartFocusModal`) can pass a raw
`var(--token)` string straight into a `stroke`/`fill`/`background` attribute or a stylesheet — the
browser resolves custom properties natively at paint time, so these charts simply re-theme for
free and need no JavaScript involvement. **Canvas/WebGL components**, by contrast, draw with an
imperative API (`CanvasRenderingContext2D.fillStyle`, PixiJS's `Graphics.fill({ color })`) that has
no concept of CSS custom properties — a colour must be resolved to a concrete value (a hex number
for PIXI, an `rgb()` string for Canvas2D) in JavaScript *before* the draw call. `packages/charts/src/utils/theme-bridge.ts`
exists for exactly this: `getThemeColor(varName)` stamps a hidden `<div>` with `style.color = var(${varName})`,
reads back the browser's fully-resolved `rgb()` computed style (collapsing any nested `var()`/`hsl()`/`calc()`
in the process), converts it to a `0xRRGGBB` number, and caches it in a module-level `Map` keyed by
`` `${theme}:${varName}` `` so 60fps PIXI redraws never re-touch the DOM. The three Gantt PIXI
renderers (`GridRenderer`, `TaskRenderer`, `ScrollRenderer`) are the **only** consumers of
`theme-bridge.ts` in the package. The `PipelineFlowChart` Canvas2D scatter needs the same
capability but does **not** use `theme-bridge.ts` — it reimplements an uncached, divergent local
`resolveCssColor()` helper instead (see its Guardrail section). Every matrix below is graded
against the canonical token vocabulary (`--status-*` / primitives, `--surface-*`, `--radius-*`,
`--motion-*`, `--focus-glow`, `--elevation-*`, `--text-*`) defined in
`apps/web/styles/themes/variables/{colour,system,ui}.css`.

---

### GanttChart
- **Import:** `import { GanttChart } from '@projective/charts'`
- **Source:** `packages/charts/src/components/gantt/GanttChart.tsx` (composes the internal,
  non-exported `GanttHeader.tsx`, `GanttTaskList.tsx`/`GanttTaskCard.tsx`, `GanttTimeline.tsx`,
  `GanttTooltip.tsx`) · core: `core/gantt/store.ts`, `time-scale.ts`, `header-utils.ts`,
  `gantt-manager.ts`, `renderer/{base,grid,task,scroll}-renderer.ts` · **Render tech:** Hybrid —
  DOM/CSS chrome (header controls, left task list, tooltip) + a PixiJS WebGL canvas
  (`GanttManager`) for grid lines, task bars, milestones and scrollbars · **Style/tokens via:**
  DOM parts read the `styles/gantt/*.css` files directly; the PIXI canvas layer resolves colour
  tokens through `theme-bridge.ts#getThemeColor`.
- **Radius:** `var(--border-radius)` (legacy 8px primitive, not the semantic ladder) on the body/
  header/tooltip DOM containers; the PIXI task-bar corner radius is a bare JS literal (`4`), not
  token-driven at all — see guardrails.
- **Motion:** none of the canonical `--motion-*` tokens appear anywhere in the Gantt stack. DOM
  hover states use the raw `--fast` primitive (`gantt-task-card.css`); the canvas has no CSS
  transitions — panning uses a hand-rolled inertia decay (`deltaX *= 0.9` per PIXI ticker frame)
  and every redraw is a full, un-eased `graphics.clear()` + redraw.
- **Purpose:** interactive project/stage timeline — a draggable, zoomable canvas of task bars and
  milestones synced to a virtualized left-hand row list.
- **Series / variants:** no per-status colour encoding. `GanttTask.status` exists in the Zod schema
  (`types/gantt.ts`) but `TaskRenderer` never reads it — every non-milestone bar renders identically
  (`--primary` accent) regardless of status; the only visual "variant" is `selectedRowId`
  (thicker/opaque stroke) and `isMilestone` (diamond glyph in `--warning`).

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Task bar (PIXI) | fill `--primary` @ .15 alpha, left accent strip @ 1 alpha, stroke `--primary` @ .4 alpha / 1px | cursor → pointer only (no fill change; hover instead opens `GanttTooltip`) | stroke @ 1 alpha / 2px (`store.selectedRowId` match) | — (no drag/resize wired despite `constraints.allowMove/allowResize` existing in the schema — dead capability) | width clamps to a 2px sliver minimum so zero-duration tasks still render |
| Milestone diamond (PIXI) | fill `--warning` @ 1 alpha, stroke `--bg` / 3px | pointer cursor only | stroke swaps to `--primary` / 3px | — | — |
| Grid lines (PIXI) | bottom tier `--border-color` @ .3 alpha; top (month/day boundary) tier `--primary` @ .2 alpha | — | — | — | — |
| Scrollbar thumbs (PIXI, v + h) | hollow stroke `--text-main` @ .2 alpha, 6px wide, invisible `0xffffff`@.001 fill for hit-testing | 8px wide, .6 alpha (`vHovered`/`hHovered`, also suppresses canvas panning via `store.hoveredScrollbar`) | — | position/width recomputed live from `clientX`/`clientY` delta | hidden entirely when content ≤ viewport |
| GanttTaskCard (DOM, left list) | transparent, border transparent | bg `--input-bg`, border `--border-color` | `data-selected=true` → bg `--primary-surface`, border `--primary` | click → `store.selectRow()` (no drag on the row) | — |
| Header zoom slider / day steppers | inherits `SliderField`/`IconButton` defaults | inherits | inherits | hold-to-repeat (`useHoldRepeat`: 400ms initial delay, 50ms interval) on ± buttons | visible-days clamped to 1–90 |
| GanttTooltip (DOM) | hidden (`hoveredTask` null) | appears at `pointerPos`, flips above/left near viewport edges (roof <120px, wall <280px) | — | force-hidden while `isMouseDown` (panning) | — |

**Token pull-list (via theme-bridge):** `--primary` (grid top-tier lines, task-bar accent,
milestone selected-stroke), `--border-color` (grid bottom-tier lines), `--bg` (milestone
unselected stroke — non-canonical, see guardrail), `--text-main` (task title text, scrollbar
thumb stroke), `--text-muted` (task date subtext), `--warning` (milestone fill — non-canonical).
Each is cached under `` `${theme}:${varName}` `` in `theme-bridge.ts`'s module-level `Map`;
`GanttManager` invalidates via a `MutationObserver` on `data-theme` that bumps `store.themeTrigger`
to force a redraw (old-theme cache entries are never purged, just left stale under their own key).

**Anatomy & tokens:** dual-tier grid (day/month), sticky top-tier labels vs. centered bottom-tier
labels (`--text-main`/`--text-muted`); tooltip surface `--card` + `--border-color` border + raw
`--border-radius` + a hardcoded shadow; left-list header is uppercase `--text-muted`; there is no
"no tasks" empty state anywhere in `GanttChart`/`GanttTaskList`.

**Behavioral notes:** dragging pans the whole canvas (`ScrollManager`) with inertia, not per-task
move/resize; Ctrl/Cmd+wheel zooms `visibleDays` (1–3650) exponentially, anchored to the first
task's start date; the task list virtualizes to 15 rows from a computed `startIndex`, with
sub-pixel `translateY` for smooth sub-row scroll; header ticks are procedurally generated per zoom
tier (hour/day/week/month/quarter/year) via `getHeaderTier`; there is no enter/update/exit
animation curve — PIXI redraws are immediate and discrete on every signal change.

**⚠ Guardrail violations found:**
1. `packages/charts/src/core/gantt/renderer/task-renderer.ts:24` — `getThemeColor('--bg')` resolves
   the raw page-canvas primitive instead of a surface token; the milestone's "cutout" stroke should
   match the timeline's actual background (`.gantt-body` is `var(--card)`, not `--bg`) — a visible
   mismatch, not just a naming nit.
2. `packages/charts/src/core/gantt/renderer/task-renderer.ts:28` — `getThemeColor('--warning')`
   uses the raw primitive; should resolve `--status-warning`.
3. `packages/charts/src/core/gantt/renderer/task-renderer.ts:93` — `const radius = 4;` hardcoded
   PIXI corner radius (value matches `--radius-control` but isn't token-driven — `theme-bridge.ts`
   has no numeric/radius equivalent of `getThemeColor` today).
4. `packages/charts/src/core/gantt/renderer/scroll-renderer.ts:198,243` — `fill({ color: 0xffffff, alpha: 0.001 })`
   hardcoded raw hex for the invisible hit-target fill (low severity given the near-zero alpha, but
   still a literal, not resolved via `getThemeColor`).
5. `packages/charts/src/components/gantt/GanttChart.tsx:91-93` and mirrored in
   `styles/gantt/gantt.css:25-27`, `gantt-header.css:3-5`, `gantt-tooltip.css:5-7` —
   `var(--border-radius)` (legacy 8px primitive) instead of the semantic `--radius-card`/`--radius-stage`.
6. `packages/charts/src/styles/gantt/gantt-tooltip.css:8` —
   `box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1);` hardcoded instead of
   `var(--elevation-3)` (explicitly the "popovers, dropdowns, floating panels" token).

---

### Kanban
- **Import:** `import { Kanban } from '@projective/charts'`
- **Source:** `packages/charts/src/components/kanban/Kanban.tsx` (+ `hooks/useKanbanDnD.ts`) ·
  **Render tech:** DOM/CSS, native Pointer Events drag-and-drop (no HTML5 DnD API, no external
  library) · **Style/tokens via:** `styles/kanban/kanban.css`.
- **Radius:** `var(--border-radius__large)` (legacy ladder rung, numerically equal to
  `--radius-card` but not the semantic alias) on the Add-Stage button and field-ghost placeholder.
- **Motion:** raw `--fast` primitive drives the drag-avatar's rotate transition; no `--motion-*`
  semantic token appears anywhere in `kanban.css`.
- **Purpose:** horizontal multi-column ticket board (stage pipeline) — orchestrates column
  reordering and card reordering via a shared module-global `dragData` signal.
- **Series / variants:** none at the board level; `KanbanField.color` (see below) is the only
  per-instance accent, and it is opt-in/consumer-supplied, not a fixed palette.

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Field track (`.kanban__track`) | flex row, `gap:1rem`, horizontal scroll | — | — | dragged field's original slot gets `display:none`; a floating `.kanban__drag-avatar` clone follows the pointer at `rotate(2deg)` | zero fields → only the Add Stage button (if permitted) renders |
| Field-ghost drop placeholder | — | — | — | rendered only while `isDropTarget`; height matches the dragged element, bg `color-mix(primary 8%)`, dashed `color-mix(primary 45%)` border | — |
| Add Stage button | inherits `Button variant=secondary` | inherits | inherits | — | hidden unless `permissions.canAddField && onAddField` |
| Drag avatar ghost | — | — | — | fixed-position clone of the dragged Field/Card, `rotate(2deg)`, `opacity:.97`, hardcoded shadow | — |

**Token pull-list (via theme-bridge):** none — pure CSS; relies directly on `--border-color`,
`--text-muted`, `--text-main`, `--primary`, composed through `color-mix()`.

**Anatomy & tokens:** `.kanban__track` padding `1.25rem 1.25rem 0.5rem`; ghost/avatar float above
the board at `z-index:9999`; no empty-board illustration beyond the Add-Stage button; no
axis/legend — this is an interactive board, not a coordinate chart.

**Behavioral notes:** drag starts on `pointerdown` + a 5px move threshold (`useDraggable`),
continues via **window-level** `pointermove`/`pointerup` listeners (not per-node); the drop target
is resolved every move via `document.elementFromPoint` plus a geometric X/Y midpoint comparison
against sibling `data-kanban-*-id` elements (an O(n) DOM query per pointer move, no
virtualization); reordering only commits on `pointerup` through the `onCardMove`/`onFieldMove`
callbacks — `Kanban` itself never mutates `fields` (fully controlled).

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/kanban/kanban.css:78` —
   `box-shadow: 0 20px 40px rgba(0,0,0,0.35);` on `.kanban__drag-avatar`, hardcoded instead of
   `var(--elevation-4)`.
2. `packages/charts/src/styles/kanban/kanban.css:80` —
   `transition: transform var(--fast) ease;` uses the raw `--fast` primitive instead of the
   semantic `--motion-micro`/`--motion-standard`.
3. `packages/charts/src/styles/kanban/kanban.css:42,68` — `var(--border-radius__large)` legacy
   ladder rung (Add-Stage button, field-ghost) instead of `--radius-card`.

---

### KanbanField
- **Import:** `import { KanbanField } from '@projective/charts'`
- **Source:** `packages/charts/src/components/kanban/KanbanField.tsx` · **Render tech:** DOM/CSS ·
  **Style/tokens via:** `styles/kanban/kanban-field.css`.
- **Radius:** `var(--border-radius__large)` (card list container implicit), `var(--border-radius__small)`
  (count chip) — legacy ladder rungs instead of `--radius-card`/`--radius-control`.
- **Motion:** raw `--fast` primitive for the empty-state and add-button opacity/border transitions;
  no semantic `--motion-*` token used.
- **Purpose:** a single board column — accent dot, title, card-count chip, sort-mode hint, card
  list, inline "Add Ticket" affordance.
- **Series / variants:** `color` (`'primary' | 'secondary' | string`) drives the `--field-solid`
  custom property behind the dot + its glow ring, via `resolveColor()`: `'primary'` → `var(--primary)`,
  `''`/`'secondary'` → `var(--text-muted)`, anything else (hex/rgb/arbitrary CSS colour) passes
  through unresolved — a deliberate per-field, consumer-supplied colour escape hatch, not a fixed
  palette.

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Accent dot | 8px solid `--field-solid`, ring `color-mix(field-solid 18%)` | — | — | — | — |
| Count chip | `color-mix(text-main 8%)` bg, `--text-muted` text | — | — | — | over-limit → `--danger` @ 18% bg / `--danger` text |
| Sort hint (icon + label) | `--text-disabled` | — | — | — | only rendered when `sortMode` is set |
| Header (drag handle) | `cursor:grab` when `data-reorderable=true` | — | — | dragging is driven by parent `Kanban`; the header has no visual drag state beyond cursor | `cursor:default`, no drag, when `permissions.canReorder !== true` |
| Empty state | dashed `--border-color` border, `IconInbox` + "Empty" in `--text-disabled` | — | — | — | shown when `cardCount===0` and no card is currently hovering to drop in |
| Add Ticket button | `opacity:0`, `pointer-events:none` | revealed on `.kanban-field:hover`/`:focus-within` | — | — | hidden entirely unless `permissions.canAddCard && onAddCard` |

**Token pull-list (via theme-bridge):** none — pure CSS; `--field-solid` is a component-local
custom property fed by the `color` prop, not a global token.

**Anatomy & tokens:** header = dot + title + count (left) / sort hint (right); body = vertical
card stack (`gap:.6rem`, `overflow-y:auto`); no axis/legend — a structural column, not a chart.

**Behavioral notes:** `sortMode` is a read-only badge only ("drag to reorder" / "by update") — the
component doesn't enforce the ordering itself; `sortCards()` always sorts by `order` then `created`
regardless of the displayed hint. Over-limit (`cardCount > limit`) only recolors the count chip; it
never blocks `onAddCard`.

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/kanban/kanban-field.css:42,60,68,104,139` — `var(--border-radius__large)`
   / `var(--border-radius__small)` (legacy ladder rungs) used directly instead of the semantic
   `--radius-card` / `--radius-control` aliases.

---

### KanbanCard
- **Import:** `import { KanbanCard } from '@projective/charts'`
- **Source:** `packages/charts/src/components/kanban/KanbanCard.tsx` · **Render tech:** DOM/CSS ·
  **Style/tokens via:** `styles/kanban/kanban-card.css`.
- **Radius:** `var(--border-radius__large)` (card body), `var(--border-radius__small)` (priority
  pill, frozen pill), raw `var(--border-radius)` (frozen overlay box) — three different
  ladder rungs used inconsistently, none of them the semantic `--radius-card`/`--radius-control`.
- **Motion:** raw `--fast` throughout (box-shadow/transform/border-color/background-color
  transitions); no semantic `--motion-*` token anywhere in the file.
- **Purpose:** an individual ticket card — id/lock-or-claim glyph, title, optional 2-line-clamped
  description, optional frozen/dispute countdown overlay, footer meta chips (date/attachments/
  priority or first tag) + assignee avatar.
- **Series / variants:** `priority.level` drives a 4-way pill palette (`low`→`--success`,
  `medium`→`--warning`, `high`→`--danger`, `none`→neutral `color-mix(text-main 10%)`); `frozen`
  presence is an independent binary overlay state (workload-dispute countdown); `tags[0].color`
  (only rendered when no `priority` is set) is a raw, unvalidated consumer-supplied inline colour.

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Card root | `color-mix(text-main 5%, card)` bg, `--border-color` border, hardcoded shadow | border → `color-mix(text-main 22%, border-color)`, `translateY(-2px)`, stronger hardcoded shadow | no distinct `:focus-visible` treatment beyond the browser default outline (`role=button tabIndex=0`) | `:active` (reorderable only) → `translateY(-1px) scale(.985)`, hardcoded shadow | `data-reorderable=false` → cursor `pointer` not `grab`; `.kanban-card--locked` swaps bg to plain `--card` |
| Corner icon | none when frozen; `IconLock` when locked; `IconClock` when claimable | — | — | — | — |
| Priority pill | tone-mapped bg + text per level (low/medium/high/none) | — | — | — | — |
| Assignee avatar | initial-letter avatar, `linear-gradient(--primary → color-mix(primary 40%, danger))`, `#fff` text | — | — | — | no `takenBy` → dashed-border empty circle |
| Frozen overlay | striped `repeating-linear-gradient` in `color-mix(danger 7%)`, live `HH:MM:SS` countdown (`useCountdown`, 1s `setInterval`, clamps at 0) | card-level hover still applies (danger-tinted border + shadow) | — | — | countdown reaching 0 does **not** auto-clear the frozen visual — purely cosmetic, caller must clear `frozen` |

**Token pull-list (via theme-bridge):** none — pure CSS, heavy `color-mix()` usage.

**Anatomy & tokens:** no legend/axis (a ticket card, not a chart); the "empty" grid state is
handled one level up by `KanbanField`'s empty-state, not per-card.

**Behavioral notes:** draggable via the same `useDraggable` hook as fields (5px move threshold);
`useCountdown` recomputes from `Date.now()` on every render plus a 1s interval; description
clamps to 2 lines via `-webkit-line-clamp` (WebKit-only property, no fallback for other engines).

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/kanban/kanban-card.css:179,229` — `color: #fff;` hardcoded raw hex
   on the avatar initial and the "FROZEN" pill text; should be `var(--on-accent)` (defined in
   `system.css` for exactly "text/iconography that sits on a solid status fill").
2. `packages/charts/src/styles/kanban/kanban-card.css:11,33,39,182,187,219` — six separate
   hardcoded `box-shadow: … rgba(0,0,0,…)` declarations (resting, hover, active, avatar ×2, frozen
   hover) instead of the `--elevation-1`/`--elevation-2` ladder.
3. `packages/charts/src/styles/kanban/kanban-card.css:10,47,137,227` — `var(--border-radius__large)`/
   `__small` legacy ladder rungs instead of `--radius-card`/`--radius-control`.
4. `packages/charts/src/styles/kanban/kanban-card.css:241` — `.kanban-card__frozen { border-radius: var(--border-radius); }`
   raw legacy 8px primitive, inconsistent with the sibling `--border-radius__small` pills two rules
   away.

---

### RatingBreakdownChart
- **Import:** `import { RatingBreakdownChart } from '@projective/charts'`
- **Source:** `packages/charts/src/components/rating/RatingBreakdownChart.tsx` · **Render tech:**
  CSS (flex bars) — no SVG/Canvas · **Style/tokens via:** `styles/rating/rating-breakdown.css`.
- **Radius:** `var(--border-radius__small)` (track + fill) — legacy ladder rung, not
  `--radius-control`. **Motion:** `transition: width var(--medium) cubic-bezier(0.4,0,0.2,1);` —
  raw duration + a hardcoded curve literal instead of a semantic `--motion-*` pair.
- **Purpose:** horizontal dual/multi-bar rating breakdown (e.g. "As a Client" vs "As a
  Freelancer") — track + fill sized by `rating/max`, optional numeric value and review-count tally.
- **Series / variants:** `tone` (`primary | secondary | success | warning`) selects the fill
  colour class; when omitted, alternates `primary` → `secondary` by row index (`DEFAULT_TONES`).

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Row | flex column, `gap:.35rem` | — | — | — | — |
| Track | `color-mix(border-color 60%)` bg, 8px tall | — | — | — | ratio 0 → fill width 0%, track still fully visible |
| Fill — `primary` | `--primary` | — | — | width animates via CSS transition | — |
| Fill — `secondary` | `--primary-half` (translucent primary, not a distinct hue) | — | — | " | — |
| Fill — `success` | `var(--complete)` → **resolves to `--primary` (teal), not `--success`** — see guardrail | — | — | " | — |
| Fill — `warning` | `--warning` | — | — | " | — |
| Star + value | `IconStar` tinted `--warning`, `rating.toFixed(1)` | — | — | — | hidden when `showValue=false` |
| Review count | `--text-muted` | — | — | — | hidden when `showReviewCount=false` |

**Token pull-list (via theme-bridge):** none — pure CSS `var()`, SSR-safe with no JS colour
resolution needed.

**Anatomy & tokens:** no axis/grid/legend — a labeled bar-per-row layout, not a coordinate chart;
`ratio` clamps to `[0,1]` (`Math.min(Math.max(...))`); `max<=0` degrades every row to ratio 0
rather than throwing.

**Behavioral notes:** pure CSS transition, no JS animation/easing; fully static/presentational —
no hover, focus, or tooltip interactivity at all.

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/rating/rating-breakdown.css:63` —
   `.rating-breakdown__fill--success { background-color: var(--complete); }`. **This is a
   functional bug, not just a naming nit**: `--complete` aliases `var(--primary)` (teal) in
   `colour.css`, not `--success` (green) — a `tone="success"` segment renders indistinguishable
   from `tone="primary"`. Should be `var(--status-success)`.
2. `packages/charts/src/styles/rating/rating-breakdown.css:36,67` — `.rating-breakdown__star` /
   `.rating-breakdown__fill--warning` use the raw `--warning` primitive instead of `--status-warning`.
3. `packages/charts/src/styles/rating/rating-breakdown.css:44` —
   `border-radius: var(--border-radius__small);` legacy ladder rung instead of `--radius-control`
   (this is literally the "bars/chips" case the token's own definition calls out).
4. `packages/charts/src/styles/rating/rating-breakdown.css:51` —
   `transition: width var(--medium) cubic-bezier(0.4,0,0.2,1);` hardcodes the `--ease-standard`
   curve literal paired with the raw `--medium` duration instead of a semantic `--motion-*` pair.

---

### WorkloadCapacityGauge
- **Import:** `import { WorkloadCapacityGauge } from '@projective/charts'`
- **Source:** `packages/charts/src/components/gauge/WorkloadCapacityGauge.tsx` · **Render tech:**
  SVG (`dial` variant) + CSS (`bar` variant) — pure, no PixiJS or Canvas · **Style/tokens via:**
  `styles/gauge/workload-capacity-gauge.css`.
- **Radius:** `var(--border-radius__small, 4px)` (bar track) — legacy ladder rung with a redundant
  literal fallback, instead of `--radius-control`. **Motion:** dial-arc, pct-colour and bar-fill
  transitions all use raw `var(--medium, 350ms)` (fallback 350ms mismatches the real 250ms value of
  `--medium`) paired with a hardcoded `cubic-bezier(0.4,0,0.2,1)`, repeated four times, instead of
  `var(--ease-standard)`/`--motion-standard`.
- **Purpose:** freelancer Workload Intensity (W_i) vs. concurrency cap — a 270° SVG dial or a
  compact horizontal bar, with a 3-band colour ramp (ok / warn / over).
- **Series / variants:** single-series gauge; `tone` (`ok|warn|over`) is computed from
  `ratio = current/max` vs. `warnThreshold` (default `.75`). `ok` renders a 2-stop SVG
  `<linearGradient>` (`--mint` → `--primary`); `warn`/`over` swap to a flat colour via CSS custom
  properties cascaded from the root (`--gauge-warn: var(--amber, var(--warning))`,
  `--gauge-over: var(--danger)`).

**Element × State matrix**

| Element | default (`ok`) | hover | focus/selected | active (`warn`/`over`) | disabled/empty |
|---|---|---|---|---|---|
| Dial value arc | `url(#workloadGaugeOk)` gradient (`--mint`→`--primary`) | — | — | `warn`: flat `--gauge-warn`; `over`: flat `--gauge-over` + `drop-shadow` glow + `workload-gauge-pulse` opacity animation (1.8s ease-in-out infinite, 1↔.62) | ratio 0 → arc length 0, track still shows the full 270° |
| Dial track | `color-mix(border-color 70%)` stroke, static | — | — | — | — |
| Bar fill | `linear-gradient(90deg, --mint, --primary)` | — | — | `warn`/`over` swap to flat `--gauge-warn`/`--gauge-over` | — |
| Bar track | `color-mix(border-color 60%)` | — | — | — | — |
| Readout `pct` text (dial only) | colour tracks `--gauge-accent` | — | — | — | — |
| Root (`role=meter`) | `aria-valuenow/min/max` wired for both variants | — | — | — | — |

**Token pull-list (via theme-bridge):** none — SVG `<stop stop-color>` and CSS both consume
`var()` natively at paint time; no JS colour resolution needed (unlike the Canvas-based Pipeline
chart below).

**Anatomy & tokens:** dial = SVG `<circle>` track + value arc (`stroke-dasharray` trick, 270°/360°
sweep, `rotate(135deg)` to center the gap at the bottom) + a centered readout overlay (value/cap,
label, pct); bar = header row (label + value/cap) + track/fill + optional caption; no legend
(single series).

**Behavioral notes:** dial geometry (stroke width, radius, circumference, 270° sweep) is fully
re-derived from `size` (default 132px) on every render, unmemoized; the `over` state's pulse
animation is the only `@keyframes` block found anywhere in the `charts` package; the gauge has no
pointer interaction at all — a pure live readout.

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/gauge/workload-capacity-gauge.css:46-47,107,153-154` —
   `cubic-bezier(0.4,0,0.2,1)` hardcoded four times instead of `var(--ease-standard)`, paired with
   a raw `var(--medium, 350ms)` whose 350ms fallback doesn't even match the real token (250ms).
2. `packages/charts/src/styles/gauge/workload-capacity-gauge.css:144` —
   `border-radius: var(--border-radius__small, 4px);` legacy ladder rung (with a redundant literal
   fallback) instead of `--radius-control`.

---

### AreaLineChart
- **Import:** `import { AreaLineChart } from '@projective/charts/finance'`
- **Source:** `packages/charts/src/components/finance/AreaLineChart.tsx` (+
  `core/finance/area-line.ts`, `core/finance/scales.ts`) · **Render tech:** SVG + `d3-shape`/`d3-scale`
  (pure layout math, no DOM in `core/`) · **Style/tokens via:** `styles/finance/area-line.css`;
  series colours are caller-supplied CSS-var strings passed straight into SVG presentation
  attributes — no `theme-bridge.ts` resolution needed since SVG resolves `var()` natively.
- **Radius:** `var(--border-radius__small, 6px)` (tooltip) and a raw `2px` (tooltip swatch chip) —
  neither routed through the semantic ladder. **Motion:** path-`d` morph transitions use raw
  `var(--slow, 350ms)` (2 sites) instead of `--motion-standard`/`--motion-structural`.
- **Purpose:** multi-series filled area/line chart for financial volume/spend history, with a
  scrub crosshair + per-series tooltip.
- **Series / variants:** the caller supplies `series[].color` (any CSS colour string, "typically a
  theme var like `var(--mint)`" per the type doc comment in `types/finance.ts`) — the component
  ships zero built-in palette; every stroke, gradient stop, tooltip swatch and marker dot binds
  directly to that string. Observed real usage (`apps/web/.../ServiceAnalyticsPanel.tsx`) assigns
  `--mint`/`--violet`/`--amber`/`--primary`/`--success` per category — primitives, not the
  `--status-*` semantic set.

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Line path | `stroke={s.color}`, width 2, round caps/joins | — | — | `d` morphs on data change (`var(--slow,350ms)`) | empty series → empty `d` string, nothing drawn |
| Area fill | `url(#gradient)` (0.26→0 opacity of `s.color`) | — | — | same transition | hidden when `showArea=false` |
| Y gridlines | `--hairline`, 1px, `crispEdges` | — | — | — | 0 ticks while `size.width` is 0 (pre-hydration) |
| Crosshair + marker dots | hidden | `--text-muted` dashed line; dot `fill={s.color}` r=4, shown while `activeIdx!=null` | — | follows `onMouseMove`, index snapped via `scales.x.invert()` + clamp | hidden on `onMouseLeave` |
| Tooltip | hidden | `--card` bg, `--hairline-strong` border, `var(--shadow-lg)` (correctly tokenized) | — | repositions to stay inside the plot (`Math.min(x+12, width-168)`) | — |

**Token pull-list (via theme-bridge):** none — SVG-native. `--hairline` (gridlines), `--text-muted`
(tick labels + crosshair), `--card` (tooltip bg + marker-circle outer stroke), `--hairline-strong`/
`--hairline` (tooltip border), `--shadow-lg` (tooltip elevation — correctly tokenized), `--text-secondary`/
`--text-main` (tooltip label/value) — plus whatever `series[].color` the caller passes.

**Anatomy & tokens:** y-axis uses compact-currency labels (`Intl.NumberFormat` compact notation);
x-axis picks 4 representative ticks (`[0, n/3, 2n/3, n-1]`) off the longest series rather than
every point; no in-component legend (the tooltip rows double as an ad-hoc legend only while
scrubbing); SSR-safe via `useElementSize` — renders 0-width until hydrated.

**Behavioral notes:** `scales` rebuild on every `series`/`width`/`height` change via `useMemo`;
y-domain pins to a 0 baseline unless data goes negative (`Math.min(0, lo)`); x-domain is
index-based (not time-based), so uneven real-world date gaps render as uniform spacing — the axis
labels are the only thing conveying real dates; gradient `id`s are prefixed (`idPrefix`) to avoid
collisions when two charts share a page.

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/finance/area-line.css:44,49` —
   `transition: d var(--slow, 350ms) ease;` raw `--slow` primitive (not a semantic `--motion-*`
   pair) with a redundant literal fallback.
2. `packages/charts/src/styles/finance/area-line.css:72` —
   `border-radius: var(--border-radius__small, 6px);` legacy ladder rung instead of
   `--radius-field`/`--radius-control`.
3. `packages/charts/src/styles/finance/area-line.css:97` —
   `.area-line__tooltip-swatch { border-radius: 2px; }` raw hardcoded px radius for exactly the
   "chip" case `--radius-control` (4px) exists for.

*(This chart's `box-shadow` is done correctly — `var(--shadow-lg)` — the positive counter-example
against Pipeline/Forecast's hardcoded shadows below.)*

---

### PipelineFlowChart
- **Import:** `import { PipelineFlowChart } from '@projective/charts/finance'`
- **Source:** `packages/charts/src/components/pipeline/PipelineFlowChart.tsx` (+
  `core/finance/pipeline-render.ts` draw routine, `core/finance/scales.ts`) · **Render tech:**
  HTML5 Canvas 2D (node scatter, drawn imperatively) + a thin SVG overlay (axes, crosshair, hit
  testing) · **Style/tokens via:** a local `resolveCssColor()` helper defined **inside the
  component** (not `theme-bridge.ts`) for the canvas layer, plus `styles/pipeline/pipeline-flow.css`
  for the SVG/DOM overlay.
- **Radius:** raw `8px` (tooltip) — not ladder-aligned. **Motion:** none — canvas repaints are a
  full imperative redraw on every dependency change (no CSS transition is possible on canvas
  pixels); the SVG overlay (crosshair/axis) has no transitions either.
- **Purpose:** a Velocity-vs-ROI scatter ("Pipeline Flow Analysis") — node radius encodes deal
  value (`sqrt` scale), colour encodes category, with an optional least-squares trend line; Canvas
  for point density, SVG overlay for interaction.
- **Series / variants:** categories are either caller-supplied (`PipelineCategoryStyle[]`) or
  auto-assigned round-robin from a **local, component-scoped** `AUTO_PALETTE` — `--mint`,
  `--violet`, `--amber`, `--primary`, `--danger`, `--success` (6 primitives; a different
  auto-palette instance from every other chart in the package).

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Node (canvas arc) | `fillStyle=category.color`, `globalAlpha=.62` | — | nearest/hovered node → `globalAlpha=.95` + a 3px-larger ring stroked in the same colour (`activeId` match) | — | 0 points → empty canvas (grid + trend still draw if `showTrendLine`) |
| Background grid (canvas) | 4×4 faint lines, `strokeStyle=gridColor` (resolved `--hairline`), `globalAlpha=.5` | — | — | — | — |
| Trend line (canvas) | dashed `[6,5]`, `strokeStyle=trendColor` (resolved `--text-muted`), `globalAlpha=.85` | — | — | — | hidden when `showTrendLine=false` or <2 points |
| Axis frame (SVG) | `--hairline-strong` (with a hardcoded rgba fallback, see guardrail) | — | — | — | — |
| Crosshair (SVG) | hidden | dashed `--text-muted` lines + `--text-main`-stroked cursor ring, follows pointer | — | recomputed every `mousemove` via `nearestPoint` (26px hit threshold + node radius) | hidden on `mouseleave` |
| Tooltip (DOM) | hidden | shown near hovered node, position clamped in-bounds, hardcoded shadow/radius | — | — | — |

**Token pull-list:** **this component does not use `theme-bridge.ts`.** It reimplements its own
resolver (`resolveCssColor`, lines 34-39) that regex-parses a `var(--x, fallback)` string and calls
`getComputedStyle(el).getPropertyValue()` directly against the `<canvas>` element — uncached
(recomputed on every repaint, unlike `theme-bridge`'s `Map` cache) and with its own hardcoded
fallback literals when resolution fails. Resolves `--hairline` (grid), `--text-muted` (trend
line), `--primary` (fallback node fill), plus whatever `category.color` strings are supplied or
auto-assigned.

**Anatomy & tokens:** no tick labels at all — only two static corner captions ("Velocity →" /
"ROI →"), genuinely axis-less unlike the other two finance charts; no legend rendered
in-component (the category→colour map is exposed via props for an external legend, e.g. a
`ChartFocusModal` `controls` panel, but `PipelineFlowChart` itself draws none).

**Behavioral notes:** canvas is resized to `size.width*dpr`/`height*dpr` and
`ctx.setTransform(dpr,...)` on every repaint (devicePixelRatio-aware, capped at 2×); the entire
canvas is cleared and everything (grid, trend, every node) is redrawn from scratch on any
dependency change — no incremental/dirty-rect optimization despite the file's own comment about
"thousands of points"; hit-testing (`nearestPoint`) is an O(n) linear scan via `d3.least`, run
synchronously on every `mousemove`.

**⚠ Guardrail violations found:**
1. **Architectural** — `packages/charts/src/components/pipeline/PipelineFlowChart.tsx:34-39`
   defines a second, independent CSS-variable-to-colour resolver instead of reusing
   `theme-bridge.ts#getThemeColor`. It disagrees with `theme-bridge` on both caching (never caches,
   vs. `theme-bridge`'s per-theme `Map`) and output type (a CSS colour string for Canvas2D vs.
   `theme-bridge`'s PIXI hex number) — a reasonable type difference, but it compounds with the
   hardcoded fallbacks below in a way `theme-bridge.ts` avoids entirely.
2. `packages/charts/src/components/pipeline/PipelineFlowChart.tsx:116` —
   `resolveCssColor(canvas, 'var(--hairline)') || 'rgba(128,128,128,0.15)'` hardcoded rgba fallback.
3. `packages/charts/src/components/pipeline/PipelineFlowChart.tsx:117` —
   `... || '#888'` hardcoded hex fallback for the trend line.
4. `packages/charts/src/components/pipeline/PipelineFlowChart.tsx:118` —
   `... || '#3aa'` hardcoded hex fallback for node fill.
5. `packages/charts/src/styles/pipeline/pipeline-flow.css:19` —
   `stroke: var(--hairline-strong, rgba(128,128,128,0.25));` hardcoded rgba fallback.
6. `packages/charts/src/styles/pipeline/pipeline-flow.css:64` — `border-radius: 8px;` raw,
   non-ladder-aligned.
7. `packages/charts/src/styles/pipeline/pipeline-flow.css:65` —
   `box-shadow: 0 8px 24px rgba(0,0,0,0.28);` hardcoded instead of `var(--elevation-3)`.

---

### ForecastRunwayChart
- **Import:** `import { ForecastRunwayChart } from '@projective/charts/finance'`
- **Source:** `packages/charts/src/components/forecast/ForecastRunwayChart.tsx` (+
  `core/finance/runway.ts`, `core/finance/scales.ts`) · **Render tech:** SVG + `d3-shape`
  (Catmull-Rom curve) · **Style/tokens via:** `styles/forecast/forecast-runway.css`; colour
  resolved natively by SVG via the caller-supplied `accent` prop (default `var(--mint)`).
- **Radius:** raw `8px` (tooltip) — the same non-ladder pattern as Pipeline's tooltip. **Motion:**
  path/opacity transitions use raw `var(--medium, 240ms)` (fallback 240ms doesn't match the actual
  `--medium` token of 250ms), repeated three times.
- **Purpose:** predictive revenue "runway" — a confidence-interval band + central projection line
  + soft gradient fill under the line, a single accent series with a scrub tooltip.
- **Series / variants:** single series only (no per-point category); the whole chart is tinted by
  one caller-supplied `accent` CSS colour (default `var(--mint)`) applied uniformly to band fill,
  line stroke, gradient stops and the active-point dot — unlike Pipeline, there is no per-datum
  colour variation.

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Confidence band | `fill={accent}`, `opacity:.16` | — | — | `d`+`opacity` morph on data change (`var(--medium,240ms)`) | hidden when `showBand=false` |
| Gradient fill under line | `url(#runway-fill)` (accent 0.28→0 opacity) | — | — | `d` morphs | — |
| Projection line | `stroke={accent}`, width 2.5, round caps | — | — | `d` morphs | — |
| Scrub marker (line + dot) | hidden | dot `fill={accent}` r=5, appears at `activeIdx` | — | follows `onMouseMove` (index snapped via `scales.x.invert()` + clamp) | hidden on leave |
| Y/X gridlines + labels | `--hairline` lines, `--text-muted` labels | — | — | — | 4 representative x-ticks like `AreaLineChart` |
| Tooltip | hidden | date/value/CI-band range, hardcoded shadow/radius | — | repositions to stay in-bounds | — |

**Token pull-list (via theme-bridge):** none — SVG-native. `--hairline` (grid), `--text-muted`
(tick labels + tooltip date/band text), `--card` (tooltip bg + marker-dot stroke), `--hairline-strong`/
`--border-color` (tooltip border), `--text-main` (tooltip value) — plus the caller's `accent`
string.

**Anatomy & tokens:** nearly identical axis/tooltip anatomy to `AreaLineChart` (shared `MARGIN`
and tick-selection pattern) but with a confidence band instead of multiple series, and a
Catmull-Rom curve rather than a monotone one.

**Behavioral notes:** x is index-based like `AreaLineChart` (uniform spacing regardless of real
date gaps — daily vs. monthly horizons render identically); `curveCatmullRom.alpha(0.5)` vs.
`AreaLineChart`'s `curveMonotoneX` is the one real interpolation difference between the two SVG D3
charts — deliberately chosen because a monotone curve avoids overshoot on real money data, while a
smoother spline suits a *projected* line.

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/forecast/forecast-runway.css:34,38,46` — `var(--medium, 240ms)` raw
   primitive with a mismatched literal fallback (240ms vs. the real 250ms), repeated three times,
   instead of a semantic `--motion-*` pair.
2. `packages/charts/src/styles/forecast/forecast-runway.css:68` — `border-radius: 8px;` raw,
   non-ladder value (identical pattern to Pipeline's tooltip).
3. `packages/charts/src/styles/forecast/forecast-runway.css:69` —
   `box-shadow: 0 8px 24px rgba(0,0,0,0.28);` hardcoded — the identical literal duplicated verbatim
   from `pipeline-flow.css:65`; both should be `var(--elevation-3)`.

---

### ChartFocusModal
- **Import:** `import { ChartFocusModal } from '@projective/charts/finance'`
- **Source:** `packages/charts/src/components/finance/ChartFocusModal.tsx` · **Render tech:**
  CSS (fixed-position overlay, no portal) · **Style/tokens via:** `styles/finance/chart-focus-modal.css`.
- **Radius:** raw `14px` (frame — nearest semantic is `--radius-stage`, 16px); raw `8px` (close
  button — nearest is `--radius-button`/`--radius-field`, 6px). **Motion:** `chart-focus-in`
  keyframe uses a raw `160ms ease` (nearest semantic is `--motion-standard`, 150ms); the close
  button's hover transition uses the raw `--fast` primitive instead of `--motion-standard`.
- **Purpose:** a full-screen "maximize" wrapper that lifts any chart (`children`) into a large
  modal frame with an optional side config panel (`controls` — layer toggles, timeline sliders,
  category filters supplied by the caller); a structural container for the D3 charts above, not
  itself a data visualization.
- **Series / variants:** n/a — structural container, no data encoding.

**Element × State matrix**

| Element | default | hover | focus/selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|
| Scrim (`.chart-focus`) | `rgba(0,0,0,.55)` + `blur(3px)`, `160ms` fade-in on mount | — | — | click → `onClose()` | — |
| Frame | `--mid` bg, `--hairline-strong`/`--border-color` border, hardcoded `14px` radius + hardcoded shadow | — | — | click inside stops propagation so it doesn't close | — |
| Close button | `--text-muted` icon | bg `--card`, colour `--text-main` | — | — | — |
| Config panel (`aside`) | `--header` bg, left border `--hairline` | — | — | — | omitted when no `controls` prop; ≤820px it collapses to a bottom-stacked panel with a top border instead of a left border |

**Token pull-list (via theme-bridge):** none — pure CSS chrome (only its `children` might be
canvas-based, e.g. when it wraps `PipelineFlowChart`).

**Anatomy & tokens:** header (title + subtitle / close button) → body (stage for `children` +
optional 280px-wide `aside` config rail, which becomes full-width and bottom-stacked under
820px) — the only chart-adjacent component in the package with a documented responsive breakpoint.

**Behavioral notes:** `Escape` closes the modal (bound only while `isOpen`); body scroll locks
(`document.body.style.overflow='hidden'`) and restores its prior value on close/unmount; `open`
accepts either a plain `boolean` or a `@preact/signals` `Signal<boolean>` (unwrapped via
`instanceof Signal`) so an island can drive it reactively.

**⚠ Guardrail violations found:**
1. `packages/charts/src/styles/finance/chart-focus-modal.css:9` —
   `background: rgba(0,0,0,0.55);` hardcoded scrim colour (no scrim/backdrop token exists in the
   canonical vocabulary to route through — flagged as a raw literal regardless).
2. `packages/charts/src/styles/finance/chart-focus-modal.css:30` — `border-radius: 14px;` raw,
   non-ladder value for a modal frame (should be `--radius-stage`, the token explicitly reserved
   for large panel/stage containers).
3. `packages/charts/src/styles/finance/chart-focus-modal.css:31` —
   `box-shadow: 0 24px 70px rgba(0,0,0,0.45);` hardcoded — precisely the "modals, command palette,
   dialogs" case `--elevation-4` exists for.
4. `packages/charts/src/styles/finance/chart-focus-modal.css:63` —
   `.chart-focus__close { border-radius: 8px; }` raw, non-ladder value.
5. `packages/charts/src/styles/finance/chart-focus-modal.css:11` —
   `animation: chart-focus-in 160ms ease;` raw ms/curve instead of a `--motion-*` pair.
