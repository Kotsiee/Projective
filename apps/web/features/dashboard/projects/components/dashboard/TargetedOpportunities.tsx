/**
 * @file TargetedOpportunities.tsx
 * @description Freelancer-only reel of high-value, active project postings pulled live from the
 * Explore ranking engine (`/api/v1/public/search`, `type=project`, `recommended` sort — which the
 * engine personalises to the signed-in user). Renders the shared ExploreCard so postings look and
 * navigate exactly as they do on Explore. Hides itself entirely when nothing relevant is live.
 */

import { HScroll } from '@projective/ui';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconTargetArrow } from '@tabler/icons-preact';
import type { ExploreEntity } from '@projective/types';
import { SearchService } from '@features/public/explore/services/SearchService.ts';
import { DEFAULT_FILTERS } from '@features/public/explore/contracts/Explore.ts';
import ExploreCard from '@features/public/explore/components/shared/explore-card.tsx';

export function TargetedOpportunities({ skills = [] }: { skills?: string[] }) {
	const items = useSignal<ExploreEntity[]>([]);
	const isLoading = useSignal(true);

	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const res = await SearchService.query({
					query: '',
					type: 'project',
					sort: 'recommended',
					filters: { ...DEFAULT_FILTERS, skills },
					limit: 12,
				});
				if (!alive) return;
				items.value = res.mode === 'single' ? res.items : [];
			} catch {
				if (alive) items.value = [];
			} finally {
				if (alive) isLoading.value = false;
			}
		})();
		return () => {
			alive = false;
		};
	}, []);

	// Nothing to show and not loading → don't render an empty band.
	if (!isLoading.value && items.value.length === 0) return null;

	return (
		<section class='pw-panel pw-opps pw-panel--luxe' aria-label='Targeted opportunities'>
			<header class='pw-panel__head'>
				<div class='pw-panel__heading'>
					<span class='pw-eyebrow pw-eyebrow--accent'>
						<IconTargetArrow size={13} /> For you
					</span>
					<h2 class='pw-panel__title'>Targeted Opportunities</h2>
					<p class='pw-panel__sub'>High-value projects matched to your craft.</p>
				</div>
			</header>

			{isLoading.value
				? (
					<div class='pw-opps__reel pw-opps__reel--skeleton'>
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} class='pw-opps__slide-skeleton' aria-hidden='true' />
						))}
					</div>
				)
				: (
					<HScroll ariaLabel='Targeted opportunities' gap={16} class='pw-opps__reel'>
						{items.value.map((e) => (
							<div key={e.id} class='pw-opps__slide'>
								<ExploreCard entity={e} variant='wide' />
							</div>
						))}
					</HScroll>
				)}
		</section>
	);
}

export default TargetedOpportunities;
