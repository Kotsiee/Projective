/**
 * @file QuickLinksService.ts
 * @description Client-side data access for the sidebar quick-link submenus. Islands are dumb — they
 * never touch Supabase; this wraps the internal `/api/v1/navigation/quick-links` route (which today
 * returns frontend seed). Throws on a non-OK response so the caller can surface an inline error.
 */

import type { QuickLinkItem, QuickLinkSource } from '../contracts/quicklinks.ts';

export class QuickLinksService {
	static async list(source: QuickLinkSource, signal?: AbortSignal): Promise<QuickLinkItem[]> {
		const res = await fetch(`/api/v1/navigation/quick-links?source=${source}`, { signal });
		if (!res.ok) throw new Error(`quick-links ${source}: ${res.status}`);
		const data = await res.json();
		return Array.isArray(data) ? data as QuickLinkItem[] : [];
	}
}
