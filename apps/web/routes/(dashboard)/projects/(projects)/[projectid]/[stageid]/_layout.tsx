import { define } from '@utils';
import StageLayoutIslandWrapper from '../../../(_islands)/project/stage/Layout.island.tsx';

export default define.layout(function App(ctx) {
	const { projectid, stageid } = ctx.params;

	return (
		<>
			<StageLayoutIslandWrapper projectId={projectid} stageId={stageid}>
				<ctx.Component />
			</StageLayoutIslandWrapper>
		</>
	);
});
