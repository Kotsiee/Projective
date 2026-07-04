/**
 * @file purchase.ts
 * @description API Controller for initializing a ticket purchase/checkout. Enforces purchase
 * eligibility (a comprehensive description must exist) and routes to the requested pathway:
 * "Buy Now", basket checkout, or intervaled corporate invoicing (spec §2A).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import {
	type PurchaseMethod,
	TicketsServiceBackend,
} from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

const VALID_METHODS: PurchaseMethod[] = ['buy_now', 'basket', 'invoice'];

export const handler = define.handlers({
	/**
	 * @description Initializes checkout for a ticket via the requested purchase pathway.
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const body = await ctx.req.json();
			const method: PurchaseMethod = body.method;

			if (!VALID_METHODS.includes(method)) {
				return new Response(
					JSON.stringify({ error: `method must be one of: ${VALID_METHODS.join(', ')}` }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const result = await TicketsServiceBackend.purchaseTicket(
				projectid,
				ticketid,
				method,
				ctx.req,
			);

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Ticket Purchase Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to purchase ticket' }), {
				status: 500,
			});
		}
	},
});
