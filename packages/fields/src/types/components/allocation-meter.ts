/**
 * AllocationMeter specific props.
 */
export interface AllocationMeterProps {
	/** Number of slots currently filled. Clamped to [0, total]. */
	filled: number;
	/** Total number of slots. */
	total: number;
	/** Visual style. Defaults to 'dots'. */
	variant?: 'dots' | 'bar';
	/** Noun used to build the caption, e.g. 'seats'. */
	label?: string;
	/** Show the "N/T label available" caption. Defaults to true. */
	showCaption?: boolean;
	/** Meter size. */
	size?: 'sm' | 'md';
	/**
	 * Colour tone. 'auto' (default) resolves to green when seats remain,
	 * amber when only one is left, red when full.
	 */
	tone?: 'primary' | 'warning' | 'danger' | 'auto';
	className?: string;
}
