/**
 * @file ServicesDashboard.island.tsx
 * @description Root island for the `/services` management suite. Seeds its listings signal from the
 * server-resolved `initialData` (Route → Service → props → signals), then owns the interactive
 * surface: the executive hero, the analytics sub-section (charts), the listings manager, and the
 * create/edit tier modal. Mutations are optimistic against the signal today (frontend seed); wiring
 * them to a `ServicesService` client later is a drop-in — the handlers already localise every write.
 */

import '../styles/components/services-dashboard.css';
import { useSignal } from '@preact/signals';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import type { ServiceListing, ServicesOverview } from '../contracts/services.ts';
import { formatMoney } from '../contracts/services.ts';
import ServicesHero from '../components/ServicesHero.tsx';
import ServiceAnalyticsPanel from '../components/ServiceAnalyticsPanel.tsx';
import ServiceListingsManager from '../components/ServiceListingsManager.tsx';
import ServiceTierEditor from '../components/ServiceTierEditor.tsx';

const EMPTY_OVERVIEW: ServicesOverview = {
	currency: 'USD',
	listings: [],
	analytics: { currency: 'USD', kpis: [], pipelineSeries: [], performance: [], categories: [] },
};

export default function ServicesDashboard(
	{ initialData }: { initialData: ServicesOverview | null },
) {
	const overview = initialData ?? EMPTY_OVERVIEW;
	const { user } = useUserContext();

	// Listings are the only mutable surface; analytics is a static server snapshot.
	const listings = useSignal<ServiceListing[]>(overview.listings);

	// Editor modal — create (editing=null) or edit an existing listing.
	const editorOpen = useSignal(false);
	const editing = useSignal<ServiceListing | null>(null);

	const openCreate = () => {
		editing.value = null;
		editorOpen.value = true;
	};
	const openEdit = (listing: ServiceListing) => {
		editing.value = listing;
		editorOpen.value = true;
	};
	const closeEditor = () => (editorOpen.value = false);

	const saveListing = (next: ServiceListing) => {
		const exists = listings.value.some((l) => l.id === next.id);
		listings.value = exists
			? listings.value.map((l) => (l.id === next.id ? next : l))
			: [next, ...listings.value];
		editorOpen.value = false;
	};

	const toggleStatus = (id: string) => {
		listings.value = listings.value.map((l) =>
			l.id === id ? { ...l, status: l.status === 'active' ? 'paused' : 'active' } : l
		);
	};

	const activeCount = listings.value.filter((l) => l.status === 'active').length;
	const openPipelineCents = listings.value
		.filter((l) => l.status === 'active')
		.reduce((sum, l) => sum + l.stats.pipelineValueCents, 0);

	return (
		<div class='svc'>
			<ServicesHero
				displayName={user.value?.displayName ?? null}
				listingCount={listings.value.length}
				activeCount={activeCount}
				pipelineLabel={formatMoney(openPipelineCents, overview.currency, true)}
				onCreate={openCreate}
			/>

			<ServiceAnalyticsPanel analytics={overview.analytics} />

			<ServiceListingsManager
				listings={listings.value}
				currency={overview.currency}
				onEdit={openEdit}
				onToggleStatus={toggleStatus}
				onCreate={openCreate}
			/>

			{editorOpen.value && (
				<ServiceTierEditor
					open={editorOpen.value}
					listing={editing.value}
					currency={overview.currency}
					onClose={closeEditor}
					onSave={saveListing}
				/>
			)}
		</div>
	);
}
