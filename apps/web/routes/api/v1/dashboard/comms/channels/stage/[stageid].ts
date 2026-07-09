import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getStageChannels } from '@features/shared/services/comms/getStageChannels.ts';

/**
 * GET /api/v1/dashboard/comms/channels/stage/[stageid]
 *
 * Lists the three scoped rooms (General / Team / Business) for a stage with a per-scope access flag,
 * and the project's protected-phase / Projective-Unlock status. Powers the stage-chat channel tabs
 * and the handover UI. Access itself is enforced by RLS + the RPC's stage-access guard.
 */
export const handler = define.handlers({
	async GET(ctx) {
		const { stageid } = ctx.params;

		try {
			const getClient = () =>
				Promise.resolve(
					(ctx.state as any).supabaseClient ?? supabaseClient(ctx.req),
				);

			const res = await getStageChannels(stageid, { getClient });

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
			console.error('[API] GET Stage Channels Error:', err);
			return new Response(
				JSON.stringify({ error: 'Failed to load stage channels' }),
				{ status: 500 },
			);
		}
	},
});
