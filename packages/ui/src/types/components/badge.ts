import type { ComponentChildren } from 'preact';

/** Semantic colour keys — each maps to a palette token that already re-themes for dark mode. */
export type BadgeTone =
	| 'neutral'
	| 'primary'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'mint'
	| 'violet'
	| 'amber';

export interface StatusBadgeProps {
	children: ComponentChildren;
	/** Colour intent. Default `neutral`. */
	tone?: BadgeTone;
	/** `soft` = translucent fill (default), `solid` = filled, `outline` = bordered. */
	variant?: 'soft' | 'solid' | 'outline';
	/** `sm` for dense tables, `md` (default) elsewhere. */
	size?: 'sm' | 'md';
	/** Render a leading status dot. */
	dot?: boolean;
	className?: string;
}
