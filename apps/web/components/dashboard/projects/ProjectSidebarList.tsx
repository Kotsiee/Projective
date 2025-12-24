import { IconMessages, IconMessagesOff, IconSearch, IconStar } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { SelectField } from '@projective/fields';
import { ProjectItem } from '@contracts/dashboard/projects/Projects.ts';
import { ProjectListItem } from './ProjectListItem.tsx';
import { useMemo } from 'preact/hooks';
import { SelectOption } from '@projective/types';
import { useSignal } from '@preact/signals';

export default function ProjectsSidebarList() {
	const projectCategories: SelectOption<string>[] = [
		{ value: 'all', label: 'All Projects', icon: <IconMessages /> },
		{ value: 'unread', label: 'Unread', icon: <IconMessagesOff /> },
		{ value: 'starred', label: 'Starred', icon: <IconStar /> },
		{ value: 'in-progress', label: 'In Progress', icon: <IconStar /> },
		{ value: 'completed', label: 'Completed', icon: <IconStar /> },
		{ value: 'archived', label: 'Archived', icon: <IconStar /> },
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
				<SelectField
					name='message-type'
					value={selectedMessageType}
					options={projectCategories}
					multiple={false}
					searchable={false}
					onChange={(value) => selectedMessageType.value = value as string}
				/>
				<button type='button' title='Search'>
					<IconSearch />
				</button>
			</div>

			<div style={{ paddingBottom: '1rem' }}>
				<input
					type='text'
					placeholder='Search projects...'
					value={searchQuery}
					onInput={handleSearchInput}
					style={{
						width: '100%',
						padding: '8px',
						borderRadius: '6px',
						border: '1px solid var(--border-subtle)',
					}}
				/>
			</div>

			<div style={{ flex: 1, minHeight: 0 }}>
				<DataDisplay<ProjectItem, ProjectItem>
					dataSource={dataSource}
					mode='list'
					estimateHeight={56}
					pageSize={20}
					selectionMode='none'
					renderItem={(project) => <ProjectListItem project={project} />}
					interactive={false}
				/>
			</div>
		</>
	);
}
