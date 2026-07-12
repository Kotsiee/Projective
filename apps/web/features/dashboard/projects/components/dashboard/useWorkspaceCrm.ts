/**
 * @file useWorkspaceCrm.ts
 * @description Loads the freelancer/team client roster that powers the CRM tray + Services Pipeline.
 * Mirrors `useWorkspaceProjects`: one fetch on mount, then a silent revalidate on client navigation
 * so the roster never shows a stale snapshot when hopping between the projects and services views.
 */

import { onNavigate } from '@projective/data';
import { type Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { WorkspaceEntry } from '../../contracts/crm.ts';

export interface WorkspaceCrm {
	roster: Signal<WorkspaceEntry[]>;
	loading: Signal<boolean>;
	error: Signal<string | null>;
}

export function useWorkspaceCrm(): WorkspaceCrm {
	const roster = useSignal<WorkspaceEntry[]>([]);
	const loading = useSignal(true);
	const error = useSignal<string | null>(null);

	const hydrate = async (opts?: { silent?: boolean }) => {
		if (!opts?.silent) loading.value = true;
		try {
			const res = await fetch('/api/v1/dashboard/workspace-crm');
			if (!res.ok) throw new Error(`Error ${res.status}`);
			const data = await res.json() as WorkspaceEntry[];
			roster.value = Array.isArray(data) ? data : [];
			error.value = null;
		} catch (err) {
			if (!opts?.silent) error.value = err instanceof Error ? err.message : 'Failed to load roster';
		} finally {
			if (!opts?.silent) loading.value = false;
		}
	};

	useEffect(() => {
		hydrate();
	}, []);
	useEffect(() => onNavigate(() => hydrate({ silent: true })), []);

	return { roster, loading, error };
}
