import '@styles/components/dashboard/projects/project-list-item.css';
import { IconStar } from '@tabler/icons-preact';
import { ProjectItem } from '@contracts/dashboard/projects/Projects.ts';

interface ProjectListItemProps {
	project: ProjectItem;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
	const projectUrl = `/projects/${project.project_id}`;

	return (
		<a
			href={projectUrl}
			className='project-list-item'
			data-f-preload
			f-client-nav={false}
		>
			<img
				src={project.owner_avatar_url || 'https://placehold.co/32x32'}
				alt={project.owner_name}
				className='project-list-item__avatar'
			/>

			<div className='project-list-item__content'>
				<span className='project-list-item__title'>{project.title}</span>
				<div className='project-list-item__meta'>
					<span
						className={`project-list-item__status project-list-item__status--${project.status}`}
						title={`Status: ${project.status}`}
					/>
					<span>{project.owner_name}</span>
				</div>
			</div>

			<div className='project-list-item__indicators'>
				{project.is_starred && (
					<IconStar
						size={16}
						className='project-list-item__icon--active'
					/>
				)}
				{project.is_unread && (
					<span className='project-list-item__unread-dot' title='Unread activity' />
				)}
			</div>
		</a>
	);
}
