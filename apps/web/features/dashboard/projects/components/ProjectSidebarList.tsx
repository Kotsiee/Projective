/**
 * @file ProjectSidebarList.tsx
 * @description Sidebar view displaying a filterable, infinitely scrolling list of projects.
 */

// #region Imports
import '../styles/components/project-sidebar-list.css';
import { IconCompass, IconFolderOff, IconPlus, IconSearch, IconX } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { ProjectItem } from '../contracts/Projects.ts';
import { ProjectListItem } from './ProjectListItem.tsx';
import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Button, IconButton } from '@projective/ui';
import NewProjectModal from './new/NewProjectModal.tsx';
// #endregion

export default function ProjectsSidebarList() {
	// #region State
	const searchQuery = useSignal('');
	const isSearchExpanded = useSignal(false);
	const activeFilter = useSignal('all');

	const isNewProjectModalOpen = useSignal(false);

	// Placeholder tags for filtering
	const filterTags = [
		{ id: 'all', label: 'All' },
		{ id: 'active', label: 'Active' },
		{ id: 'starred', label: 'Starred' },
		{ id: 'archived', label: 'Archived' },
	];
	// #endregion

	// #region Data Management
	const dataSource = useMemo(() => {
		return new RestDataSource<ProjectItem, ProjectItem>({
			url: '/api/v1/dashboard/projects',
			keyExtractor: (item) => item.project_id,
			defaultParams: {
				category: activeFilter.value,
				search: searchQuery.value,
				sortBy: 'last_updated',
				sortDir: 'desc',
			},
		});
	}, [activeFilter.value, searchQuery.value]);
	// #endregion

	// #region Handlers
	const toggleSearch = () => {
		isSearchExpanded.value = !isSearchExpanded.value;
		if (!isSearchExpanded.value) {
			searchQuery.value = ''; // Clear search when collapsing
		}
	};
	// #endregion

	return (
		<div class='project-sidebar-list'>
			{/* 1. Header & Actions */}
			<div class='project-sidebar-list__header'>
				<h3 class='project-sidebar-list__title'>Projects</h3>
				<div class='project-sidebar-list__actions'>
					<IconButton
						className='project-sidebar-list__action-btn'
						onClick={toggleSearch}
						aria-label='Search Projects'
					>
						{isSearchExpanded.value ? <IconX size={18} /> : <IconSearch size={18} />}
					</IconButton>
				</div>
			</div>

			{/* 2. Expandable Search Bar */}
			{isSearchExpanded.value && (
				<div class='project-sidebar-list__search-container'>
					<IconSearch size={16} class='project-sidebar-list__search-icon' />
					<input
						type='text'
						class='project-sidebar-list__search-input'
						placeholder='Search projects...'
						value={searchQuery.value}
						onInput={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
						autoFocus
					/>
				</div>
			)}

			{/* 3. Filter Tags (Chips) */}
			<div class='project-sidebar-list__tags'>
				{filterTags.map((tag) => (
					<button
						key={tag.id}
						class={`project-sidebar-list__tag ${
							activeFilter.value === tag.id ? 'project-sidebar-list__tag--active' : ''
						}`}
						onClick={() => activeFilter.value = tag.id}
					>
						{tag.label}
					</button>
				))}
			</div>

			{/* 4. Infinite Scroll List */}
			<div class='project-sidebar-list__content'>
				<DataDisplay<ProjectItem, ProjectItem>
					dataSource={dataSource}
					mode='list'
					estimateHeight={72}
					pageSize={20}
					selectionMode='none'
					renderItem={(project) => <ProjectListItem project={project} />}
					interactive={false}
					emptyState={
						<div class='project-sidebar-list__empty'>
							<IconFolderOff size={48} stroke={1.5} class='project-sidebar-list__empty-icon' />
							<p class='project-sidebar-list__empty-text'>No projects found.</p>
							<Button
								href='/explore?category=projects'
								className='project-sidebar-list__empty-link'
								f-client-nav={false}
								variant='primary'
							>
								<IconCompass size={18} />
								Explore Projects
							</Button>
						</div>
					}
				/>
			</div>

			<div class='project-sidebar-list__actions'>
				<Button
					onClick={() => isNewProjectModalOpen.value = true}
					className='project-sidebar-list__new-btn'
					aria-label='New Project'
					fullWidth
					variant='secondary'
				>
					<span class='project-sidebar-list__new-btn__content'>
						<IconPlus size={18} />
						<span>
							Create New Project
						</span>
					</span>
				</Button>
			</div>

			{isNewProjectModalOpen.value && (
				<NewProjectModal
					isOpen={isNewProjectModalOpen.value}
					onClose={() => isNewProjectModalOpen.value = false}
				/>
			)}
		</div>
	);
}
