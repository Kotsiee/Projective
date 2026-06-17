// deno-lint-ignore-file no-explicit-any
import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { StageDetails, StageState } from '../contracts/Projects.ts';

export const StageContext = createContext<StageState | null>(null);

export function StageProvider({
	projectId,
	stageId: initialId,
	children,
}: {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
}) {
	const stageId = useSignal(initialId);
	const stage = useSignal<StageDetails | null>(null);
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);

	useEffect(() => {
		if (stageId.value !== initialId) {
			stageId.value = initialId;
			stage.value = null;
			error.value = null;
		}
	}, [initialId]);

	const fetchStage = async () => {
		if (!projectId || !stageId.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const res = await fetch(
				`/api/v1/dashboard/projects/${projectId}/stages/${stageId.value}`,
			);
			if (!res.ok) throw new Error(`Error ${res.status}`);
			stage.value = await res.json();
		} catch (err: any) {
			error.value = err.message;
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		if (stageId.value) {
			fetchStage();
		}
	}, [projectId, stageId.value]);

	const contextValue = useMemo(() => ({
		stage_id: stageId,
		stage,
		isLoading,
		error,
		refresh: fetchStage,
	}), []);

	return (
		<StageContext.Provider value={contextValue}>
			{children}
		</StageContext.Provider>
	);
}

export function useStageContext() {
	const ctx = useContext(StageContext);
	if (!ctx) throw new Error('useStageContext must be used within StageProvider');
	return ctx;
}
