/**
 * @file index.ts
 * @description API Controller for updating (moving/claiming) and deleting individual tickets.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
import { UpdateTicketRequestSchema } from 'packages/types/src/entities/projects/request.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Updates an existing ticket (e.g., column movement, status change).
	 */
	async PATCH(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const body = await ctx.req.json();

			const validation = UpdateTicketRequestSchema.safeParse(body);
			if (!validation.success) {
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					},
				);
			}

			const updatedTicket = await TicketsServiceBackend.updateTicket(
				projectid,
				ticketid,
				validation.data,
			);

			return new Response(JSON.stringify(updatedTicket), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] PATCH Ticket Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to update ticket' }), {
				status: 500,
			});
		}
	},

	/**
	 * @description Deletes a ticket, initiating escrow refunds if applicable via the backend service.
	 */
	async DELETE(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			await TicketsServiceBackend.deleteTicket(projectid, ticketid);
			return new Response(null, { status: 204 });
		} catch (err: any) {
			console.error('[API] DELETE Ticket Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to delete ticket' }), {
				status: 500,
			});
		}
	},
});
