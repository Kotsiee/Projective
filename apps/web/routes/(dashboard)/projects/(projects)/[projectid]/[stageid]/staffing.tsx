/**
 * @file staffing.tsx
 * @description Stage "Staffing" tab — server controller (US-004). Resolves the staffing read-model
 * on the server (via `StaffingServiceBackend.getStageStaffing`) and hands it to the island as
 * `initialData` so it doesn't re-fetch on mount. The island still derives viewer authority
 * (canManage / Apply) from the live StageContext and owns the seat/apply/assign mutations. If the
 * server load fails, the island falls back to its own client fetch.
 */

import { define } from '@utils';
import StageStaffingRoute from '@features/dashboard/projects/islands/project/stage/StageStaffing.island.tsx';
import { StaffingServiceBackend } from '@features/dashboard/projects/services/StaffingServiceBackend.ts';
import type { StageStaffingDTO } from '@features/dashboard/projects/services/StaffingService.ts';

export default define.page(async function ProjectStageStaffing(ctx) {
	let initialData: StageStaffingDTO | null = null;
	try {
		initialData = await StaffingServiceBackend.getStageStaffing(
			ctx.params.projectid,
			ctx.params.stageid,
			ctx.req,
		) as StageStaffingDTO;
	} catch (_err) {
		// Non-fatal: the island client-fetches as a fallback.
		initialData = null;
	}

	return <StageStaffingRoute initialData={initialData} />;
});
