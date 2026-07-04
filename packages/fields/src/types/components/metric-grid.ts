import { VNode } from 'preact';

/** A single counter cell within a {@link MetricGrid}. */
export interface Metric {
	/** Muted caption shown beneath the value. */
	label: string;
	/** The prominent numeric (or short text) value. */
	value: string | number;
	/** Optional leading icon. */
	icon?: VNode;
	/** Optional hint, surfaced as a native tooltip on the cell. */
	hint?: string;
	/** Semantic tone applied to the value. */
	tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * MetricGrid specific props.
 */
export interface MetricGridProps {
	/** The metrics to render, one cell each. */
	metrics: Metric[];
	/** Number of columns. Defaults to metrics.length capped at 4. */
	columns?: number;
	/** Grid size. */
	size?: 'sm' | 'md';
	/** Show thin dividers between cells. Defaults to true. */
	divided?: boolean;
	className?: string;
}
