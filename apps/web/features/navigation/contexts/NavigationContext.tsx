// deno-lint-ignore-file no-explicit-any
import { ComponentChildren, ComponentType, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';

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
	toggleTopSideNav: () => void;
	setMiddleNav: (config: Partial<MiddleNavState>) => void;
	addProvider: (id: string, component: ComponentType<any>, props?: Record<string, any>) => void;
	removeProvider: (id: string) => void;
	setCustomScrollEnabled: (enabled: boolean) => void; // NEW
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
		middleNav.value = { ...middleNav.value, ...config };
	};

	return (
		<NavigationContext.Provider
			value={{
				isTopSideNavExpanded,
				middleNav,
				dynamicProviders,
				isCustomScrollEnabled,
				toggleTopSideNav,
				setMiddleNav,
				addProvider,
				removeProvider,
				setCustomScrollEnabled,
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
