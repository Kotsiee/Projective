import '@styles/components/dashboard/projects/project/project-sidebar-details.css';
import {
	IconArrowLeft,
	IconChartLine,
	IconInfoCircle,
	IconLogout,
	IconSettings,
	IconUsers,
} from '@tabler/icons-preact';

import { DataDisplay } from '@projective/data';

import { ProjectStageSummary, useProjectContext } from '@contexts/ProjectContext.tsx';

import { ProjectPermission } from '@projective/types';
import { StageListItem } from './ProjectSidebarDetailsStageItem.tsx';

export default function ProjectsSidebarDetails() {
	const { project, isLoading } = useProjectContext();

	if (isLoading.value || !project.value) {
		return (
			<div className='sidebar-details'>
				<div style={{ padding: '1rem', color: 'var(--text-tertiary)' }}>
					Loading project...
				</div>
			</div>
		);
	}

	const p = project.value;

	const can = (perm: ProjectPermission) => p.viewer_context?.permissions?.includes(perm);

	return (
		<div className='sidebar-details'>
			{/* --- HEADER --- */}
			<div className='sidebar-details__header'>
				<a
					href='/projects'
					className='sidebar-details__back-link'
					f-client-nav={false}
				>
					<IconArrowLeft size={18} />
					<span>Back</span>
				</a>
				<div className='sidebar-details__header-info'>
					<img
						src={p.owner.avatar_url ?? 'https://placehold.co/50'}
						alt={`${p.title} Avatar`}
						className='sidebar-details__avatar'
					/>
					<div>
						<h2 className='sidebar-details__title'>{p.title}</h2>
						<p className='sidebar-details__owner'>{p.owner.name}</p>
					</div>
				</div>
			</div>

			{/* --- NAVIGATION --- */}
			<div className='sidebar-details__nav'>
				<a
					href={`/projects/${p.project_id}`}
					className='sidebar-details__nav-link'
					f-partial={`/projects/${p.project_id}`}
				>
					<IconInfoCircle size={20} />
				</a>
				<a
					href={`/projects/${p.project_id}/members`}
					className='sidebar-details__nav-link'
					f-partial={`/projects/${p.project_id}/members`}
				>
					<IconUsers size={20} />
				</a>
				<a
					href={`/projects/${p.project_id}/timeline`}
					className='sidebar-details__nav-link'
					f-partial={`/projects/${p.project_id}/timeline`}
				>
					<IconChartLine size={20} />
				</a>
			</div>

			{/* --- STAGES LIST --- */}
			<div className='sidebar-details__stages'>
				<h3 className='sidebar-details__section-title'>Stages</h3>
				<div className='sidebar-details__list-wrapper'>
					<DataDisplay<ProjectStageSummary, ProjectStageSummary>
						dataSource={p.stages}
						mode='list'
						estimateHeight={50}
						pageSize={p.stages.length}
						selectionMode='none'
						interactive={false}
						renderItem={(stage) => <StageListItem stage={stage} projectId={p.project_id} />}
					/>
				</div>
			</div>

			{/* --- FOOTER ACTIONS --- */}
			<div className='sidebar-details__footer'>
				{can(ProjectPermission.ManageSettings) && (
					<a
						href={`/projects/${p.project_id}/settings`}
						className='sidebar-details__action sidebar-details__action--settings'
						f-partial={`/projects/${p.project_id}/settings`}
					>
						<IconSettings size={20} />
						<span>Settings</span>
					</a>
				)}

				<button
					type='button'
					className='sidebar-details__action sidebar-details__action--leave'
				>
					<IconLogout size={20} />
					<span>Leave Project</span>
				</button>
			</div>
		</div>
	);
}
