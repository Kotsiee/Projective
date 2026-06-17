import { define } from '@utils';
import StageLayoutIsland from '@features/dashboard/projects/islands/project/stage/StageLayout.island.tsx';
import { Partial } from 'fresh/runtime';

export default define.layout(function App(ctx) {
	return (
		<>
			<StageLayoutIsland
				projectId={ctx.params.projectid}
				stageId={ctx.params.stageid}
			>
				<Partial name='stage-content'>
					<ctx.Component />
				</Partial>
			</StageLayoutIsland>
		</>
	);
});
