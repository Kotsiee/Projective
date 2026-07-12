# Data, Time & Files — State & Variant Matrices

This document is the reference-grade behavioral catalogue for the `@projective/data`, `@projective/time`
and `@projective/files` packages: every exported (and load-bearing internal) component, its display
variants, and an exhaustive default/hover/focus/selected/active/disabled state matrix, each cell traced to
the actual source and CSS that was read to produce it — never inferred. `data` authors its CSS against the
semantic bridge vocabulary defined in `apps/web/styles/themes/variables/data.css` (`--bg-surface`,
`--table-header-bg`, `--data-radius`, …), which in turn aliases the real Teal-Velvet system tokens in
`colour.css`/`system.css`. `time` and `files` mostly reach past that bridge straight to package-local tokens
(`--cal-*`) or the raw primitives (`--card`, `--fast`, `--border-radius__small`, `--hairline`) rather than the
canonical semantic ladder (`--radius-*`, `--motion-*`, `--surface-*`) — this is called out per component.
Guardrail violations (hardcoded hex/hsl/rgba/raw-px/raw-ms in place of a token) are cited by `file:line`.

---

## data (`packages/data/src/`)

### DataDisplay
- **Import:** `import { DataDisplay } from '@projective/data'`
- **Source:** `packages/data/src/components/DataDisplay.tsx` · **Style/tokens via:** `data.css` bridge
  (`styles/base.css`), delegating to each mode's own stylesheet (`list.css` / `grid.css` / `table.css` /
  `masonry.css`)
- **Radius:** `--data-radius` (bridge) → `var(--border-radius)` = **8px**, a raw primitive **not** on the
  canonical `--radius-*` ladder (sits between `--radius-field` 6px and `--radius-card` 12px)
- **Motion:** `--data-transition` (bridge) → `var(--fast)` = 150ms, value-equivalent to `--motion-standard`
  but referenced by its legacy name, not the canonical one
- **Purpose:** Universal, mode-driven data renderer — one component orchestrating list/grid/table/masonry
  rendering over a shared `DataSource`-or-local-array, `useDataManager` pagination, `useSelection`, and
  `useVirtual`/`useMasonryVirtual` virtualization.
- **Variants / display modes:** `mode: 'list' | 'grid' | 'table' | 'masonry'` · `scrollMode: 'container' |
  'window'` · `selectionMode: 'none' | 'single' | 'multi'` · `interactive` (list-only hover affordance) ·
  custom `emptyState` slot (fully replaces content once fetch settles empty).

**Row / cell / item × State matrix** (DataDisplay owns the loader badge; per-mode item chrome is delegated
to List/Grid/Table/MasonryGrid — see their own sections for the authoritative cell-level detail)

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-display` root | `--data-font-family`, `--text-primary`, transparent bg | — | — | — | — | — |
| `.data-display__loader` badge | `--bg-surface` bg, `1px solid --border-subtle`, `--text-secondary` text, `z-index:` `--z-loader` | — | — | — | — | shown only while `manager.isFetching` |
| `mode='list'` items | → see **List** | → see **List** | → see **List** | → see **List** | — | → see **List** |
| `mode='grid'` cards | `--grid-card-bg`, `1px solid --border-subtle`, `--data-radius` | `--border-active` + soft shadow | — | `--border-focus` ring + `--bg-brand-subtle` | — | no skeleton path wired through Grid |
| `mode='table'` rows | → see **Table** | → see **Table** | → see **Table** | → see **Table** | — | → see **Table** |
| `mode='masonry'` items | → see **MasonryGrid** | → see **MasonryGrid** | → see **MasonryGrid** | → see **MasonryGrid** | — | → see **MasonryGrid** |
| `emptyState` slot | fully caller-defined; only shown once `!isFetching && totalCount === 0` | — | — | — | — | — |

**Anatomy & tokens:** the component itself carries no header/cell geometry — it is pure orchestration. It
computes `effectiveGridColumns` from a `ResizeObserver`'d container width when `columnWidth` is given
(auto-fit grid), otherwise uses the fixed `gridColumns` prop. `totalCount` padding (`+100` skeleton rows) is
suppressed for local arrays (`isLocal`) to avoid over-counting skeletons past the real array length.

**Behavioral notes:** `useVirtual` (row/column virtualization, ResizeObserver-measured variable heights via
the internal `Row` primitive) drives list/grid/table; masonry bypasses it entirely (`virtualRowCount = 0`)
and uses the separate column-packing `useMasonryVirtual` engine instead. `useSelection` is wired once and
shared across all four modes via `handleItemClick`. In `scrollMode='window'`, scroll physics hand off to the
document (`ScrollPane` switches to `overflow:visible`) and an extra effect re-scrolls the page on new content
if the user was already near the top when `scrollToBottom` is set. `isEmpty` deliberately waits for the first
fetch to resolve so the empty-state never flashes during initial load.

**⚠ Guardrail violations found:**
- `packages/data/src/styles/base.css:31` `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);` on
  `.data-display__loader` → raw rgba shadow; should be `var(--elevation-1)`.

---

### Table (+ TableRow)
- **Import:** internal render target of `DataDisplay` when `mode='table'` (not directly exported)
- **Source:** `packages/data/src/components/table/Table.tsx`, `TableRow.tsx` · **Style/tokens via:**
  `table.css` (data.css bridge) + `skeleton.css`
- **Radius:** none applied at row/cell level · **Motion:** raw `0.1s` (see guardrail — the bridge exposes
  `--data-transition` but the row/resizer rules don't use it)
- **Purpose:** Virtualized, resizable, sortable spreadsheet-style grid for arbitrarily long remote/local
  datasets — the "infinite" counterpart to `LedgerTable`'s bounded, real-`<table>` dense ledger.
- **Variants / display modes:** sortable vs non-sortable columns · resizable vs fixed-width columns ·
  skeleton vs loaded vs striped vs selected rows.

**Row / cell × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-table__row` | `--bg-surface`, `border-bottom: 1px solid --border-subtle` | `--bg-surface-subtle` (only if `onRowClick`, via `--row--interactive`) | — (no explicit ring) | `--bg-selection` (wins over hover) | — | — |
| `.data-table__row--stripe` (odd index) | `--bg-surface-subtle` | interactive hover applies on top | — | selected wins over stripe | — | — |
| `.data-table__row--skeleton` | `pointer-events:none`; cells host `.data-skeleton__text` shimmer bars (`--bg-surface-active`, 2s pulse) | — | — | — | — | shown whenever `item.isSkeleton` |
| `.data-table__cell` | `--text-primary`, padding `--table-cell-padding`, ellipsis truncation, `align-self:center` | — | — | — | — | — |
| last row | `border-bottom:none` | — | — | — | — | — |

**Anatomy & tokens:** row virtualization via the shared internal `Row` primitive (absolute `translateY`,
`ResizeObserver`-measured variable heights — so skeleton rows and real rows of differing height coexist
without layout jumps). Horizontal scroll is delegated to the parent `ScrollPane`/`scroll-pane__shim`
(`min-width: fit-content` on the table wrapper keeps the sticky header pixel-aligned to body columns).

**Behavioral notes:** `TableRow` renders a full skeleton row (matching real column widths from `TableState`)
when `!item || item.isSkeleton`, so in-flight pagination shows shimmering placeholders inline rather than a
blocking spinner. Selection (`useSelection`, wired one level up in `DataDisplay`) supports click / shift-range
/ ctrl-toggle uniformly with List and Grid.

**⚠ Guardrail violations found:**
- `packages/data/src/styles/components/table.css:90` `transition: background-color 0.1s;` on `.data-table__row`
  → raw seconds; should be `var(--data-transition)`.
- `packages/data/src/styles/components/table.css:76` `transition: background-color 0.1s;` on
  `.data-table__resizer::after` → same fix.

---

### Header
- **Import:** internal to `Table` (not directly exported)
- **Source:** `packages/data/src/components/table/Header.tsx` · **Style/tokens via:** `table.css` (shared
  with Table, imported once via `Table.tsx`)
- **Radius:** — (none) · **Motion:** none on the cell itself; resizer accent transitions `0.1s` raw
- **Purpose:** Sticky column header row — click-to-sort per column, drag-to-resize via a raw
  `mousedown`→document-level `mousemove`/`mouseup` handler (not Pointer Events / pointer capture).
- **Variants / display modes:** sortable column (asc/desc/none, single-column only) · resizable vs
  `resizable: false` column · resizer idle/hover/active-drag.

**Header cell × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-table__header` (sticky) | `--table-header-bg` (→`--mid`), `border-bottom: 1px solid --border-default`, height `--table-header-height` (40px; 32px under `[data-ds-density='compact']`) | — | — | — | — | — |
| `.data-table__header-cell` | `--text-secondary`, uppercase, `letter-spacing:0.05em`, `--table-cell-padding` | — | — | — | — | — |
| `.data-table__header-cell--sortable` | `cursor:pointer` | `--text-primary` + `--bg-surface-subtle` | — (no focus-visible ring) | — | — | — |
| `.data-table__sort-icon` (▲/▼) | `--text-brand` | — | — | — | — | shown only for the active sort column |
| `.data-table__resizer` (12px hit target, centred `::after` hairline) | `::after` transparent | `::after` → `--border-focus`, width 2px | — | — | `--resizer--active` (same visual as hover), `touch-action:none` while dragging | — |

**Anatomy & tokens:** header bg `--table-header-bg`, height token overridable by the density DS-provider
scope, cell padding `--table-cell-padding` (0.5rem 0.75rem), text `--text-secondary`. `aria-sort` is set
correctly (`ascending`/`descending`/`none`) for a11y even though the visual sort indicator is a plain glyph.

**Behavioral notes:** resize computes `newWidth = max(50, startWidth + (pageX - startX))` and calls
`onResize` on every `mousemove` tick (no throttling/rAF batching) — width state lives in the parent
`DataDisplay`'s `tableState`. Sort toggles strictly asc → desc → asc per column (clicking a different column
resets to asc); there is no "cleared/unsorted" third click state.

**⚠ Guardrail violations found:** None beyond the shared `table.css:76` transition already listed under
**Table**.

---

### LedgerTable
- **Import:** `import { LedgerTable } from '@projective/data'`
- **Source:** `packages/data/src/components/table/LedgerTable.tsx` · **Style/tokens via:** `ledger-table.css`
- **Radius:** `var(--border-radius, 8px)` on the outer shell — non-canonical primitive with a hardcoded
  fallback, should resolve to `--radius-card` · **Motion:** `var(--fast, 150ms)` — value matches
  `--motion-standard` but wrong vocabulary + raw ms fallback
- **Purpose:** Non-virtualized, dense, **real** `<table>` with `table-layout:fixed` + explicit `<colgroup>`
  for exact header↔body pixel alignment — built for bounded financial ledgers (wallet/finance surfaces), in
  contrast to the virtualized **Table** above which targets arbitrarily long datasets.
- **Variants / display modes:** `dense` (tighter row height) · `striped` · `stickyHeader` · `maxHeight`
  (vertical scroll with sticky header) · expandable rows (chevron + full-width detail panel) · fee-line
  segmentation (`isFeeLine`, isolates the platform 5% service charge).

**Row / cell × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.ledger-table__th` (sticky) | `--mid` bg, `--text-muted`, `border-bottom: 1px solid --hairline-strong` (fallback `--hairline`) | — | — | — | — | — |
| `.ledger-table__row` | transparent | `--primary-surface` (if `onRowClick` or expandable, via `--row--interactive`) | — | no dedicated "selected" state exists | `--row--expanded` → `border-bottom:transparent` + `--primary-surface` bg | `.ledger-table__empty-row` → centred `--text-muted` label, full colspan |
| `.ledger-table__row--stripe` (odd) | `--mid` bg | interactive hover layers on top | — | — | — | — |
| `.ledger-table__row--fee` (platform-fee line) | monospace italic, `--text-muted`, `color-mix(--amber 7%, transparent)` bg, inset-left 3px `--amber` rule | — | — | — | — | — |
| `.ledger-table__chevron` (expand toggle) | `--text-muted` | row-hover → `--primary` | — | open → `rotate(90deg)` + `--primary` | — | hidden entirely (not just disabled) when a row returns no detail content |
| `.ledger-table__detail` (expanded panel row) | `color-mix(--primary 4%, --card)` bg, `border-bottom: 1px solid --hairline` | — | — | — | — | — |

