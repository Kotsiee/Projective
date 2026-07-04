/**
 * Status values a {@link StatusBadge} can represent. A mix of presence
 * states (online/offline/…) and finance/escrow lifecycle states.
 */
export type StatusBadgeStatus =
	| 'active'
	| 'online'
	| 'offline'
	| 'away'
	| 'released'
	| 'in-escrow'
	| 'pending'
	| 'funding'
	| 'funded'
	| 'disputed';

/**
 * StatusBadge specific props.
 */
export interface StatusBadgeProps {
	/** The semantic status to render. */
	status: StatusBadgeStatus;
	/** Override the default label text derived from {@link status}. */
	label?: string;
	/** Visual treatment of the chip. Defaults to 'subtle'. */
	variant?: 'solid' | 'subtle' | 'outline';
	/** Chip size. Defaults to 'md'. */
	size?: 'sm' | 'md';
	/**
	 * Force showing the pulsing presence dot. Defaults to true for presence
	 * states (online/offline/active/away); finance states show an icon instead.
	 */
	showDot?: boolean;
	/** Force showing the status icon. */
	showIcon?: boolean;
	className?: string;
}
