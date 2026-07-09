/**
 * @file index.tsx
 * @description Stage "Submissions" tab — server controller (spec §3). Server-loads the deliverable
 * ledger (`SubmissionsServiceBackend.listForStage`) and hands it to the island as
 * `initialSubmissions`, so the surface paints instantly with no client hydration fetch on mount.
 * The freelancer/client mutation flows (create / accept / request-revision) stay client-side and
 * persist through the submission RPCs; the provider falls back to its own fetch if the load fails.
 */

import { define } from '@utils';
import StageSubmissionsIsland from '@features/dashboard/projects/islands/project/stage/StageSubmissions.island.tsx';
import { SubmissionsServiceBackend } from '@features/dashboard/projects/services/SubmissionsServiceBackend.ts';
import type { SubmissionDTO } from '@features/dashboard/projects/services/SubmissionsService.ts';

export default define.page(async function ProjectStageSubmissions(ctx) {
	let initialSubmissions: SubmissionDTO[] | null = null;
	try {
		initialSubmissions = await SubmissionsServiceBackend.listForStage(
			ctx.params.projectid,
			ctx.params.stageid,
			ctx.req,
		) as SubmissionDTO[];
	} catch (_err) {
		// Non-fatal: the provider client-fetches as a fallback.
		initialSubmissions = null;
	}

	return <StageSubmissionsIsland initialSubmissions={initialSubmissions} />;
});
