/**
 * @file index.tsx
 * @description The independent Services management suite (`/services`) — an executive dashboard for
 * freelancers and teams to create listings, edit pricing tiers, and manage active services, with an
 * analytics sub-section. NOT a project workspace. Data flows Route → Service (server) → `initialData`
 * prop → island (apps/web/CLAUDE.md). Persona visibility of the nav entry is enforced in the sidebar
 * (`requires: 'freelancer'`); the page itself is reachable by direct link but renders the same
 * freelancer/team-oriented suite.
 */

import { define } from '@utils';
import ServicesDashboard from '@features/dashboard/services/islands/ServicesDashboard.island.tsx';
import { ServicesServiceBackend } from '@features/dashboard/services/services/ServicesServiceBackend.ts';
import type { ServicesOverview } from '@features/dashboard/services/contracts/services.ts';

export default define.page(async function ServicesPage() {
	let overview: ServicesOverview | null = null;
	try {
		overview = await ServicesServiceBackend.getServicesOverview();
	} catch (err) {
		console.error('[services] overview load failed:', err);
	}

	return <ServicesDashboard initialData={overview} />;
});
