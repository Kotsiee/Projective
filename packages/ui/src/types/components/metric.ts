import type { ComponentChildren } from 'preact';

export type MetricAccent =
	| 'primary'
	| 'mint'
	| 'violet'
	| 'amber'
	| 'success'
	| 'danger'
	| 'neutral';

/** A trend chip shown beside the value (e.g. `+12.4%` since last month). */
export interface MetricDelta {
	label: string;
	direction: 'up' | 'down' | 'flat';
	/** Override the colour intent. Defaults from `direction` (up→success, down→danger). */
	tone?: 'success' | 'danger' | 'neutral';
}

export interface MetricCardProps {
	label: string;
	/** Preformatted headline value (e.g. a currency-formatted balance). */
	value: string;
	/** Secondary line under the value. */
	sublabel?: string;
	delta?: MetricDelta;
	/** Leading icon (typically a `@tabler/icons-preact` node). */
	icon?: ComponentChildren;
	/** Accent tint for the icon chip + left rule. Default `primary`. */
	accent?: MetricAccent;
	footer?: ComponentChildren;
	/** Renders the card as a link (quick-action shortcut). */
	href?: string;
	/** Renders the card as a button. Ignored when `href` is set. */
	onClick?: () => void;
	className?: string;
}
