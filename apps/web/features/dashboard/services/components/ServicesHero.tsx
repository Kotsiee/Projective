/**
 * @file ServicesHero.tsx
 * @description The executive header band of the Services suite: a champagne-gradient title block, a
 * one-line summary of the roster, and the primary "New service" affordance. Purely presentational —
 * the counts are derived by the island from the live listings signal.
 */

import { Button } from '@projective/ui';
import { IconPlus, IconSparkles } from '@tabler/icons-preact';

interface ServicesHeroProps {
	displayName: string | null;
	listingCount: number;
	activeCount: number;
	pipelineLabel: string;
	onCreate: () => void;
}

export default function ServicesHero(
	{ displayName, listingCount, activeCount, pipelineLabel, onCreate }: ServicesHeroProps,
) {
	return (
		<header class='svc-hero'>
			<div class='svc-hero__body'>
				<span class='svc-hero__eyebrow'>
					<IconSparkles size={14} /> Services
				</span>
				<h1 class='svc-hero__title'>
					{displayName ? `${displayName}'s service studio` : 'Your service studio'}
				</h1>
				<p class='svc-hero__sub'>
					Package your craft into listings, price the tiers, and manage every active engagement —
					your executive command centre for productised work.
				</p>

				<div class='svc-hero__stats'>
					<div class='svc-hero__stat'>
						<span class='svc-hero__stat-value'>{listingCount}</span>
						<span class='svc-hero__stat-label'>Listings</span>
					</div>
					<div class='svc-hero__stat'>
						<span class='svc-hero__stat-value'>{activeCount}</span>
						<span class='svc-hero__stat-label'>Active</span>
					</div>
					<div class='svc-hero__stat'>
						<span class='svc-hero__stat-value'>{pipelineLabel}</span>
						<span class='svc-hero__stat-label'>Open pipeline</span>
					</div>
				</div>
			</div>

			<div class='svc-hero__actions'>
				<Button variant='primary' onClick={onCreate}>
					<IconPlus size={18} /> New service
				</Button>
			</div>
		</header>
	);
}
