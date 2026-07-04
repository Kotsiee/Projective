/**
 * @file TeamsTab.tsx
 * @description The "Teams" panel. Two sections — Teams and Businesses — of
 * interactive entity cards (avatar/logo, name, handle, role, member count).
 */

import '../../styles/components/entities.css';

import { Avatar, Tag } from '@projective/ui';
import { IconUsers } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { EntityCard } from '../../contracts/Profile.ts';

function EntityCardView({ entity }: { entity: EntityCard }) {
	return (
		<article class='entity-card'>
			<div class='entity-card__head'>
				<span class='entity-card__avatar'>
					<Avatar name={entity.name} src={entity.logoUrl} size={44} />
				</span>
				<div class='entity-card__id'>
					<span class='entity-card__name'>{entity.name}</span>
					<span class='entity-card__handle'>@{entity.handle}</span>
				</div>
				<span class='entity-card__role'>{entity.role}</span>
			</div>

			<p class='entity-card__desc'>{entity.description}</p>

			<div class='entity-card__foot'>
				<span class='entity-card__members'>
					<IconUsers size={14} /> {entity.memberCount} members
				</span>
				{entity.tags.length > 0 && (
					<span class='entity-card__tags'>
						{entity.tags.map((t) => (
							<Tag key={t} size='small' color='neutral' variant='subtle' rounded>{t}</Tag>
						))}
					</span>
				)}
			</div>
		</article>
	);
}

function EntitySection({ label, items }: { label: string; items: EntityCard[] }) {
	if (items.length === 0) return null;
	return (
		<>
			<h3 class='tab-subhead'>
				{label} <span class='tab-subhead__count'>{items.length}</span>
			</h3>
			<div class='entity-grid'>
				{items.map((e) => <EntityCardView key={e.id} entity={e} />)}
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
