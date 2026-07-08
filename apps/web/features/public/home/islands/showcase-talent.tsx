import '../styles/pages/home/home.css';
import type { ExploreEntity } from '@projective/types';
import ExploreCard from '@features/public/explore/components/shared/explore-card.tsx';
import SectionHeading from '../components/section-heading.tsx';

export interface ShowcaseTalentProps {
	items: ExploreEntity[];
}

/**
 * @island ShowcaseTalent
 * @description Featured freelancers, teams, and studios on the unified profile card. Atomic island.
 */
export default function ShowcaseTalent({ items }: ShowcaseTalentProps) {
	return (
		<section class='home-section home-showcase reveal'>
			<div class='home-shell'>
				<SectionHeading
					eyebrow='Meet the makers'
					title={
						<>
							Freelancers &amp; <em>teams</em> to build with
						</>
					}
					sub='Solo specialists, agencies, and studios — all reputation-verified.'
					href='/explore?type=person'
					linkLabel='Discover talent'
				/>

				<div class='home-grid home-grid--talent'>
					{items.map((e) => (
						<div class='home-grid__item' key={e.id}>
							<ExploreCard entity={e} variant='profile' />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
