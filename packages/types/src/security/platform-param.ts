/**
 * @file platform-param.ts
 * @description Zod schema and inferred type for tunable platform configuration. Mirrors
 * `security.platform_params` (a key/jsonb store read by the enforcement sweep RPCs).
 */

import { z } from 'zod';

/**
 * @description A single tunable parameter. `value` is arbitrary JSON (scalar for windows/severities).
 * Known keys include `workload_report_window_hours`, `claim_ttl_minutes`, `session_payout_hours`,
 * `platform_fee_bp`, `freelancer_bad_faith_penalty`, and `client_no_adjust_penalty`.
 */
export const PlatformParamSchema = z.object({
	key: z.string().min(1),
	value: z.unknown(),
	description: z.string().nullable(),
	updated_at: z.iso.datetime({}),
});
export type PlatformParam = z.infer<typeof PlatformParamSchema>;
