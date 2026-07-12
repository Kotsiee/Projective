/**
 * @file dashboard.ts
 * @description Contracts + pure derivations for the Projects Workspace control hub (the landing
 * canvas rendered by `routes/(dashboard)/projects/(projects)/index.tsx`). Everything here is
 * presentation-layer only — the raw shapes come from the live `/api/v1/dashboard/projects` list and
 * the per-project `/summary` RPC (`get_project_card_summary`); the derivations turn those real
 * signals into the phase / health / velocity indicators the matrix renders.
 */

import type { ComponentChildren } from 'preact';

// #region 1. RAW API SHAPES

/**
 * A row from `GET /api/v1/dashboard/projects` (`get_dashboard_projects`). The persisted
 * `ProjectItem` contract is partly out of sync with the RPC, so this mirrors the ACTUAL columns the
 * function returns (`owner_avatar` JSONB, `has_unread`) while tolerating the legacy aliases.
 */
export interface DashboardProjectRow {
	project_id: string;
	title: string;
	status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
	owner_name: string;
	/** JSONB variants blob from `files.items` — not a plain URL. */
	owner_avatar?: unknown;
	owner_avatar_url?: string | null;
	is_starred: boolean;
	is_archived?: boolean;
	has_unread?: boolean;
	is_unread?: boolean;
	last_updated_at: string;
	total_count?: number;
}

/** Kanban column counts returned by `get_project_card_summary` (mig 0122). */
export interface ProjectTicketCounts {
	total: number;
	backlog: number;
	todo: number;
	in_progress: number;
	in_review: number;
	completed: number;
	active: number;
}

/** High-density inspector payload from `GET /api/v1/dashboard/projects/{id}/summary`. */
export interface ProjectCardSummary {
	project_id: string;
	title: string;
	status: string;
	currency: string;
	updated_at: string;
	stage_count: number;
	tickets: ProjectTicketCounts;
	pending_submissions: number;
	held_escrows: number;
	next_milestone_at: string | null;
}

// #endregion

// #region 2. DERIVED VIEW MODEL

export type HealthTone = 'success' | 'warning' | 'danger' | 'neutral';

/** A project row fused with its (optional) summary into everything a matrix card renders. */
export interface MatrixProject {
	id: string;
	title: string;
	status: DashboardProjectRow['status'];
	ownerName: string;
	isStarred: boolean;
	hasUnread: boolean;
	updatedAt: string;
	/** Null until the summary resolves (or if it failed / is unauthorized). */
	summary: ProjectCardSummary | null;
	/** Completion 0–100 derived from the ticket ledger. */
	progress: number;
	phase: string;
	health: { label: string; tone: HealthTone };
	/** Short velocity readout, e.g. "7 / 12 delivered". */
	velocity: string;
	/** Relative "next milestone" caption, or null when none is scheduled. */
	milestone: string | null;
	href: string;
}

// #endregion

// #region 3. TEMPLATES

/** A curated, frontend-seed project blueprint surfaced in the Templates Hub. */
export interface ProjectTemplate {
	id: string;
	name: string;
	tagline: string;
	/** Longer blurb shown in the card body. */
	description: string;
	accent: 'primary' | 'mint' | 'violet' | 'amber';
	icon: ComponentChildren;
	format: 'pipeline' | 'one_off';
	/** Ordered stage blueprint — communicates the pipeline shape at a glance. */
	stages: string[];
	/** Optional flourish, e.g. "Most used". */
	badge?: string;
}

// #endregion

// #region 4. PURE DERIVATIONS

const STATUS_TONE: Record<string, HealthTone> = {
	active: 'success',
	on_hold: 'warning',
	draft: 'neutral',
	completed: 'success',
	cancelled: 'danger',
	archived: 'neutral',
};

export function statusTone(status: string): HealthTone {
	return STATUS_TONE[status] ?? 'neutral';
}

