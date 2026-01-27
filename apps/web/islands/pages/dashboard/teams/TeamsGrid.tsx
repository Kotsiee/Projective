import '@styles/components/dashboard/teams/team-grid.css';

import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconPlus, IconSearch } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { SelectField } from '@projective/fields';
import { DashboardTeam } from '@contracts/dashboard/teams/Teams.ts';
import { SelectOption } from '@projective/types';
import { TeamCard } from '@components/dashboard/teams/TeamCard.tsx';

export default function TeamsGrid() {
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
		searchQuery.value = (e.target as HTMLInputElement).value;
	};

	return (
		<div className='teams-grid'>
			{/* Header / Controls */}
			<div className='teams-grid__header'>
				<div className='teams-grid__controls'>
					<div className='teams-grid__search'>
						<div className='teams-grid__search-icon'>
							<IconSearch size={16} />
						</div>
						<input
							type='text'
							className='teams-grid__input'
							placeholder='Search teams...'
							value={searchQuery}
							onInput={handleSearchInput}
						/>
					</div>

					<div className='teams-grid__filter'>
						<SelectField
							name='role-filter'
							value={roleFilter}
							options={roleOptions}
							onChange={(v) => roleFilter.value = v as any}
							searchable={false}
							multiple={false}
							floating={false}
							placeholder='Filter by Role'
						/>
					</div>
				</div>

				<a href='/teams/new' className='teams-grid__create-btn'>
					<IconPlus size={18} className='teams-grid__create-icon' />
					Create Team
				</a>
			</div>

			{/* Data Grid */}
			<div className='teams-grid__content'>
				<DataDisplay<DashboardTeam, DashboardTeam>
					dataSource={dataSource}
					mode='grid'
					gridColumns={4}
					estimateHeight={200}
					pageSize={24}
					selectionMode='single'
					renderItem={(team) => <TeamCard team={team} />}
					onSelectionChange={(keys) => {
						console.log('Selected Team:', Array.from(keys));
					}}
					interactive
					scrollMode='window'
				/>
			</div>
		</div>
	);
}
