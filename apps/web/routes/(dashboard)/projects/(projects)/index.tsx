/**
 * @file index.tsx
 * @description Projects Workspace landing route. Renders the persona-gated control-hub dashboard
 * island inside the layout's `project-content` partial (no project selected → workspace overview).
 */

import ProjectsDashboard from '@features/dashboard/projects/islands/ProjectsDashboard.island.tsx';

export default function Projects() {
	return <ProjectsDashboard />;
}
