/**
 * @file useWorkspaceFilters.ts
 * @description The Projects workspace view state: which slice the toggle shows (`projects` |
 * `services`), the three CRM filter axes, and whether the filter tray is open. Crucially, all of it
 * **resets on client navigation** (`onNavigate`) — so switching workspaces via the sidebar quick
 * links never carries a stale mode/filter set into the next view, per the SPA-transition rule.
 */

import { onNavigate } from '@projective/data';
import { type Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { type CrmFilters, EMPTY_FILTERS, type WorkspaceMode } from '../../contracts/crm.ts';

export interface WorkspaceFilters {
	mode: Signal<WorkspaceMode>;
	filters: Signal<CrmFilters>;
	trayOpen: Signal<boolean>;
	toggleFilter: (axis: keyof CrmFilters, id: string) => void;
	clearFilters: () => void;
	reset: () => void;
}

export function useWorkspaceFilters(): WorkspaceFilters {
	const mode = useSignal<WorkspaceMode>('projects');
	const filters = useSignal<CrmFilters>(EMPTY_FILTERS);
	const trayOpen = useSignal(false);

	const reset = () => {
		mode.value = 'projects';
		filters.value = EMPTY_FILTERS;
		trayOpen.value = false;
	};

	// Reset every signal on SPA navigation. The dashboard island lives in a swapped partial (so it
	// usually remounts), but this guarantees a clean slate even if it is ever kept alive.
	useEffect(() => onNavigate(reset), []);

	const toggleFilter = (axis: keyof CrmFilters, id: string) => {
		const current = filters.value[axis];
		const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
		filters.value = { ...filters.value, [axis]: next };
	};

	const clearFilters = () => (filters.value = EMPTY_FILTERS);

	return { mode, filters, trayOpen, toggleFilter, clearFilters, reset };
}
