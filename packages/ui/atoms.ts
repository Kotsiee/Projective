/**
 * @module @projective/ui/atoms
 * Pure presentation atomic primitives — buttons, icons, badges/status badges, tags, media, the logo
 * and the theme switcher. Zero business logic, no data-layer coupling: fully copy-paste portable.
 *
 * Input-aware mechanics live in `@projective/ui/fields`; composite surfaces (cards, panels, feed)
 * in `@projective/ui`. Prefer importing atoms from here rather than the `@projective/ui` barrel so
 * bundles stay lean and the dependency intent stays explicit.
 */
export * from './src/components/button/index.ts';
export * from './src/components/icon/index.ts';
export * from './src/components/badge/index.ts';
export * from './src/components/ripple/index.ts';
export * from './src/components/progress/index.ts';
export * from './src/components/taglist/index.ts';
export * from './src/components/media/index.ts';
export * from './src/components/theme/index.ts';
export * from './src/ThemeSwitcher.ts';
export * from './src/components/Logo.tsx';
