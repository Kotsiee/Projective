import { define } from '@utils';
import ProjectsLayout from '@islands/pages/dashboard/projects/ProjectsLayout.tsx';
import { Partial } from 'fresh/runtime';

export default define.layout(function App(ctx) {
	return (
		<ProjectsLayout url={ctx.url} projectId={ctx.params.projectid}>
			<Partial name='project-content'>
				<ctx.Component />
			</Partial>
		</ProjectsLayout>
	);
});
