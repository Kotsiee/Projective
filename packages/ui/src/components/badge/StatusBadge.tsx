import '../../styles/components/badge.css';
import type { StatusBadgeProps } from '../../types/components/badge.ts';

/**
 * @function StatusBadge
 * @description A compact, tone-driven status pill (Held / Released / Pending / Active …). Colours
 * come from palette tokens via a single `--badge-color` custom property per tone, so `soft`,
 * `solid` and `outline` variants all re-theme for free between light and dark mode.
 */
export function StatusBadge(props: StatusBadgeProps) {
	const {
		children,
		tone = 'neutral',
		variant = 'soft',
		size = 'md',
		dot = false,
		className,
	} = props;

	const classes = [
		'status-badge',
		`status-badge--${tone}`,
		`status-badge--${variant}`,
		`status-badge--${size}`,
		className,
	].filter(Boolean).join(' ');

	return (
		<span class={classes}>
			{dot && <span class='status-badge__dot' aria-hidden='true' />}
			<span class='status-badge__label'>{children}</span>
		</span>
	);
}
