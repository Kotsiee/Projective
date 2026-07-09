import { define } from '@utils';
import { Partial } from 'fresh/runtime';
import { supabaseClient } from '@projective/backend';
import StageLayoutIsland from '@features/dashboard/projects/islands/project/stage/StageLayout.island.tsx';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';
import type { StageDetails } from '@features/dashboard/projects/contracts/Projects.ts';

/**
 * Stage layout. Server-loads the stage details once (`ProjectsBackendService.getStage`) and seeds
 * them into the persistent `StageLayout` island's provider as `initialStage`, so the whole stage
 * surface — and every tab under it — paints instantly with no client "Loading…" flash. The provider
 * still owns `refresh()` for post-mutation re-pulls and re-fetches on stage-to-stage navigation. On
 * load failure the provider falls back to its own client fetch.
 */
export default define.layout(async function App(ctx) {
	let initialStage: StageDetails | null = null;
	try {
		const getClient = () => supabaseClient(ctx.req);
		const res = await ProjectsBackendService.getStage(
			ctx.params.projectid,
			ctx.params.stageid,
			{ getClient },
		);
		if (res.ok) initialStage = res.data;
	} catch (_err) {
		// Non-fatal: the provider client-fetches as a fallback.
		initialStage = null;
	}

	return (
		<StageLayoutIsland
			projectId={ctx.params.projectid}
			stageId={ctx.params.stageid}
			initialStage={initialStage}
		>
			<Partial name='stage-content'>
				<ctx.Component />
			</Partial>
		</StageLayoutIsland>
	);
});
