/**
 * @file useQuickLinks.ts
 * @description Lazy, self-refreshing data source for a sidebar quick-link submenu. Two performance
 * guarantees drive the design:
 *
 *  1. **Nav hydration stays cheap.** The reel is *never* fetched on mount — only the first time its
 *     submenu is actually opened (`enabled` flips true). So adding these submenus adds zero network
 *     work to the global navigation's hydration path.
 *  2. **No stale reels across SPA nav.** The nav island is persistent (it doesn't remount on client
 *     navigation), so an already-opened reel would otherwise keep its first snapshot forever. After
 *     the first load we silently revalidate on `onNavigate`, matching the persistent-region pattern
 *     used elsewhere (e.g. `useWorkspaceProjects`).
 */

import { onNavigate } from '@projective/data';
import { type Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { QuickLinkItem, QuickLinkSource } from '../contracts/quicklinks.ts';
import { QuickLinksService } from '../services/QuickLinksService.ts';

export interface QuickLinksState {
	items: Signal<QuickLinkItem[]>;
	loading: Signal<boolean>;
	error: Signal<string | null>;
	loadedOnce: Signal<boolean>;
}

export function useQuickLinks(source: QuickLinkSource, enabled: boolean): QuickLinksState {
	const items = useSignal<QuickLinkItem[]>([]);
	const loading = useSignal(false);
	const error = useSignal<string | null>(null);
	const loadedOnce = useSignal(false);

	const load = async (opts?: { silent?: boolean }) => {
		if (!opts?.silent) loading.value = true;
		try {
			items.value = await QuickLinksService.list(source);
			loadedOnce.value = true;
			error.value = null;
		} catch (_err) {
			if (!opts?.silent) error.value = 'Unavailable';
		} finally {
			if (!opts?.silent) loading.value = false;
		}
	};

	// Lazy first load — deferred until the submenu opens, so nav hydration pays nothing for it.
	useEffect(() => {
		if (enabled && !loadedOnce.value && !loading.value) load();
	}, [enabled]);

	// Silent revalidation on client navigation, but only once the reel has been opened at least once.
	useEffect(() =>
		onNavigate(() => {
			if (loadedOnce.value) load({ silent: true });
		}), []);

	return { items, loading, error, loadedOnce };
}
