import '../../../styles/components/search/results/results-uncategorised.css';
import { Carousel, DataDisplay } from '@projective/data';
import type { EntityType, ExploreEntity } from '@projective/types';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import { EntityFilter } from '../../../contracts/Explore.ts';
import ExploreSection from '../../shared/section.tsx';
import ExploreCard, { ExploreCardVariant } from '../../shared/explore-card.tsx';
import { SEARCH_SECTIONS } from '../../../data/exploreSeed.ts';

function cardVariant(type: EntityType): ExploreCardVariant {
	if (type === 'product') return 'product';
	if (type === 'project') return 'wide';
	if (type === 'person' || type === 'team' || type === 'business') return 'profile';
	return 'standard';
}

/**
 * @function ExploreSearchResultsUncategorised
 * @description The multi-entity (federated) default view. A Recommended carousel sits at the very
 * top, followed by per-entity-type sections rendered in their fixed layouts (grids, masonry). Cards
 * bypass the inspector entirely and navigate straight to the target asset page.
 */
export default function ExploreSearchResultsUncategorised() {
	const { entityType, sections } = useExploreContext();

	// Live federated buckets (seed fallback via useLiveSearch).
	const recs = sections.value.recommended;

	return (
		<div class='explore-federated'>
			{/* Recommended carousel */}
			{recs.length > 0 && (
				<ExploreSection eyebrow='Handpicked for you' title='Recommended'>
					<div class='home-carousel'>
						<Carousel<ExploreEntity>
							dataSource={recs}
							renderItem={(item) => <ExploreCard entity={item} variant='standard' />}
							itemMinWidth={300}
							arrowPosition='inside'
							indicatorPosition='hidden'
						/>
					</div>
				</ExploreSection>
			)}

			{SEARCH_SECTIONS.map((section) => {
				const items =
					sections.value[section.type as 'service' | 'person' | 'product' | 'project'] ?? [];
				if (items.length === 0) return null;
				const variant = cardVariant(section.type);

				return (
					<ExploreSection
						key={section.type}
						title={section.title}
						viewAllLabel={`View all ${section.title.toLowerCase()}`}
						onViewAll={() => entityType.value = section.type as EntityFilter}
					>
						{section.layout === 'masonry'
							? (
								<DataDisplay<ExploreEntity, unknown>
									mode='masonry'
									dataSource={items}
									columnWidth={230}
									gap={18}
									estimateHeight={320}
									scrollMode='window'
									renderItem={(item) => <ExploreCard entity={item} variant={variant} />}
									style={{ width: '100%', display: 'block' }}
								/>
							)
							: (
								<DataDisplay<ExploreEntity, unknown>
									mode='grid'
									dataSource={items}
									columnWidth={section.type === 'project'
										? 440
										: section.type === 'service'
										? 300
										: 272}
									gap={18}
									estimateHeight={section.type === 'project'
										? 252
										: section.type === 'service'
										? 340
										: 342}
									scrollMode='window'
									selectionMode='none'
									renderItem={(item) => <ExploreCard entity={item} variant={variant} />}
									style={{ width: '100%', display: 'block' }}
								/>
							)}
					</ExploreSection>
				);
			})}
		</div>
	);
}
