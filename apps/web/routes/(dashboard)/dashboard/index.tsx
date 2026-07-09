/**
 * @file index.tsx
 * @description Business Administration & Financial Overview (US-008) — server route controller.
 *
 * State flows one way (see apps/web/CLAUDE.md): this route resolves the active business and reads
 * the live finance snapshot + member roster on the *server* (straight from the Postgres ledger
 * engine via the backend Services), then renders the whole page as static server components. The
 * only things that hydrate on the client are the atomic `RefreshButton` and `FinanceChart` islands.
 *
 * The body is wrapped in a `dashboard-overview` Fresh Partial inside an `f-client-nav` region, so
 * the Refresh control re-runs this controller and swaps just the Partial — the numbers move as
 * escrow is held or released with zero client-side data fetching.
 */

import { define } from '@utils';
import { Partial } from 'fresh/runtime';
import { supabaseClient } from '@projective/backend';
import { AuthBackendService } from '@features/shared/services/profile/AuthServiceBackend.ts';
import {
	getBusinessFinance,
	getBusinessMembers,
} from '@features/dashboard/overview/services/BusinessOverviewServiceBackend.ts';
import {
	DashboardEmpty,
	DashboardError,
	DashboardView,
} from '@features/dashboard/overview/components/DashboardView.tsx';

export default define.page(async function Dashboard(ctx) {
	const getClient = () => supabaseClient(ctx.req);

	// Resolve the authenticated user + active business server-side (same payload the header uses).
	const me = await AuthBackendService.getMe({ getClient });
	const profile = me.ok ? me.data : null;

	let body;
	if (!profile || profile.activeProfileType !== 'business' || !profile.activeProfileId) {
		body = <DashboardEmpty />;
	} else {
		const businessId = profile.activeProfileId;
		const [finance, members] = await Promise.all([
			getBusinessFinance(businessId, { getClient }),
			getBusinessMembers(businessId, { getClient }),
		]);

		if (!finance.ok) {
			body = <DashboardError />;
		} else {
			const businessName = profile.businesses.find((b) => b.id === businessId)?.name ??
				profile.displayName ?? 'Your business';
			body = (
				<DashboardView
					finance={finance.data}
					members={members.ok ? members.data : []}
					businessName={businessName}
					settingsHref={`/business/${businessId}/settings`}
				/>
			);
		}
	}

	return (
		<div class='overview-root' {...{ 'f-client-nav': true }}>
			<Partial name='dashboard-overview'>
				{body}
			</Partial>
		</div>
	);
});
