/* #region Imports */
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getFiles } from '@server/dashboard/comms/getFiles.ts';
/* #endregion */

/* #region Route Handler */
export const handler = define.handlers({
	/**
	 * @function GET
	 * @description Retrieves a paginated and filterable list of files shared within a specific channel.
	 */
	async GET(ctx) {
		const { channelid } = ctx.params;
		const url = new URL(ctx.req.url);

		const start = parseInt(url.searchParams.get('start') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '30');
		const countOnly = url.searchParams.get('countOnly') === 'true';
		const type = (url.searchParams.get('type') || 'channel') as 'dm' | 'channel';
		const category = url.searchParams.get('category') || 'all';
		const search = url.searchParams.get('search') || '';

		if (type !== 'dm' && type !== 'channel') {
			return new Response(JSON.stringify({ error: 'Invalid type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve(
					// deno-lint-ignore no-explicit-any
					(ctx.state as any).supabaseClient ?? supabaseClient(ctx.req),
				);

			const res = await getFiles(
				channelid,
				{
					start,
					limit,
					countOnly,
					type,
					category,
					search,
				},
				{
					getClient,
				},
			);

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('[API Error] Failed to fetch channel files:', err);
			return new Response(
				JSON.stringify({ error: 'Failed to fetch files' }),
				{ status: 500, headers: { 'Content-Type': 'application/json' } },
			);
		}
	},
});
/* #endregion */
