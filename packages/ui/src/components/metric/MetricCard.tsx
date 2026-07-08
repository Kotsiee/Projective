import '../../styles/components/metric-card.css';
import { IconArrowDownRight, IconArrowRight, IconArrowUpRight } from '@tabler/icons-preact';
import type { MetricCardProps } from '../../types/components/metric.ts';

/**
 * @function MetricCard
 * @description A high-fidelity financial summary / KPI card: an accent-tinted icon chip, a headline
 * value, an optional trend chip and footer. Polymorphic — renders as a link or button when `href` /
 * `onClick` are given so it doubles as a quick-action shortcut on the admin dashboard. All colours
 * are palette tokens, so it adapts to light/dark automatically.
 */
export function MetricCard(props: MetricCardProps) {
	const {
		label,
		value,
		sublabel,
		delta,
		icon,
		accent = 'primary',
		footer,
		href,
		onClick,
		className,
	} = props;

	const interactive = !!href || !!onClick;
	const classes = [
		'metric-card',
		`metric-card--${accent}`,
		interactive && 'metric-card--interactive',
		className,
	].filter(Boolean).join(' ');

	const deltaTone = delta?.tone ??
		(delta?.direction === 'up' ? 'success' : delta?.direction === 'down' ? 'danger' : 'neutral');
	const DeltaIcon = delta?.direction === 'up'
		? IconArrowUpRight
		: delta?.direction === 'down'
		? IconArrowDownRight
		: IconArrowRight;

	const body = (
		<>
			<div class='metric-card__top'>
				{icon && <span class='metric-card__icon' aria-hidden='true'>{icon}</span>}
				<span class='metric-card__label'>{label}</span>
				{delta && (
					<span class={`metric-card__delta metric-card__delta--${deltaTone}`}>
						<DeltaIcon size={13} stroke={2.4} />
						{delta.label}
					</span>
				)}
			</div>
			<div class='metric-card__value'>{value}</div>
			{sublabel && <div class='metric-card__sublabel'>{sublabel}</div>}
			{footer && <div class='metric-card__footer'>{footer}</div>}
		</>
	);

	if (href) {
		return <a href={href} class={classes}>{body}</a>;
	}
	if (onClick) {
		return <button type='button' class={classes} onClick={onClick}>{body}</button>;
	}
	return <div class={classes}>{body}</div>;
}