**Anatomy & tokens:** `border-collapse:separate` + `table-layout:fixed` driven by an explicit `<colgroup>`
(so truncation never breaks alignment). `dense` shrinks cell padding to `0.32rem 0.7rem` and font to
`0.76rem`. Numeric columns (`numeric: true`) get `font-variant-numeric: tabular-nums` + right-align by
default. No virtualization — designed for bounded row counts; vertical scroll (`maxHeight`) is native
`overflow-y:auto` with a sticky `<thead>`.

**Behavioral notes:** expand/collapse state is a flat `useState<Record<string, boolean>>` keyed by
`rowKey(row)` (not signals) — every toggle re-renders the whole table body. Zebra striping is keyed on plain
array index, which is safe here specifically because rows are never virtualized/reordered mid-scroll (unlike
the virtualized **Table**, which deliberately avoids `nth-child` striping for that reason).

**⚠ Guardrail violations found:**
- `packages/data/src/styles/components/ledger-table.css:10` `border-radius: var(--border-radius, 8px);` →
  non-canonical primitive + raw fallback; should be `var(--radius-card)`.
- `ledger-table.css:96` `transition: background-color var(--fast, 150ms);` → raw ms fallback duplicating
  `--motion-standard`'s value under the wrong name.
- `ledger-table.css:121` fee-row font reaches for `var(--font-mono, ui-monospace, 'SF Mono', 'Cascadia Code',
  monospace)` — a literal font stack fallback chain rather than a typographic token.
- `ledger-table.css:125,129` fee-row accent uses `var(--amber)` directly rather than the canonical
  `--status-warning` / `--status-warning-surface` pair.
- `ledger-table.css:151` `transition: transform var(--fast, 150ms) ease, color var(--fast, 150ms) ease;` on
  the chevron → repeats the same raw-ms-fallback pattern.

---

### ChatList
- **Import:** `import { ChatList } from '@projective/data'`
- **Source:** `packages/data/src/components/displays/ChatList.tsx` · **Style/tokens via:** `chat-list.css`
  (3 rules) + `scroll-pane.css`
- **Radius:** — (unstyled; chrome is entirely the caller's `renderItem`) · **Motion:** — (no owned CSS
  transitions)
- **Purpose:** Realtime, cursor-paginated, bottom-anchored message list. History loads upward on scroll-near-
  top, new messages append + auto-scroll, backed by a `RealtimeDataSource` with an optional `subscribe()`
  event stream (INSERT/UPDATE/DELETE).
- **Variants / display modes:** `scrollMode: 'container' | 'window'` · optimistic-message overlay merge
  (in-flight sends de-duped by `id`/`tempId` against confirmed items).

**Row / item × State matrix** (ChatList owns no per-message chrome — only structural/loading states)

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-chat__scroll-pane` / `.data-chat__item` | `transform: scaleY(-1)` flip trick (keeps native scroll-anchor pinned to the bottom while history loads upward) | — | — | — | — | — |
| "Loading history…" banner | absolute, `-40px` above content, inline `color:'#888'` | — | — | — | — | shown only while `cursor > 0 && isLoading` |
| "Loading chat…" initial state | plain `<div class="p-4 text-center text-gray-400">` | — | — | — | — | shown only pre-first-fetch, before any items exist |

**Anatomy & tokens:** none of ChatList's own chrome is themed — the `#888` banner text and Tailwind-style
`text-gray-400` utility class are the only "styling" ChatList owns, and neither is a Projective token.

**Behavioral notes:** uses a double `scaleY(-1)` CSS hack (pane + item both flipped) so the browser's native
bottom-anchored scroll behavior does the heavy lifting during upward history loads, **plus** a redundant
JS-level `useScrollAnchoring` (scrollHeight-delta compensation) as a second anchoring layer. `useVirtual` runs
with `initialScrollToBottom: true`. Realtime events mutate the `items` signal directly and INSERT events
trigger a `requestAnimationFrame` → smooth scroll-to-end. The file also ships several `console.log('[ChatList] …')`
debug statements left in the production code path (an engineering hygiene note, not a styling guardrail).

**⚠ Guardrail violations found:**
- `packages/data/src/components/displays/ChatList.tsx:184` inline `color: '#888'` on the "Loading history…"
  banner → raw hex; should be `var(--text-muted)`.
- `ChatList.tsx:163` `class='p-4 text-center text-gray-400'` on the initial loading state → ad hoc Tailwind-
  style utility classes with a raw grey, not a Projective token/class at all.

---

### Carousel
- **Import:** `import { Carousel } from '@projective/data'`
- **Source:** `packages/data/src/components/displays/Carousel.tsx` · **Style/tokens via:** `carousel.css` +
  `skeleton.css`
- **Radius:** `var(--border-radius, 8px)` on the viewport; nav buttons are `50%` circular · **Motion:**
  `var(--medium, 250ms)` on the track transform (value matches `--motion-micro` but wrong vocabulary +
  raw fallback)
- **Purpose:** `DataManager`-integrated, DOM-virtualized (±1-page buffer window) carousel with pointer
  drag/swipe, autoplay pause-on-hover, arrow navigation and dot pagination.
- **Variants / display modes:** `arrowPosition: 'inside' | 'outside' | 'hidden'` · `indicatorPosition:
  'bottom' | 'hidden'` · `circular` vs bounded · autoplay on/off (via `useCarousel`).

**Item / control × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-carousel__track` | transform-positioned, `var(--medium)` transition | — | — | — | `--track--dragging` strips the transition for 1:1 pointer tracking | — |
| `.data-carousel__nav-button` | `--card` bg, `1px solid --border-color`, raw `rgba(0,0,0,0.1)` shadow | `--primary` bg + `--card` text/border | `box-shadow: var(--focus-ring)` (**undefined token**, see guardrail) | — | — | `opacity:0.5`, `cursor:not-allowed` at bounds when non-circular |
| `.data-carousel__indicator` (dot) | `--text-disabled` bg, 8px circle | `--text-muted` bg | `box-shadow: var(--focus-ring)` (undefined) | `--primary` bg + `scale(1.25)` (active page) | — | — |
| `.data-carousel__item` (off-viewport placeholder) | empty `aria-hidden` div, structural only, preserves flex sizing | — | — | — | `pointer-events:none` while `state.isDragging` | — |
| item skeleton | caller `renderSkeleton`, else bare `.data-skeleton` div (`min-height:150px`) | — | — | — | — | shown per-item while its data page hasn't loaded |

**Anatomy & tokens:** viewport `border-radius: var(--border-radius, 8px)`; nav buttons 2.5rem circular;
indicators 8px dots at `1.25×` scale when active. DOM virtualization keeps only items within one page-width
of the viewport fully mounted; everything else is an empty flex placeholder (`aria-hidden`) that preserves
layout math without paying render cost.

**Behavioral notes:** drag uses raw `onPointerDown/Move/Up` (relies on default browser pointer capture, no
explicit `setPointerCapture` call visible). Hovering the whole carousel pauses autoplay (`state.pause()` /
`state.play()`). `useDataManager.setVisibleRange` pre-fetches two full pages ahead of the current index to
mask pop-in during fast interaction.

**⚠ Guardrail violations found:**
- `packages/data/src/styles/components/carousel.css:22` `border-radius: var(--border-radius, 8px);` → raw
  fallback, non-canonical primitive; should resolve through `--radius-card`.
- `carousel.css:67` `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);` → raw rgba; should be `var(--elevation-2)`.
- `carousel.css:79` and `carousel.css:135` `box-shadow: var(--focus-ring);` → `--focus-ring` **is not defined
  anywhere** in `apps/web/styles/themes/variables/` (only `--focus-glow` / `--focus-glow-danger` /
  `--focus-glow-violet` exist in `system.css`) — a broken token reference; should be `var(--focus-glow)`.
- `carousel.css:28` `transition: transform var(--medium, 250ms) cubic-bezier(0.4, 0, 0.2, 1);` → raw ms
  fallback plus an inline `cubic-bezier` that duplicates `--ease-standard` verbatim instead of composing
  `--motion-standard`/`--motion-micro`.

---

### MasonryGrid
- **Import:** `import { MasonryGrid } from '@projective/data'`
- **Source:** `packages/data/src/components/displays/MasonryGrid.tsx` · **Style/tokens via:** `masonry.css`
- **Radius:** `var(--border-radius)` on the selected-item outline only · **Motion:** fade-in `animation: …
  0.5s ease-out both;` — raw seconds, no token reference at all
- **Purpose:** Column-packed, absolutely-positioned masonry layout for variable-height cards (portfolio /
  media grids), virtualized via a bespoke `MasonryVirtualizer` bin-packing engine (column-balancing, not
  row-based like List/Table/Grid).
- **Variants / display modes:** fixed `columns` vs auto-fit `columnWidth` · `useWindowScroll` · optional
  `animateEntrance` staggered fade-in.

**Item × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-masonry__item` | `position:absolute`, `transform: translate(x, y)` (pure math, no `will-change`/transition on transform) | `cursor:pointer` if `onItemClick` | — | `outline: var(--focus-ring)` (**undefined token**, same issue as Carousel) + `border-radius: var(--border-radius)`, `outline-offset:2px` | — | — |
| `.data-masonry__item--animate-in` | `opacity:0 → 1` over 0.5s, staggered `min(index,20) × 40ms` | — | — | — | — | opt-in only (`animateEntrance` prop, defaults `false`) |
| `.data-masonry__sr-only` live region | visually hidden, `aria-live='polite'` | — | — | — | — | announces "No items found." when `dataset.items.size === 0` |

