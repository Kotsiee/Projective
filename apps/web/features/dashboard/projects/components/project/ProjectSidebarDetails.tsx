import '../../styles/components/project/project-sidebar-details.css';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import {
	IconArrowLeft,
	IconBriefcase,
	IconCalendar,
	IconChevronDown,
	IconDots,
	IconDotsVertical,
	IconFile,
	IconHash,
	IconPlus,
	IconSettings,
	IconUser,
	IconUsers,
} from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';
import NewStageModal from '../../components/new/NewStageModal.tsx';
import { Head } from 'fresh/runtime';

export default function ProjectSidebarDetails() {
	const { project, isLoading, error } = useProjectContext();

	// Collapse state signals
	const isStagesOpen = useSignal(true);
	const isTeamsOpen = useSignal(true);
	const isDmsOpen = useSignal(true);
	const isNewStageModalOpen = useSignal(false);

	if (isLoading.value && !project.value) {
		return <div class='sidebar-details--loading'>Loading Project...</div>;
	}

	if (error.value) {
		return <div class='sidebar-details--error'>Error: {error.value}</div>;
	}

	if (!project.value) return null;

	const data = project.value;

	// Permission evaluation - expand this based on your specific ProjectPermission enum
	const canEdit = data.viewer_context.role === 'owner' ||
		data.viewer_context.role === 'collaborator';

	return (
		<div class='sidebar-details'>
			<Head>
				<title>{project.value?.title}</title>
			</Head>
			<div class='sidebar-details__header'>
				<div class='sidebar-details__header__actions'>
					<IconButton
						aria-label='Back to List'
						variant='secondary'
						size='small'
					>
						<IconArrowLeft size={16} />
					</IconButton>
					<IconButton
						size='small'
						aria-label='Menu'
						variant='secondary'
					>
						<IconDotsVertical size={16} />
					</IconButton>
				</div>
				<div class='sidebar-details__header__details'>
					<div class='sidebar-details__header__details__avatar'>
						<img
							src={data.owner.avatar_url ??
								'https://cdn.prod.website-files.com/62d84e447b4f9e7263d31e94/6399a4d27711a5ad2c9bf5cd_ben-sweet-2LowviVHZ-E-unsplash-1.jpeg'}
							alt={data.owner.name}
						/>
					</div>
					<div class='sidebar-details__header__details__info'>
						<h3 class='sidebar-details__header__details__title'>{data.title}</h3>
						<a class='sidebar-details__header__details__owner' href={`/${data.owner.username}`}>
							{data.owner.name}
						</a>
					</div>
				</div>
			</div>

			<div class='sidebar-details__content'>
				<div class='sidebar-details__channels'>
					{/* 1. General Channel */}
					<div class='sidebar-details__channels__group'>
						<ul class='sidebar-details__channels__list'>
							<ProjectSidebarDetailsChannelsListItem
								title='General'
								icon={<IconHash size={16} />}
								url={`/projects/${data.project_id}/general`}
								isActive={false} // Hook up to your current route logic
							/>
						</ul>
					</div>

					{/* 2. Stages */}
					<div class='sidebar-details__channels__group'>
						<ProjectSidebarDetailsChannelsHeader
							title='Stages'
							isOpen={isStagesOpen.value}
							onToggle={() => isStagesOpen.value = !isStagesOpen.value}
							onAdd={() => {
								isNewStageModalOpen.value = true;
							}}
						/>
						{isStagesOpen.value && (
							<ul class='sidebar-details__channels__list'>
								{data.stages.length === 0
									? <div class='sidebar-details__channels__empty'>No stages created yet.</div>
									: (
										data.stages.map((stage) => (
											<ProjectSidebarDetailsChannelsListItem
												key={stage.id}
												title={stage.name}
												icon={<IconHash size={16} />}
												url={`/projects/${data.project_id}/${stage.id}/chat`}
												onOptions={canEdit
													? () => console.log(`Open options for stage: ${stage.id}`)
													: undefined}
											/>
										))
									)}
							</ul>
						)}
					</div>

					{/* 3. Teams */}
					<div class='sidebar-details__channels__group'>
						<ProjectSidebarDetailsChannelsHeader
							title='Teams'
							isOpen={isTeamsOpen.value}
							onToggle={() => isTeamsOpen.value = !isTeamsOpen.value}
						/>
						{isTeamsOpen.value && (
							<ul class='sidebar-details__channels__list'>
								{/* Placeholder data - map over actual team memberships when ready */}
								<ProjectSidebarDetailsChannelsListItem
									title='Frontend Guild'
									icon={<IconUsers size={16} />}
									url={`/projects/${data.project_id}/team-1`}
								/>
							</ul>
						)}
					</div>

					{/* 4. Direct Messages */}
					<div class='sidebar-details__channels__group'>
						<ProjectSidebarDetailsChannelsHeader
							title='Direct Messages'
							isOpen={isDmsOpen.value}
							onToggle={() => isDmsOpen.value = !isDmsOpen.value}
						/>
						{isDmsOpen.value && (
							<ul class='sidebar-details__channels__list'>
								{/* Placeholder data - map over actual DMs when ready */}
								<ProjectSidebarDetailsChannelsListItem
									title='Alice Johnson'
									icon={
										<div class='sidebar-details__channels__dm-avatar'>
											<IconUser size={12} />
										</div>
									}
									url={`/projects/${data.project_id}/dm-1`}
								/>
								<ProjectSidebarDetailsChannelsListItem
									title='Bob Smith'
									icon={
										<div class='sidebar-details__channels__dm-avatar'>
											<IconUser size={12} />
										</div>
									}
									url={`/projects/${data.project_id}/dm-2`}
								/>
							</ul>
						)}
					</div>
				</div>

				<div class='sidebar-details__actions'>
					<div>
						<IconButton
							href={`/projects/${data.project_id}`}
							aria-label='Project Details'
							variant='secondary'
						>
							<IconBriefcase size={20} />
						</IconButton>
						<IconButton
							href={`/projects/${data.project_id}/board`}
							aria-label='Stage Management'
							variant='secondary'
						>
							<IconCalendar size={20} />
						</IconButton>
						<IconButton
							href={`/projects/${data.project_id}/members`}
							aria-label='Members'
							variant='secondary'
						>
							<IconUsers size={20} />
						</IconButton>
						<IconButton
							href={`/projects/${data.project_id}/attachments`}
							aria-label='Attachments'
							variant='secondary'
						>
							<IconFile size={20} />
						</IconButton>
					</div>
					<IconButton
						href={`/projects/${data.project_id}/settings`}
						aria-label='Settings'
						variant='secondary'
					>
						<IconSettings size={20} />
					</IconButton>
				</div>
			</div>

			{isNewStageModalOpen.value && (
				<NewStageModal
					isOpen={isNewStageModalOpen.value}
					onClose={() => isNewStageModalOpen.value = false}
					projectId={data.project_id}
					projectFormat={data.format}
				/>
			)}
		</div>
	);
}

