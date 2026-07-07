import { DashboardTeam } from '@features/dashboard/teams/contracts/Teams.ts';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import { EntityCard } from '@projective/ui';
import type { EntityCardModel } from '@projective/types';

interface NavBarTeamCardProps {
	team: DashboardTeam;
}

/** Adapts a team into the compact card model used by the nav workspace switcher. */
function teamToCardModel(team: DashboardTeam): EntityCardModel {
	return {
		id: team.team_id,
		entity_type: 'team',
		display_title: team.name,
		display_description: null,
		tags: [],
		rating_average: 0,
		rating_count: 0,
		owner_name: team.name,
		owner_handle: team.slug,
		owner_avatar: team.avatar_url ?? null,
		banner: null,
		accent: 'primary',
		price_cents: null,
		price_unit: null,
		availability: null,
		location: null,
		scope: null,
		taxonomy: null,
		is_sponsored: false,
	};
}

export default function NavBarTeamCard({ team }: NavBarTeamCardProps) {
	const { user, switchTeam } = useUserContext();
	const isActive = user.value?.activeTeamId === team.team_id;

	const handleSwitch = async () => {
		if (isActive) return;
		await switchTeam(team.team_id);
	};

	return (
		<EntityCard
			variant='compact'
			entity={teamToCardModel(team)}
			active={isActive}
			onSelect={handleSwitch}
			actions={false}
		/>
	);
}
