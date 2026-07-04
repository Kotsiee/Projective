import '../styles/fields/metric-grid.css';
import { JSX } from 'preact';
import { MetricGridProps } from '../types/components/metric-grid.ts';

/**
 * @function MetricGrid
 * @description A multi-cell metadata grid of key numeric counters. Each cell
 * shows an optional icon, a prominent value, and a muted label beneath it.
 */
export function MetricGrid(props: MetricGridProps): JSX.Element {
	const {
		metrics,
		columns,
		size = 'md',
		divided = true,
		className,
	} = props;

	const colCount = Math.max(
		1,
		columns ?? Math.min(metrics.length || 1, 4),
	);

	return (
		<div
			class={[
				'metric-grid',
				`metric-grid--${size}`,
				divided && 'metric-grid--divided',
				className,
			].filter(Boolean).join(' ')}
			style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
		>
			{metrics.map((metric, i) => (
				<div
					key={i}
					class={`metric-grid__cell metric-grid__cell--${metric.tone ?? 'default'}`}
					title={metric.hint}
				>
					{metric.icon && (
						<span class='metric-grid__icon' aria-hidden='true'>
							{metric.icon}
						</span>
					)}
					<span class='metric-grid__value'>{metric.value}</span>
					<span class='metric-grid__label'>{metric.label}</span>
				</div>
			))}
		</div>
	);
}
