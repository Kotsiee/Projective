import '@styles/components/dashboard/projects/project/project-sidebar-details.css';
import { useProjectContext } from '@contexts/ProjectContext.tsx';
import { IconArrowLeft, IconLogout, IconSettings, IconUsers } from '@tabler/icons-preact';
import ProjectSidebarStageItem from './ProjectSidebarStageItem.tsx';

export default function ProjectSidebarDetails() {
	// 1. Consume the Context
	const { project, isLoading, error } = useProjectContext();

	// 2. Handle Loading & Error States locally
	if (isLoading.value && !project.value) {
		return <div class='sidebar-details--loading'>Loading Project...</div>;
	}

	if (error.value) {
		return <div class='sidebar-details--error'>Error: {error.value}</div>;
	}

	if (!project.value) return null;

	// 3. Render using context data
	const data = project.value;

	return (
		<div class='sidebar-details'>
			{/* Header Section */}
			<div class='sidebar-details__header'>
				<a href='/projects' class='sidebar-details__back-link'>
					<IconArrowLeft size={16} />
					Back to List
				</a>

				<div class='sidebar-details__header-content'>
					<img
						src={data.owner.avatar_url || 'https://placehold.co/50x50'}
						class='sidebar-details__avatar'
						alt={data.owner.name}
					/>
					<div class='sidebar-details__header-text'>
						<h2 class='sidebar-details__title'>{data.title}</h2>
						<p class='sidebar-details__owner'>by {data.owner.name}</p>
					</div>
				</div>

				<div class='sidebar-details__nav'>
					<a href={`/projects/${data.project_id}/team`} class='sidebar-details__nav-link'>
						<IconUsers size={18} />
						<span>Team</span>
					</a>
					<a href={`/projects/${data.project_id}/settings`} class='sidebar-details__nav-link'>
						<IconSettings size={18} />
						<span>Settings</span>
					</a>
				</div>
			</div>

			{/* Stages List (Scrollable) */}
			<div class='sidebar-details__stages'>
				<h3 class='sidebar-details__section-title'>Project Stages</h3>
				<div class='sidebar-details__list-wrapper'>
					{data.stages.length === 0
						? <div class='sidebar-details--empty'>No stages created yet.</div>
						: (
							data.stages.map((stage) => (
								<ProjectSidebarStageItem
									key={stage.id}
									stage={stage}
									projectId={data.project_id}
								/>
							))
						)}
				</div>
			</div>

			{/* Footer Actions */}
			<div class='sidebar-details__footer'>
				<button class='sidebar-details__action sidebar-details__action--leave'>
					<IconLogout size={18} />
					<span>Leave Project</span>
				</button>
			</div>
		</div>
	);
}