**Anatomy & tokens:** no header/cell geometry tokens — gap and column width are runtime-computed by
`MasonryVirtualizer` + `ResizeObserver`, not CSS. `overscan: 400` (px) buffer around the viewport.

**Behavioral notes:** a code comment ("FIX: Temporarily removed will-change and transition to isolate layout
math") confirms item positioning is deliberately un-animated — a debugging workaround left in the shipped
component, so masonry items snap into position instantly even when reflowing, and `animateEntrance` only
ever fades opacity, never eases position. Separately, `var(--stagger-idx, 0)` (the animation-delay driver) is
never actually set via inline style anywhere in `MasonryGrid.tsx`, so the stagger always falls back to `0` —
the entrance stagger is effectively dead code.

**⚠ Guardrail violations found:**
- `packages/data/src/styles/components/masonry.css:24` `outline: var(--focus-ring);` → undefined token
  (identical issue to Carousel); should be `var(--focus-glow)`.
- `masonry.css:41` `animation: masonry-fade-in 0.5s ease-out both;` → raw `0.5s`, no motion token; nearest
  canonical is `--motion-structural` (620ms) for an entrance reveal.
- `masonry.css:43` `animation-delay: calc(min(var(--stagger-idx, 0), 20) * 40ms);` → raw `40ms` step, and (per
  above) `--stagger-idx` is dead/unset.

---

### List
- **Import:** internal render target of `DataDisplay` when `mode='list'` (not directly exported)
- **Source:** `packages/data/src/components/displays/List.tsx` · **Style/tokens via:** `list.css` +
  `skeleton.css`
- **Radius:** — none · **Motion:** `--data-transition`
- **Purpose:** Row-virtualized simple list renderer — the default `DataDisplay` mode; wraps each item in the
  shared `Row` virtualization primitive and layers selection/interactive affordances on top of the caller's
  `renderItem`.
- **Variants / display modes:** `interactive` (opt-in hover affordance) × `selected` × 3-tier skeleton
  fallback (loaded → caller `renderSkeleton` → default `ListCardSkeleton`).

**Item × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.data-list__item` | transparent bg, `border-bottom:1px solid transparent` (reserved, never painted a visible colour), `display:flex` | `--bg-surface-subtle` — **only** if both `interactive` prop **and** an `onItemClick` handler are present | — (no explicit focus ring) | `--bg-selection` (wins over hover, incl. on hover) | — | `ListCardSkeleton` (`@projective/ui/skeletons`) or caller-supplied `renderSkeleton` |

**Anatomy & tokens:** `transition: background-color var(--data-transition)` (→`--fast`/150ms). Row key falls
back to `loading-${index}` for unloaded gaps to keep virtualization keys stable.

**Behavioral notes:** `interactive` and `isSelectable` (`!!onItemClick`) are independent gates — hover tint
requires both, but the `selected` visual applies purely from `useSelection` state regardless of `interactive`.

**⚠ Guardrail violations found:** None — `list.css` uses only bridge tokens (`--bg-surface-subtle`,
`--bg-selection`, `--data-transition`). (`list.css:8` has a commented-out `padding: 8px 12px;` — dead code,
not a live violation.)

---

### ScrollPane
- **Import:** `import { ScrollPane } from '@projective/data'`
- **Source:** `packages/data/src/components/ScrollPane.tsx` · **Style/tokens via:** `scroll-pane.css`
- **Radius:** — · **Motion:** —
- **Purpose:** Thin `forwardRef` wrapper unifying "container-scrolled" vs "window-scrolled" layout so every
  virtualized surface (List/Grid/Table/MasonryGrid/ChatList) shares one scroll-physics contract.
- **Variants / display modes:** `mode: 'container' | 'window'`.

**State matrix:** not applicable — `ScrollPane` is pure layout plumbing with no hover/focus/selected states.

**Anatomy & tokens:** `.scroll-pane--container` → `height:100%; overflow-y:auto; overflow-x:hidden;
contain:strict` (CSS containment, keeping row-level `ResizeObserver` measurement cheap). `.scroll-pane--window`
→ `height:auto; overflow:visible; overflow-anchor:none`. `.scroll-pane__shim` is the virtualizer's
total-height spacer `div`.

**Behavioral notes:** `overflow-anchor:none` in window mode deliberately disables the browser's native scroll
anchoring so the package's own JS-computed `useScrollAnchoring` is the sole source of truth, avoiding
double-compensation with the browser's built-in behavior.

**⚠ Guardrail violations found:** None.

---

### Row (internal virtualization primitive)
- **Import:** not exported — internal to `packages/data/src/components/internal/Row.tsx`; used by List,
  Table (via TableRow), and Grid.
- **Source:** `packages/data/src/components/internal/Row.tsx` · **Style/tokens via:** none owned (className
  is supplied by the caller: `data-list__row`, `data-table__row …`, `data-grid__row`).
- **Radius:** — · **Motion:** —
- **Purpose:** Shared virtualization primitive — absolutely positions one row at `virtualItem.start` via
  `translateY`, and reports its real measured height back to the `Virtualizer` via `ResizeObserver`
  (variable-height virtualization, not fixed-row-height).
- **Variants / display modes:** — (structural only; no visual variants).

**State matrix:** not applicable — zero owned CSS.

**Behavioral notes:** this is the linchpin of `useVirtual`'s variable-height mode. It deliberately does
**not** set an explicit height in its inline style (code comment: "let content dictate it"), instead reading
`entry.borderBoxSize[0].blockSize` post-layout and calling `virtualizer.measure(index, height)`, which
triggers the parent's `forceUpdate`. This is why skeleton rows (fixed `estimateHeight`) and loaded rows of
arbitrary real height can coexist in the same virtualized list without visual jumps — each row self-reports
once painted.

**⚠ Guardrail violations found:** None (no CSS to check).

---

### Virtualization & interaction hooks (brief — no state matrix)

- **`useVirtual`** (`hooks/useVirtual.ts`) — Preact wrapper around the core `Virtualizer` class. Owns a
  `parentRef`, listens to scroll/resize on either the container or `globalThis` (per `useWindowScroll`), and
  exposes `getItems()`/`getTotalSize()`. Supports `initialScrollToBottom` (used by ChatList) via a
  `requestAnimationFrame`-deferred scroll-to-bottom that fires once per mount.
- **`useMasonryVirtual`** (`hooks/useMasonryVirtual.ts`) — same shape as `useVirtual` but wraps
  `MasonryVirtualizer` (column-packing bin-packer) and additionally tracks `containerWidth` via a
  `ResizeObserver` on a dedicated `gridRef` (separate from the scrollable `parentRef`), since column count
  depends on measured width, not just scroll position.
- **`useSelection`** (`hooks/useSelection.ts`) — mode-aware (`none`/`single`/`multi`) click handler:
  plain click replaces the selection; Ctrl/Cmd-click toggles; Shift-click selects a contiguous range from the
  last-clicked key (`lastKeyRef`). Mutates a `Map`-backed `Dataset.items` immutably and fires
  `onSelectionChange` with the resulting `Set<string>` of keys.
- **`useScrollAnchoring`** (`hooks/useScrollAnchoring.ts`) — maintains scroll position relative to content
  growth: if the user was within 100px of the bottom before a height change, it force-locks to the new
  bottom (`CASE 1`); otherwise it applies the exact height delta to prevent visual jumping while reading
  history (`CASE 2`). Runs in `useLayoutEffect` (pre-paint) plus a passive scroll listener to keep the
  "am I at the bottom" flag live.

---

## time (`packages/time/src/`)

The `time` package owns a single shared "boundless-velocity" scroll engine (`useViewportScroll` →
`useTimelineScroll`): the Day/Week/Month timelines have **no native scroll and no bounds** — a container is
`overflow:hidden`, and one unbounded virtual `offset` signal (driven by wheel, a velocity-accelerator
scrollbar thumb, or a middle-mouse pan) selects the visible slice, which a single absolutely-positioned
canvas (SVG for Day/Week, transformed blocks for Month) repaints. The custom scrollbar
(`TimelineScrollbar`) is a **Schedule Minimap**: a relative-velocity jog-wheel thumb (not a position mapper)
riding over a live minimap track of Available/Reserved/Unavailable ticks plus a "now" anchor.

### LocalTimeChip
- **Import:** `import { LocalTimeChip } from '@projective/time'`
- **Source:** `packages/time/src/components/LocalTimeChip.tsx` · **Style/tokens via:**
  `local-time-chip.css`
- **Radius:** `--border-radius__small` (6px; canonical equivalent `--radius-field`) · **Motion:** — (no
  transitions; content updates via interval re-render, not animated)
- **Purpose:** Live, self-updating chip showing current wall-clock time in an arbitrary IANA timezone via
  `Intl.DateTimeFormat`, with graceful fallback to local time on an invalid zone.
- **Variants / display modes:** `showSeconds` (1s vs 30s tick) · `use24h` · `showZone` (short zone
  abbreviation suffix) · optional `label` prefix.

**Chip × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.local-time-chip` | `--card` bg, `1px solid --border-color`, `--border-radius__small`, `--text-main`, `0.8125rem` | — (no hover rule) | — | — | — | — |
| `.local-time-chip__icon` | `--text-secondary` | — | — | — | — | — |
| `.local-time-chip__time` | `font-variant-numeric: tabular-nums`, `font-weight:500` | — | — | — | — | — |

**Anatomy & tokens:** static, non-interactive chip — no hover/focus/active affordances exist by design (it
is a passive display element, not a control).

**Behavioral notes:** ticks every 1000ms when `showSeconds`, else every 30000ms; any `Intl` error (bad
timezone id) silently falls back to plain local time with the zone abbreviation dropped, so it can never
throw into the tree.

**⚠ Guardrail violations found:** None — all values route through tokens.

---

### AvailabilityScheduler
- **Import:** `import { AvailabilityScheduler } from '@projective/time'`
- **Source:** `packages/time/src/components/AvailabilityScheduler.tsx` · **Style/tokens via:**
  `availability-scheduler.css`
- **Radius:** `--border-radius__large` (12px, shell) / `--border-radius__small` (6-8px, cells/inputs) ·
  **Motion:** `var(--fast)` (150ms, unqualified — no fallback literal, correctly referenced)
- **Purpose:** Full-screen overlay editor for weekly recurring availability windows (an hour × weekday
  toggle grid) plus away-date range management, emitting a complete `AvailabilityValue` on every edit.
- **Variants / display modes:** `readOnly` (view-only, disables all cell/away mutation controls) · empty
  away-list state.

**Cell / control × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.availability-scheduler__backdrop` | `rgba(0,0,0,0.45)` scrim, `z-index: --z-overlay` | — | — | — | — | — |
| `.availability-scheduler__cell` (hour×day toggle) | `--card` bg, `1px solid --border-color` | `border-color: --primary` (`:not(:disabled)`) | — (no focus-visible ring) | `--cell--active` → `--primary-half` bg + `--primary` border | — | `:disabled` → `opacity:0.7`, `cursor:default` (readOnly mode) |
| `.availability-scheduler__cell--active` | `--primary-half` bg, `--primary` border | hover **while active** → solid `--primary` bg | — | (same as default for this modifier) | — | — |
| `.availability-scheduler__input` (away date/note fields) | `--card` bg, `1px solid --border-color`, height `--input-height` | — | `border-color: --primary` (plain `:focus`, not `:focus-visible`) | — | — | — |
| `.availability-scheduler__add-btn` | `--primary` bg, `#fff` text (raw, see guardrail) | `--primary-hover` bg (`:not(:disabled)`) | — | — | — | `:disabled` → `opacity:0.5` (empty from/to dates) |
| `.availability-scheduler__away-remove` | `--text-secondary` | `--bg` bg + `--danger` icon | — | — | — | — |
| `.availability-scheduler__close` | `--text-secondary` | `--card` bg + `--text-main` | — | — | — | — |

**Anatomy & tokens:** the weekly grid is a single CSS Grid (`auto repeat(7, minmax(0,1fr))`) built entirely
from `cellKey(day,hour)` toggles — internal state is a `Set<string>` (`slotsToSet`/`setToSlots` collapse it
back to contiguous `AvailabilitySlot` ranges on every edit). `START_HOUR=8` / `END_HOUR=20` bound the visible
row range (not the data model, which is unbounded 0-24h).

**Behavioral notes:** every single cell toggle recomputes the **entire** `weekly` array via `setToSlots` and
calls `onChange` — there is no batching of rapid clicks. The grid re-syncs from `value.weekly` on every
upstream change via a `useEffect`, so it is fully controlled (no local-only drift). Overlay backdrop click
closes; the inner panel `stopPropagation`s.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/availability-scheduler.css:9` `background: rgba(0, 0, 0, 0.45);` → raw rgba
  scrim, no scrim/overlay token exists in the system to reference — worth promoting one.
- `availability-scheduler.css:236` `color: #fff;` on `.availability-scheduler__add-btn` → raw hex; should be
  `var(--on-accent)`.
- Focus states throughout (`.availability-scheduler__cell`, `.availability-scheduler__close`,
  `.availability-scheduler__away-remove`) rely on the browser's unstyled default outline — no
  `--focus-glow` applied anywhere in this file.

---

### Calendar
- **Import:** `import { Calendar } from '@projective/time'`
- **Source:** `packages/time/src/components/Calendar.tsx` · **Style/tokens via:** `calendar.css`
- **Radius:** `--cal-radius` → `var(--border-radius__xlarge)` (16px; canonical equivalent `--radius-stage`) ·
  **Motion:** `--cal-ease` = a locally-redeclared `cubic-bezier(0.4, 0, 0.2, 1)` — value-identical to
  `--ease-standard` but reinvented under a package-local name
- **Purpose:** The controlled root calendar — owns the toolbar + active view (day/week/month) switch; cursor
  and view are fully controlled via props/callbacks so a host page can bind them to its own signals.
- **Variants / display modes:** `view: 'day' | 'week' | 'month'` · `masked` (external-viewer privacy mode —
  booked spans collapse to anonymous "Reserved" blocks; availability/time-off stay visible) ·
  `startHour`/`slotMinutes` (booking-grid granularity).

**Regions × State matrix** (Calendar itself is a thin router; per-view cell states live in `TimeGridView` /
`MonthTimeline` below — this table covers only the `.cal` shell + the local design tokens it declares)

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal` root | declares `--cal-hairline`/`--cal-hairline-strong`/`--cal-surface`/`--cal-radius`/`--cal-ease` local tokens | — | — | — | — | — |
| `.cal__body` | `flex:1`, hosts the active view | — | — | — | — | — |

**Anatomy & tokens:** `--cal-hairline: color-mix(in srgb, --text-main 6%, transparent)`,
`--cal-hairline-strong` at 10%, `--cal-surface: color-mix(in srgb, --text-main 2%, --card)` — all
theme-token-derived (no raw colour literals), giving free light/dark inversion.

**Behavioral notes:** `stepCursor` advances by 1 day / 7 days / 1 calendar month depending on `view`.
`openDay` (drill-down from Month → Day) sets both the cursor and the view atomically. `masked` is threaded
down to every child view uniformly — see **TimeGridView** and **MonthTimeline** for the actual masking
render logic (E7 PII-handover privacy behavior).

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:13` `--cal-ease: cubic-bezier(0.4, 0, 0.2, 1);` → duplicates
  `--ease-standard` verbatim under a new local name instead of referencing it directly.

---

### CalendarToolbar
- **Import:** `import { CalendarToolbar } from '@projective/time'`
- **Source:** `packages/time/src/components/CalendarToolbar.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-toolbar*` rules)
- **Radius:** `999px` raw pill radius throughout (canonical equivalent `--radius-pill`) ·
  **Motion:** mixed — `var(--fast) ease` for the chevrons/Today button, `var(--medium) var(--cal-ease)` for
  the view-switch tab
