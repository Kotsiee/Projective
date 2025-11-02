import '@styles/pages/home/hero.css';
import SearchBar from '@components/search/SearchBar.tsx';

export default function HomeHeroIsland() {
	return (
		<section id='hero' class='home__hero'>
			<div class='home__hero__content'>
				<h1 class='home__hero__content__title'>
					Build Together.<br />Deliver Better.
				</h1>

				<div>
					<SearchBar />
				</div>

				<div class='home__hero__content__actions'>
					<a class='home__hero__content__actions__join' href='#s'>Start Creating</a>
					<a class='home__hero__content__actions__explore' href='#s'>Explore</a>
				</div>
			</div>
		</section>
	);
}
