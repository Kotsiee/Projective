/**
 * @file quick-links.ts
 * @description `GET /api/v1/navigation/quick-links?source=projects|services` — returns the ordered
 * quick-link reel for a sidebar submenu (favorites first, then most-recently-updated, capped to a
 * few). Thin route: parse + validate the source, hand back the seed slice. Swap `QUICK_LINKS_SEED`
 * for a Service call when the backend lands — the shape (`QuickLinkItem[]`) is already the contract.
 */

import { define } from '@utils';
import { selectQuickLinks } from '@features/navigation/contracts/quicklinks.ts';
import { QUICK_LINKS_SEED } from '@features/navigation/data/quickLinksSeed.ts';

export const handler = define.handlers({
	GET(ctx) {
		const source = new URL(ctx.req.url).searchParams.get('source');
		if (source !== 'projects' && source !== 'services') {
			return new Response(
				JSON.stringify({ error: 'Invalid or missing `source` (projects|services)' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		const items = selectQuickLinks(QUICK_LINKS_SEED[source], 5);
		return new Response(JSON.stringify(items), {
			headers: {
				'Content-Type': 'application/json',
				// Small private cache: keeps the reel snappy without pinning a stale snapshot.
				'Cache-Control': 'private, max-age=30',
			},
		});
	},
});
