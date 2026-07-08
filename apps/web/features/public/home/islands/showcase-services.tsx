import '../styles/pages/home/home.css';
import type { ExploreEntity } from '@projective/types';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { useRef } from 'preact/hooks';
import ExploreCard from '@features/public/explore/components/shared/explore-card.tsx';
import SectionHeading from '../components/section-heading.tsx';

export interface ShowcaseServicesProps {
	items: ExploreEntity[];
}

/**
 * @island ShowcaseServices
 * @description Top-rated services as a snap-scrolling rail with prev/next controls. Its own atomic
 * island so it hydrates independently of the hero and the talent/project grids.
 */
export default function ShowcaseServices({ items }: ShowcaseServicesProps) {
	const viewport = useRef<HTMLDivElement>(null);

	const nudge = (dir: 1 | -1) => {
		const el = viewport.current;
		if (!el) return;
		el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 720), behavior: 'smooth' });
	};

	return (
		<section class='home-section home-showcase reveal'>
			<div class='home-shell'>
				<SectionHeading
					eyebrow='Top rated'
					title={
						<>
							Services that <em>deliver</em>
						</>
					}
					sub='Vetted offerings from the platform’s highest-rated freelancers and studios.'
					aside={
						<div class='home-rail__nav'>
							<button
								type='button'
								class='home-rail__btn'
								aria-label='Scroll left'
								onClick={() => nudge(-1)}
							>
								<IconChevronLeft size={18} />
							</button>
							<button
								type='button'
								class='home-rail__btn'
								aria-label='Scroll right'
								onClick={() => nudge(1)}
							>
								<IconChevronRight size={18} />
							</button>
						</div>
					}
				/>

				<div class='home-rail'>
					<div class='home-rail__viewport' ref={viewport}>
						{items.map((e) => (
							<div class='home-rail__item' key={e.id}>
								<ExploreCard entity={e} variant='standard' />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
