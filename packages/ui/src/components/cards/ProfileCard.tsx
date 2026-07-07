import type { EntityCardVariantProps } from '../../types/components/entity-card.ts';
import { EntityCard } from './EntityCard.tsx';

/**
 * Profile card — the shared foundation for Freelancers, Teams, and Businesses, differentiated by a
 * micro-bordered taxonomy flag over an avatar canopy. Pass `variant="compact"` via {@link EntityCard}
 * for switcher/dropdown rows; this wrapper renders the full canopy layout.
 */
export function ProfileCard(props: EntityCardVariantProps) {
	return <EntityCard {...props} variant='profile' />;
}

export default ProfileCard;
