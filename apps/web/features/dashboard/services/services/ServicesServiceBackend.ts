/**
 * @file ServicesServiceBackend.ts
 * @description Server-side loader for the `/services` management suite. Follows the app's
 * Route → Service → props flow (apps/web/CLAUDE.md): the route awaits this on the server and hands
 * the result to the island as `initialData`. Backed by frontend seed today; swap the body for a
 * `services.*` RPC returning the same `ServicesOverview` and nothing downstream changes.
 */

import type { ServicesOverview } from '../contracts/services.ts';
import { SERVICES_OVERVIEW_SEED } from '../data/servicesSeed.ts';

export class ServicesServiceBackend {
	static getServicesOverview(): Promise<ServicesOverview> {
		return Promise.resolve(SERVICES_OVERVIEW_SEED);
	}
}
