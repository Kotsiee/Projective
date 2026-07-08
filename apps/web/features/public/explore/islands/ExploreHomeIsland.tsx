import '../styles/islands/home.css';
import '../styles/premium.css';
import ExploreHomeHero from '../components/home/hero.tsx';
import ExploreHomeCategories from '../components/home/categories.tsx';
import ExploreHomeCinematic from '../components/home/cinematic.tsx';
import ExploreHomeSections from '../components/home/sections.tsx';

/**
 * @function ExploreHomeIsland
 * @description The vibrant multi-entity discovery hub. Composed inside an ExploreProvider so the
 * hero can react to session-role state for its contextual CTA.
 */
export default function ExploreHomeIsland() {
	return (
		<div class='explore-home'>
			<ExploreHomeHero />
			<div class='explore-home__body'>
				<ExploreHomeCategories />
				<ExploreHomeCinematic />
				<ExploreHomeSections />
			</div>
		</div>
	);
}
