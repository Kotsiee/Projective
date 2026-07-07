import { DashboardTeam } from '../contracts/Teams.ts';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import { deltaToPlainText } from '@projective/utils';
import { ProfileCard } from '@projective/ui';
import type { EntityCardMenuItem } from '@projective/ui';
import type { EntityCardModel } from '@projective/types';

interface TeamCardProps {
	team: DashboardTeam;
}

function getShortDescription(desc: string): string {
	if (!desc) return 'No description provided.';
	try {
		if (desc.startsWith('{') && desc.includes('"ops"')) {
			const parsed = JSON.parse(desc);
			if (Array.isArray(parsed.ops)) {
				return parsed.ops
					.map((op: { insert?: unknown }) => (typeof op.insert === 'string' ? op.insert : ''))
					.join('')
					.trim() || 'No description provided.';
			}
		}
		return desc;
	} catch {
		return desc;
	}
}

/** Adapts a dashboard team into the unified card model. */
function teamToCardModel(team: DashboardTeam): EntityCardModel {
	const description = deltaToPlainText(JSON.parse(getShortDescription(team.description)));
	const role = team.user_role
		? team.user_role[0].toUpperCase() + team.user_role.slice(1)
		: undefined;

	return {
		id: team.team_id,
		entity_type: 'team',
		display_title: team.name,
		display_description: description,
		tags: [],
		rating_average: 0,
		rating_count: 0,
		owner_name: team.name,
		owner_handle: team.slug,
		owner_avatar: team.avatar_url ?? null,
		banner: null,
		accent: 'violet',
		price_cents: null,
		price_unit: null,
		availability: null,
		location: null,
		scope: null,
		taxonomy: 'team',
		is_sponsored: false,
		member_count: team.member_count,
		role_label: role,
	};
}

export function TeamCard({ team }: TeamCardProps) {
	const { user, switchTeam } = useUserContext();
	const isActive = user.value?.activeTeamId === team.team_id;

	const handleSwitch = async () => {
		if (isActive) return;
		await switchTeam(team.team_id);
	};

	const menuItems: EntityCardMenuItem[] = [
		{ label: isActive ? 'Currently active' : 'Set as active', onSelect: handleSwitch },
	];

	return (
		<ProfileCard
			entity={teamToCardModel(team)}
			active={isActive}
			onSelect={handleSwitch}
			menuItems={menuItems}
		/>
	);
}
