/**
 * StatusSlider primitive props. A segmented, ordered status-transition control (open → assigned →
 * active → submitted → …). Reads as a filled track with a node per step; the current step and every
 * step before it are "reached". Used by the stage board / timeline to show — and, when interactive,
 * drive — live status transitions.
 */
export interface StatusStep {
	/** Machine value written on transition (e.g. a stage_status enum label). */
	value: string;
	/** Human label under the node. */
	label: string;
	/** Optional per-step accent (falls back to the slider tone). */
	tone?: 'primary' | 'success' | 'warning' | 'danger';
}

export interface StatusSliderProps {
	/** Ordered steps, left → right. */
	steps: StatusStep[];
	/** The current step's `value`. */
	value: string;
	/** Fired with the chosen step value. Omit to render a read-only indicator. */
	onChange?: (value: string) => void;
	/** Disable all interaction (still renders the current state). */
	disabled?: boolean;
	/**
	 * Restrict which steps may be chosen when interactive. Receives a step value, returns whether it
	 * is selectable. Defaults to allowing only the immediate next/previous steps.
	 */
	canSelect?: (value: string) => boolean;
	/** Track accent. Defaults to 'primary'. */
	tone?: 'primary' | 'success' | 'warning' | 'danger';
	/** Node + track size. Defaults to 'md'. */
	size?: 'sm' | 'md';
	/** Hide the per-node labels. */
	hideLabels?: boolean;
	className?: string;
}
