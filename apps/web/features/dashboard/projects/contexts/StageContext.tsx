import { createContext, VNode } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { StageDetails, StageState } from '../contracts/Projects.ts';

const StageContext = createContext<StageState | null>(null);

export function StageProvider(
	{ projectId, stageId: initialId, children }: {
		projectId: string;
		stageId: string;
		children: ComponentChildren;
	},
) {
	const stageId = useSignal(initialId);
	const stage = useSignal<StageDetails | null>(null);
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);
	const footer = useSignal<VNode | null>(null);

	if (stageId.value !== initialId) {
		stageId.value = initialId;
		stage.value = null;
		error.value = null;
	}

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
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			console.error('Stage Fetch Error:', err);
			error.value = err.message;
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		fetchStage();
	}, [projectId, stageId.value]);

	return (
		<StageContext.Provider
			value={{
				stage_id: stageId,
				stage,
				isLoading,
				error,
				refresh: fetchStage,
				footer,
			}}
		>
			{children}
		</StageContext.Provider>
	);
}

export function useStageContext() {
	const ctx = useContext(StageContext);
	if (!ctx) {
		throw new Error('useStageContext must be used within StageProvider');
	}
	return ctx;
}
