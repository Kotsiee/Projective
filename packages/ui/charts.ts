/**
 * @module @projective/ui/charts
 * Data-visualization surfaces — Gantt, Kanban, rating, the WorkloadCapacityGauge, and the D3 finance
 * pipeline / forecast / area charts. Colours are resolved from CSS design tokens at runtime via the
 * package's `theme-bridge`, so every chart re-themes with the rest of the system. The heavier D3
 * finance entry is split out under `@projective/ui/charts/finance`.
 */
export * from '@projective/charts';
