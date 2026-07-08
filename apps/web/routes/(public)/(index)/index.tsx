import HomeHeroIsland from '@features/public/home/islands/hero.tsx';
import ShowcaseServices from '@features/public/home/islands/showcase-services.tsx';
import ShowcaseProjects from '@features/public/home/islands/showcase-projects.tsx';
import ShowcaseTalent from '@features/public/home/islands/showcase-talent.tsx';
import LogosMarquee from '@features/public/home/components/logos-marquee.tsx';
import ValueEngine from '@features/public/home/components/value-engine.tsx';
import HowItWorks from '@features/public/home/components/how-it-works.tsx';
import StatsBand from '@features/public/home/components/stats-band.tsx';
import Reviews from '@features/public/home/components/reviews.tsx';
import HomeCTA from '@features/public/home/components/cta.tsx';
import { trending } from '@features/public/explore/data/exploreSeed.ts';

/**
 * Guest landing. A thin server composer: it resolves showcase data from the shared discovery seed and
 * streams a sequence of atomic islands (hero + showcases) interleaved with static premium partials.
 * No single mega-island — each interactive block hydrates independently for fast, smooth loads.
 */
export default function Home() {
	const services = trending('service', 8);
	const projects = trending('project', 4);
	const talent = trending('person', 6);

	return (
		<div class='home'>
			<HomeHeroIsland />
			<LogosMarquee />
			<ValueEngine />
			<HowItWorks />
			<ShowcaseServices items={services} />
			<ShowcaseProjects items={projects} />
			<ShowcaseTalent items={talent} />
			<StatsBand />
			<Reviews />
			<HomeCTA />
		</div>
	);
}
