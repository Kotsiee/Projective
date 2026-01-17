import { createContext } from "preact";
import { useContext, useEffect } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";
import { StagePermission, StageType } from "@projective/types";

export type StageRole = "owner" | "assignee" | "viewer";

export interface StageDetails {
	stage_id: string;
	project_id: string;
	channel_id: string;
	title: string;
	description: string;
	sort_order: number;

	status:
		| "open"
		| "assigned"
		| "in_progress"
		| "submitted"
		| "approved"
		| "revisions"
		| "paid";
	stage_type: StageType;
	ip_mode:
		| "exclusive_transfer"
		| "licensed_use"
		| "internal_only"
		| "template_only";
	due_date: string | null;

	budget: {
		type: "fixed" | "hourly_cap" | "free";
		amount_cents: number;
		currency: string;
	} | null;

	assignee: {
		profile_id: string;
		name: string;
		avatar_url: string | null;
		type: "freelancer" | "team";
		status: "invited" | "accepted";
	} | null;

	latest_submission: {
		id: string;
		submitted_at: string;
		notes: string;
		files: Array<{ name: string; url: string }>;
	} | null;

	viewer_context: {
		role: StageRole;
		permissions: StagePermission[];
	};
}

export interface StageState {
	stage_id: Signal<string | undefined>;
	stage: Signal<StageDetails | null>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => void;
}

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
			console.error("Stage Fetch Error:", err);
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
			}}
		>
			{children}
		</StageContext.Provider>
	);
}

export function useStageContext() {
	const ctx = useContext(StageContext);
	if (!ctx) {
		throw new Error("useStageContext must be used within StageProvider");
	}
	return ctx;
}
