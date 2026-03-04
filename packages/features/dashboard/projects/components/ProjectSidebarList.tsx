import { IconMessages, IconMessagesOff, IconSearch, IconStar } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { SelectField } from '@projective/fields';
import { ProjectItem } from '../contracts/Projects.ts';
import { ProjectListItem } from './ProjectListItem.tsx';
import { useMemo } from 'preact/hooks';
import { SelectOption } from '@projective/types';
import { useSignal } from '@preact/signals';

export default function ProjectsSidebarList() {
	const projectCategories: SelectOption<string>[] = [
		{ value: 'all', label: 'All Projects', icon: <IconMessages size={18} /> },
		{ value: 'unread', label: 'Unread', icon: <IconMessagesOff size={18} /> },
		{ value: 'starred', label: 'Starred', icon: <IconStar size={18} /> },
		{ value: 'in-progress', label: 'In Progress', icon: <IconStar size={18} /> },
		{ value: 'completed', label: 'Completed', icon: <IconStar size={18} /> },
		{ value: 'archived', label: 'Archived', icon: <IconStar size={18} /> },
	];

	const searchQuery = useSignal('');
	const selectedMessageType = useSignal('all');

	const dataSource = useMemo(() => {
		return new RestDataSource<ProjectItem, ProjectItem>({
			url: '/api/v1/dashboard/projects',
			keyExtractor: (item) => item.project_id,
			defaultParams: {
				category: selectedMessageType.value,
				search: searchQuery.value,
				sortBy: 'last_updated',
				sortDir: 'desc',
			},
		});
	}, [selectedMessageType.value, searchQuery]);

	const handleSearchInput = (e: InputEvent) => {
		const target = e.target as HTMLInputElement;
		searchQuery.value = target.value;
	};

	return (
		<>
			<div class='layout-projects__sidebar__header'>
				<div class='layout-projects__sidebar__filter'>
					<SelectField
						name='message-type'
						value={selectedMessageType}
						options={projectCategories}
						multiple={false}
						searchable={false}
						onChange={(value) => selectedMessageType.value = value as string}
					/>
				</div>
			</div>

			<div class='layout-projects__sidebar__search'>
				<IconSearch size={18} class='layout-projects__sidebar__search-icon' />
				<input
					type='text'
					class='layout-projects__sidebar__search-input'
					placeholder='Search projects...'
					value={searchQuery}
					onInput={handleSearchInput}
				/>
			</div>

			<div class='layout-projects__sidebar__content'>
				<DataDisplay<ProjectItem, ProjectItem>
					dataSource={dataSource}
					mode='list'
					estimateHeight={72} /* Adjusted for the new taller card */
					pageSize={20}
					selectionMode='none'
					renderItem={(project) => <ProjectListItem project={project} />}
					interactive={false}
				/>
			</div>
		</>
	);
}
