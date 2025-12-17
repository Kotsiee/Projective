import { define } from '@utils';
import ProjectsLayout from '@islands/pages/dashboard/projects/ProjectsLayout.tsx';

export default define.layout(function App({ Component }) {
	return (
		<>
			<ProjectsLayout>
				<Component />
			</ProjectsLayout>
		</>
	);
});
