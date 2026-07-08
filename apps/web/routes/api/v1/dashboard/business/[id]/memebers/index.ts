import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getBusinessMembers } from '@features/dashboard/overview/services/BusinessOverviewServiceBackend.ts';

/**
 * GET /api/v1/dashboard/business/:id/members
 * Organization member roster with roles + seat state (US-008 AC5). Avatars are resolved to public
 * URLs server-side. Access is guarded inside `org.get_business_members` (active members only).
 */
export const handler = define.handlers({
	async GET(ctx) {
		try {
			const businessId = ctx.params.id;
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getBusinessMembers(businessId, { getClient });

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
			console.error('Business members API error:', err);
			return new Response(JSON.stringify({ error: 'Failed to load members' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
