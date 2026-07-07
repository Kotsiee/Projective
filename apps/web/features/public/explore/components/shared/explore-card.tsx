import type { EntityCardVariant, ExploreEntity } from '@projective/types';
import { EntityCard } from '@projective/ui';
import { isProfileType } from '../../data/exploreSeed.ts';

/**
 * Legacy variant vocabulary kept for the Explore consumers (home sections + search matrices).
 * Maps onto the shared {@link EntityCardVariant} so no call site needs to change.
 */
export type ExploreCardVariant = 'standard' | 'product' | 'profile' | 'wide';

const VARIANT_MAP: Record<ExploreCardVariant, EntityCardVariant> = {
	standard: 'service',
	product: 'product',
	profile: 'profile',
	wide: 'project',
};

export interface ExploreCardProps {
	entity: ExploreEntity;
	variant?: ExploreCardVariant;
	/**
	 * When provided, the card selects for the split-pane inspector (single-entity view).
	 * When omitted, the whole card navigates directly to the target page (federated / home view).
	 */
	onSelect?: (entity: ExploreEntity) => void;
	active?: boolean;
	onTagClick?: (tag: string) => void;
}

/** Resolves the direct-navigation target for a discovery entity. */
function targetHref(e: ExploreEntity): string {
	if (isProfileType(e.entity_type)) return `/${e.owner_handle}`;
	return `/view/${e.id}`;
}

/**
 * @function ExploreCard
 * @description Thin Explore-surface adapter over the unified `@projective/ui` {@link EntityCard}.
 * `ExploreEntity` is structurally assignable to the shared `EntityCardModel`, so it passes straight
 * through; this adapter only supplies the app-specific navigation target and preserves the
 * `onSelect`-with-`ExploreEntity` contract the Explore inspector relies on.
 */
export default function ExploreCard(
	{ entity, variant = 'standard', onSelect, active, onTagClick }: ExploreCardProps,
) {
	return (
		<EntityCard
			entity={entity}
			variant={VARIANT_MAP[variant]}
			href={targetHref(entity)}
			onSelect={onSelect ? () => onSelect(entity) : undefined}
			active={active}
			onTagClick={onTagClick}
		/>
	);
}
