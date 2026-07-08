import '../../../styles/components/search/results/results-categorised.css';
import { DataDisplay } from '@projective/data';
import { IconMoodSearch } from '@tabler/icons-preact';
import type { EntityType, ExploreEntity } from '@projective/types';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import ExploreCard, { ExploreCardVariant } from '../../shared/explore-card.tsx';
import ExploreSearchInspector from './results-details.tsx';

function cardVariant(type: EntityType): ExploreCardVariant {
	if (type === 'product') return 'product';
	if (type === 'project') return 'wide';
	if (type === 'person' || type === 'team' || type === 'business') return 'profile';
	return 'standard';
}

/**
 * @function ExploreSearchResultsCategorised
 * @description The isolated single-entity view. Renders exactly one entity layout (no cross-type
 * sections, no view toggles) with sort + filters unlocked. Clicking a card slides out the right-hand
 * inspector, compressing the results workspace to the left.
 */
export default function ExploreSearchResultsCategorised() {
	const { entityType, selectedItem, results } = useExploreContext();
	const type = entityType.value as EntityType;

	// Live single-entity results (sorted + filtered server-side; seed fallback via useLiveSearch).
	const items = results.value;
	const variant = cardVariant(type);
	const isMasonry = type === 'product';
	const hasInspector = selectedItem.value !== null;

	const renderCard = (item: ExploreEntity) => (
		<ExploreCard
			entity={item}
			variant={variant}
			active={selectedItem.value?.id === item.id}
			onSelect={(e) => selectedItem.value = e}
		/>
	);

	return (
		<div class={`explore-single ${hasInspector ? 'explore-single--split' : ''}`}>
			<div class='explore-single__stage'>
				{items.length === 0
					? (
						<div class='explore-single__empty'>
							<IconMoodSearch size={44} />
							<h3>No matches yet</h3>
							<p>Try widening your filters or searching a different term.</p>
						</div>
					)
					: isMasonry
					? (
						<DataDisplay<ExploreEntity, unknown>
							mode='masonry'
							dataSource={items}
							columnWidth={hasInspector ? 200 : 230}
							gap={18}
							estimateHeight={320}
							scrollMode='window'
							renderItem={renderCard}
							style={{ width: '100%', display: 'block' }}
						/>
					)
					: (
						<DataDisplay<ExploreEntity, unknown>
							mode='grid'
							dataSource={items}
							columnWidth={type === 'project' ? 440 : 272}
							gap={18}
							estimateHeight={type === 'project' ? 252 : 342}
							scrollMode='window'
							selectionMode='none'
							renderItem={renderCard}
							style={{ width: '100%', display: 'block' }}
						/>
					)}
			</div>

			{hasInspector && (
				<aside class='explore-single__inspector'>
					<ExploreSearchInspector />
				</aside>
			)}
		</div>
	);
}
