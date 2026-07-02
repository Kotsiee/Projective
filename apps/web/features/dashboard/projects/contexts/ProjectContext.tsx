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
	moveTicket: (
		ticketId: string,
		newStageId: string | null,
		newStatus: TicketStatus,
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
			project.value = data;
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
	 * @description Optimistically records Kanban changes across streams.
	 */
	const moveTicket = async (
		ticketId: string,
		newStageId: string | null,
		newStatus: TicketStatus,
	) => {
		const previousState = [...tickets.value];
		tickets.value = tickets.value.map((t) =>
			t.id === ticketId ? { ...t, current_stage_id: newStageId, status: newStatus } : t
		);

		try {
			const payload: UpdateTicketRequest = {
				current_stage_id: newStageId,
				status: newStatus,
			};

			const res = await fetch(`/api/v1/dashboard/projects/${projectId.value}/tickets/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error('Persistence step failed.');
		} catch (err: any) {
			tickets.value = previousState;
			error.value = err.message || 'Failed to sync ticket update.';
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
