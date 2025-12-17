import '@styles/components/dashboard/projects/projects-sidebar.css';
import { useMemo, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import { IconMessages, IconMessagesOff, IconSearch, IconStar } from '@tabler/icons-preact';
import { SelectOption } from '@projective/types';
import { SelectField } from '@projective/fields';

// Data Package
import { DataDisplay } from '@projective/data';

// Components
import { ProjectItem } from '@contracts/dashboard/projects/Projects.ts';
import { RestDataSource } from '@projective/data';
import { ProjectListItem } from './ProjectListItem.tsx';

const projectCategories: SelectOption<string>[] = [
	{ value: 'all', label: 'All Projects', icon: <IconMessages /> },
	{ value: 'unread', label: 'Unread', icon: <IconMessagesOff /> },
	{ value: 'starred', label: 'Starred', icon: <IconStar /> },
	{ value: 'in-progress', label: 'In Progress', icon: <IconStar /> },
	{ value: 'completed', label: 'Completed', icon: <IconStar /> },
	{ value: 'archived', label: 'Archived', icon: <IconStar /> },
];

const selectedMessageType = signal('all');

export default function ProjectsSidebar() {
	const [searchQuery, setSearchQuery] = useState('');

	// Initialize the data source
	// We use useMemo so we don't recreate the class instance on every render
	// unless the dependencies (filter/search) change.
	const dataSource = useMemo(() => {
		return new RestDataSource<ProjectItem, ProjectItem>({
			url: '/api/v1/dashboard/projects',
			keyExtractor: (item) => item.project_id,
			defaultParams: {
				category: selectedMessageType.value,
				search: searchQuery,
				sortBy: 'last_updated', // Default sort
				sortDir: 'desc',
			},
		});
	}, [selectedMessageType.value, searchQuery]);

	const handleSearchInput = (e: InputEvent) => {
		const target = e.target as HTMLInputElement;
		setSearchQuery(target.value);
	};

	const handleItemClick = (key: string) => {
		console.log('Project selected:', key);
		// TODO: Navigate to project details or set active project signal
	};

	return (
		<div class='layout-projects__sidebar'>
			<div class='layout-projects__sidebar__header'>
				<SelectField
					name='message-type'
					value={selectedMessageType}
					options={projectCategories}
					multiple={false}
					searchable={false}
					onChange={(value) => selectedMessageType.value = value as string}
				/>
				{/* Simple visual search toggle for now, can be expanded */}
				<button type='button' title='Search'>
					<IconSearch />
				</button>
			</div>

			{/* Search Input (Always visible for now for testing) */}
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

			{/* The Data Display Component */}
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
		</div>
	);
}
