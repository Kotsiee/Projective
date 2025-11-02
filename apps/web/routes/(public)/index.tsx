import { Head } from 'fresh/runtime';
import '@styles/pages/home/home.css';
import HomeHeroIsland from '@islands/pages/home/hero.tsx';

export default function Home() {
	return (
		<>
			<Head>
				<title>Projective</title>
			</Head>
			<div class='home'>
				<HomeHeroIsland />
			</div>
		</>
	);
}
