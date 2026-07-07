import '../../styles/components/shared/section.css';
import { ComponentChildren } from 'preact';
import { IconChevronRight } from '@tabler/icons-preact';

export interface ExploreSectionProps {
	title: string;
	eyebrow?: string;
	subtitle?: string;
	/** Optional "view all" affordance. */
	viewAllLabel?: string;
	onViewAll?: () => void;
	viewAllHref?: string;
	children: ComponentChildren;
}

/**
 * @function ExploreSection
 * @description Consistent section shell (eyebrow + title + optional "view all") used across the
 * discovery home hub and the federated search view.
 */
export default function ExploreSection(props: ExploreSectionProps) {
	const { title, eyebrow, subtitle, viewAllLabel, onViewAll, viewAllHref, children } = props;

	const viewAll = (viewAllLabel && (onViewAll || viewAllHref))
		? (
			<a
				class='explore-section__view-all'
				href={viewAllHref}
				onClick={onViewAll
					? (e) => {
						if (!viewAllHref) e.preventDefault();
						onViewAll();
					}
					: undefined}
			>
				<span>{viewAllLabel}</span>
				<IconChevronRight size={16} />
			</a>
		)
		: null;

	return (
		<section class='explore-section'>
			<header class='explore-section__head'>
				<div class='explore-section__titles'>
					{eyebrow && <span class='explore-section__eyebrow'>{eyebrow}</span>}
					<h2 class='explore-section__title'>{title}</h2>
					{subtitle && <p class='explore-section__subtitle'>{subtitle}</p>}
				</div>
				{viewAll}
			</header>
			<div class='explore-section__body'>{children}</div>
		</section>
	);
}
