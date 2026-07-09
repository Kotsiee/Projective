import { ComponentChildren } from 'preact';
import '../../styles/components/metric-placeholder.css';

export interface MetricPlaceholderProps {
	label: string;
	/** Optional icon node for the chip. */
	icon?: ComponentChildren;
	/** Accent tint for the gradient wash + chip. @default 'primary' */
	accent?: 'primary' | 'mint' | 'violet' | 'amber';
	/** Short "coming soon" hint under the shimmer bars. */
	hint?: string;
	className?: string;
}

/**
 * @function MetricPlaceholder
 * @description An elegant, non-interactive placeholder tile for organizational-health
 * metrics that aren't wired to data yet. Renders a soft premium gradient wash, an
 * accent chip, and shimmering skeleton bars — so the health matrix reads as
 * "instrumented, populating" rather than empty. Palette-token driven for light/dark.
 */
export function MetricPlaceholder(props: MetricPlaceholderProps) {
	const { label, icon, accent = 'primary', hint = 'Instrumenting…', className } = props;

	const classes = [
		'metric-placeholder',
		`metric-placeholder--${accent}`,
		className,
	].filter(Boolean).join(' ');

	return (
		<div class={classes} aria-hidden='true'>
			<div class='metric-placeholder__top'>
				{icon && <span class='metric-placeholder__icon'>{icon}</span>}
				<span class='metric-placeholder__label'>{label}</span>
			</div>
			<div class='metric-placeholder__bars'>
				<span class='metric-placeholder__bar metric-placeholder__bar--lg' />
				<span class='metric-placeholder__bar metric-placeholder__bar--md' />
			</div>
			<div class='metric-placeholder__hint'>{hint}</div>
		</div>
	);
}

export default MetricPlaceholder;
