/**
 * @file ProjectSidebarList.tsx
 * @description The workspace-level side navigation shown when no single project is open. A premium,
 * collapse-aware rail: a workspace header, a facet navigation built on the `Button` primitive (with
 * distinct hover/active states and variable weights), quick links, and a filterable, infinitely
 * scrolling project list. Collapsing swaps to an icon-only rail — mirroring the primary site nav.
 */

// #region Imports
import '../styles/components/project-sidebar-list.css';
import {
	IconArchive,
	IconBolt,
	IconCompass,
	IconFolder,
	IconFolderOff,
	IconLayoutBoard,
	IconLayoutGrid,
	IconPlus,
	IconSearch,
	IconStar,
	IconX,
} from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { ProjectItem } from '../contracts/Projects.ts';
import { ProjectListItem } from './ProjectListItem.tsx';
import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Button, IconButton } from '@projective/ui';
import NewProjectModal from './modals/NewProjectModal.tsx';
// #endregion

// #region Config
/** Facet navigation — each item drives the list's `category` filter (parity with the RPC contract). */
const FACETS = [
	{ id: 'all', label: 'All Projects', icon: IconLayoutGrid },
	{ id: 'active', label: 'Active', icon: IconBolt },
	{ id: 'starred', label: 'Starred', icon: IconStar },
	{ id: 'archived', label: 'Archived', icon: IconArchive },
] as const;
// #endregion

export default function ProjectsSidebarList({ collapsed = false }: { collapsed?: boolean }) {
	// #region State
	const searchQuery = useSignal('');
	const isSearchExpanded = useSignal(false);
	const activeFilter = useSignal<string>('all');
	const isNewProjectModalOpen = useSignal(false);
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
		if (!isSearchExpanded.value) searchQuery.value = '';
	};

	const scrollToTemplates = () => {
		document.getElementById('projects-templates')?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};
	// #endregion

	// #region Collapsed icon rail — mirrors the primary nav's icon-only state
	if (collapsed) {
		return (
			<nav class='psl psl--collapsed' aria-label='Projects workspace'>
				<span class='psl__brand-mark' aria-hidden='true'>
					<IconFolder size={20} />
				</span>
				<div class='psl__rail'>
					{FACETS.map((f) => {
						const Icon = f.icon;
						const active = activeFilter.value === f.id;
						return (
							<IconButton
								key={f.id}
								aria-label={f.label}
								variant='secondary'
								ghost
								className={`psl__rail-btn ${active ? 'is-active' : ''}`}
								onClick={() => (activeFilter.value = f.id)}
							>
								<Icon size={19} />
							</IconButton>
						);
					})}
					<span class='psl__rail-divider' aria-hidden='true' />
					<IconButton
						aria-label='Explore projects'
						variant='secondary'
						ghost
						href='/explore?category=projects'
						f-client-nav={false}
						className='psl__rail-btn'
					>
						<IconCompass size={19} />
					</IconButton>
					<IconButton
						aria-label='Project templates'
						variant='secondary'
						ghost
						className='psl__rail-btn'
						onClick={scrollToTemplates}
					>
						<IconLayoutBoard size={19} />
					</IconButton>
				</div>
				<IconButton
					aria-label='New project'
					variant='primary'
					rounded
					className='psl__rail-new'
					onClick={() => (isNewProjectModalOpen.value = true)}
				>
					<IconPlus size={19} />
				</IconButton>

				{isNewProjectModalOpen.value && (
					<NewProjectModal
						isOpen={isNewProjectModalOpen.value}
						onClose={() => (isNewProjectModalOpen.value = false)}
					/>
				)}
			</nav>
		);
	}
	// #endregion

	return (
		<div class='psl'>
			{/* 1. Workspace header */}
			<div class='psl__header'>
				<div class='psl__brand'>
					<span class='psl__brand-mark' aria-hidden='true'>
						<IconFolder size={18} />
					</span>
					<div class='psl__brand-text'>
						<span class='psl__eyebrow'>Workspace</span>
						<h3 class='psl__title'>Projects</h3>
					</div>
				</div>
				<IconButton
					aria-label={isSearchExpanded.value ? 'Close search' : 'Search projects'}
					variant='secondary'
					ghost
					onClick={toggleSearch}
				>
					{isSearchExpanded.value ? <IconX size={18} /> : <IconSearch size={18} />}
				</IconButton>
			</div>

			{/* 2. Expandable search */}
			{isSearchExpanded.value && (
				<div class='psl__search'>
					<IconSearch size={15} class='psl__search-icon' />
					<input
						type='text'
						class='psl__search-input'
						placeholder='Search projects…'
						value={searchQuery.value}
						onInput={(e) => (searchQuery.value = (e.target as HTMLInputElement).value)}
						autoFocus
					/>
				</div>
			)}

			{/* 3. Facet navigation — Button primitive, active + hover states */}
			<nav class='psl__nav' aria-label='Filter projects'>
				{FACETS.map((f) => {
					const Icon = f.icon;
					const active = activeFilter.value === f.id;
					return (
						<Button
							key={f.id}
							variant='secondary'
							ghost
							fullWidth
							size='small'
							startIcon={<Icon size={17} />}
							className={`psl__nav-item ${active ? 'is-active' : ''}`}
							onClick={() => (activeFilter.value = f.id)}
						>
							{f.label}
						</Button>
					);
				})}
			</nav>

			{/* 4. Quick links */}
			<div class='psl__links'>
				<Button
					variant='secondary'
					ghost
					fullWidth
					size='small'
					href='/explore?category=projects'
					f-client-nav={false}
					startIcon={<IconCompass size={17} />}
					className='psl__nav-item psl__nav-item--muted'
				>
					Explore Projects
				</Button>
				<Button
					variant='secondary'
					ghost
					fullWidth
					size='small'
					startIcon={<IconLayoutBoard size={17} />}
					className='psl__nav-item psl__nav-item--muted'
					onClick={scrollToTemplates}
				>
					Templates
				</Button>
			</div>

			{/* 5. Project list */}
			<div class='psl__list'>
				<span class='psl__list-label'>Recent</span>
				<div class='psl__list-scroll'>
					<DataDisplay<ProjectItem, ProjectItem>
						dataSource={dataSource}
						mode='list'
						estimateHeight={64}
						pageSize={20}
						selectionMode='none'
						renderItem={(project) => <ProjectListItem project={project} />}
						interactive={false}
						emptyState={
							<div class='psl__empty'>
								<IconFolderOff size={40} stroke={1.5} class='psl__empty-icon' />
								<p class='psl__empty-text'>No projects here yet.</p>
								<Button
									href='/explore?category=projects'
									f-client-nav={false}
									variant='secondary'
									size='small'
									outlined
									startIcon={<IconCompass size={16} />}
								>
									Explore Projects
								</Button>
							</div>
						}
					/>
				</div>
			</div>

			{/* 6. Primary action */}
			<div class='psl__foot'>
				<Button
					variant='primary'
					fullWidth
					startIcon={<IconPlus size={18} />}
					onClick={() => (isNewProjectModalOpen.value = true)}
				>
					Create New Project
				</Button>
			</div>

			{isNewProjectModalOpen.value && (
				<NewProjectModal
					isOpen={isNewProjectModalOpen.value}
					onClose={() => (isNewProjectModalOpen.value = false)}
				/>
			)}
		</div>
	);
}
