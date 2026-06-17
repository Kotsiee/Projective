/**
 * @file StageHeader.tsx
 * @description Global middle-nav header component for the stage layout, displaying stage details,
 * contextual tabs, and actions. Injected via NavigationContext.
 */

// #region Imports
import '../../../styles/components/project/stage/stage-header.css';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { IconDotsVertical } from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';
// #endregion

export const stageTabs = () => {
	const tabs = [
		{ label: 'Chat', href: 'chat' },
		{ label: 'Files', href: 'files' },
		{ label: 'Tasks', href: 'tasks' },
		{ label: 'Submissions', href: 'submissions' },
		{ label: 'Finance', href: 'finance' },
		{ label: 'Members', href: 'members' },
	];

	return tabs;
};

// #region Component
export default function StageHeader() {
	const { stage, stage_id } = useStageContext();
	const { project, project_id } = useProjectContext();

	let tabs: { label: string; href: string }[] = [];
	if (stage.value) {
		tabs = stageTabs();
	}

	const isCurrentTab = (href: string) => {
		if (typeof window === 'undefined') return false;
		return globalThis.location.pathname.includes(
			`/projects/${project_id.value}/${stage_id.value}/${href}`,
		);
	};

	return (
		<div class='stage-header'>
			{/* Left: Identity */}
			<div class='stage-header__left'>
				<img
					src={project.value?.banner_url || 'https://placehold.co/32'}
					alt='Stage Assignee Avatar'
					class='stage-header__avatar'
				/>
				<div class='stage-header__details'>
					<h3 class='stage-header__title'>
						{stage.value?.title || 'Loading Stage...'}
					</h3>
					<span class='stage-header__status'>Active</span>
				</div>
			</div>

			{/* Center: Navigation Tabs */}
			<div class='stage-header__center'>
				{tabs.map((tab) => {
					const targetUrl = `/projects/${project_id.value}/${stage_id.value}/${tab.href}`;
					const isActive = isCurrentTab(tab.href);

					return (
						<a
							key={tab.href}
							class={`stage-header__tab ${isActive ? 'stage-header__tab--active' : ''}`}
							href={targetUrl}
							f-client-nav={false}
						>
							{tab.label}
						</a>
					);
				})}
			</div>

			{/* Right: Actions */}
			<div class='stage-header__right'>
				<IconButton
					ghost
					size='small'
					aria-label='Stage Options'
				>
					<IconDotsVertical size={18} />
				</IconButton>
			</div>
		</div>
	);
}
// #endregion
