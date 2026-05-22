/**
 * @file [entity].ts
 * @description Dynamic API Route for fetching public entity views.
 */

// #region Imports
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ViewBackendService } from '@features/public/explore/services/ViewServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);
		const entity = ctx.params.entity?.toLowerCase() || '';
		const id = url.searchParams.get('id');

		if (!id) {
			return new Response(JSON.stringify({ error: { message: 'Entity ID is required' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			// Dependency injection wrapper for the Supabase client
			// deno-lint-ignore no-explicit-any
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			// Execute the business logic through the service
			const res = await ViewBackendService.getView(entity, id, { getClient });

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
			console.error('[public/view] Execution Error:', e);
			return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
