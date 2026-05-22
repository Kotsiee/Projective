/**
 * @file results-card-list.tsx
 * @description Renders individual search result cards based on their entity_type.
 * Consumes the normalized PartialEntityResponse DTO.
 */

import { IconClockHour4, IconLanguage, IconMapPin, IconStarFilled } from '@tabler/icons-preact';
import { DateTime, PartialEntityResponse } from '@projective/types';
import { ListCard } from '@projective/ui';
import { ExploreResponses } from '../../../contracts/Explore.ts';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';

export default function ExploreSearchResultsListItem(
	{ type, data }: { type: string; data: ExploreResponses },
) {
	// The new search index normalizes everything into a PartialEntityResponse.
	// We check the entity_type property provided by the backend mapper.
	if (data.entity_type === 'project') {
		return <ExploreSearchResultsListItemProjects data={data} />;
	}

	if (data.entity_type === 'service') {
		return <ExploreSearchResultsListItemServices data={data} />;
	}

	// Fallback for people/businesses/teams
	return (
		<ListCard
			id={data.id}
			href={`/view/${data.entity_type}?id=${data.id}`}
			typeLabel={data.entity_type.toUpperCase()}
			title={data.display_title}
			subtitle={`Type: ${data.owner_type}`}
			description={data.display_description ?? ''}
			imageUrl={data.display_image_url ?? undefined}
			imageFallback={data.display_title.charAt(0)}
		/>
	);
}

// #region Item Renderers
function ExploreSearchResultsListItemProjects({ data }: { data: PartialEntityResponse }) {
	const { selectedItem } = useExploreContext();

	// Dedicated page URL (Used natively for Middle-Click / Right-Click -> New Tab)
	const projectUrl = `/view/project?id=${data.id}`;

	// Extract custom properties mapped from tags/created_at if available
	const startDate = data.created_at ? new DateTime(data.created_at).toFormat('DD MMM yyyy') : 'TBD';

	const endDate = 'TBD'; // Placeholder

	// Fallback values since PartialEntityResponse strips heavy arrays to tags
	const location = data.tags && data.tags.length > 0 ? data.tags[0] : 'Global';
	const languages = 'English';

	const mockRating = `${data.rating_average || '4.3'} (${data.rating_count || '123'})`;

	return (
		<ListCard
			id={data.id}
			href={projectUrl}
			typeLabel='PROJECT'
			title={data.display_title}
			// Fallback text if owner name isn't directly resolved in index yet
			subtitle={`Owned by ${data.owner_type}`}
			description={data.display_description ?? ''}
			imageUrl={data.display_image_url ??
				'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60'}
			imageFallback={data.display_title.charAt(0)}
			onClick={(e: MouseEvent) => {
				// 1. Let the browser handle standard link behaviors (New Tab / Context Menu)
				if (e.metaKey || e.ctrlKey || e.button === 1) return;

				// 2. Intercept left-click for the Indeed-style Master-Detail preview
				e.preventDefault();

				// 3. Silently update the URL so the exact state can be shared/copied
				const url = new URL(globalThis.location.href);
				url.searchParams.set('preview_id', data.id);
				url.searchParams.set('preview_type', 'projects');
				globalThis.history.pushState({}, '', url.toString());

				// 4. Update the context to open the preview pane immediately
				selectedItem.value = data;
			}}
			footer={
				<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
					{/* Rating */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<IconStarFilled size={18} color='var(--primary)' />
						<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{mockRating}</span>
					</div>

					{/* Timeline (Stacked Start/End) */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<IconClockHour4 size={18} color='var(--primary)' />
						<div style={{ display: 'flex', gap: '1rem' }}>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span
									style={{
										fontSize: '0.6rem',
										textTransform: 'uppercase',
										color: 'var(--text-muted)',
										fontWeight: 700,
									}}
								>
									Start
								</span>
								<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{startDate}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span
									style={{
										fontSize: '0.6rem',
										textTransform: 'uppercase',
										color: 'var(--text-muted)',
										fontWeight: 700,
									}}
								>
									End
								</span>
								<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{endDate}</span>
							</div>
						</div>
					</div>

					{/* Location */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<IconMapPin size={18} color='var(--primary)' />
						<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{location}</span>
					</div>

					{/* Languages */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<IconLanguage size={18} color='var(--primary)' />
						<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{languages}</span>
					</div>
				</div>
			}
		/>
	);
}

function ExploreSearchResultsListItemServices({ data }: { data: PartialEntityResponse }) {
	const { selectedItem } = useExploreContext();
	const serviceUrl = `/view/service?id=${data.id}`;

	return (
		<ListCard
			id={data.id}
			href={serviceUrl}
			typeLabel='SERVICE'
			title={data.display_title}
			subtitle={`By ${data.owner_type}`}
			description={data.display_description ?? ''}
			imageFallback={data.display_title.charAt(0)}
			onClick={(e: MouseEvent) => {
				if (e.metaKey || e.ctrlKey || e.button === 1) return;
				e.preventDefault();

				const url = new URL(globalThis.location.href);
				url.searchParams.set('preview_id', data.id);
				url.searchParams.set('preview_type', 'services');
				globalThis.history.pushState({}, '', url.toString());

				selectedItem.value = data;
			}}
		/>
	);
}
// #endregion
