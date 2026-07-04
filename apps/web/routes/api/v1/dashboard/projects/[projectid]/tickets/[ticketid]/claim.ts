/**
 * @file claim.ts
 * @description API Controller for a freelancer claiming a ticket. Delegates to the backend
 * service, which holds escrow immediately on claim (spec §2A escrow lifecycle).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Claims a ticket for the requesting (or supplied) freelancer and holds escrow.
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const body = await ctx.req.json().catch(() => ({}));

			// Prefer the authenticated user; allow an explicit assignee for team/admin flows.
			let assigneeId: string | undefined = body.assignee_id;
			if (!assigneeId) {
				const supabase = (ctx.state as any).supabaseClient;
				const user = supabase ? (await supabase.auth.getUser()).data.user : null;
				assigneeId = user?.id;
			}

			if (!assigneeId) {
				return new Response(JSON.stringify({ error: 'Assignee could not be resolved.' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const result = await TicketsServiceBackend.claimTicket(
				projectid,
				ticketid,
				assigneeId,
				ctx.req,
			);

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Ticket Claim Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to claim ticket' }), {
				status: 500,
			});
		}
	},
});
