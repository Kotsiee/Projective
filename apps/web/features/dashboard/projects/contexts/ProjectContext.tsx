/**
 * @file ProjectContext.tsx
 * @description Global signal-based context for managing a single project and its board tickets.
 */

import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import {
	FullProjectResponse,
	TicketResponse,
	TicketStatus,
	UpdateTicketRequest,
} from '@projective/types';
import { TicketsService } from '@features/dashboard/projects/services/TicketsService.ts';

// #region 1. INTERFACES

/**
 * @interface ProjectState
 * @description Re-establishes the exact runtime contract expected by the platform layouts.
 */
export interface ProjectState {
	project_id: Signal<string | undefined>;
	project: Signal<FullProjectResponse | null>;
	tickets: Signal<TicketResponse[]>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => Promise<void>;
	loadTickets: (projectId: string) => Promise<void>;
	/**
	 * Relocates a ticket on the board. Stage and lifecycle status are INDEPENDENT properties, so
	 * pass only what actually changed:
	 *   • Omit `newStageId` to leave the stage untouched (e.g. a status-only move).
	 *   • Omit `newStatus` to leave the status untouched (e.g. assigning a pipeline stage, which
	 *     must NOT advance a ticket into `in_progress` — it stays "New"/backlog until the
	 *     payment→claim lifecycle moves it).
	 *   • Pass `null` for `newStageId` to explicitly unstage a ticket back into the backlog pool.
	 *
	 * Rejects (and rolls back) with the underlying server/DB error message rather than a generic
	 * string, and rethrows so the caller can surface it.
	 */
	moveTicket: (
		ticketId: string,
		newStageId?: string | null,
		newStatus?: TicketStatus,
	) => Promise<void>;
}

// #endregion

// #region 2. CONTEXT INITIALIZATION

export const ProjectContext = createContext<ProjectState | null>(null);

// #endregion

// #region 3. PROVIDER COMPONENT

/**
 * @function ProjectProvider
 * @description Wraps layouts ensuring reactive sync boundaries match the layout pipelines.
 */
export function ProjectProvider(
	{ id, children }: { id: string | undefined; children: ComponentChildren },
) {
	const projectId = useSignal<string | undefined>(id);
	const project = useSignal<FullProjectResponse | null>(null);
	const tickets = useSignal<TicketResponse[]>([]);
	const isLoading = useSignal<boolean>(false);
	const error = useSignal<string | null>(null);

	// Multi-business/project switching dynamic guard rails
	if (projectId.value !== id) {
		projectId.value = id;
		project.value = null;
		tickets.value = [];
		error.value = null;
	}

	/**
	 * @description Fetches the project schema configuration.
	 */
	const fetchProject = async () => {
		if (!projectId.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const res = await fetch(`/api/v1/dashboard/projects/${projectId.value}`);
			if (!res.ok) throw new Error(`Project fetch failed with status: ${res.status}`);

			const data: FullProjectResponse = await res.json();
			// Normalize nullable aggregates: get_project_details returns NULL (not []) for
			// stages/roles when a project has none, which would break array consumers downstream.
			project.value = data ? { ...data, stages: data.stages ?? [], roles: data.roles ?? [] } : null;
		} catch (err: any) {
			console.error('Project Context Fetch Error:', err);
			error.value = err.message || 'An unexpected error occurred.';
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * @description Fetches the atomic workspace pipeline components.
	 */
	const loadTickets = async (pId: string) => {
		try {
			const res = await fetch(`/api/v1/dashboard/projects/${pId}/tickets`);
			if (!res.ok) throw new Error('Failed to retrieve board tasks.');

			const data: TicketResponse[] = await res.json();
			tickets.value = data;
		} catch (err: any) {
			console.error('Tickets Fetch Error:', err);
			error.value = err.message || 'Failed to fetch tickets.';
		}
	};

	/**
	 * @description Optimistically relocates a ticket, then persists it with a PATCH. Stage and
	 * status are patched independently (see {@link ProjectState.moveTicket}); an omitted argument is
	 * left untouched both locally and in the payload. On failure the optimistic change is rolled
	 * back, the real server/DB message is surfaced, and the error is rethrown for the caller.
	 */
	const moveTicket = async (
		ticketId: string,
		newStageId?: string | null,
		newStatus?: TicketStatus,
	) => {
		const previousState = [...tickets.value];
		tickets.value = tickets.value.map((t) =>
			t.id === ticketId
				? {
					...t,
					...(newStageId !== undefined ? { current_stage_id: newStageId } : {}),
					...(newStatus !== undefined ? { status: newStatus } : {}),
				}
				: t
		);

		try {
			if (newStatus !== undefined) {
				// Column transition → route through the guarded `move_ticket` RPC so the Kanban rules
				// apply: Review auto-generates a submission, and Done requires client/owner review
				// authority + confirms milestone delivery (spec §3). The stage moves atomically with it.
				await TicketsService.moveTicket(
					projectId.value ?? '',
					ticketId,
					newStatus,
					newStageId ?? null,
				);
			} else {
				// Pure re-stage within the same column → lightweight PATCH. The service attaches the
				// `X-CSRF` token the global middleware requires and normalizes DB/trigger errors.
				const payload: UpdateTicketRequest = {};
				if (newStageId !== undefined) payload.current_stage_id = newStageId;
				await TicketsService.updateTicket(projectId.value ?? '', ticketId, payload);
			}
		} catch (err: any) {
			tickets.value = previousState;
			error.value = err.message || 'Failed to sync ticket update.';
			throw err;
		}
	};

	useEffect(() => {
		if (projectId.value) {
			fetchProject();
			loadTickets(projectId.value);
		}
	}, [projectId.value]);

	const state: ProjectState = {
		project_id: projectId,
		project,
		tickets,
		isLoading,
		error,
		refresh: fetchProject,
		loadTickets,
		moveTicket,
	};

	return (
		<ProjectContext.Provider value={state}>
			{children}
		</ProjectContext.Provider>
	);
}

// #endregion

// #region 4. HOOKS

export function useProjectContext(): ProjectState {
	const context = useContext(ProjectContext);
	if (!context) {
		throw new Error('useProjectContext must be used within a ProjectProvider');
	}
	return context;
}

// #endregion
