import { Head } from 'fresh/runtime';
import '@styles/pages/home.css';

export default function Home() {
	return (
		<>
			<Head>
				<title>Projective</title>
			</Head>
			<div class='home'>
				<section id='hero' class='home__hero'>
					<div>
						<h1>
							Build Together.<br />Deliver Better.
						</h1>

						<div>
							<p>Search Bar</p>
						</div>

						<div>
							<a href='#s'>Start Creating</a>
							<a href='#s'>Explore</a>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
