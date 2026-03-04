import '../../styles/components/project/project-sidebar-details-stage-item.css';
import { ProjectStageSummary } from '../../contracts/Projects.ts';

interface StageListItemProps {
	stage: ProjectStageSummary;
	projectId: string;
}

export default function ProjectSidebarStageItem({ stage, projectId }: StageListItemProps) {
	const statusClass = stage.status.toLowerCase().replace(/_/g, '-');

	const typeLabel = stage.stage_type.replace(/_/g, ' ');

	return (
		<div class='stage-list-item__container'>
			<a
				href={`/projects/${projectId}/${stage.id}/chat`}
				f-partial={`/projects/${projectId}/${stage.id}/chat`}
				class='stage-list-item'
			>
				<div class='stage-list-item__info'>
					<span class='stage-list-item__title'>{stage.name}</span>
					<div class='stage-list-item__meta'>
						<span
							class={`stage-list-item__status-dot stage-list-item__status-dot--${statusClass}`}
							title={`Status: ${stage.status}`}
						/>
						<span class='stage-list-item__type'>
							{typeLabel}
						</span>
					</div>
				</div>

				<div class='stage-list-item__indicators'>
					{stage.unread && <span class='stage-list-item__unread' title='Unread messages' />}
				</div>
			</a>
		</div>
	);
}
