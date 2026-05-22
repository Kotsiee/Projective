import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { ViewService } from '../services/ViewService.ts';

// #region 1. TYPES & INTERFACES
export type ViewEntityType =
	| 'project'
	| 'service'
	| 'person'
	| 'business'
	| 'team'
	| 'product'
	| 'article';
export type ViewTab = 'overview' | 'reviews' | 'members' | 'stages' | 'files';

export interface ViewState {
	entityType: Signal<ViewEntityType | null>;
	entityId: Signal<string | null>;
	activeTab: Signal<ViewTab>;
	isLoading: Signal<boolean>;
	hasError: Signal<boolean>;
	// deno-lint-ignore no-explicit-any
	data: Signal<any | null>;
	displayData: Signal<{ banner: string | null; avatar: string | null; fallback: string }>;
}

export interface ViewProviderProps {
	initialType?: ViewEntityType;
	initialId?: string;
	initialTab?: ViewTab;
	children: ComponentChildren;
}
// #endregion

// #region 2. CONTEXT INITIALIZATION
const ViewContext = createContext<ViewState | null>(null);
// #endregion

/**
 * @function ViewProvider
 * @description Manages the localized state for a specific entity view page.
 * Hydrates from URL params and automatically fetches the required entity data.
 */
export function ViewProvider(props: ViewProviderProps) {
	// #region 3. SIGNAL INSTANTIATION
	const entityType = useSignal<ViewEntityType | null>(props.initialType || null);
	const entityId = useSignal<string | null>(props.initialId || null);
	const activeTab = useSignal<ViewTab>(props.initialTab || 'overview');
	const isLoading = useSignal<boolean>(true);
	const hasError = useSignal<boolean>(false);
	// deno-lint-ignore no-explicit-any
	const data = useSignal<any | null>(null);
	// #endregion

	// #region 4. HYDRATION (On Mount)
	useEffect(() => {
		if (typeof globalThis === 'undefined') return;

		const url = new URL(globalThis.location.href);

		// Extract type from path: e.g., /view/project -> project
		const pathSegments = url.pathname.split('/').filter(Boolean);
		const viewIndex = pathSegments.indexOf('view');

		if (viewIndex !== -1 && pathSegments.length > viewIndex + 1) {
			const typeFromPath = pathSegments[viewIndex + 1] as ViewEntityType;
			if (!entityType.value) entityType.value = typeFromPath;
		}

		// Extract ID from query
		const idFromUrl = url.searchParams.get('id');
		if (idFromUrl && !entityId.value) {
			entityId.value = idFromUrl;
		}

		// Extract Tab from query
		const tabFromUrl = url.searchParams.get('tab') as ViewTab | null;
		if (tabFromUrl) {
			activeTab.value = tabFromUrl;
		}
	}, []);
	// #endregion

	const displayData = useComputed(() => {
		if (!data.value) return { banner: null, avatar: null, fallback: '?' };

		let banner = null;
		let avatar = null;
		let fallback = '?';

		if (
			entityType.value === 'project' ||
			entityType.value === 'service' ||
			entityType.value === 'product'
		) {
			banner = data.value.owner?.banner?.original || data.value.owner?.banner_url;
			avatar = data.value.owner?.avatar?.original || data.value.owner?.avatar_url;
			fallback = data.value.owner?.name?.charAt(0) || '?';
		} else {
			banner = data.value.banner?.original || data.value.banner_url;
			avatar = data.value.avatar?.original || data.value.avatar_url;
			fallback = (data.value.name || data.value.display_title || '?').charAt(0);
		}

		return { banner, avatar, fallback: fallback.toUpperCase() };
	});

	// #region 5. DATA FETCHING
	useEffect(() => {
		if (!entityType.value || !entityId.value) {
			isLoading.value = false;
			return;
		}

		// Reset state before fetching
		isLoading.value = true;
		hasError.value = false;
		data.value = null;

		const abortController = new AbortController();

		const fetchData = async () => {
			try {
				// We cast entityType to 'project' to satisfy the strict TS overload in ViewService for now.
				// When you add more services, you can expand this typing.
				const res = await ViewService.getView(entityType.value as 'project', entityId.value!);

				if (!abortController.signal.aborted) {
					data.value = res;
					isLoading.value = false;
				}
			} catch (err) {
				console.error('[ViewContext] Failed to fetch entity data:', err);
				if (!abortController.signal.aborted) {
					hasError.value = true;
					isLoading.value = false;
				}
			}
		};

		fetchData();

		// Cleanup prevents race conditions if the user rapidly changes the URL ID
		return () => {
			abortController.abort();
		};
	}, [entityType.value, entityId.value]);
	// #endregion

	// #region 6. URL SYNCING
	useEffect(() => {
		if (typeof globalThis === 'undefined') return;

		const url = new URL(globalThis.location.href);

		if (activeTab.value !== 'overview') {
			url.searchParams.set('tab', activeTab.value);
		} else {
			url.searchParams.delete('tab');
		}

		globalThis.history.replaceState({}, '', url.toString());
	}, [activeTab.value]);
	// #endregion

	return (
		<ViewContext.Provider
			value={{
				entityType,
				entityId,
				activeTab,
				isLoading,
				hasError,
				data,
				displayData,
			}}
		>
			{props.children}
		</ViewContext.Provider>
	);
}

/**
 * @function useViewContext
 * @description Hook to consume the ViewContext state.
 * @throws {Error} If used outside of ViewProvider.
 */
export function useViewContext(): ViewState {
	const ctx = useContext(ViewContext);
	if (!ctx) {
		throw new Error('useViewContext must be used within a ViewProvider boundary');
	}
	return ctx;
}
