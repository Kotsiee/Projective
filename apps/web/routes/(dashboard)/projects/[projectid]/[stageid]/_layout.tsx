import { define } from '@utils';
import StageLayout from '@islands/pages/dashboard/projects/project/stage/StageLayout.tsx';

export default define.layout(function App(ctx) {
	const { projectid, stageid } = ctx.params;

	return (
		<>
			<StageLayout projectId={projectid} stageId={stageid}>
				<ctx.Component />
			</StageLayout>
		</>
	);
});
