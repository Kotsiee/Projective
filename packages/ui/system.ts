/**
 * @module @projective/ui/system
 * The design-system context engine — `<DesignSystemProvider>` + `useDesignSystem()`. Import from
 * here to wrap an app, page or subtree in a density / radius / accent / motion / surface-level
 * configuration that re-scopes the design tokens for everything beneath it. Also re-exported from
 * the `@projective/ui` root barrel for convenience.
 */
export * from './src/system/DesignSystemProvider.tsx';
