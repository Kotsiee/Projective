/**
 * @file crm.ts
 * @description Contracts + pure filtering for the Projects workspace's client-CRM layer. The
 * workspace toggle splits the freelancer/team roster into two slices — project contracts vs. service
 * engagements — and the CRM tray segments that roster three ways: by client account, by the specific
 * service tier purchased, and by the distinct project contract. Every `WorkspaceEntry` carries all
 * three keys so the filters compose holistically. Frontend-seed today (see `data/workspaceCrmSeed.ts`);
 * the shapes map onto a future `projects.get_workspace_roster` RPC.
 */

/** Which workspace slice the toggle is showing. */
export type WorkspaceMode = 'projects' | 'services';

/** A roster entry is either an ongoing project contract or a purchased service engagement. */
export type WorkspaceEntryKind = 'project' | 'service';

export type WorkspaceEntryStatus = 'active' | 'on_hold' | 'completed';

export interface WorkspaceEntry {
	id: string;
	kind: WorkspaceEntryKind;
	/** Client account. */
	clientId: string;
	clientName: string;
	clientAvatarUrl: string | null;
	/** The service tier this engagement is against (null for a pure project contract). */
	serviceId: string | null;
	serviceName: string | null;
	tierName: string | null;
	/** The distinct project contract. */
	projectId: string;
	projectTitle: string;
	/** Engagement value in cents. */
	valueCents: number;
	/** Human pipeline stage, e.g. "Discovery", "In production". */
	stage: string;
	status: WorkspaceEntryStatus;
	updatedAt: string;
}

/** The three CRM filter axes; empty array on an axis means "no constraint". */
export interface CrmFilters {
	clientIds: string[];
	serviceIds: string[];
	projectIds: string[];
}

export const EMPTY_FILTERS: CrmFilters = { clientIds: [], serviceIds: [], projectIds: [] };

/** A selectable filter chip with its live match count. */
export interface CrmOption {
	id: string;
	label: string;
	count: number;
}

export interface CrmOptionGroups {
	clients: CrmOption[];
	services: CrmOption[];
	projects: CrmOption[];
}

const KIND_FOR_MODE: Record<WorkspaceMode, WorkspaceEntryKind> = {
	projects: 'project',
	services: 'service',
};

/** True when any axis constrains the roster. */
export function crmFilterActive(f: CrmFilters): boolean {
	return f.clientIds.length > 0 || f.serviceIds.length > 0 || f.projectIds.length > 0;
}

export function crmFilterCount(f: CrmFilters): number {
	return f.clientIds.length + f.serviceIds.length + f.projectIds.length;
}

/**
 * Filter the roster to the active mode's slice, then apply the three axes (AND across axes, OR
 * within an axis). Service-tier filtering only matches entries that actually carry a service.
 */
export function applyCrmFilters(
	entries: WorkspaceEntry[],
	f: CrmFilters,
	mode: WorkspaceMode,
): WorkspaceEntry[] {
	const kind = KIND_FOR_MODE[mode];
	return entries.filter((e) => {
		if (e.kind !== kind) return false;
		if (f.clientIds.length && !f.clientIds.includes(e.clientId)) return false;
		if (f.serviceIds.length && !(e.serviceId && f.serviceIds.includes(e.serviceId))) return false;
		if (f.projectIds.length && !f.projectIds.includes(e.projectId)) return false;
		return true;
	});
}

/**
 * Build the tray's chip groups from the roster, scoped to the active mode's slice, with a live count
 * per option. Options are sorted by count desc then label so the busiest clients/services surface.
 */
export function deriveCrmOptions(
	entries: WorkspaceEntry[],
	mode: WorkspaceMode,
): CrmOptionGroups {
	const kind = KIND_FOR_MODE[mode];
	const scoped = entries.filter((e) => e.kind === kind);

	const tally = (
		key: (e: WorkspaceEntry) => { id: string | null; label: string | null },
	): CrmOption[] => {
		const map = new Map<string, CrmOption>();
		for (const e of scoped) {
			const { id, label } = key(e);
			if (!id || !label) continue;
			const existing = map.get(id);
			if (existing) existing.count++;
			else map.set(id, { id, label, count: 1 });
		}
		return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
	};

	return {
		clients: tally((e) => ({ id: e.clientId, label: e.clientName })),
		services: tally((e) => ({ id: e.serviceId, label: e.serviceName })),
		projects: tally((e) => ({ id: e.projectId, label: e.projectTitle })),
	};
}

export function workspaceStatusTone(
	status: WorkspaceEntryStatus,
): 'success' | 'warning' | 'neutral' {
	return status === 'active' ? 'success' : status === 'on_hold' ? 'warning' : 'neutral';
}
