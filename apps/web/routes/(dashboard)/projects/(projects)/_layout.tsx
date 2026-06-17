/**
 * @file _layout.tsx
 * @description Project-level layout boundary. Delegates structural rendering to the global Navigation Context.
 */

// #region Imports
import { define } from '@utils';
import { Partial } from 'fresh/runtime';
import ProjectsLayoutIsland from '@features/dashboard/projects/islands/ProjectsLayout.island.tsx';
// #endregion

export default define.layout(function ProjectsLayout(ctx) {
	return (
		<ProjectsLayoutIsland
			projectId={ctx.params.projectid}
		>
			<Partial name='project-content'>
				<ctx.Component />
			</Partial>
		</ProjectsLayoutIsland>
	);
});
