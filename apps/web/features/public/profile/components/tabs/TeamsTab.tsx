/**
 * @file TeamsTab.tsx
 * @description The "Teams" panel. Two sections — Teams and Businesses — rendered through the unified
 * `ProfileCard` (avatar canopy + micro-bordered taxonomy flag, member count, and role).
 */

import '../../styles/components/entities.css';

import { ProfileCard } from '@projective/ui';
import type { EntityCardModel } from '@projective/types';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { EntityCard } from '../../contracts/Profile.ts';

/** Adapts a profile affiliation (`EntityCard`) into the unified card model. */
function entityToCardModel(e: EntityCard): EntityCardModel {
	return {
		id: e.id,
		entity_type: e.kind,
		display_title: e.name,
		display_description: e.description,
		tags: e.tags,
		rating_average: 0,
		rating_count: 0,
		owner_name: e.name,
		owner_handle: e.handle,
		owner_avatar: e.logoUrl ?? null,
		banner: null,
		accent: e.kind === 'business' ? 'amber' : 'violet',
		price_cents: null,
		price_unit: null,
		availability: null,
		location: null,
		scope: null,
		taxonomy: e.kind === 'business' ? 'business' : 'team',
		is_sponsored: false,
		member_count: e.memberCount,
		role_label: e.role,
	};
}

function EntitySection({ label, items }: { label: string; items: EntityCard[] }) {
	if (items.length === 0) return null;
	return (
		<>
			<h3 class='tab-subhead'>
				{label} <span class='tab-subhead__count'>{items.length}</span>
			</h3>
			<div class='entity-grid'>
				{items.map((e) => (
					<ProfileCard key={e.id} entity={entityToCardModel(e)} href={`/${e.handle}`} />
				))}
			</div>
		</>
	);
}

export default function TeamsTab() {
	const { profile } = useProfileContext();
	const { teams, businesses } = profile.value;

	const empty = teams.length === 0 && businesses.length === 0;

	return (
		<section class='entity'>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Teams & businesses</h2>
					<p class='tab-head__sub'>{teams.length + businesses.length} affiliations</p>
				</div>
			</header>

			{empty ? <div class='tab-empty'>No teams or businesses yet.</div> : (
				<>
					<EntitySection label='Teams' items={teams} />
					<EntitySection label='Businesses' items={businesses} />
				</>
			)}
		</section>
	);
}
