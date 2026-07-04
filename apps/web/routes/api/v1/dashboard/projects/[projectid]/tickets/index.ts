/**
 * @file index.ts
 * @description API Controller for fetching all tickets within a project and creating new ones.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
import { CreateTicketRequestSchema } from '@projective/types';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Fetches all tickets for a given project.
	 */
	async GET(ctx) {
		const project_id = ctx.params.projectid;

		if (!project_id) {
			return new Response(JSON.stringify({ error: 'Project ID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));
			const supabase = await getClient();

			const { data, error } = await supabase
				.schema('projects')
				.from('tickets')
				.select('*')
				.eq('project_id', project_id)
				.order('created_at', { ascending: true });

			if (error) {
				console.error('[API] GET Tickets DB Error:', error);
				return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
			}

			return new Response(JSON.stringify(data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] GET Tickets Error:', err);
			return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), { status: 500 });
		}
	},

	/**
	 * @description Creates a new ticket within the project backlog.
	 */
	async POST(ctx) {
		const project_id = ctx.params.projectid;

		try {
			const body = await ctx.req.json();
			const payload = { ...body, project_id };

			const validation = CreateTicketRequestSchema.safeParse(payload);
			if (!validation.success) {
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					},
				);
			}

			const newTicket = await TicketsServiceBackend.createTicket(
				project_id,
				validation.data,
				ctx.req,
			);

			return new Response(JSON.stringify(newTicket), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Ticket Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to create ticket' }), {
				status: 500,
			});
		}
	},
});