// #region Helper Components

interface ChannelHeaderProps {
	title: string;
	isOpen: boolean;
	onToggle: () => void;
	onAdd?: () => void;
}

function ProjectSidebarDetailsChannelsHeader(
	{ title, isOpen, onToggle, onAdd }: ChannelHeaderProps,
) {
	return (
		<div class='sidebar-details__channels__header'>
			<button
				type='button'
				class={`sidebar-details__channels__header-toggle ${
					!isOpen ? 'sidebar-details__channels__header-toggle--closed' : ''
				}`}
				onClick={onToggle}
			>
				<IconChevronDown size={14} />
				<h5 class='sidebar-details__channels__title'>{title}</h5>
			</button>

			{onAdd && (
				<div class='sidebar-details__channels__header-actions'>
					<button
						type='button'
						class='sidebar-details__channels__action__add'
						onClick={onAdd}
						title={`Add ${title.slice(0, -1)}`}
					>
						<IconPlus size={16} />
					</button>
				</div>
			)}
		</div>
	);
}

interface ChannelItemProps {
	title: string;
	url: string;
	icon: ComponentChildren;
	isActive?: boolean;
	onOptions?: () => void;
}

function ProjectSidebarDetailsChannelsListItem(
	{ title, icon, url, isActive, onOptions }: ChannelItemProps,
) {
	return (
		<li class='sidebar-details__channels__list-item-wrapper'>
			<a
				href={url}
				class={`sidebar-details__channels__list-item ${
					isActive ? 'sidebar-details__channels__list-item--active' : ''
				}`}
				f-client-nav={false}
			>
				<span class='sidebar-details__channels__list-item-icon'>{icon}</span>
				<span class='sidebar-details__channels__list-item-title'>{title}</span>
			</a>
			{onOptions && (
				<button
					type='button'
					class='sidebar-details__channels__list-item-options'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onOptions();
					}}
					title='Options'
				>
					<IconDots size={16} />
				</button>
			)}
		</li>
	);
}

// #endregion
