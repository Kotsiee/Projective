import '@styles/layouts/projects.css';
import { type ComponentChildren } from 'preact';
import ProjectsSidebar from '@components/dashboard/projects/ProjectsSidebar.tsx';
import { ProjectProvider } from '@contexts/ProjectContext.tsx';

type ProjectsLayoutProps = {
	url: URL;
	projectId: string | undefined;
	children: ComponentChildren;
};

export default function ProjectsLayout(props: ProjectsLayoutProps) {
	return (
		<ProjectProvider id={props.projectId}>
			<div class='layout-projects' f-client-nav>
				<div class='layout-projects__sidebar__container'>
					<ProjectsSidebar />
				</div>

				<div class='layout-projects__content__container'>
					{props.children}
				</div>
			</div>
		</ProjectProvider>
	);
}
