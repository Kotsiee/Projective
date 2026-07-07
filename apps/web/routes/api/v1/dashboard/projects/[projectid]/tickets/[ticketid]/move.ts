/**
 * @file move.ts
 * @description API Controller for Kanban column transitions (spec §3 "Automated Kanban State
 * Synchronization"). Thin route: parse + validate + delegate to `move_ticket` via the service.
 *
 * Structural behaviour lives in SQL (0121): moving into "Review" auto-generates a submission ledger
 * row; moving into "Done" requires client/owner review authority and confirms milestone delivery
 * (escrow settles through the existing sync trigger).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { z } from 'zod';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

const MoveTicketSchema = z.object({
	status: z.enum([
		'backlog',
		'todo',
		'claimed',
		'in_progress',
		'in_review',
		'completed',
		'cancelled',
	]),
	stageId: z.string().uuid().optional().nullable(),
});

export const handler = define.handlers({
	/**
	 * @description Moves a ticket to a new board column (and optionally a new stage).
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;
		const startedAt = Date.now();

		try {
			const body = await ctx.req.json();
			const validation = MoveTicketSchema.safeParse(body);
			if (!validation.success) {
				console.warn(
					`[KANBAN_API] POST move validation failed project=${projectid} ticket=${ticketid} issues=${
						JSON.stringify(validation.error.flatten())
					}`,
				);
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			console.log(
				`[KANBAN_API] POST move begin ts=${
					new Date().toISOString()
				} project=${projectid} ticket=${ticketid} to=${validation.data.status} stage=${
					validation.data.stageId ?? '-'
				}`,
			);

			const updated = await TicketsServiceBackend.moveTicket(
				projectid,
				ticketid,
				validation.data.status,
				validation.data.stageId ?? null,
				ctx.req,
			);

			console.log(
				`[KANBAN_API] POST move ok project=${projectid} ticket=${ticketid} to=${validation.data.status} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(updated), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[KANBAN_API] POST move ERROR project=${projectid} ticket=${ticketid} msg=${err?.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501' || err?.code === '23514';
			return new Response(JSON.stringify({ error: err.message || 'Failed to move ticket' }), {
				status: isGuard ? 422 : 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
