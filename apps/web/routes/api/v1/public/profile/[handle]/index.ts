/**
 * @file index.ts
 * @description API Route Handler for fetching core profile data.
 * GET /api/v1/public/profile/:handle
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProfileBackendService } from '@features/public/profile/services/ProfileServiceBackend.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const handle = ctx.params.handle;
		console.log(`[API] Fetching profile for handle: ${handle}`);

		if (!handle) {
			return new Response(JSON.stringify({ error: { message: 'Profile handle is required' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			// Dependency injection for testability and RLS propagation
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProfileBackendService.getProfileCore(handle, { getClient });

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error?.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
				},
			});
		} catch (e: unknown) {
			console.error('[API] /profile/[handle] Error:', e);
			return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
