import type { EntityCardVariantProps } from '../../types/components/entity-card.ts';
import { EntityCard } from './EntityCard.tsx';

/** Product card — image-forward masonry poster with a soft glow and compact price/owner footer. */
export function ProductCard(props: EntityCardVariantProps) {
	return <EntityCard {...props} variant='product' />;
}

export default ProductCard;
