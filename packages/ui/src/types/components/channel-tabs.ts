import type { ComponentChildren } from 'preact';

/** One tab in the stage-room channel strip. */
export interface ChannelTab {
	id: string;
	label: string;
	/** Optional leading icon node (e.g. a Tabler icon). */
	icon?: ComponentChildren;
	/** Locked channels render dimmed with a lock glyph and cannot be selected. */
	locked?: boolean;
	/** Tooltip explaining why the channel is locked. */
	lockedHint?: string;
}

export interface ChannelTabsProps {
	tabs: ChannelTab[];
	activeId: string;
	onSelect: (id: string) => void;
	className?: string;
}
