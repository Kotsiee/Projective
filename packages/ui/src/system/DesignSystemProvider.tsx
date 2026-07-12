import { ComponentChildren, createContext, JSX } from 'preact';
import { useContext, useMemo } from 'preact/hooks';

/**
 * @module DesignSystemProvider
 * @description The Preact context engine behind the Projective design system. It lets any app, page
 * or subtree override the system's structural knobs (density, radius, accent, motion, surface level)
 * WITHOUT touching component code. The provider stamps `data-ds-*` attributes onto a wrapper element;
 * the CSS in `apps/web/styles/themes/variables/system.css` re-scopes the design tokens for everything
 * beneath it, so overrides flow purely through the cascade (no per-component prop drilling).
 *
 * Nesting is hierarchical: a nested provider merges over its parent's config, so a `compact`
 * settings panel can live inside a `comfortable` app, and a `violet` social surface inside a `teal`
 * workspace. Components read the resolved config with {@link useDesignSystem} to compute modifier
 * classes or fallback styles based on their placement.
 *
 * Zero external dependencies (preact only) — part of the copy-paste-portable `@projective/ui` core.
 */

/** Control heights + padding density. Comfortable is the default; compact/spacious re-scale. */
export type DsDensity = 'comfortable' | 'compact' | 'spacious';
/** Whole-ladder radius character. Standard is the default; sharp (Carbon) / soft (Material). */
export type DsRadius = 'standard' | 'sharp' | 'soft';
/** Brand accent lane the subtree paints with. */
export type DsAccent = 'teal' | 'violet' | 'ocean';
/** Motion budget. `reduced` collapses every transition for the subtree. */
export type DsMotion = 'full' | 'reduced';
/** Hierarchical surface level — drives the default surface token + concentric nesting. */
export type DsSurface = 0 | 1 | 2 | 'card';

export interface DesignSystemConfig {
	density: DsDensity;
	radius: DsRadius;
	accent: DsAccent;
	motion: DsMotion;
	surface: DsSurface;
}

/** The system defaults — a comfortable, standard-radius, teal, full-motion, ground-surface baseline. */
export const DEFAULT_DESIGN_SYSTEM: DesignSystemConfig = {
	density: 'comfortable',
	radius: 'standard',
	accent: 'teal',
	motion: 'full',
	surface: 0,
};

/** Maps a hierarchical surface level to the CSS surface token a subtree should paint with. */
const SURFACE_TOKEN: Record<string, string> = {
	'0': 'var(--surface-0)',
	'1': 'var(--surface-1)',
	'2': 'var(--surface-2)',
	'card': 'var(--surface-card)',
};

const DesignSystemContext = createContext<DesignSystemConfig>(DEFAULT_DESIGN_SYSTEM);

export interface DesignSystemProviderProps extends Partial<DesignSystemConfig> {
	children: ComponentChildren;
	className?: string;
	/** Escape hatch: raw CSS custom properties to set on the provider element (e.g. `{ '--primary-hue': '258' }`). */
	vars?: Record<string, string>;
	style?: JSX.CSSProperties;
}

/**
 * Wraps a subtree in a resolved design-system configuration. Renders a `display:contents` element
 * (see `.pjv-ds` in system.css) so it never disturbs layout while still setting the inherited
 * `data-ds-*` scope + any `vars` overrides.
 */
export function DesignSystemProvider(props: DesignSystemProviderProps): JSX.Element {
	const parent = useContext(DesignSystemContext);
	const { children, className, vars, style, density, radius, accent, motion, surface } = props;

	// Child overrides win over the inherited parent config (hierarchical placement).
	const config = useMemo<DesignSystemConfig>(() => ({
		density: density ?? parent.density,
		radius: radius ?? parent.radius,
		accent: accent ?? parent.accent,
		motion: motion ?? parent.motion,
		surface: surface ?? parent.surface,
	}), [parent, density, radius, accent, motion, surface]);

	const mergedStyle = { ...(vars as JSX.CSSProperties | undefined), ...style };

	return (
		<DesignSystemContext.Provider value={config}>
			<div
				class={['pjv-ds', className].filter(Boolean).join(' ')}
				data-ds-density={config.density}
				data-ds-radius={config.radius}
				data-ds-accent={config.accent}
				data-ds-motion={config.motion === 'reduced' ? 'reduced' : undefined}
				data-ds-surface={String(config.surface)}
				style={mergedStyle}
			>
				{children}
			</div>
		</DesignSystemContext.Provider>
	);
}

export interface DesignSystemHandle extends DesignSystemConfig {
	/** The CSS surface token this subtree should paint backgrounds with. */
	surfaceToken: string;
	/** True when motion is collapsed — gate JS-driven animations on this. */
	isReduced: boolean;
	/**
	 * Append the active config as BEM-style modifier classes to a base class, so a component can
	 * react structurally to its placement, e.g. `modifier('card') → 'card card--d-compact card--r-sharp'`.
	 */
	modifier: (base: string) => string;
}

/**
 * Read the resolved design-system config for the current subtree, plus a few computed helpers.
 * Components call this to compute modifier classes / fallback styles based on hierarchical placement.
 */
export function useDesignSystem(): DesignSystemHandle {
	const config = useContext(DesignSystemContext);
	return useMemo<DesignSystemHandle>(() => ({
		...config,
		surfaceToken: SURFACE_TOKEN[String(config.surface)] ?? SURFACE_TOKEN['0'],
		isReduced: config.motion === 'reduced',
		modifier: (base: string) =>
			`${base} ${base}--d-${config.density} ${base}--r-${config.radius} ${base}--a-${config.accent}`,
	}), [config]);
}
