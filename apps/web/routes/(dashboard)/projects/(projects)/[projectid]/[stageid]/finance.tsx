/**
 * @file finance.tsx
 * @description Stage "Finance" tab — server controller. Resolves the stage escrow/settlement
 * summary on the server (via `StagesServiceBackend.getStageFinance`, the `projects.get_stage_finance`
 * RPC) and hands it to the island as `initialData`, so the tab paints instantly with no client
 * fetch on mount. The island keeps the Fund/Approve/Fair-exit actions and re-loads after each. If
 * the server load fails, the island falls back to its own client fetch.
 */

import { define } from '@utils';
import StageFinanceIsland, {
	type StageFinanceData,
} from '@features/dashboard/projects/islands/project/stage/StageFinance.island.tsx';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';

export default define.page(async function ProjectStageFinance(ctx) {
	let initialData: StageFinanceData | null = null;
	try {
		initialData = await StagesServiceBackend.getStageFinance(
			ctx.params.projectid,
			ctx.params.stageid,
			ctx.req,
		) as StageFinanceData;
	} catch (_err) {
		// Non-fatal: the island client-fetches as a fallback.
		initialData = null;
	}

	return <StageFinanceIsland initialData={initialData} />;
});
