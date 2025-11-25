import '@styles/pages/home/hero.css';
import SearchBar from '@components/search/SearchBar.tsx';
import { IconChevronRight } from '@tabler/icons-preact';

export default function HomeHeroIsland() {
	return (
		<section id='hero' class='home__hero'>
			<div class='home__hero__bg'>
				<img
					class='home__hero__bg__image'
					src='https://images.unsplash.com/photo-1535957998253-26ae1ef29506?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=736'
				/>
			</div>
			<div class='home__hero__content'>
				<h1 class='home__hero__content__title'>
					Build Together.<br />Deliver Better.
				</h1>

				<div class='home__hero__content__search'>
					<SearchBar />
				</div>

				<div class='home__hero__content__actions'>
					<a class='home__hero__content__actions__join' href='#s'>
						<span>Start Creating</span>
						<IconChevronRight />
					</a>
					<a class='home__hero__content__actions__explore' href='#s'>
						<span>Explore</span>
						<IconChevronRight />
					</a>
				</div>
			</div>
		</section>
	);
}
