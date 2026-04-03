import { IconClockHour4, IconLanguage, IconMapPin, IconStarFilled } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { ListCard } from '@projective/ui';
import { ProjectResponse } from '../../../contracts/ProjectResponse.ts';
import { ExploreResponses } from '../../../contracts/Explore.ts';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';

export default function ExploreSearchResultsListItem(
	{ type, data }: { type: string; data: ExploreResponses },
) {
	if (type === 'projects') {
		return <ExploreSearchResultsListItemProjects data={data as ProjectResponse} />;
	}

	return null;
}

function ExploreSearchResultsListItemProjects({ data }: { data: ProjectResponse }) {
	const { selectedItem } = useExploreContext();

	// Dedicated page URL (Used natively for Middle-Click / Right-Click -> New Tab)
	const projectUrl = `/projects/${data.project_id}`;

	const startDate = data.target_project_start_date
		? new DateTime(data.target_project_start_date).toFormat('DD MMM yyyy')
		: 'TBD';

	// Assuming you will add an end date to the schema later, using a placeholder for now to match UI
	const endDate = 'TBD';

	const location = data.locations?.[0] ?? 'Global';
	const languages = data.languages?.length > 0 ? data.languages.join(', ') : 'English';

	// Hardcoded rating for now to match the UI screenshot, replace with actual data later
	const mockRating = '4.3 (123)';

	return (
		<ListCard
			id={data.project_id}
			href={projectUrl}
			typeLabel='PROJECT'
			title={data.title}
			subtitle={`Posted By ${data.owner.name}`}
			description={data.description ?? ''}
			imageUrl={data.thumbnail_url ??
				'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60'}
			imageFallback={data.owner.name.charAt(0)}
			onClick={(e: MouseEvent) => {
				// 1. Let the browser handle standard link behaviors (New Tab / Context Menu)
				if (e.metaKey || e.ctrlKey || e.button === 1) return;

				// 2. Intercept left-click for the Indeed-style Master-Detail preview
				e.preventDefault();

				// 3. Silently update the URL so the exact state can be shared/copied
				const url = new URL(globalThis.location.href);
				url.searchParams.set('preview_id', data.project_id);
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
