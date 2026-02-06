import '@styles/components/dashboard/teams/teams-island.css';

import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconPlus, IconSearch } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { SelectField, TextField } from '@projective/fields';
import { Button } from '@projective/ui';
import { DashboardTeam } from '@contracts/dashboard/teams/Teams.ts';
import { SelectOption } from '@projective/types';
import { TeamCard } from '@components/dashboard/teams/TeamCard.tsx';

export default function TeamsIsland() {
	const searchQuery = useSignal('');
	const roleFilter = useSignal<'all' | 'owner' | 'member'>('all');

	const roleOptions: SelectOption<string>[] = [
		{ value: 'all', label: 'All Teams' },
		{ value: 'owner', label: 'Owned by Me' },
		{ value: 'member', label: 'Joined' },
	];

	const dataSource = useMemo(() => {
		return new RestDataSource<DashboardTeam, DashboardTeam>({
			url: '/api/v1/dashboard/teams',
			keyExtractor: (item) => item.team_id,
			fetchOptions: {
				credentials: 'include',
			},
			defaultParams: {
				search: searchQuery.value,
				role: roleFilter.value,
				sortBy: 'last_updated',
				sortDir: 'desc',
			},
		});
	}, [searchQuery.value, roleFilter.value]);

	const handleSearchInput = (e: InputEvent) => {
		searchQuery.value = (e.currentTarget as HTMLInputElement).value;
	};

	return (
		<div className='teams-island'>
			{/* Page Header */}
			<div className='teams-island__page-header'>
				<h1>Teams</h1>
				<p>
					Manage your agencies, collaborate with others, and view your active memberships.
				</p>
			</div>

			{/* Controls Toolbar */}
			<div className='teams-island__toolbar'>
				<div className='teams-island__controls'>
					<div className='teams-island__search'>
						<TextField
							name='team-search'
							placeholder='Search teams...'
							value={searchQuery}
							onInput={handleSearchInput}
							prefix={<IconSearch size={16} style={{ color: 'var(--text-muted)' }} />}
							floating={false}
							className='teams-island__search-input'
						/>
					</div>

					<div className='teams-island__filter'>
						<SelectField
							name='role-filter'
							value={roleFilter}
							options={roleOptions}
							onChange={(v) => roleFilter.value = v as any}
							searchable={false}
							multiple={false}
							floating={false}
							placeholder='Filter'
						/>
					</div>
				</div>

				<div className='teams-island__actions'>
					<Button
						href='/teams/new'
						variant='primary'
						startIcon={<IconPlus size={18} />}
					>
						Create Team
					</Button>
				</div>
			</div>

			{/* Data Grid */}
			<div className='teams-island__content'>
				<DataDisplay<DashboardTeam, DashboardTeam>
					dataSource={dataSource}
					mode='grid'
					gridColumns={4}
					estimateHeight={200}
					pageSize={24}
					selectionMode='single'
					renderItem={(team) => <TeamCard team={team} />}
					interactive
					scrollMode='window'
				/>
			</div>
		</div>
	);
}
