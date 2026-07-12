/**
 * @file NotificationsBackendService.ts
 * @description Backend (server-only) service for reading a user's notification
 * feed from `comms.notifications`. Consumed by the thin `/api/v1/notifications`
 * route; islands must never query Supabase directly.
 *
 * Each row carries an `entity_table` / `entity_id` pointer (see `comms.fn_notify`, mig 0305). This
 * service resolves that pointer into a deep link (`targetUrl`) to the exact project sub-tab the
 * event belongs to, so a click in any feed lands the user precisely where it happened.
 */

// deno-lint-ignore-file no-explicit-any
import { SupabaseClient } from 'supabaseClient';
import {
	type NotificationSummary,
	notificationTargetUrl,
} from '@features/navigation/contracts/notifications.ts';

// #region Types
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}

export type { NotificationSummary };

type ServiceResult =
	| { ok: true; data: NotificationSummary[] }
	| { ok: false; error: { status: number; code: string } };
// #endregion

export class NotificationsBackendService {
	// #region Main Methods
	/**
	 * Fetch the most recent notifications for the authenticated user, each pre-resolved to its
	 * deep-link target.
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
			.select('id, type, title, body, read_at, created_at, entity_table, entity_id')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) {
			return { ok: false, error: { status: 500, code: 'query_failed' } };
		}

		const rows = data ?? [];
		const projectByStage = await NotificationsBackendService.resolveStageProjects(sb, rows);

		const notifications: NotificationSummary[] = rows.map((n: any) => {
			const projectId = n.entity_table === 'projects.projects'
				? (n.entity_id ?? null)
				: n.entity_table === 'projects.project_stages'
				? (projectByStage.get(n.entity_id) ?? null)
				: null;

			return {
				id: n.id,
				type: n.type,
				title: n.title,
				body: n.body,
				readAt: n.read_at,
				createdAt: n.created_at,
				entityTable: n.entity_table ?? null,
				entityId: n.entity_id ?? null,
				projectId,
				targetUrl: notificationTargetUrl({
					entityTable: n.entity_table,
					entityId: n.entity_id,
					type: n.type,
					projectId,
				}),
			};
		});

		return { ok: true, data: notifications };
	}

	/**
	 * Batch-resolve the owning project id for stage-scoped notifications. Defensive: any failure (RLS,
	 * schema exposure) yields an empty map, so the deep link degrades to the inbox rather than erroring
	 * the whole feed.
	 */
	static async resolveStageProjects(
		sb: SupabaseClient,
		rows: any[],
	): Promise<Map<string, string>> {
		const map = new Map<string, string>();
		const stageIds = [
			...new Set(
				rows
					.filter((r) => r.entity_table === 'projects.project_stages' && r.entity_id)
					.map((r) => r.entity_id as string),
			),
		];
		if (stageIds.length === 0) return map;

		try {
			const { data } = await sb
				.schema('projects')
				.from('project_stages')
				.select('id, project_id')
				.in('id', stageIds);
			for (const s of (data ?? []) as any[]) {
				if (s?.id && s?.project_id) map.set(s.id, s.project_id);
			}
		} catch {
			/* leave unresolved — links fall back to the inbox */
		}
		return map;
	}
	// #endregion
}