- **Purpose:** The calendar's top bar — a computed human-readable range label, prev/next chevrons, a "Today"
  pill, and a Day/Week/Month segmented switch.
- **Variants / display modes:** active view highlight (`data-active`) on the segmented switch.

**Control × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal-toolbar__chev` (prev/next) | transparent, `--text-muted`, `--border-radius__small` | `color-mix(--text-main 7%, transparent)` bg + `--text-main` | — (no focus-visible ring) | — | — | — |
| `.cal-toolbar__today` | transparent, `1px solid --cal-hairline-strong`, `--text-secondary`, `999px` pill | `color-mix(--text-main 6%, transparent)` bg + darker border + `--text-main` text | — | — | — | — |
| `.cal-toolbar__views` (segmented track) | `color-mix(--text-main 4%, transparent)` bg, `999px` pill, `3px` padding | — | — | — | — | — |
| `.cal-toolbar__view` (tab) | transparent, `--text-muted` | `--text-main` (no bg change) | — | `[data-active='true']` → `--card` bg + `--text-main` + raw `box-shadow: 0 1px 3px rgba(0,0,0,0.18)` | — | — |

**Anatomy & tokens:** range label formatting is pure JS (`rangeLabel()` — no date library), branching on
`view` to build "Jul 12, 2026" / "Jul 12 – 18, 2026" / "July 2026" strings.

**Behavioral notes:** the view switch is a `role='tablist'`/`role='tab'` pattern with `aria-selected`, but
keyboard arrow-key roving-tabindex behavior (standard ARIA tablist expectation) is **not** implemented —
each tab is just a plain focusable `<button>`.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:117` `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);` on the active
  view tab → raw rgba; should be `var(--elevation-1)`.
- `calendar.css:77,94,103` `border-radius: 999px;` (×3 in this file alone) → matches the canonical
  `--radius-pill` value exactly but is hardcoded rather than referencing the token.

---

### TimeGridView (internal engine — powers WeekView & DayView)
- **Import:** not exported from the barrel — internal to `packages/time/src/components/TimeGridView.tsx`,
  rendered by both `WeekView` and `DayView`.
- **Source:** `packages/time/src/components/TimeGridView.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-grid*`, `.cal-svg*`, `.cal-viewport*` rules)
- **Radius:** `--cal-radius` on the outer `.cal-grid` shell · **Motion:** none on the SVG paint layer itself
  (repaint is a pure per-frame vector redraw, not CSS-animated); `.cal-grid__date[data-today]` and
  `.cal-toolbar`-adjacent chrome use `var(--medium) var(--cal-ease)`
- **Purpose:** The SVG-driven continuous vertical timeline engine — **no native scroll, no spacer, no
  bounds**. A single virtual `offset` (from `useTimelineScroll`) selects the visible slice; one absolutely-
  positioned `<svg>` repaints hour rules, midnight demarcations, availability washes, events, hover/drag
  selection bands and the live "now" line as pure vector math. A single pointer handler converts
  `clientX/clientY` back into an exact date + `slotMinutes`-granularity block for booking.
- **Variants / display modes:** `daysPerPage: 1` (Day) vs `7` (Week) · `masked` (booked events render as
  anonymous "Reserved" blocks — no title/attendee/project leaks; availability & time-off stay visible).

