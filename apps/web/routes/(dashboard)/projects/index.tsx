import ProjectsHome from '@islands/pages/dashboard/projects/ProjectsHome.tsx';

export default function Projects() {
	return (
		<div>
			<a href='/projects/new'>New Project</a>
			<ProjectsHome />
		</div>
	);
}
