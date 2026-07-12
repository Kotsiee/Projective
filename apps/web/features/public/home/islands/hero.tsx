import '../styles/pages/home/home.css';
import { Button, RippleSurface } from '@projective/ui';
import { SearchInput } from '@projective/fields';
import {
	IconArrowRight,
	IconPlayerPlay,
	IconShieldCheck,
	IconStarFilled,
} from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { HERO_ROTATING } from '../data/homeSeed.ts';

/**
 * @island HomeHeroIsland
 * @description The landing hero — an atomic island that owns the massive headline, the search
 * centrepiece, and the primary CTA into Explore. Clean surface backdrop (no decorative canvas);
 * interactivity is scoped here while the rest of the page streams as lighter islands + partials.
 */
export default function HomeHeroIsland() {
	const query = useSignal('');

	const submit = (q?: string) => {
		const term = (q ?? query.value).trim();
		globalThis.location.href = term ? `/explore?q=${encodeURIComponent(term)}` : '/explore';
	};

	return (
		<section class='home-hero' id='top'>
			<div class='home-hero__bg'>
				<AuroraCanvas />
				<div class='home-hero__grid' />
				<div class='home-hero__spotlight' />
			</div>

			<div class='home-hero__inner'>
				<span class='home-eyebrow home-hero__eyebrow'>
					<IconShieldCheck size={14} />
					Escrow-backed freelancing
				</span>

				<h1 class='home-hero__title'>
					<span class='home-hero__line'>Hire the best.</span>
					<span class='home-hero__line'>
						Ship in <em>stages</em>.
					</span>
					<span class='home-hero__line'>
						Pay with <em>confidence</em>.
					</span>
				</h1>

				<p class='home-hero__lede'>
					Projective is the stage-based marketplace where milestones are funded into escrow, work
					ships in reviewable stages, and payment releases only when you're satisfied.
				</p>

				<div class='home-hero__search'>
					<SearchInput
						variant='cinematic'
						size='xl'
						value={query}
						onSearch={submit}
						rotatingTerms={HERO_ROTATING}
						placeholder='Search services, talent, projects…'
						aria-label='Search the marketplace'
						action={<kbd class='home-hero__kbd'>↵</kbd>}
					/>
				</div>

				<div class='home-hero__ctas'>
					<Button
						variant='premium'
						size='large'
						rounded
						href='/explore'
						endIcon={<IconArrowRight size={18} />}
					>
						Explore the marketplace
					</Button>
					<RippleSurface as='a' href='#value' class='home-hero__ghost'>
						<IconPlayerPlay size={16} />
						See how it works
					</RippleSurface>
				</div>

				<div class='home-hero__trust'>
					<span class='home-hero__avatars' aria-hidden='true'>
						<span class='home-hero__avatar'>A</span>
						<span class='home-hero__avatar'>M</span>
						<span class='home-hero__avatar'>K</span>
						<span class='home-hero__avatar'>+</span>
					</span>
					<span class='home-hero__stars'>
						{[0, 1, 2, 3, 4].map((i) => <IconStarFilled key={i} size={14} />)}
					</span>
					<span>
						Trusted by <strong>12,000+ teams</strong> shipping with escrow
					</span>
				</div>
			</div>
		</section>
	);
}