**Cell / event / overlay × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal-svg__hour` / `.cal-svg__col` / `.cal-svg__axis` grid lines | `--cal-hairline` / `--cal-hairline-strong` stroke | — (`pointer-events:none` on the whole `<svg>` except event groups) | — | — | — | — |
| `.cal-svg__today` (today column wash) | `color-mix(--primary 4%, transparent)` fill | — | — | — | — | — |
| hatch wash (time-off column) | `url(#cal-hatch)` diagonal pattern (`color-mix(--text-main 3–8%)`) | — | — | — | — | — |
| availability window wash | `tint(colour, 8%)` fill + `tint(colour, 55%)` 2px left accent | — | — | — | — | — |
| `.cal-svg__event` (booking chip) | `tint(colour,16%)` bg rect + solid 3px left accent, `cursor:pointer` | `filter: brightness(1.12)` on `.cal-svg__event-bg` | — | — | — | — |
| `.cal-svg__event--reserved` (masked) | `color-mix(--text-main 9%, transparent)` bg, `--text-muted` "Reserved" label, `cursor:default` | — (no hover treatment — intentionally inert) | — | — | — | rendered whenever `masked=true`, regardless of underlying event |
| `.cal-svg__hover` (open-slot hover highlight) | `--primary-surface` fill, `color-mix(--primary 32%)` stroke | — | — | — | — | only drawn over slots that pass `isOpen()` |
| `.cal-svg__sel` (drag-selection band) | `color-mix(--primary 18%, transparent)` fill, `color-mix(--primary 55%)` stroke | — | — | — | shown while `dragging.current` is true (click-drag beyond the initial slot) | — |
| `.cal-svg__now` line + dot | `--danger` stroke/fill | — | — | — | — | only drawn when today's column is in view |
| midnight daybreak band | gradient wash (`--primary` 16%→0) + `color-mix(--primary 55%)` rule + dated pill (`color-mix(--primary 90%, --card)` bg, `#fff` text — raw, see guardrail) | — | — | — | — | — |

**Anatomy & tokens:** `GUTTER_W = 56px` hour-label gutter; `pxPerHour` default 60; `pageHeight = 24 ×
pxPerHour`. The Schedule Minimap (passed to `TimelineScrollbar`) is recomputed every paint from a
±`MINIMAP_HALF_PAGES` (3 pages) window centred on the viewport — pure math over the small seed arrays, no DOM
reads, so it never thrashes layout even during max-speed accelerator scrolling.

**Behavioral notes:** interaction is a single `mousemove`/`mousedown`/`mouseup`/`dblclick` handler set on the
paint surface (`slotAt()` converts client coordinates → `{page, col, date, startMin}`). A plain click-drag
only surfaces a visible selection band once it spans **more than** the initial slot (so a double-click never
flashes a spurious selection). Middle-mouse button (`e.button===1`) triggers `beginPan` (grab-pan) instead of
booking. `isOpen()` gates both hover and click booking on three conditions: not time-off, within an
availability window, and not overlapping an existing event. The "Return to present" `PresentButton` appears
whenever the live now-line scrolls out of the current slice, in either direction.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:420` `fill: #fff;` on `.cal-svg__daybreak-tag-text` → raw hex;
  should be `var(--on-accent)`.
- The event/window "colour" is accepted as **any raw CSS colour string** (`event.colour ?? 'var(--primary)'`)
  at the data-model level (`packages/time/src/types/calendar.ts:19,32`) — by design this is caller-supplied
  per-item accent data, not a component-authored guardrail violation, but it does mean arbitrary hex/hsl can
  flow into the SVG `fill`/`stroke` attributes from outside the design system's control.

---

### WeekView
- **Import:** `import { WeekView } from '@projective/time'`
- **Source:** `packages/time/src/components/WeekView.tsx` · **Style/tokens via:** delegates entirely to
  `TimeGridView` / `calendar.css`
- **Radius / Motion:** inherited from `TimeGridView`
- **Purpose:** A 7-column pass-through over `TimeGridView` (`daysPerPage={7}`) — adds no markup or styling
  of its own.
- **Variants / display modes:** none beyond what `TimeGridView` exposes.

**State matrix:** identical to **TimeGridView** — see above; `WeekView` is a zero-logic wrapper
(`<TimeGridView daysPerPage={7} {...props} />`).

**Behavioral notes:** the 7 day-columns share one continuous vertical timeline (not 7 independent scroll
areas) — scrolling moves all columns together, week-to-week, seamlessly (no per-week pagination boundary).

**⚠ Guardrail violations found:** None beyond those already listed under **TimeGridView**.

---

### DayView
- **Import:** `import { DayView } from '@projective/time'`
- **Source:** `packages/time/src/components/DayView.tsx` · **Style/tokens via:** delegates to `TimeGridView`
- **Radius / Motion:** inherited from `TimeGridView`
- **Purpose:** A single-column pass-through over `TimeGridView` (`daysPerPage={1}`, `anchor={day}`).
- **Variants / display modes:** none beyond `TimeGridView`.

**State matrix:** identical to **TimeGridView** — see above.

**Behavioral notes:** because it shares the exact same boundless-viewport engine as `WeekView`, scrolling a
Day view flows continuously day-to-day (not paginated per-day) — the only difference from Week is
`daysPerPage`/column width math.

**⚠ Guardrail violations found:** None beyond those already listed under **TimeGridView**.

---

### MonthView *(orphaned — exported but unused)*
- **Import:** `import { MonthView } from '@projective/time'`
- **Source:** `packages/time/src/components/MonthView.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-month*` rules — shared with `MonthTimeline`'s `MonthBlock`)
- **Radius / Motion:** shares `--cal-radius`/hover transitions with the `.cal-month__cell` rules documented
  under **MonthTimeline** below.
- **Purpose:** A static, single-month 6×7 day grid (today = filled primary circle, up to 3 event chips + "+N"
  overflow per day, time-off subtly hatched).
- **Variants / display modes:** out-of-month dimming (`data-outside`), today highlight, time-off shading.

**⚠ Status finding (not a styling guardrail):** `MonthView` is exported from
`packages/time/src/components/index.ts:10` but **is not imported or rendered anywhere else in the
repository** — `Calendar.tsx`'s `view==='month'` branch renders `MonthTimeline` (the infinite-scroll month
stream), not `MonthView`. `MonthView` appears to be an earlier, paginated month implementation superseded by
`MonthTimeline`'s continuous-scroll version but never removed from the barrel. Its state matrix is otherwise
identical to `MonthTimeline`'s per-day cell rendering (see below) since they share the same `.cal-month__cell`
class family.

**⚠ Guardrail violations found:** None of its own beyond what's cited under **MonthTimeline** (shared CSS).

---

### MonthTimeline
- **Import:** `import { MonthTimeline } from '@projective/time'`
- **Source:** `packages/time/src/components/MonthTimeline.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-month*`, `.cal-monthblock*`)
- **Radius:** `--cal-radius` on the outer shell · **Motion:** `var(--medium) var(--cal-ease)` for cell
  hover/today-circle transitions
- **Purpose:** Continuous, infinitely-scrollable Month view — consecutive months stack vertically and stream
  through the **same** boundless-viewport engine as Day/Week (`useViewportScroll`, not `useTimelineScroll` —
  Month uses its own month-row bounce-snap via `snapMonthRow`). Only months intersecting the viewport are
  mounted; each is positioned by a pure `transform: translateY()` from the virtual offset.
- **Variants / display modes:** `masked` (event chips collapse to a neutral "Reserved" pill, no accent
  colour, no title).

**Cell × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal-month__cell` (day cell) | transparent, `border-top`/`border-left: 1px solid --cal-hairline`, `cursor:pointer` | `color-mix(--text-main 3%, transparent)` bg | — | — | — | — |
| `.cal-month__cell[data-outside]` | `.cal-month__num` dims to `--text-disabled` | — | — | — | — | — |
| `.cal-month__cell[data-off]` (time-off) | 45° repeating diagonal hatch (`color-mix(--text-main 3%)`) | — | — | — | — | — |
| `.cal-month__num` (day number) | `--text-secondary`, `999px` pill | — | — | `[data-today='true']` → `--primary` bg + `#fff` text (raw, see guardrail) + `color-mix(--primary 45%)` glow shadow | — | — |
| `.cal-month__chip` (event pill) | `cursor:pointer` | `color-mix(--cal-event-accent 14%, transparent)` bg | — | — | — | — |
| `.cal-month__chip--reserved` (masked) | neutral `color-mix(--text-main 6%)` bg, `cursor:default`, italic muted title, no accent dot colour | — (intentionally inert — no hover) | — | — | — | rendered instead of the real chip whenever `masked=true` |
| `.cal-month__more` ("+N" overflow) | `--text-muted` | — | — | — | — | shown when `dayEvents.length > MAX_CHIPS (3)` |

**Anatomy & tokens:** `LABEL_H=40px`, `ROW_H=96px`, `MONTH_H = LABEL_H + ROW_H×6` — fixed month-block height
so offset math stays exact. `snapMonthRow()` bounce-snaps a settling scroll onto the nearest week-row line
across the current month ± 1 neighbour (so a settle never fights a month-boundary seam). Schedule minimap
uses a ±`MINIMAP_HALF_MONTHS` (1.5 months) window, marking only Reserved/Unavailable rows (no "available"
tick at month granularity, unlike the Day/Week minimap).

**Behavioral notes:** month origin (`index 0`) is fixed once on mount so the offset↔month mapping never
drifts; the `anchor` prop only re-anchors the viewport (`vp.setOffset`) when it disagrees with the last
broadcast centre (`syncedCentre` guard), preventing a cursor⇄scroll feedback loop identical in spirit to
`useTimelineScroll`'s guard. Middle-mouse pan (`onCanvasDown`, `e.button===1`) is supported here too; plain
left-click still just selects/opens a day.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:647` `color: #fff;` on `.cal-month__num[data-today='true']` → raw
  hex; should be `var(--on-accent)`.
- `calendar.css:640` `border-radius: 999px;` (day-number pill) → should reference `--radius-pill`.

---

### MiniCalendar
- **Import:** `import { MiniCalendar } from '@projective/time'`
- **Source:** `packages/time/src/components/MiniCalendar.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-mini*`)
- **Radius:** `999px` pill (day cells, nav buttons) — raw, canonical equivalent `--radius-pill` ·
  **Motion:** `var(--fast) ease` (background transitions only)
- **Purpose:** Compact sidebar month picker — month label + prev/next, weekday initials, day cells with a
  filled circle for the selected day and a small availability/event dot.
- **Variants / display modes:** internally-tracked `viewMonth` (independent of the externally-controlled
  `value`/selected day, so browsing months doesn't move the selection).

**Day cell × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal-mini__navbtn` (prev/next month) | transparent, `--text-muted`, `999px` | `color-mix(--text-main 7%)` bg + `--text-main` | — | — | — | — |
| `.cal-mini__day` (day cell) | transparent, `999px`, `aspect-ratio:1` | `color-mix(--text-main 7%)` bg | — | `[data-selected='true']` → `--primary` bg (hover stays `--primary`, no lighten) | — | — |
| `.cal-mini__daynum` | `--text-secondary`, tabular-nums | — | — | selected → `#fff` (raw, see guardrail) + `font-weight:700`; today (unselected) → `--primary` + `font-weight:700` | — | `[data-outside]` → `--text-disabled`; `[data-off]` → `line-through` + `--text-disabled` |
| `.cal-mini__dot` (has-events indicator) | `--primary`, 3px circle, bottom-anchored | — | — | on a selected day → `#fff` (raw, see guardrail) | — | only rendered when the day has windows/events and is not time-off |

**Anatomy & tokens:** 7×6 CSS Grid, weekday initials from `WEEKDAY_LABELS[d][0]`. `off?.label` becomes the
cell's `title` tooltip for time-off days.

**Behavioral notes:** `data-selected` and `data-today` are independent booleans that can both apply (today
happens to be selected) — the selected-fill rule visually wins since it's declared after in the cascade.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:826` `color: #fff;` on `.cal-mini__day[data-selected='true']
  .cal-mini__daynum` → raw hex; should be `var(--on-accent)`.
- `calendar.css:845` `background: #fff;` on `.cal-mini__day[data-selected='true'] .cal-mini__dot` → raw hex;
  should be `var(--on-accent)`.
- `calendar.css:793` `border-radius: 999px;` (day cell) → should reference `--radius-pill`.
- No `:focus-visible` treatment anywhere in this file for `.cal-mini__navbtn` / `.cal-mini__day` — both rely
  on the unstyled browser default outline.

---

### TimelineScrollbar (Schedule Minimap)
- **Import:** `import { TimelineScrollbar } from '@projective/time'`
- **Source:** `packages/time/src/components/TimelineScrollbar.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-scrollbar*`)
- **Radius:** `999px` (track + thumb, both fully rounded pills) · **Motion:** thumb position/size transition
  `top 220ms var(--cal-ease), height 220ms var(--cal-ease), width 120ms ease, background 120ms ease` — raw ms
  values, none matching the canonical motion ramp exactly
- **Purpose:** Not a conventional scrollbar — a **relative-velocity jog/shuttle control**. The thumb rests
  centred at 50% of the track, shortens + drifts with scroll velocity, and eases home when idle; dragging it
  off-centre (`beginAccel`) drives continuous scroll at a speed proportional to displacement. The track
  behind it is a live minimap of a local time window: ultra-thin ticks for Available/Reserved/Unavailable
  plus a distinct "now" anchor.
