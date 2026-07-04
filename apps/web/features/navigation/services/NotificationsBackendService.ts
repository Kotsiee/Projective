/**
 * @file NotificationsBackendService.ts
 * @description Backend (server-only) service for reading a user's notification
 * feed from `comms.notifications`. Consumed by the thin `/api/v1/notifications`
 * route; islands must never query Supabase directly.
 */

import { SupabaseClient } from 'supabaseClient';

// #region Types
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}

/** Client-facing shape of a single notification (camelCased from the DB row). */
export interface NotificationSummary {
	id: string;
	type: string;
	title: string;
	body: string;
	readAt: string | null;
	createdAt: string;
}

type ServiceResult =
	| { ok: true; data: NotificationSummary[] }
	| { ok: false; error: { status: number; code: string } };
// #endregion

export class NotificationsBackendService {
	// #region Main Methods
	/**
	 * Fetch the most recent notifications for the authenticated user.
	 * @param {Deps} deps - Injected Supabase client getter.
	 * @param {number} [limit=10] - Maximum rows to return, newest first.
	 * @returns {Promise<ServiceResult>} Ordered notification summaries or an error.
	 */
	static async listRecent(deps: Deps = {}, limit = 10): Promise<ServiceResult> {
		if (!deps.getClient) {
			return { ok: false, error: { status: 500, code: 'internal_error' } };
		}

		const sb = await deps.getClient();

		const { data: { user }, error: userErr } = await sb.auth.getUser();
		if (userErr || !user) {
			return { ok: false, error: { status: 401, code: 'unauthorized' } };
		}

		const { data, error } = await sb
			.schema('comms')
			.from('notifications')
			.select('id, type, title, body, read_at, created_at')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) {
			return { ok: false, error: { status: 500, code: 'query_failed' } };
		}

		const notifications: NotificationSummary[] = (data ?? []).map((n) => ({
			id: n.id,
			type: n.type,
			title: n.title,
			body: n.body,
			readAt: n.read_at,
			createdAt: n.created_at,
		}));

		return { ok: true, data: notifications };
	}
	// #endregion
}