export function statusLabel(status: string): string {
	return status
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** Whole-number completion from the ticket ledger (0 when the board is empty). */
export function deriveProgress(s: ProjectCardSummary | null): number {
	if (!s || s.tickets.total <= 0) return 0;
	return Math.round((s.tickets.completed / s.tickets.total) * 100);
}

/**
 * A human "phase" label. Phase is not persisted, so infer it from the lifecycle status plus the
 * board's centre of gravity — mirroring how a producer would describe where the work sits.
 */
export function derivePhase(status: string, s: ProjectCardSummary | null): string {
	if (status === 'draft') return 'Planning';
	if (status === 'completed') return 'Delivered';
	if (status === 'cancelled') return 'Closed';
	if (status === 'on_hold') return 'On Hold';
	if (!s || s.tickets.total === 0) return 'Kickoff';
	const t = s.tickets;
	if (t.completed >= t.total && t.total > 0) return 'Wrapping';
	if (t.in_review > 0) return 'In Review';
	if (t.in_progress > 0) return 'In Production';
	if (t.todo > 0 || t.backlog > 0) return 'Kickoff';
	return 'Active';
}

const DAY_MS = 86_400_000;

/**
 * Health blends the real risk signals the summary exposes: an overdue next milestone reads as
 * At Risk, unreviewed submissions as Needs Review, otherwise On Track. Draft/complete projects are
 * neutral (health doesn't apply).
 */
export function deriveHealth(
	status: string,
	s: ProjectCardSummary | null,
	now: number,
): { label: string; tone: HealthTone } {
	if (status === 'completed') return { label: 'Delivered', tone: 'success' };
	if (status === 'cancelled') return { label: 'Closed', tone: 'danger' };
	if (status === 'draft' || !s) return { label: 'Setup', tone: 'neutral' };

	if (s.next_milestone_at) {
		const due = new Date(s.next_milestone_at).getTime();
		if (!Number.isNaN(due) && due < now) return { label: 'At Risk', tone: 'danger' };
		if (!Number.isNaN(due) && due - now < 2 * DAY_MS) return { label: 'Due Soon', tone: 'warning' };
	}
	if (s.pending_submissions > 0) return { label: 'Needs Review', tone: 'warning' };
	if (s.held_escrows > 0 && s.tickets.active === 0) {
		return { label: 'Awaiting Work', tone: 'warning' };
	}
	return { label: 'On Track', tone: 'success' };
}

export function deriveVelocity(s: ProjectCardSummary | null): string {
	if (!s || s.tickets.total === 0) return 'No tasks yet';
	return `${s.tickets.completed} / ${s.tickets.total} delivered`;
}

/** Compact relative time — "2h", "3d", "in 5d", "overdue". */
export function relativeTime(iso: string | null, now: number): string | null {
	if (!iso) return null;
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return null;
	const diff = t - now;
	const abs = Math.abs(diff);
	const mins = Math.round(abs / 60000);
	const hrs = Math.round(abs / 3_600_000);
	const days = Math.round(abs / DAY_MS);
	let mag: string;
	if (mins < 60) mag = `${Math.max(1, mins)}m`;
	else if (hrs < 24) mag = `${hrs}h`;
	else mag = `${days}d`;
	if (diff < 0) return `${mag} overdue`;
	return `in ${mag}`;
}

/**
 * Fuse a list row with its (possibly missing) summary into the matrix view model. Kept pure so it
 * can run the moment either datum arrives, without waiting on the other.
 */
export function toMatrixProject(
	row: DashboardProjectRow,
	summary: ProjectCardSummary | null,
	now: number,
): MatrixProject {
	return {
		id: row.project_id,
		title: row.title,
		status: row.status,
		ownerName: row.owner_name,
		isStarred: !!row.is_starred,
		hasUnread: !!(row.has_unread ?? row.is_unread),
		updatedAt: row.last_updated_at,
		summary,
		progress: deriveProgress(summary),
		phase: derivePhase(row.status, summary),
		health: deriveHealth(row.status, summary, now),
		velocity: deriveVelocity(summary),
		milestone: summary ? relativeTime(summary.next_milestone_at, now) : null,
		href: `/projects/${row.project_id}`,
	};
}

// #endregion
