import type { EntityCardVariantProps } from '../../types/components/entity-card.ts';
import { EntityCard } from './EntityCard.tsx';

/** Service listing card — premium thumbnail banner + dense pricing/rating metadata. */
export function ServiceCard(props: EntityCardVariantProps) {
	return <EntityCard {...props} variant='service' />;
}

export default ServiceCard;
