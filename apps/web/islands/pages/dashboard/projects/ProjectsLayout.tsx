import '@styles/layouts/projects.css';
import { type ComponentChildren } from 'preact';
import ProjectsSidebar from '@components/dashboard/projects/ProjectsSidebar.tsx';

type AuthLayoutProps = {
	children: ComponentChildren;
};

export default function ProjectsLayout(props: AuthLayoutProps) {
	return (
		<div class='layout-projects'>
			<div class='layout-projects__sidebar__container'>
				<ProjectsSidebar />
			</div>

			<div class='layout-projects__content__container'>
				{props.children}
			</div>
		</div>
	);
}
