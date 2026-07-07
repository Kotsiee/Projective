import type { EntityCardVariantProps } from '../../types/components/entity-card.ts';
import { EntityCard } from './EntityCard.tsx';

/**
 * Project card — banner-free by design. Focuses entirely on high-density metadata (open scopes,
 * budget ranges, required-skill tags, and timeline markers) with no heavy image asset container.
 */
export function ProjectCard(props: EntityCardVariantProps) {
	return <EntityCard {...props} variant='project' />;
}

export default ProjectCard;
