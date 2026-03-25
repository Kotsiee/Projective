import '../../styles/components/home/hero.css';
import ExploreSearch from '../shared/search.tsx';

export default function ExploreHomeHero() {
	return (
		<div class='explore-home-hero'>
			<div class='explore-home-hero__header'>
				<div class='explore-home-hero__header__context'>
					<h1 class='explore-home-hero__header__context__title'>
						Discover Your<br />Perfect Team
					</h1>
					<p class='explore-home-hero__header__context__subtitle'>
						Explore a world of creativity, imagination and commitment from people ready to take on
						your project.
					</p>
				</div>
				<div class='explore-home-hero__header__search'>
					<div class='explore-home-hero__header__search__input'>
						<ExploreSearch />
					</div>
					<div class='explore-home-hero__header__search__suggested'></div>
				</div>
			</div>
			<div class='explore-home-hero__promotion'></div>
		</div>
	);
}
