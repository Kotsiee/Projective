import TeamsGrid from '@islands/pages/dashboard/teams/TeamsGrid.tsx';
import TeamsList from '@islands/pages/dashboard/teams/TeamsGrid.tsx';

export default function Teams() {
	return (
		<div>
			{/* Page Header */}
			<div>
				<h1>Teams</h1>
				<p>
					Manage your agencies, collaborate with others, and view your active memberships.
				</p>
				<a href='/teams/new'>Create New Team</a>
			</div>

			{/* Main Content Island */}
			<TeamsGrid />
		</div>
	);
}