- **Variants / display modes:** hovered vs idle vs dragging (`data-active`/`data-dragging`) · presence/
  absence of `minimap` data (renders `null` entirely if `viewportH <= 0`).

**Thumb / track × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal-scrollbar__track` (minimap rail) | `4px` wide, `999px`, `color-mix(--text-main 6%, transparent)`, `opacity:0.9`, `pointer-events:none` | — | — | — | — | — |
| `.cal-scrollbar__tick[data-state='available']` | `color-mix(--primary 62%, transparent)`, `opacity:0.55` | — | — | — | — | — |
| `.cal-scrollbar__tick[data-state='reserved']` | `color-mix(--text-main 40%, transparent)`, `opacity:0.55` | — | — | — | — | — |
| `.cal-scrollbar__tick[data-state='unavailable']` | `color-mix(--danger 42%, transparent)`, `opacity:0.4` | — | — | — | — | — |
| `.cal-scrollbar__now` (current-time anchor) | `--danger` fill, glow `color-mix(--danger 70%)` box-shadow | — | — | — | — | only rendered when `nowFrac` falls within the mapped window |
| `.cal-scrollbar__thumb` | `6px` wide, `999px`, `color-mix(--text-main 26%, transparent)`, `cursor:grab` | `[data-active='true']` → `8px` wide, `color-mix(--text-main 52%, transparent)` | — | — | `[data-dragging='true']` → `cursor:grabbing`, `color-mix(--primary 66%, transparent)`, **no** positional easing (tracks the pointer 1:1) | — |

**Anatomy & tokens:** `BASE_RATIO=0.5` (thumb rests at 50% of track), `MIN_LEN=34px`, `MARGIN=4px`. Thumb
length shrinks up to 34% at max velocity shrink (`shrink.value`). The whole `.cal-scrollbar` region is
`pointer-events:none` except the thumb itself (`pointer-events:auto`), so the track/ticks are purely visual.

**Behavioral notes:** this is explicitly **not** a position-mapping scrollbar — its `onPointerDown` calls
`beginAccel`, which starts a `requestAnimationFrame` loop that advances the virtual `offset` at a
frame-rate-independent speed derived from `(drift / maxDrift)^1.6 × MAX_ACCEL` (eased for fine low-speed
control, linear-feeling at extremes). Dragging fully off-centre flies the timeline at max speed with no
upper clamp on distance travelled. Visual language is explicitly stated (in a source comment) to match the
Gantt chart's velocity thumb in `packages/charts` — a shared cross-package "integrated tool asset," not an OS
scrollbar affordance.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:285-288` `transition: top 220ms var(--cal-ease), height 220ms
  var(--cal-ease), width 120ms ease, background 120ms ease;` → four raw ms durations (220ms/220ms/120ms/120ms),
  none aligned to `--motion-standard`(150) / `--motion-micro`(250) / `--motion-structural`(620).
- `calendar.css:300` `transition: width 120ms ease, background 120ms ease;` (dragging state) → same issue.
- `calendar.css:232,242,279` `border-radius: 999px;` (×3) → should reference `--radius-pill`.

---

### PresentButton
- **Import:** `import { PresentButton } from '@projective/time'`
- **Source:** `packages/time/src/components/PresentButton.tsx` · **Style/tokens via:** `calendar.css`
  (`.cal-jump*`)
- **Radius:** `999px` pill · **Motion:** `opacity 260ms var(--cal-ease), transform 260ms var(--cal-ease),
  background 160ms ease, border-color 160ms ease` — raw ms, none on the canonical ramp
- **Purpose:** Floating "return to present" teleport pill. Appears only when the live now-line has scrolled
  out of the viewport (either direction), eases in from the bottom edge, and animates the timeline back to
  now on click.
- **Variants / display modes:** `direction: 'up' | 'down'` (chevron hints which way "now" lies) ·
  show/hidden (`data-show`).

**Button × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.cal-jump` (hidden resting state) | `opacity:0`, `translate(-50%, 14px) scale(0.94)`, `pointer-events:none` | — | — | — | — | — |
| `.cal-jump[data-show='true']` | `opacity:1`, `translate(-50%, 0) scale(1)`, `pointer-events:auto` | `color-mix(--card 78%, --primary)` bg + `color-mix(--primary 60%)` border | — (no focus-visible ring) | — | `:active` → `translate(-50%, 1px) scale(0.98)` | rendered but `aria-hidden`/`tabIndex=-1` when `show=false` |
| `.cal-jump` chrome | `color-mix(--card 88%, --primary)` bg, `color-mix(--primary 40%)` border, `backdrop-filter: blur(10px) saturate(1.2)`, layered `box-shadow` (one token `color-mix(--primary 28%)`, one raw `rgba(0,0,0,0.16)`) | — | — | — | — | — |
| `.cal-jump__icon` | `--primary` | — | — | — | — | — |
| `.cal-jump__dir` (chevron) | `--text-muted` | — | — | — | — | — |

**Anatomy & tokens:** entrance transition explicitly separates the show/hide `opacity`+`transform` (260ms)
from hover's `background`/`border-color` (160ms) so a hover mid-transition doesn't restart the entrance
easing.

**Behavioral notes:** `show` is computed per-frame by the parent (`presentVisible` in `TimeGridView`/
`MonthTimeline`) from whether the now-line/today-row falls inside the current virtual slice — `PresentButton`
itself is stateless and purely presentational.

**⚠ Guardrail violations found:**
- `packages/time/src/styles/calendar.css:325` `0 1px 3px rgba(0, 0, 0, 0.16);` (second layer of the `.cal-jump`
  box-shadow) → raw rgba; should be composed from `--elevation-*`.
- `calendar.css:331-334` `transition: opacity 260ms var(--cal-ease), transform 260ms var(--cal-ease),
  background 160ms ease, border-color 160ms ease;` → raw ms values off the canonical ramp.
- `calendar.css:315` `border-radius: 999px;` → should reference `--radius-pill`.

---

### EventBlock *(orphaned — exported but unused, and unstyled)*
- **Import:** `import { EventBlock } from '@projective/time'`
- **Source:** `packages/time/src/components/EventBlock.tsx` · **Style/tokens via:** none found —
  `class='cal-event'` and its `__content`/`__title`/`__time`/`__subtitle` sub-elements have **zero** matching
  CSS anywhere in `packages/time` or `apps/web` (verified by repo-wide grep for `.cal-event`).
- **Radius / Motion:** — (unstyled)
- **Purpose (as written):** A "minimalist event chip for the week/day time grids" — a positioned, colour-
  accented `<button>` meant to render one event within a day column, with a `data-compact` variant for short
  spans.
- **Variants / display modes (as written):** `data-kind` (`booking`/`busy`/`reserved`) · `data-compact`
  (height-driven, hides time/subtitle when the chip is under 44px tall).

**⚠ Status finding (not a conventional styling guardrail — the component is entirely dead code):**
`EventBlock` is exported from `packages/time/src/components/index.ts:15` but is **never imported or rendered
anywhere** in the repository (verified by grep). The actual Day/Week event rendering happens inline as raw
SVG groups inside `TimeGridView.tsx` (`.cal-svg__event*` — fully styled, see **TimeGridView** above), which
duplicates `EventBlock`'s stated purpose but as vector shapes instead of DOM buttons. `EventBlock` appears to
be a superseded first-pass implementation left in the public API surface with no corresponding CSS ever
written for it — if instantiated today it would render completely unstyled (plain `<button>`/`<span>` chrome
only).

**⚠ Guardrail violations found:** N/A — there is no CSS to audit.

---

### Navigation & scroll-physics hooks (brief — no state matrix)

- **`useCalendarNavigation`** (`hooks/useCalendarNavigation.ts`) — the simple, non-virtualized date-math
  engine: owns `cursor`/`view` signals, derives `visibleDays` (1/7/42 ISO dates) via `useComputed`, and steps
  by day/week/month depending on the active view. Used by hosts that want calendar state without the
  boundless-scroll engine (e.g. driving `MiniCalendar` externally).
- **`useViewportScroll`** (`hooks/useViewportScroll.ts`) — the shared **boundless-velocity viewport physics**
  primitive underlying Day/Week/Month. No native scroll, no bounds: a single `offset` signal is driven by
  wheel (`DRIFT_K=0.32`, `DRIFT_MAX=96px`), a velocity-accelerator thumb drag (`MAX_ACCEL=62px/frame`,
  `speed = sign(ratio) × |ratio|^1.6 × MAX_ACCEL`), or a middle-mouse pan (1:1). Idles after `IDLE_MS=140ms`
  of no input, then eases the thumb home and bounce-snaps the offset via a caller-supplied `snap()` function
  using `easeOutBack` (visible overshoot) for snap-settles vs `easeOutCubic` (no overshoot) for
  present-teleports.
- **`useTimelineScroll`** (`hooks/useTimelineScroll.ts`) — layers Day/Week date semantics on top of
  `useViewportScroll`: fixes a stable coordinate origin at canvas y=0, applies a half-hour bounce-snap grid
  (`snapStep = pxPerHour/2`), translates `offset` → the centred page date (broadcast via `onAnchorChange`),
  and re-anchors when the host's `cursor` prop changes — guarded by a single `syncedCentre` ref so
  broadcast-out and cursor-in never feedback-loop each other.

---

## files (`packages/files/src/`)

### UploadFile (UploadFileIsland)
- **Import:** `import { UploadFileIsland } from '@projective/files'`
- **Source:** `packages/files/src/UploadFile.tsx` · **Style/tokens via:** `upload-file.css` (also styles
  most of DirectoryTree/FileGrid/FileDetails/SelectionTray, which share this one sheet)
- **Radius:** `--border-radius__large` (12px, cards/preview panels — canonical `--radius-card`) ·
  **Motion:** `var(--medium, 220ms)` on the details-column slide-in (raw fallback, off-ramp — see guardrail)
- **Purpose:** The full three-column directory browser modal for attaching files — Column 1 collapsible
  directory tree, Column 2 breadcrumbs + search + sort + grid/list toggle + file grid, Column 3 details panel
  (appears when a file is active). Supports OS drag-and-drop upload with a full-surface drop overlay.
- **Variants / display modes:** grid vs list view (`store.viewMode`) · tree collapsed/expanded · details
  panel open/closed · global search mode (overrides the scoped folder view, matches files **and** folders
  across every source) · drag-over state.

**Region × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.upload-file` shell | `--card` bg | — | — | — | — | — |
| `.upload-file__drop-overlay` | not rendered | — | — | — | — | shown full-bleed (`inset:0`, `z-index:50`) while `isDragOver`, only for genuine OS file drags (`dataTransfer.types.includes('Files')`) — internal file→folder drags use a custom MIME and do **not** trigger it |
| `.upload-file__col--tree` | `232px` fixed, `--bg` bg, right-bordered | — | — | — | — | hidden entirely (not just collapsed-width) when `store.treeCollapsed` |
| `.upload-file__col--details` | `312px` fixed, left-bordered, slide-in `uf-details-in` keyframe (`translateX(18px)→0` + fade) | — | — | — | — | mounted only while `activeFile` is non-null |
| `.upload-file__confirm` (footer CTA) | `Button variant='primary'`, `flex:2` | — inherits `@projective/ui` Button hover | — inherits Button focus | — | — | `disabled` when `selectionCount === 0`; label switches between "Select a file" / "Confirm selection (N)" |

