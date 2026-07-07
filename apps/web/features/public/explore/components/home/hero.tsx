import '../../styles/components/home/hero.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button } from '@projective/ui';
import { IconArrowRight, IconSparkles } from '@tabler/icons-preact';
import ExploreSearch from '../shared/search.tsx';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { EntityFilter, UserRole } from '../../contracts/Explore.ts';

// #region Typewriter suffixes
const SUFFIXES = [
	'Your Perfect Team',
	'The Best Projects',
	'Top Talent',
	'Elite Services',
];
// #endregion

// #region Role-driven CTA
const ROLE_CTA: Record<UserRole, { label: string; href: string }> = {
	guest: { label: 'Join Now', href: '/auth/register' },
	client: { label: 'Become a Freelancer', href: '/dashboard/freelancer/apply' },
	freelancer: { label: 'Join a Project', href: '/explore?type=project' },
};

const ROLES: UserRole[] = ['guest', 'client', 'freelancer'];
// #endregion

export default function ExploreHomeHero() {
	const { userRole, exploreQuery, entityType } = useExploreContext();

	// #region Typewriter engine
	const text = useSignal(SUFFIXES[0]);
	useEffect(() => {
		let phrase = 0;
		let char = SUFFIXES[0].length;
		let deleting = false;
		let timer: number;

		const tick = () => {
			const full = SUFFIXES[phrase];
			char += deleting ? -1 : 1;
			text.value = full.slice(0, char);

			let delay = deleting ? 45 : 85;
			if (!deleting && char === full.length) {
				delay = 1900; // hold the completed phrase
				deleting = true;
			} else if (deleting && char === 0) {
				deleting = false;
				phrase = (phrase + 1) % SUFFIXES.length;
				delay = 320;
			}
			timer = setTimeout(tick, delay) as unknown as number;
		};

		timer = setTimeout(tick, 1900) as unknown as number;
		return () => clearTimeout(timer);
	}, []);
	// #endregion

	const cta = ROLE_CTA[userRole.value];

	const handleSearch = (term: string, type: EntityFilter) => {
		exploreQuery.value = term;
		entityType.value = type;
		const params = new URLSearchParams();
		if (term) params.set('q', term);
		if (type !== 'all') params.set('type', type);
		globalThis.location.href = `/explore?${params.toString()}`;
	};

	return (
		<section class='explore-hero'>
			<div class='explore-hero__aurora' aria-hidden='true' />

			<div class='explore-hero__inner'>
				<span class='explore-hero__badge'>
					<IconSparkles size={14} />
					The Unified Discovery Engine
				</span>

				<h1 class='explore-hero__title'>
					Discover{' '}
					<span class='explore-hero__typed'>
						{text.value}
						<span class='explore-hero__caret' />
					</span>
				</h1>

				<p class='explore-hero__subtitle'>
					Explore a world of creativity, imagination and commitment from people ready to take on
					your project.
				</p>

				<div class='explore-hero__search'>
					<ExploreSearch onSearch={handleSearch} size='lg' />
				</div>

				{/* Contextual dynamic CTA banner — adapts to session role state. */}
				<div class='explore-hero__cta'>
					<div class='explore-hero__cta-copy'>
						<strong>Ready to build something great?</strong>
						<span>Thousands of teams, services and projects are one click away.</span>
					</div>
					<div class='explore-hero__cta-actions'>
						<Button variant='primary' rounded href={cta.href} endIcon={<IconArrowRight size={16} />}>
							{cta.label}
						</Button>
						<div class='explore-hero__role-switch' role='group' aria-label='Preview as role'>
							<span>Viewing as</span>
							{ROLES.map((r) => (
								<button
									type='button'
									key={r}
									class={`explore-hero__role ${userRole.value === r ? 'is-active' : ''}`}
									onClick={() => userRole.value = r}
								>
									{r}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
