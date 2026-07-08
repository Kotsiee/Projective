import '../styles/pages/home/home.css';
import type { ExploreEntity } from '@projective/types';
import ExploreCard from '@features/public/explore/components/shared/explore-card.tsx';
import SectionHeading from '../components/section-heading.tsx';

export interface ShowcaseProjectsProps {
	items: ExploreEntity[];
}

/**
 * @island ShowcaseProjects
 * @description Live open projects as high-density wide cards. Atomic island — hydrates on its own.
 */
export default function ShowcaseProjects({ items }: ShowcaseProjectsProps) {
	return (
		<section class='home-section home-showcase home-showcase--alt reveal'>
			<div class='home-shell'>
				<SectionHeading
					eyebrow='Hiring now'
					title={
						<>
							Active <em>projects</em> seeking talent
						</>
					}
					sub='Multi-stage briefs from vetted clients — funded and ready to staff.'
					href='/explore?type=project'
					linkLabel='Browse projects'
				/>

				<div class='home-grid home-grid--projects'>
					{items.map((e) => (
						<div class='home-grid__item' key={e.id}>
							<ExploreCard entity={e} variant='wide' />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
