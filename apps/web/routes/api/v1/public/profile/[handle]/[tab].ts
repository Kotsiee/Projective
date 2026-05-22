/**
 * @file [tab].ts
 * @description API Route Handler for fetching paginated tab content for a profile.
 * GET /api/v1/public/profile/:handle/:tab
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProfileBackendService } from '@features/public/profile/services/ProfileServiceBackend.ts';
import { ProfileTab } from '@features/public/profile/contracts/Profile.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const handle = ctx.params.handle;
		const tab = ctx.params.tab as ProfileTab;
		const url = new URL(ctx.req.url);

		if (!handle || !tab) {
			return new Response(JSON.stringify({ error: { message: 'Handle and Tab are required' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const params = {
			limit: parseInt(url.searchParams.get('limit') || '20', 10),
			offset: parseInt(url.searchParams.get('offset') || '0', 10),
			filter: url.searchParams.get('filter') || undefined,
		};

		try {
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProfileBackendService.getProfileTab(handle, tab, params, { getClient });

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error?.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (e: unknown) {
			console.error(`[API] /profile/[handle]/${tab} Error:`, e);
			return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