**Anatomy & tokens:** header `0.85rem 1rem` padding, `border-bottom: 1px solid --border-color`; toolbar row
wraps `TextField` (search), two `MenuSelect`s (type filter, sort), and a `ButtonGroup` view toggle — all
`@projective/fields`/`@projective/ui` primitives, not package-local controls.

**Behavioral notes:** search is client-computed via `useComputed` — a non-empty query switches the whole
view from "scoped folder" to "global search" mode (matches directory **and** file names across every
connected source, not just the current folder), and file cards gain a `showPaths` breadcrumb-style location
label instead of their normal category label. Drag-enter/leave uses a manual `dragCounter` ref (not just
`dragenter`/`dragleave` booleans) to survive child-element boundary crossings without flicker.

**⚠ Guardrail violations found:**
- `packages/files/src/styles/upload-file.css:86` `animation: uf-details-in var(--medium, 220ms)
  cubic-bezier(0.16, 1, 0.3, 1);` → raw ms fallback + a bespoke cubic-bezier not defined among the system's
  `--ease-*` tokens.
- `upload-file.css:443` `background-color: hsla(var(--bg-hue), var(--bg-saturation), var(--bg-lightness),
  0.85);` (drop overlay) → built from theme primitives (not a raw literal) but duplicates what should be a
  semantic scrim/overlay token.

---

### HandoverLibrary
- **Import:** `import { HandoverLibrary } from '@projective/files'`
- **Source:** `packages/files/src/HandoverLibrary.tsx` · **Style/tokens via:** `handover-library.css`
- **Radius:** `var(--border-radius, 8px)` (cards/buttons — non-canonical primitive w/ raw fallback) ·
  **Motion:** `var(--fast, 150ms) var(--ease-out, ease-out)` (raw ms + raw ease fallbacks, though
  `--ease-out` **is** a real defined token — the fallback is merely redundant, not a violation of vocabulary)
- **Purpose:** The "unlocked" post-handover downloader (E7 private-channel PII/handover feature) — once the
  protected phase ends, every released asset renders as a responsive grid of file cards with unrestricted
  download actions. The `unlocked` accent (open-lock badge + faint primary glow border) signals no gating
  remains.
- **Variants / display modes:** `unlocked` (default `true` — glow border + badge) vs plain · `onDownload`
  handler vs raw `<a download>` fallback (per-file) · `onDownloadAll` header action (only rendered when
  provided) · empty state (no files shared).

**Card × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.handover-library__card` | `--card` bg, `1px solid --hairline`, `--border-radius` (8px), `--shadow-sm` | `translateY(-2px)`, `--shadow-md`, `border-color: --hairline-strong` | — (no explicit focus ring on the card itself — it's not focusable) | — | — | — |
| `.handover-library--unlocked .handover-library__card` | border tinted `color-mix(--primary 22%, --hairline)` + extra `0 0 10px color-mix(--primary 8%)` glow layered on `--shadow-sm` | glow intensifies to `color-mix(--primary 40%)` border + `14px` glow on `--shadow-md` | — | — | — | — |
| `.handover-library__unlocked-badge` | `color-mix(--primary 12%, transparent)` bg, `--primary` text, `999px` pill | — | — | — | — | shown only when `unlocked=true` |
| `.handover-library__download-all` (header CTA) | `--primary` bg, `hsl(0,0%,100%)` text (raw, see guardrail), `var(--border-radius, 8px)` | `translateY(-1px)` + `color-mix(--primary 32%)` shadow | `box-shadow: 0 0 0 3px color-mix(--primary 40%)` (explicit `:focus-visible`) | — | — | rendered only when `onDownloadAll` provided |
| `.handover-library__download` (per-card icon button) | `color-mix(--primary 10%, transparent)` bg, `--primary` icon | solid `--primary` bg + `hsl(0,0%,100%)` icon (raw, see guardrail) | `box-shadow: 0 0 0 3px color-mix(--primary 40%)` (explicit `:focus-visible`) | — | — | — |
| `.handover-library__empty` | centred `--text-muted` message | — | — | — | — | shown when `files.length === 0` |

**Anatomy & tokens:** grid `repeat(auto-fill, minmax(220px, 1fr))`, `0.75rem` gap. This is the **only** file
in either `time` or `files` that explicitly respects `@media (prefers-reduced-motion: reduce)` (strips all
three transitions to `none`).

**Behavioral notes:** per-file download resolves in priority order: caller `onDownload` handler → else a
plain `<a href={file.url} download>` if `file.url` exists → else the icon is simply omitted (no dead button
rendered for reference-only files with neither).

**⚠ Guardrail violations found:**
- `packages/files/src/styles/handover-library.css:56` `color: hsl(0, 0%, 100%);` on
  `.handover-library__download-all` → raw hsl white; should be `var(--on-accent)`.
- `handover-library.css:171` `color: hsl(0, 0%, 100%);` on `.handover-library__download:hover` → same fix.
- `handover-library.css:52,92` `border-radius: var(--border-radius, 8px);` (×2) → non-canonical primitive
  with a raw fallback; should be `var(--radius-card)`.
- `handover-library.css:160` `border-radius: var(--border-radius__small, 4px);` on the download icon button
  → raw fallback (value itself matches `--radius-control` exactly).

---

### FileGrid (FolderCard + FileCard)
- **Import:** `import { FileGrid } from '@projective/files'`
- **Source:** `packages/files/src/library/FileGrid.tsx` · **Style/tokens via:** `upload-file.css`
  (`.upload-file-card*`)
- **Radius:** `--border-radius__large` (12px grid cards) / `--border-radius__small` (list-row previews) ·
  **Motion:** `var(--fast)` (border/transform/shadow transitions)
- **Purpose:** Column-2 center visualization — renders subfolders (`FolderCard`) then files (`FileCard`) in
  either a CSS-grid or a stacked-list layout, with inline rename, per-card kebab menu, drag-to-relocate, and
  a selection checkbox independent of the details-toggle click.
- **Variants / display modes:** `isGrid` (grid vs list) · folder drop-target hover · file selected / active
  (details-open) / renaming · `showPath` (search-result location label vs plain category).

**Card × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.upload-file-card` (file or folder) | `--field-bg` bg, `1px solid --border-color`, `--border-radius__large`, `cursor:pointer` | `border-color: --field-border-hover` (→`--text-muted`) + `translateY(-2px)` | — (no focus-visible ring) | `--card--selected` → `border-color: --primary` + `box-shadow: 0 0 0 1px --primary` | dragged via native HTML5 DnD (`draggable`, `dataTransfer.setData`) — no dedicated "being dragged" visual on the source card itself | — |
| `.upload-file-card--active` (details panel open for this file) | `border-color: --primary` + `box-shadow: 0 0 0 1px --primary, 0 6px 18px rgba(0,0,0,0.18)` (raw rgba, see guardrail) | (active state persists through hover) | — | — | — | — |
| `.upload-file-card--dropping` (folder card, valid drop target) | `border-color: --primary` + `box-shadow: 0 0 0 2px --primary`, `transform:none` (cancels the hover lift) | — | — | — | — | only while an internal file drag (`DRAG_FILE_MIME`) is hovering this folder |
| `.upload-file-card__check` (selection toggle, always present) | `#fff` icon colour (raw, see guardrail), `--card__check--off` → `hsla(--bg-hue,--bg-saturation,8%,0.55)` bg + `1.5px solid rgba(255,255,255,0.75)` border, `opacity:0` at rest | card-hover → `opacity:1` | — | `--check--on` → `--primary` bg, no border | — | — |
| `.upload-file-card__menu` (kebab, top-left over grid preview) | `opacity:0` | card-hover → `opacity:1`; button itself: `hsla(--bg-hue,--bg-saturation,8%,0.55)` bg → `0.8` alpha on its own `:hover` | — | — | — | — |
| `.upload-file-card__badge` (file-type colour swatch) | `visual.color` inline background (per-file computed colour), `#fff` letter (raw, see guardrail) | — | — | — | — | — |
| inline `NameInput` (rename mode) | replaces the name `<span>` entirely | — | auto-focused + auto-selected on mount | — | — | commit blocked while a validation error is present (inline error shown below the field) |

