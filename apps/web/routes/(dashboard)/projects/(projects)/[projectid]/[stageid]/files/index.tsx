/**
 * @file index.tsx
 * @description Stage "Files" tab — server controller. Resolves the stage's channel and its
 * aggregated attachments on the server (`ProjectsBackendService.getStage` → `getFiles` →
 * `parseStageFiles`) and hands the parsed entries to the island as `initialEntries`, so the grid
 * paints instantly with no client fetch on mount. Client-side search/sort/filter + the lightbox
 * stay interactive; the island falls back to its own fetch if the server load fails.
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import ProjectFileIsland from '@features/dashboard/projects/islands/project/stage/StageFile.island.tsx';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';
import { getFiles } from '@features/shared/services/comms/getFiles.ts';
import { parseStageFiles, type StageFileEntry } from '@projective/data';

/** Matches the island's single-sweep upper bound. */
const FETCH_LIMIT = 200;

export default define.page(async function ProjectStageFiles(ctx) {
	let initialEntries: StageFileEntry[] | null = null;
	try {
		const getClient = () => supabaseClient(ctx.req);
		const stageRes = await ProjectsBackendService.getStage(
			ctx.params.projectid,
			ctx.params.stageid,
			{ getClient },
		);
		const channelId = stageRes.ok ? stageRes.data?.channel_id ?? null : null;

		if (channelId) {
			const filesRes = await getFiles(
				channelId,
				{
					start: 0,
					limit: FETCH_LIMIT,
					countOnly: false,
					type: 'channel',
					category: 'all',
					search: '',
				},
				{ getClient },
			);
			if (filesRes.ok) initialEntries = parseStageFiles(filesRes.data.items);
		}
	} catch (_err) {
		// Non-fatal: the island client-fetches as a fallback.
		initialEntries = null;
	}

	return <ProjectFileIsland initialEntries={initialEntries} />;
});
