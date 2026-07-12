/**
 * @file index.ts
 * @description `GET /api/v1/home/feed?persona=&offset=` — streams one mixed-media page of the `/home`
 * feed for infinite scroll. Thin by design (see apps/web/CLAUDE.md): it parses + clamps the query,
 * auth-guards, and delegates all assembly to `HomeFeedServiceBackend`. Offset is bounded so the
 * "infinite" feed can never be driven into a runaway loop.
 */

import { define } from '@utils';
import { getAuthCookies, supabaseClient } from '@projective/backend';
import type { Persona } from '@projective/types';
import { HomeFeedServiceBackend } from '@features/dashboard/home/services/HomeFeedServiceBackend.ts';

const MAX_OFFSET = 32;

function json(body: unknown, status: number, cache = 'no-store'): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': cache,
		},
	});
}

export const handler = define.handlers({
	async GET(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) return json({ error: { code: 'unauthorized' } }, 401);

		const url = new URL(ctx.req.url);
		const persona: Persona = url.searchParams.get('persona') === 'freelancer'
			? 'freelancer'
			: 'client';

		const rawOffset = Number(url.searchParams.get('offset') ?? '1');
		const offset = Number.isFinite(rawOffset)
			? Math.max(0, Math.min(MAX_OFFSET, Math.trunc(rawOffset)))
			: 1;

		const page = await HomeFeedServiceBackend.getFeedPage(persona, offset, {
			getClient: async () => await supabaseClient(ctx.req),
		});

		return json(page, 200, 'private, max-age=30');
	},
});
