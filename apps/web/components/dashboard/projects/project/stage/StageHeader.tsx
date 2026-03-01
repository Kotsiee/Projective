/**
 * @file StageHeader.tsx
 * @description Floating header component for the stage layout, displaying stage details,
 * contextual tabs, and actions.
 */

import { useStageContext } from '@contexts/StageContext.tsx';
import { stageTabs } from '@projective/types';
import { useProjectContext } from '@contexts/ProjectContext.tsx';
import { IconDotsVertical } from '@tabler/icons-preact';

/**
 * Renders the stage header with dynamic tabs and stage metadata.
 * * @returns {preact.VNode} The rendered StageHeader component.
 */
export default function StageHeader() {
	const { stage, stage_id } = useStageContext();
	const { project, project_id } = useProjectContext();

	let tabs: { label: string; href: string }[] = [];
	if (stage.value) {
		tabs = stageTabs(stage.value.stage_type);
	}

	const isCurrentTab = (href: string) => {
		if (typeof window === 'undefined') return false;
		return globalThis.location.href.includes(
			`/projects/${project_id.value}/${stage_id.value}/${href}`,
		);
	};

	return (
		<div class='stage-header__container'>
			<div class='stage-header'>
				<div class='stage-header__left'>
					<img
						src={project.value?.banner_url || 'https://placehold.co/50'}
						alt='Stage Assignee Avatar'
						class='stage-header__avatar'
					/>
					<div class='stage-header__details'>
						<h3 class='stage-header__title'>
							{stage.value?.title || 'Loading Stage...'}
						</h3>
						<p class='stage-header__meta'>
							Active
						</p>
					</div>
				</div>

				<div class='stage-header__center'>
					{tabs.map((tab) => {
						const targetUrl = `/projects/${project_id.value}/${stage_id.value}/${tab.href}`;
						return (
							<a
								key={tab.href}
								class='stage-header__tab'
								data-current={isCurrentTab(tab.href)}
								href={targetUrl}
								f-partial={targetUrl}
							>
								{tab.label}
							</a>
						);
					})}
				</div>

				<div class='stage-header__right'>
					<button type='button' class='stage-header__action-btn' title='Stage Options'>
						<IconDotsVertical size={20} />
					</button>
				</div>
			</div>
		</div>
	);
}
