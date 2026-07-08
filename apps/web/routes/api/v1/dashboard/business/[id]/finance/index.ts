import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getBusinessFinance } from '@features/dashboard/overview/services/BusinessOverviewServiceBackend.ts';

/**
 * GET /api/v1/dashboard/business/:id/finance
 * Live finance snapshot (balances + ledger lines + escrow allocations) read straight from the
 * Postgres ledger engine via `org.get_business_finance`. Powers the admin dashboard's finance hub
 * (US-008 AC3); refetched by the island whenever escrow is held or released.
 */
export const handler = define.handlers({
	async GET(ctx) {
		try {
			const businessId = ctx.params.id;
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getBusinessFinance(businessId, { getClient });

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
			console.error('Business finance API error:', err);
			return new Response(JSON.stringify({ error: 'Failed to load business finance' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
