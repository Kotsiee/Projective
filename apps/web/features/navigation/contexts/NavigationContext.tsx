// deno-lint-ignore-file no-explicit-any
import { ComponentChildren, ComponentType, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { ReadonlySignal, Signal, useComputed, useSignal } from '@preact/signals';

// #region Middle-rail drag bounds + density thresholds
/**
 * Drag/clamp bounds and density snap thresholds for the contextual middle-navigation
 * rail. These MUST stay in lock-step with their CSS-token twins in
 * `apps/web/styles/themes/variables/ui.css` (`--middle-side-min`,
 * `--middle-side-collapsed-max`, `--middle-side-intermediate-max`, `--middle-side-max`)
 * so the JS-computed density matches what the stylesheet renders.
 */
export const MIDDLE_SIDE_MIN = 64;
export const MIDDLE_SIDE_MAX = 460;
export const DENSITY_COLLAPSED_MAX = 132;
export const DENSITY_INTERMEDIATE_MAX = 232;

export type MiddleDensity = 'none' | 'collapsed' | 'intermediate' | 'expanded';

/** Parse a CSS length string like `"300px"` to a plain pixel number (0 on failure). */
function parsePx(len: string | undefined): number {
	if (!len) return 0;
	const n = parseFloat(len);
	return Number.isFinite(n) ? n : 0;
}
// #endregion

// #region 1. Provider Definitions
export interface DynamicProviderDef {
	id: string;
	component: ComponentType<any>;
	props?: Record<string, any>;
}
// #endregion

export interface MiddleNavState {
	show: boolean;
	headerHeight: string;
	footerHeight: string; // NEW
	sideWidth: string;
	headerContent?: ComponentChildren;
	sideContent?: ComponentChildren;
	footerContent?: ComponentChildren; // NEW
}

export interface NavigationState {
	isTopSideNavExpanded: Signal<boolean>;
	middleNav: Signal<MiddleNavState>;
	dynamicProviders: Signal<DynamicProviderDef[]>;
	isCustomScrollEnabled: Signal<boolean>; // NEW
	/** Effective middle-side rail width in px — the user's drag override, or the domain's declared width. */
	middleSideWidth: ReadonlySignal<number>;
	/** Discrete density stage resolved from {@link middleSideWidth} (drives the blueprint re-flow). */
	middleDensity: ReadonlySignal<MiddleDensity>;
	/** True while the Splitter gutter is being dragged (freezes width transitions for 1:1 tracking). */
	isSplitterResizing: Signal<boolean>;
	toggleTopSideNav: () => void;
	setMiddleNav: (config: Partial<MiddleNavState>) => void;
	addProvider: (id: string, component: ComponentType<any>, props?: Record<string, any>) => void;
	removeProvider: (id: string) => void;
	setCustomScrollEnabled: (enabled: boolean) => void; // NEW
	/** Clamp + apply a user-dragged rail width (px). Pass `null` to fall back to the declared width. */
	setMiddleSideWidth: (px: number | null) => void;
	setSplitterResizing: (v: boolean) => void;
}

const NavigationContext = createContext<NavigationState | null>(null);

export function NavigationProvider({ children }: { children: ComponentChildren }) {
	const getInitialSidebarState = () => {
		if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
			return globalThis.localStorage.getItem('projective_sidebar_open') === 'true';
		}
		return false;
	};
	const isCustomScrollEnabled = useSignal(false);

	const setCustomScrollEnabled = (enabled: boolean) => {
		isCustomScrollEnabled.value = enabled;
	};
	const isTopSideNavExpanded = useSignal(getInitialSidebarState());

	const middleNav = useSignal<MiddleNavState>({
		show: false,
		headerHeight: '0px',
		footerHeight: '0px', // Init
		sideWidth: '0px',
		headerContent: null,
		sideContent: null,
		footerContent: null, // Init
	});

	const dynamicProviders = useSignal<DynamicProviderDef[]>([]);

	// #region Resizable middle-rail state
	// `null` ⇒ follow the domain's declared `middleNav.sideWidth`; a number ⇒ the user has
	// dragged the Splitter and this px override wins until the next domain re-declares a width.
	const middleSideOverride = useSignal<number | null>(null);
	const isSplitterResizing = useSignal(false);

	const middleSideWidth = useComputed(() => {
		if (!middleNav.value.show) return 0;
		const declared = parsePx(middleNav.value.sideWidth);
		if (declared === 0) return 0; // domain injects no side rail (header/footer-only view)
		const override = middleSideOverride.value;
		return override == null ? declared : override;
	});

	const middleDensity = useComputed<MiddleDensity>(() => {
		const w = middleSideWidth.value;
		if (w <= 0) return 'none';
		if (w <= DENSITY_COLLAPSED_MAX) return 'collapsed';
		if (w <= DENSITY_INTERMEDIATE_MAX) return 'intermediate';
		return 'expanded';
	});

	const setMiddleSideWidth = (px: number | null) => {
		if (px == null) {
			middleSideOverride.value = null;
			return;
		}
		middleSideOverride.value = Math.round(
			Math.min(MIDDLE_SIDE_MAX, Math.max(MIDDLE_SIDE_MIN, px)),
		);
	};

	const setSplitterResizing = (v: boolean) => {
		isSplitterResizing.value = v;
	};
	// #endregion

	const addProvider = (id: string, component: ComponentType<any>, props?: Record<string, any>) => {
		if (!dynamicProviders.value.some((p) => p.id === id)) {
			dynamicProviders.value = [...dynamicProviders.value, { id, component, props }];
		}
	};

	const removeProvider = (id: string) => {
		dynamicProviders.value = dynamicProviders.value.filter((p) => p.id !== id);
	};

	const toggleTopSideNav = () => {
		const newState = !isTopSideNavExpanded.value;
		isTopSideNavExpanded.value = newState;

		if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
			globalThis.localStorage.setItem('projective_sidebar_open', String(newState));
		}
	};

	const setMiddleNav = (config: Partial<MiddleNavState>) => {
		// A domain (re)declaring its own side width is the new baseline — drop any stale drag
		// override so the rail reopens at the injecting view's intended width, not the last drag.
		if ('sideWidth' in config) middleSideOverride.value = null;
		middleNav.value = { ...middleNav.value, ...config };
	};

	return (
		<NavigationContext.Provider
			value={{
				isTopSideNavExpanded,
				middleNav,
				dynamicProviders,
				isCustomScrollEnabled,
				middleSideWidth,
				middleDensity,
				isSplitterResizing,
				toggleTopSideNav,
				setMiddleNav,
				addProvider,
				removeProvider,
				setCustomScrollEnabled,
				setMiddleSideWidth,
				setSplitterResizing,
			}}
		>
			{children}
		</NavigationContext.Provider>
	);
}

export function useNavigationContext() {
	const ctx = useContext(NavigationContext);
	if (!ctx) {
		throw new Error('useNavigationContext must be used within NavigationProvider');
	}
	return ctx;
}
