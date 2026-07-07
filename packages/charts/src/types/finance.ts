/**
 * @file finance.ts
 * @description Prop contracts for the wallet-hub visualization engines: the Pipeline Flow
 * scatter (Canvas + SVG overlay) and the Predictive Runway forecast (SVG), plus the shared
 * large-view focus modal. Data shapes come from `@projective/types` so the app, the charts and
 * the ledger all speak one finance vocabulary.
 */

import type { ComponentChildren } from 'preact';
import type { Signal } from '@preact/signals';
import type { ForecastingDataPoint, PipelinePoint } from '@projective/types';

/** Inner plot insets, leaving room for axes/labels. */
export interface ChartMargin {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** Colour + label mapping for one pipeline category (drives the legend and node fill). */
export interface PipelineCategoryStyle {
	category: string;
	label: string;
	/** Any CSS colour string — typically a theme var like `var(--mint)`. */
	color: string;
}

/** A hovered/clicked pipeline node plus its resolved screen position (for the overlay tooltip). */
export interface PipelineHover {
	point: PipelinePoint;
	x: number;
	y: number;
}

export interface PipelineFlowChartProps {
	points: PipelinePoint[];
	/** Category → colour/label map. Missing categories fall back to a neutral tone. */
	categories?: PipelineCategoryStyle[];
	height?: number;
	/** Render the velocity-weighted trend line over the scatter. Default true. */
	showTrendLine?: boolean;
	/** When set, only points whose category is included are drawn (subset filter). */
	activeCategories?: string[] | null;
	/** ISO-4217 code used to format the tooltip value. */
	currency?: string;
	/** Fired when a node is clicked (null when the empty plot is clicked). */
	onPointSelect?: (point: PipelinePoint | null) => void;
	className?: string;
}

/** Projection horizons offered by the focus-modal timeline slider. */
export type RunwayTimeframe = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export interface ForecastRunwayChartProps {
	series: ForecastingDataPoint[];
	height?: number;
	/** Draw the confidence-interval band. Default true. */
	showBand?: boolean;
	/** ISO-4217 code used to format the y-axis + tooltip. */
	currency?: string;
	/** CSS colour for the projection line/band. Default `var(--mint)`. */
	accent?: string;
	/** Fired as the pointer scrubs the timeline (null on leave). */
	onScrubPoint?: (point: ForecastingDataPoint | null) => void;
	className?: string;
}

export interface ChartFocusModalProps {
	/** Open state — a boolean or a signal so islands can drive it reactively. */
	open: boolean | Signal<boolean>;
	title: string;
	subtitle?: string;
	onClose: () => void;
	/** The maximized chart. */
	children: ComponentChildren;
	/** Optional configuration panel (layer toggles, timeline slider, category filters). */
	controls?: ComponentChildren;
}
