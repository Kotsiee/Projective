import '@styles/components/navigation/nav-bar-user-profile-dropdown-teams.css';
import { useMemo } from 'preact/hooks';
import { RestDataSource, useDataManager } from '@projective/data';
import { DashboardTeam } from '@contracts/dashboard/teams/Teams.ts';
import NavBarTeamCard from './NavBarTeamCard.tsx';

export default function NavBarUserProfileDropdownTeams() {
	// 1. Setup Source
	const dataSource = useMemo(() => {
		return new RestDataSource<DashboardTeam, DashboardTeam>({
			url: '/api/v1/dashboard/teams',
			keyExtractor: (item) => item.team_id,
			fetchOptions: { credentials: 'include' },
			defaultParams: {
				role: 'all',
				limit: '100',
				sortBy: 'last_updated',
				sortDir: 'desc',
			},
		});
	}, []);

	const manager = useDataManager(dataSource, undefined, 100);

	useMemo(() => {
		manager.setVisibleRange(0, 50);
	}, [manager]);

	const items = Array.from(manager.dataset.value.items.values()).map((n) => n.data);
	const isLoading = manager.isFetching.value;

	return (
		<div class='nav-bar-user__profile__dropdown__teams'>
			<div class='nav-bar-user__profile__dropdown__teams-list'>
				{isLoading && items.length === 0 && (
					<div class='nav-bar-user__profile__dropdown__loading'>Loading teams...</div>
				)}

				{items.map((team) => <NavBarTeamCard key={team.team_id} team={team} />)}

				{!isLoading && items.length === 0 && (
					<div class='nav-bar-user__profile__dropdown__empty'>No teams found.</div>
				)}
			</div>

			<a href='/teams/new' class='nav-bar-user__profile__dropdown__add'>
				+ Create New Team
			</a>
		</div>
	);
}
