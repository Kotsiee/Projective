/**
 * @file session-context.ts
 * @description Zod schema and inferred type for the active-profile session context. Mirrors
 * `security.session_context` (the row returned by `security.current_context`).
 */

import { z } from 'zod';
import { ProfileTypeSchema } from '../core/base-response.ts';

/**
 * @description The user's currently active acting profile (freelancer/business) and team, used by
 * RLS helpers to scope access. Mirrors `security.session_context`.
 */
export const SessionContextSchema = z.object({
	user_id: z.uuid(),
	active_profile_type: ProfileTypeSchema.nullable(),
	active_profile_id: z.uuid().nullable(),
	active_team_id: z.uuid().nullable(),
	updated_at: z.iso.datetime({}),
});
export type SessionContext = z.infer<typeof SessionContextSchema>;
