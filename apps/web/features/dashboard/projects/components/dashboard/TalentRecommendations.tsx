/**
 * @file TalentRecommendations.tsx
 * @description Client / operator-only grid of curated freelancers, matched against the client's own
 * open projects. Each card states WHY the talent fits and names the exact project they align with,
 * then routes to their profile carrying that project as hire context (`?hire_for` / `?hire_project`)
 * so the profile's primary CTA becomes "Hire {name} for {project}" (redesign requirement §2).
 *
 * Composition, not a bespoke matchmaking endpoint: top-ranked freelancers come from the Explore
 * ranking engine (`type=person`, high rating); the client's active projects are the shared workspace
 * list; the two are paired round-robin on the freelancer's headline skill.
 */

import { Avatar, Button, StatusBadge } from '@projective/ui';
import { type Signal, useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconSparkles, IconStarFilled, IconUserSearch } from '@tabler/icons-preact';
import type { ExploreEntity } from '@projective/types';
import { SearchService } from '@features/public/explore/services/SearchService.ts';
import { DEFAULT_FILTERS } from '@features/public/explore/contracts/Explore.ts';
import type { DashboardProjectRow } from '../../contracts/dashboard.ts';

interface Match {
	talent: ExploreEntity;
	projectId: string | null;
	projectName: string | null;
	skill: string | null;
}

function hireHref(m: Match): string {
	const base = `/${m.talent.owner_handle}`;
	if (!m.projectId || !m.projectName) return base;
	const q = new URLSearchParams({ hire_for: m.projectId, hire_project: m.projectName });
	return `${base}?${q.toString()}`;
}

function TalentFitCard({ match }: { match: Match }) {
	const t = match.talent;
	const firstName = (t.owner_name || t.display_title).split(' ')[0];

	return (
		<article class='pw-talent'>
			<div class='pw-talent__top'>
				<Avatar
					name={t.owner_name || t.display_title}
					src={t.owner_avatar ?? undefined}
					size={46}
				/>
				<div class='pw-talent__id'>
					<span class='pw-talent__name'>{t.owner_name || t.display_title}</span>
					<span class='pw-talent__handle'>@{t.owner_handle}</span>
				</div>
				{t.rating_count > 0 && (
					<span class='pw-talent__rating'>
						<IconStarFilled size={13} />
						{t.rating_average.toFixed(1)}
					</span>
				)}
			</div>

			<div class='pw-talent__fit'>
				<IconSparkles size={14} class='pw-talent__fit-glyph' />
				<p class='pw-talent__fit-text'>
					{match.projectName
						? (
							<>
								Strong fit for <strong>{match.projectName}</strong>
								{match.skill
									? (
										<>
											&nbsp;— <strong>{match.skill}</strong> expertise
										</>
									)
									: ''}
							</>
						)
						: (
							<>
								{match.skill ? <strong>{match.skill}</strong> : 'Top-rated talent'}
								&nbsp;matched to the skills you hire for
							</>
						)}
				</p>
			</div>

			<div class='pw-talent__tags'>
				{t.tags.slice(0, 3).map((tag) => <span key={tag} class='pw-talent__tag'>{tag}</span>)}
				{t.availability === 'available' && (
					<StatusBadge tone='success' variant='soft' size='sm' dot>Available</StatusBadge>
				)}
			</div>

			<Button
				href={hireHref(match)}
				variant='primary'
				size='small'
				fullWidth
				className='pw-talent__cta'
			>
				{match.projectName ? `Hire ${firstName} for ${match.projectName}` : `View ${firstName}`}
			</Button>
		</article>
	);
}

export function TalentRecommendations({ projects }: { projects: Signal<DashboardProjectRow[]> }) {
	const talent = useSignal<ExploreEntity[]>([]);
	const isLoading = useSignal(true);

	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const res = await SearchService.query({
					query: '',
					type: 'person',
					sort: 'recommended',
					filters: { ...DEFAULT_FILTERS, min_rating: 4 },
					limit: 8,
				});
				if (alive) talent.value = res.mode === 'single' ? res.items : [];
			} catch {
				if (alive) talent.value = [];
			} finally {
				if (alive) isLoading.value = false;
			}
		})();
		return () => {
			alive = false;
		};
	}, []);

	const matches = useComputed<Match[]>(() => {
		const all = projects.value;
		const active = all.filter((p) => p.status === 'active' || p.status === 'on_hold');
		const pool = active.length > 0 ? active : all;
		return talent.value.map((talentItem, i) => {
			const proj = pool.length > 0 ? pool[i % pool.length] : null;
			return {
				talent: talentItem,
				projectId: proj?.project_id ?? null,
				projectName: proj?.title ?? null,
				skill: talentItem.tags[0] ?? null,
			};
		});
	});

	if (!isLoading.value && matches.value.length === 0) return null;

	return (
		<section class='pw-panel pw-talent-rec pw-panel--luxe' aria-label='Recommended freelancers'>
			<header class='pw-panel__head'>
				<div class='pw-panel__heading'>
					<span class='pw-eyebrow pw-eyebrow--accent'>
						<IconUserSearch size={13} /> Smart match
					</span>
					<h2 class='pw-panel__title'>Curated Talent for Your Projects</h2>
					<p class='pw-panel__sub'>Top-tier freelancers matched to your open workspaces.</p>
				</div>
			</header>

			{isLoading.value
				? (
					<div class='pw-talent-rec__grid'>
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} class='pw-talent pw-talent--skeleton' aria-hidden='true' />
						))}
					</div>
				)
				: (
					<div class='pw-talent-rec__grid'>
						{matches.value.map((m) => <TalentFitCard key={m.talent.id} match={m} />)}
					</div>
				)}
		</section>
	);
}

export default TalentRecommendations;
