import ExploreHomeCategories from '../components/home/categories.tsx';
import ExploreHomeHero from '../components/home/hero.tsx';
import ExploreHomeMarketplaceGrid from '../components/home/marketplace.tsx';

export default function ExploreHomeIsland() {
	return (
		<div>
			<ExploreHomeHero />
			<ExploreHomeCategories />
			<ExploreHomeMarketplaceGrid />
		</div>
	);
}
