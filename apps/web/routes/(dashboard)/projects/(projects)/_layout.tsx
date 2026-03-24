import ProjectsLayoutIslandWrapper from '../(_islands)/Layout.island.tsx';
import { define } from '@utils';
import { Partial } from 'fresh/runtime';

export default define.layout(function App(ctx) {
	return (
		<ProjectsLayoutIslandWrapper url={ctx.url} projectId={ctx.params.projectid}>
			<Partial name='project-content'>
				<ctx.Component />
			</Partial>
		</ProjectsLayoutIslandWrapper>
	);
});
