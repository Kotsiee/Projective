import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { AuthBackendService } from '@features/shared/services/profile/AuthServiceBackend.ts';
import { getDashboardBusinesses } from '@features/dashboard/business/services/getBusinesses.ts';
import { DashboardBusiness } from '@features/dashboard/business/contracts/Business.ts';
import BusinessWorkspace from '@features/dashboard/business/islands/BusinessWorkspace.island.tsx';

/**
 * Businesses space — an ultra-premium 70/30 operational workspace. The roster + overview
 * are hydrated by the `BusinessWorkspace` island; data is resolved server-side here so the
 * layout paints instantly. Any load failure (e.g. no live DB) degrades to an empty roster.
 */
export default define.page(async function BusinessPage(ctx) {
	// deno-lint-ignore no-explicit-any
	const state = ctx.state as any;
	const getClient = () => Promise.resolve(state.supabaseClient ?? supabaseClient(ctx.req));

	let businesses: DashboardBusiness[] = [];
	let activeId: string | null = null;

	try {
		const [me, list] = await Promise.all([
			AuthBackendService.getMe({ getClient }),
			getDashboardBusinesses(
				{ search: '', sortBy: 'created_at', sortDir: 'desc', limit: 50, offset: 0 },
				{ getClient },
			),
		]);
		if (me.ok && me.data) activeId = me.data.activeProfileId ?? null;
		if (list.ok && list.data?.items) businesses = list.data.items;
	} catch (err) {
		console.error('[business] load failed:', err);
	}

	return <BusinessWorkspace initialBusinesses={businesses} activeId={activeId} />;
});
