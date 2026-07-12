# Contextual Theming — `DesignSystemProvider` & `useDesignSystem`

> Part of the [Design System Master Specification](DESIGN_SYSTEM.md). This is the runtime engine that
> lets an app, page or subtree re-scope the design tokens without touching component code.

## 1. Why

Global themes (`:root[data-theme]`) flip the whole app. But a **data-dense settings panel** inside a
comfortable app, or a **social feed** on the violet lane inside a teal workspace, need *local*
overrides. `<DesignSystemProvider>` provides that: a structural, hierarchical configuration layer that
re-scopes tokens for its subtree only — cascading purely through CSS custom properties, with no
per-component prop drilling.

Import from `@projective/ui/system` (or the `@projective/ui` root barrel):

```tsx
import { DesignSystemProvider, useDesignSystem } from '@projective/ui/system';
```

## 2. The configuration knobs

| Prop | Type | Default | Effect |
|------|------|---------|--------|
| `density` | `'comfortable' \| 'compact' \| 'spacious'` | `comfortable` | Re-scales `--input-height`, `--input-padding-x`, table header height, grid gap. |
| `radius` | `'standard' \| 'sharp' \| 'soft'` | `standard` | Re-scopes the whole `--radius-*` ladder (Carbon-sharp ↔ Material-soft). |
| `accent` | `'teal' \| 'violet' \| 'ocean'` | `teal` | Remaps `--primary-*` to the chosen brand lane (violet = social surfaces). |
| `motion` | `'full' \| 'reduced'` | `full` | `reduced` collapses every `--motion-*` to `1ms linear`. |
| `surface` | `0 \| 1 \| 2 \| 'card'` | `0` | Declares the subtree's hierarchical surface level (drives the default surface token + concentric nesting). |
| `vars` | `Record<string,string>` | — | Escape hatch — raw CSS custom properties set on the wrapper (e.g. `{ '--primary-hue': '258' }`). |
| `className` / `style` | — | — | Extra class / inline style on the wrapper. |

## 3. How it works

The provider renders a `display:contents` wrapper (`.pjv-ds`, so it never disturbs layout) and stamps
its resolved config as **data attributes**:

```html
<div class="pjv-ds"
     data-ds-density="compact"
     data-ds-radius="sharp"
     data-ds-accent="teal"
     data-ds-surface="0"> … </div>
```

The `[data-ds-*]` rule blocks in `apps/web/styles/themes/variables/system.css` re-scope the tokens for
everything beneath. Because custom properties inherit through `display:contents`, the whole subtree
picks up the new values — including third-party children and server-rendered chrome.

> **The CSS half lives in `system.css`, the JS half in
> `packages/ui/src/system/DesignSystemProvider.tsx`. They must stay in lock-step** — every `data-ds-*`
> value the provider can emit needs a matching `[data-ds-*]` block, and vice-versa.

## 4. Hierarchical nesting

A nested provider **merges over** its parent — only the props you set change; the rest inherit:

```tsx
<DesignSystemProvider density="comfortable" accent="teal">      {/* app shell */}
  <WorkspaceGrid />
  <DesignSystemProvider density="compact">                     {/* a dense data panel … */}
    <LedgerTable />                                            {/* …still teal, now compact */}
  </DesignSystemProvider>
  <DesignSystemProvider accent="violet" surface="card">        {/* a social feed surface … */}
    <Feed />                                                   {/* …violet accent, card level */}
  </DesignSystemProvider>
</DesignSystemProvider>
```

## 5. Reading the config in a component

Components consume the resolved config with `useDesignSystem()` to compute modifier classes or
fallback styles based on their **hierarchical placement**:

```tsx
function Panel({ children }: { children: ComponentChildren }) {
  const ds = useDesignSystem();
  return (
    <section
      class={ds.modifier('panel')}              // → "panel panel--d-compact panel--r-sharp panel--a-teal"
      style={{ background: ds.surfaceToken }}    // → var(--surface-0 | 1 | 2 | card)
    >
      {children}
    </section>
  );
}
```

`useDesignSystem()` returns the resolved `DesignSystemConfig` plus:

| Member | Type | Meaning |
|--------|------|---------|
| `surfaceToken` | `string` | The CSS surface token for this subtree's level (`var(--surface-…)`). |
| `isReduced` | `boolean` | `true` when motion is collapsed — gate JS-driven animation on this. |
| `modifier(base)` | `(string) => string` | Appends `--d-<density> --r-<radius> --a-<accent>` BEM modifiers to a base class. |

## 6. Guardrails

- A component should **prefer tokens** (which already re-scope under the provider) and only reach for
  `useDesignSystem()` when it needs to branch *structurally* (a different layout, not just a different
  colour). If the only thing changing is a token value, let the cascade do it — don't read the hook.
- **Never** hard-code the accent hue in a component to "match" a violet surface — set
  `accent="violet"` on a provider instead.
- The provider is **portable**: it depends only on `preact`. Do not add app imports to it.