**Anatomy & tokens:** grid preview uses `aspect-ratio: 16/10`; list-row preview is a fixed `2.5rem` square.
Folder count badge (`N item(s)`) recomputed from live `store.files`/`store.childDirectories` on every render.
Object URLs for locally-held image files are created via `useMemo`+revoked via a cleanup `useEffect` (keyed
on `file.id`, so re-selecting the same file doesn't leak/re-create blobs).

**Behavioral notes:** the selection checkbox `stopPropagation`s so clicking it never also opens details; the
card's own `onClick` opens `FileDetails` (toggles), completely independent selection models coexisting on one
card. Folder cards are HTML5 drop targets gated on `dataTransfer.types.includes(DRAG_FILE_MIME)` (a custom
internal MIME type) so OS file drags never accidentally trigger a folder-move.

**⚠ Guardrail violations found:**
- `packages/files/src/styles/upload-file.css:481` `0 6px 18px rgba(0, 0, 0, 0.18);` (active-card shadow) →
  raw rgba; should be `var(--elevation-3)`.
- `upload-file.css:527` `color: #fff;` on `.upload-file-card__check` → raw hex; should be `var(--on-accent)`.
- `upload-file.css:538` `background-color: hsla(var(--bg-hue), var(--bg-saturation), 8%, 0.55);` (check-off
  resting bg) → theme-primitive-derived but hardcodes lightness `8%` and alpha `0.55` inline rather than via
  a token — recurs at `upload-file.css:568,573` (menu button bg).
- `upload-file.css:539` `border: 1.5px solid rgba(255, 255, 255, 0.75);` → raw rgba white; should reference
  `--on-accent` at reduced opacity.
- `upload-file.css:567` `color: #fff;` on `.upload-file-card__menu-btn` → raw hex.
- `upload-file.css:609` `color: #fff;` on `.upload-file-card__badge` → raw hex.
- `upload-file.css:460` `border-radius: var(--border-radius__large);` is correct/canonical here — cited only
  to note the package is inconsistent: some rules in this same file use the bare primitive with no fallback
  (fine) while others (`ledger-table.css`/`handover-library.css` elsewhere) add a redundant raw-px fallback.

---

### FileDetails
- **Import:** `import { FileDetails } from '@projective/files'`
- **Source:** `packages/files/src/library/FileDetails.tsx` · **Style/tokens via:** `upload-file.css`
  (`.uf-details*`)
- **Radius:** `--border-radius__large` (preview panel) / `--border-radius__small` (name row, buttons) ·
  **Motion:** `var(--fast)` (name-edit hover only; most of this panel is static)
- **Purpose:** Column-3 details panel for the active file — preview, inline rename, and a stacked action list
  (Download, Open original, Move to folder, Delete with confirmation).
- **Variants / display modes:** editing-name vs display mode · image preview (object URL) vs
  `FileTypeIcon` fallback · linked-reference file (no local `File` blob → download shows a toast instead).

**Region × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.uf-details__preview` | `aspect-ratio:16/10`, `--bg` bg, `1px solid --border-color`, `--border-radius__large` | — | — | — | — | — |
| `.uf-details__name-row` | `--field-bg` bg, `1px solid --border-color`, `--border-radius__small` (8px fallback) | — | — | — | — | — |
| `.uf-details__name-edit` (pencil icon button) | `--text-muted` | `--primary` | — | — | — | — |
| `.uf-details__row` (metadata rows: Type/Size/Created/Source) | `border-bottom: 1px solid --border-color`, label `--text-muted`, value `--text-main` right-aligned | — | — | — | — | `--row--multiline` variant (Source path) switches to left-aligned, stacked layout |
| `Button` action rows (Download / Open original / Delete) | inherited `@projective/ui` `Button` variants (`secondary`, `secondary`, `danger ghost`) | inherited | inherited | — | — | — |
| `.uf-details__move-btn` (custom move trigger, not the shared `Button`) | `--field-bg` bg, `1px solid --border-color`, `--border-radius__small` (8px fallback) | `border-color: --text-muted` | — | — | — | — |

**Anatomy & tokens:** metadata rendered as a semantic `<dl>`/`<dt>`/`<dd>` list via a local `Row` helper.
`sourcePath` is built as `"Source / Folder / Subfolder / file.name"` joined with `' / '`.

**Behavioral notes:** `download()` only works for locally-held `File` blobs — for a linked/reference file
(`!file.file`, e.g. a cloud-source entry) it shows an info toast ("open it from its source to download")
instead of attempting a network fetch. Rename and delete both reuse the same `NameInput`/`ConfirmDialog`
components as `FileGrid`, so their validation/interaction behavior is identical across both surfaces.

**⚠ Guardrail violations found:** None new beyond the shared `upload-file.css` `border-radius: …, 8px)` /
`var(--fast)` fallback pattern already cited under **UploadFile**/**HandoverLibrary**.

---

### DirectoryTree
- **Import:** `import { DirectoryTree } from '@projective/files'`
- **Source:** `packages/files/src/library/DirectoryTree.tsx` · **Style/tokens via:** `upload-file.css`
  (`.uf-tree*`)
- **Radius:** `--border-radius__small` (rows) / `--border-radius__xsmall` (row-action icon buttons) ·
  **Motion:** `var(--fast) ease` throughout
- **Purpose:** Column-1 collapsible directory tree plus cloud-service roots (Local / Google Drive / OneDrive
  / Dropbox). Supports inline rename, create-subfolder, delete-with-confirmation, and acts as an HTML5 drop
  target so files can be relocated by dragging them onto any folder or source-root row.
- **Variants / display modes:** expanded/collapsed nodes (`Set<string>` of keys) · connected vs
  not-connected cloud source (shows a "Connect" stub button instead of a tree) · active (current) folder
  highlight · drop-hover per-row.

**Row × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.uf-tree__row` / `.uf-tree__source-head` | transparent, `--text-main`, `--border-radius__small` (6px fallback) | `--field-bg` bg | — (no focus-visible ring) | `--row--active` / `--source-head--active` → `color-mix(--primary 16%, transparent)` bg | `--row--dropping` → `color-mix(--primary 28%, transparent)` bg + `inset 0 0 0 1px --primary` ring, while a valid internal drag hovers | — |
| `.uf-tree__caret` (expand chevron) | `--text-muted`, rotates `90deg` when `--caret-icon--open` | — | — | — | — | `--caret--empty` → `visibility:hidden` (no children) |
| `.uf-tree__actions` (new-folder / rename / delete icon row) | `display:none` | row-hover → `display:flex` (swaps places with `.uf-tree__count`, also hover-revealed→hidden) | — | — | — | — |
| `.uf-tree__action--danger:hover` | — | `color: var(--danger, hsl(4, 74%, 57%))` (raw fallback, see guardrail) | — | — | — | — |
| `.uf-tree__status--connected` (source connection dot) | `background-color: hsl(160, 60%, 42%)` (raw, see guardrail) | — | — | — | — | — |
| `.uf-tree__connect` (not-connected stub button) | transparent, `1px solid --border-color`, `--text-muted` | `--text-main` + `border-color: --text-muted` | — | — | — | shown instead of the tree body when `!connected` |
| inline `NameInput` (rename mode) | replaces `.uf-tree__label` | — | auto-focused | — | — | — |

**Anatomy & tokens:** row indent is computed inline per depth: `paddingLeft: ${0.35 + depth*0.85}rem` (not a
CSS custom property — a per-row inline style). Each `StorageSource` gets a fixed icon
(`IconDeviceDesktop`/`IconBrandGoogleDrive`/`IconBrandOnedrive`/`IconCloud`) via a lookup map.

**Behavioral notes:** `local` is always `connected:true`; cloud sources check `service?.connected` from a
purely mocked front-end state layer (per the type doc comment: "there is no DB behind them yet"). Drop
targeting distinguishes folder-rows from source-roots via separate `dropKey` namespaces (`dir:${id}` vs
`root:${source}`) so hover state never bleeds between a folder and its ancestor root. New-subfolder creation
auto-expands the parent (`expanded.value = new Set(expanded.value).add(key)`) so the just-created child is
immediately visible.

**⚠ Guardrail violations found:**
- `packages/files/src/styles/upload-file.css:252` `background-color: hsl(160, 60%, 42%);` on
  `.uf-tree__status--connected` → raw hsl; should route through `--status-success` (or a dedicated
  "connected" status token), not an ad hoc green.
- `upload-file.css:309` `color: var(--danger, hsl(4, 74%, 57%));` → raw hsl fallback duplicating `--danger`'s
  value; the fallback should simply be removed (the token is always defined).
- No `:focus-visible` styling anywhere in this file for tree rows, carets, or action buttons.

---

### SelectionTray
- **Import:** `import { SelectionTray } from '@projective/files'`
- **Source:** `packages/files/src/library/SelectionTray.tsx` · **Style/tokens via:** `upload-file.css`
  (`.uf-tray*`)
- **Radius:** `9999px` pill (raw, canonical equivalent `--radius-pill`) · **Motion:** none (no transitions
  declared on any `.uf-tray*` rule)
- **Purpose:** Horizontal strip of selected-file pills shown above the modal footer. Clicking a pill's name
  navigates the browser to the folder housing that file; clicking its cross removes it from the selection
  without closing the modal.
- **Variants / display modes:** renders `null` entirely when nothing is selected (no empty-state chrome).

**Pill × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.uf-tray` (container) | `--bg` bg, `border-top: 1px solid --border-color` | — | — | — | — | component returns `null` when `selected.length === 0` — no visual empty state at all |
| `.uf-tray__clear` (Clear all) | `--text-muted`, no border/bg | `--danger` (raw fallback `hsl(4,74%,57%)`, see guardrail) | — | — | — | — |
| `.uf-tray__pill` | `--field-bg` bg, `1px solid --border-color`, `9999px` (raw pill radius) | — (no pill-level hover) | — | — | — | — |
| `.uf-tray__pill-name` | `--text-main` | `--primary` + `text-decoration:underline` | — | — | — | — |
| `.uf-tray__pill-remove` (×) | `--text-muted`, `50%` circle | `--card` bg + `--danger` (raw fallback, see guardrail) | — | — | — | — |

**Anatomy & tokens:** pills scroll horizontally (`overflow-x:auto`, `flex-wrap:nowrap`) with a
`max-width:220px` per pill (name truncates with ellipsis).

**Behavioral notes:** the count in the header (`Selected · N`) and "Clear all" both read/write
`store.selected` directly — this is the only surface in the library browser that lets the user clear the
**entire** selection in one action (vs per-item checkbox toggling in FileGrid).

**⚠ Guardrail violations found:**
- `packages/files/src/styles/upload-file.css:1009` `border-radius: 9999px;` → raw pill radius (value
  matches `--radius-pill` exactly, spelled `9999px` here vs `999px` elsewhere in the codebase — an internal
  inconsistency on top of not using the token).
- `upload-file.css:991` `color: var(--danger, hsl(4, 74%, 57%));` (Clear all hover) → raw hsl fallback.
- `upload-file.css:1052` `color: var(--danger, hsl(4, 74%, 57%));` (pill-remove hover) → same issue.

---

### ConfirmDialog
- **Import:** `import { ConfirmDialog } from '@projective/files'`
- **Source:** `packages/files/src/library/ConfirmDialog.tsx` · **Style/tokens via:** `upload-file.css`
  (`.upload-confirm*`) — the modal chrome itself is the shared `@projective/ui` `<Overlay type='modal'>`,
  not package-owned CSS.
- **Radius / Motion:** inherited entirely from `@projective/ui`'s `Overlay` primitive; this component's own
  CSS (`.upload-confirm*`) is layout-only (flex + gap), no radius/motion/colour rules of its own.
- **Purpose:** Small centred confirmation modal gating destructive actions (delete file / delete directory)
  across the whole library browser — reused identically by `FileGrid` and `FileDetails`.
- **Variants / display modes:** `danger` (default `true` — confirm button renders as `variant='danger'`) vs
  non-danger confirmations (`variant='primary'`) · `isSticky` (stacks above the parent `UploadFileIsland`
  modal it's spawned from).

**Region × State matrix**

| Element | default | hover | focus | selected | active/dragging | disabled/empty |
|---|---|---|---|---|---|---|
| `.upload-confirm__message` | `--text-muted`, `line-height:1.5` | — | — | — | — | — |
| `.upload-confirm__actions` (button row) | `justify-content:flex-end`, `gap:0.6rem` | — | — | — | — | — |
| Cancel `Button` (`variant='secondary'`) | inherited from `@projective/ui` | inherited | inherited | — | — | — |
| Confirm `Button` (`variant={danger ? 'danger' : 'primary'}`) | inherited | inherited | inherited | — | — | — |

**Anatomy & tokens:** entirely delegates visual weight to the shared `Overlay`/`Button` primitives — this
component contributes only message typography and button-row spacing, making it the leanest, most
guardrail-clean component in the `files` package.

**Behavioral notes:** `isSticky` is set so this dialog can render **above** the `UploadFileIsland` modal that
spawned it (a modal-over-modal stack, e.g. confirming a delete without first closing the file browser).
Confirm/cancel both close via the parent's `onConfirm`/`onCancel` callbacks — `ConfirmDialog` holds no
internal state of its own.

**⚠ Guardrail violations found:** None — no owned colour/radius/motion CSS to violate.
