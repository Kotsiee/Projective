import '@styles/components/dashboard/projects/project/project-sidebar-details-stage-item.css';
import { ProjectStageSummary } from '@contexts/ProjectContext.tsx';

interface StageListItemProps {
	stage: ProjectStageSummary;
	projectId: string;
}

export function StageListItem({ stage, projectId }: StageListItemProps) {
	const statusClass = stage.status.toLowerCase().replace('_', '-');

	return (
		<a
			href={`/projects/${projectId}/${stage.id}/chat`}
			// f-client-nav allows us to navigate without full reload if supported by parent layout
			f-partial={`/projects/${projectId}/${stage.id}/chat`}
			className='stage-list-item'
		>
			<div className='stage-list-item__content'>
				<span className='stage-list-item__title'>{stage.name}</span>
				<div className='stage-list-item__meta'>
					<span
						className={`stage-list-item__status-dot stage-list-item__status-dot--${statusClass}`}
						title={`Status: ${stage.status}`}
					/>
					<span className='stage-list-item__type'>
						{stage.stage_type.replace('_', ' ')}
					</span>
				</div>
			</div>

			<div className='stage-list-item__indicators'>
				{stage.unread && <span className='stage-list-item__unread' title='Unread messages' />}
			</div>
		</a>
	);
}
