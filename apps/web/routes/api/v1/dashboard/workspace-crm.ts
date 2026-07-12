/**
 * @file workspace-crm.ts
 * @description `GET /api/v1/dashboard/workspace-crm` — the freelancer/team client roster that backs
 * the Projects workspace CRM tray + Services Pipeline. Thin route: return the seeded roster (a real
 * `projects.get_workspace_roster` RPC drops in here later returning the same `WorkspaceEntry[]`).
 */

import { define } from '@utils';
import { WORKSPACE_CRM_SEED } from '@features/dashboard/projects/data/workspaceCrmSeed.ts';

export const handler = define.handlers({
	GET() {
		return new Response(JSON.stringify(WORKSPACE_CRM_SEED), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'private, max-age=30',
			},
		});
	},
});
