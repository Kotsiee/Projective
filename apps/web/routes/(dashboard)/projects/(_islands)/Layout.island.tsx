import { ComponentChildren } from 'preact';
import ProjectsLayoutIsland from '@features/dashboard/projects/islands/ProjectsLayout.tsx';

type ProjectsLayoutProps = {
	url: URL;
	projectId: string | undefined;
	children: ComponentChildren;
};

export default function ProjectsLayoutIslandWrapper(props: ProjectsLayoutProps) {
	return <ProjectsLayoutIsland {...props} />;
}
