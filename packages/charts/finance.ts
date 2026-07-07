/**
 * @file finance.ts
 * @description Secondary entry point for the wallet-hub finance visualizations only — the D3
 * Pipeline Flow / Predictive Runway charts and the focus modal. Kept separate from `mod.ts` so
 * consumers (the wallet islands) don't transitively pull in the Gantt chart's PixiJS dependency
 * (~225 kB gzip). Import via `@projective/charts/finance`.
 */

export * from './src/types/finance.ts';
export * from './src/components/pipeline/index.ts';
export * from './src/components/forecast/index.ts';
export * from './src/components/finance/index.ts';
