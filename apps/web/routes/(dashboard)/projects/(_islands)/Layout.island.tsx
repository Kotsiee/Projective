import { ProjectsLayoutIsland } from 'packages/features/dashboard/projects/client.ts';
import { ComponentChildren } from 'preact';

type ProjectsLayoutProps = {
	url: URL;
	projectId: string | undefined;
	children: ComponentChildren;
};

export default function ProjectsLayoutIslandWrapper(props: ProjectsLayoutProps) {
	return <ProjectsLayoutIsland {...props} />;
}
