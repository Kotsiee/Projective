/**
 * @file gauge.ts
 * @description Prop contracts for the Workload Capacity Gauge — the E4 resource visualizer that
 * renders a freelancer's current Workload Intensity (W_i) against their concurrency cap. Fed by
 * `projects.get_workload_capacity` (migration 0310).
 */

/** Visual form factor: a 270° speedometer dial, or a compact horizontal bar for dense card rows. */
export type WorkloadGaugeVariant = 'dial' | 'bar';

/** Load band derived from current/max — drives the colour ramp (green/blue → amber → red). */
export type WorkloadGaugeTone = 'ok' | 'warn' | 'over';

export interface WorkloadCapacityGaugeProps {
	/** Current summed Workload Intensity across the freelancer's active tickets. */
	current: number;
	/** The freelancer's concurrency cap (global or stage-scoped). */
	max: number;
	/** Short caption, e.g. 'Workload'. Default 'Workload'. */
	label?: string;
	/** Unit suffix rendered after the values, e.g. 'Wi'. Default 'Wi'. */
	unit?: string;
	/** 'dial' (default) or 'bar'. */
	variant?: WorkloadGaugeVariant;
	/** Dial diameter / bar height reference in px. Default 132 (dial), 8 (bar track). */
	size?: number;
	/** Ratio (0..1) at which the gauge crosses into the amber "warning" band. Default 0.75. */
	warnThreshold?: number;
	/** Show the numeric current / cap read-out. Default true. */
	showValue?: boolean;
	/** Optional secondary caption, e.g. active-ticket count. */
	caption?: string;
	className?: string;
}
