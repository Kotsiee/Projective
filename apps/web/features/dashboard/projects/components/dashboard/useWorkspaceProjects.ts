/**
 * @file useWorkspaceProjects.ts
 * @description Single source of the signed-in user's project list for the workspace dashboard.
 * Fetched once by the dashboard island and threaded to the hero, matrix and talent matcher so the
 * `/api/v1/dashboard/projects` endpoint is hit once, not per-panel. Re-hydrates silently across
 * Fresh client navigation (the dashboard lives in a swapped partial, but this keeps parity with the
 * persistent-region lists and survives back/forward without a hard refresh).
 */

import { onNavigate } from '@projective/data';
import { type Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { DashboardProjectRow } from '../../contracts/dashboard.ts';

export interface WorkspaceProjects {
	rows: Signal<DashboardProjectRow[]>;
	loading: Signal<boolean>;
	error: Signal<string | null>;
}

export function useWorkspaceProjects(limit = 12): WorkspaceProjects {
	const rows = useSignal<DashboardProjectRow[]>([]);
	const loading = useSignal(true);
	const error = useSignal<string | null>(null);

	const hydrate = async (opts?: { silent?: boolean }) => {
		if (!opts?.silent) loading.value = true;
		try {
			const res = await fetch(
				`/api/v1/dashboard/projects?category=all&limit=${limit}&sortBy=last_updated&sortDir=desc`,
			);
			if (!res.ok) throw new Error(`Error ${res.status}`);
			const data = await res.json() as DashboardProjectRow[];
			rows.value = Array.isArray(data) ? data : [];
			error.value = null;
		} catch (err) {
			if (!opts?.silent) {
				error.value = err instanceof Error ? err.message : 'Failed to load projects';
			}
		} finally {
			if (!opts?.silent) loading.value = false;
		}
	};

	useEffect(() => {
		hydrate();
	}, []);
	useEffect(() => onNavigate(() => hydrate({ silent: true })), []);

	return { rows, loading, error };
}
