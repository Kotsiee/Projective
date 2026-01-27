import { IconArrowsRight, IconCheck, IconUsers } from '@tabler/icons-preact';
import { DashboardTeam } from '@contracts/dashboard/teams/Teams.ts';
import { useUserContext } from '@contexts/UserContext.tsx';

interface NavBarTeamCardProps {
	team: DashboardTeam;
}

export default function NavBarTeamCard({ team }: NavBarTeamCardProps) {
	const { user, switchTeam } = useUserContext();
	const isActive = user.value?.activeTeamId === team.team_id;

	const handleSwitch = async (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		if (isActive) return;
		await switchTeam(team.team_id);
	};

	return (
		<button
			class={`nav-bar-team-card ${isActive ? 'nav-bar-team-card--active' : ''}`}
			onClick={handleSwitch}
			disabled={isActive}
			type='button'
		>
			<div class='nav-bar-team-card__avatar'>
				{team.avatar_url ? <img src={team.avatar_url} alt={team.name} /> : <IconUsers size={16} />}
			</div>

			<div class='nav-bar-team-card__info'>
				<span class='nav-bar-team-card__name'>{team.name}</span>
				<span class='nav-bar-team-card__slug'>@{team.slug}</span>
			</div>

			<div class='nav-bar-team-card__action'>
				{isActive
					? <IconCheck size={16} class='nav-bar-team-card__icon--active' />
					: <IconArrowsRight size={16} class='nav-bar-team-card__icon--switch' />}
			</div>
		</button>
	);
}
