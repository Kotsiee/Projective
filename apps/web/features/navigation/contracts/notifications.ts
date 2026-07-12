/**
 * @file notifications.ts
 * @description Shared notification contract + the single source of truth for turning a notification
 * into a deep link. A notification carries `entity_table` / `entity_id` (see `comms.fn_notify`,
 * mig 0305) — `projects.projects` holds a project id, `projects.project_stages` holds a stage id —
 * and this maps the (entity, type) pair onto the exact project sub-tab the event belongs to so a
 * click lands the user precisely where the event happened (redesign requirement §2).
 */

/** Client-facing shape of a single notification (camelCased from the DB row). */
export interface NotificationSummary {
	id: string;
	type: string;
	title: string;
	body: string;
	readAt: string | null;
	createdAt: string;
	/** Raw entity pointer (`projects.projects` | `projects.project_stages` | …). */
	entityTable?: string | null;
	entityId?: string | null;
	/** Resolved owning project (populated for stage-scoped notifications). */
	projectId?: string | null;
	/** Pre-computed deep link to the exact tab the event belongs to. */
	targetUrl?: string | null;
}

const NOTIFICATIONS_INBOX = '/dashboard/notifications';

/** Stage-scoped notification types that belong on the stage Finance/escrow tab. */
const STAGE_FINANCE_TYPES = new Set([
	'stage_funded',
	'stage_approved',
	'stage_cancelled',
	'stage_paid',
	'stage_payout',
]);

/**
 * Compute the deep link for a notification. Pure: the caller resolves the owning project id for
 * stage-scoped rows (via a DB lookup) and passes it in. Falls back to the full inbox whenever the
 * pointer is missing or unresolved, so a click is never a dead end.
 */
export function notificationTargetUrl(input: {
	entityTable?: string | null;
	entityId?: string | null;
	type?: string | null;
	projectId?: string | null;
}): string {
	const { entityTable, entityId, type, projectId } = input;

	if (entityTable === 'projects.projects' && entityId) {
		return `/projects/${entityId}`;
	}

	if (entityTable === 'projects.project_stages' && entityId && projectId) {
		const tab = STAGE_FINANCE_TYPES.has(type ?? '') ? '/finance' : '';
		return `/projects/${projectId}/${entityId}${tab}`;
	}

	return NOTIFICATIONS_INBOX;
}
