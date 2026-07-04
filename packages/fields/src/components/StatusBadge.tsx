import '../styles/fields/status-badge.css';
import { JSX } from 'preact';
import {
	Icon,
	IconAlertTriangle,
	IconCircleCheck,
	IconClock,
	IconLock,
} from '@tabler/icons-preact';
import { StatusBadgeProps, StatusBadgeStatus } from '../types/components/status-badge.ts';

/** Statuses that represent presence and default to a pulsing dot. */
const PRESENCE_STATUSES: StatusBadgeStatus[] = [
	'online',
	'offline',
	'active',
	'away',
];

/** Nicely formatted default label per status. */
const DEFAULT_LABELS: Record<StatusBadgeStatus, string> = {
	active: 'Active',
	online: 'Online',
	offline: 'Offline',
	away: 'Away',
	released: 'Released',
	'in-escrow': 'In Escrow',
	pending: 'Pending',
	funding: 'Funding',
	funded: 'Funded',
	disputed: 'Disputed',
};

/** Icon component per finance/escrow status. */
const STATUS_ICONS: Partial<Record<StatusBadgeStatus, Icon>> = {
	released: IconCircleCheck,
	funded: IconCircleCheck,
	'in-escrow': IconLock,
	pending: IconClock,
	funding: IconClock,
	disputed: IconAlertTriangle,
};

/**
 * @function StatusBadge
 * @description A dynamic semantic indicator chip. Presence states render a
 * small pulsing dot; finance/escrow states render a contextual icon. Colours
 * are driven by per-status CSS classes mapped onto the semantic palette.
 */
export function StatusBadge(props: StatusBadgeProps): JSX.Element {
	const {
		status,
		label,
		variant = 'subtle',
		size = 'md',
		showDot,
		showIcon,
		className,
	} = props;

	const isPresence = PRESENCE_STATUSES.includes(status);
	const Icon = STATUS_ICONS[status];

	const renderDot = showDot ?? isPresence;
	const renderIcon = showIcon ?? (!isPresence && !!Icon);

	const text = label ?? DEFAULT_LABELS[status];
	const iconSize = size === 'sm' ? 13 : 15;

	return (
		<span
			class={[
				'status-badge',
				`status-badge--${status}`,
				`status-badge--${variant}`,
				`status-badge--${size}`,
				className,
			].filter(Boolean).join(' ')}
		>
			{renderDot && <span class='status-badge__dot' aria-hidden='true' />}
			{renderIcon && Icon && (
				<span class='status-badge__icon' aria-hidden='true'>
					<Icon size={iconSize} />
				</span>
			)}
			<span class='status-badge__label'>{text}</span>
		</span>
	);
}
