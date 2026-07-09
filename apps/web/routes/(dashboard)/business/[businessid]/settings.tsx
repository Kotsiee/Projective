/**
 * @file settings.tsx
 * @description Business Profile Management (US-008 AC2) — server route controller. Loads the admin
 * profile for `:businessid` on the server via `getBusinessAdminProfile` (the `org.*` RPC enforces
 * owner/admin access), then renders the header + deferred card as server components and hands the
 * profile to the atomic `BusinessProfileForm` island as props. No client-side fetch on mount.
 */

import { define } from '@utils';
import { Partial } from 'fresh/runtime';
import { supabaseClient } from '@projective/backend';
import { getBusinessAdminProfile } from '@features/dashboard/business/services/update.ts';
import {
	BusinessSettingsError,
	BusinessSettingsView,
} from '@features/dashboard/business/components/settings/BusinessSettingsView.tsx';

export default define.page(async function BusinessSettingsRoute(ctx) {
	const businessId = ctx.params.businessid;
	const getClient = () => supabaseClient(ctx.req);

	const res = await getBusinessAdminProfile(businessId, { getClient });

	const body = res.ok
		? <BusinessSettingsView businessId={businessId} profile={res.data} />
		: <BusinessSettingsError message={res.error?.message} />;

	return (
		<div class='bsettings-root' {...{ 'f-client-nav': true }}>
			<Partial name='business-settings'>
				{body}
			</Partial>
		</div>
	);
});
