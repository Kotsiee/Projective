// Floating "return to present" teleport. Appears only when the current real-world
// date/time has scrolled out of the viewport, easing in from the bottom edge.
// Clicking it smoothly animates the timeline back to now. A small chevron hints
// which way the present lies (above or below the current slice).

import { IconChevronDown, IconChevronUp, IconClock } from '@tabler/icons-preact';

export interface PresentButtonProps {
	/** Whether the button is visible (present is off-screen). */
	show: boolean;
	/** Where the present sits relative to the viewport. */
	direction: 'up' | 'down';
	/** Short caption, e.g. "Now" or "Today". */
	label: string;
	onClick: () => void;
}

export function PresentButton({ show, direction, label, onClick }: PresentButtonProps) {
	return (
		<button
			type='button'
			class='cal-jump'
			data-show={show}
			tabIndex={show ? 0 : -1}
			aria-hidden={!show}
			aria-label={`Jump to ${label.toLowerCase()}`}
			onClick={onClick}
		>
			<span class='cal-jump__icon'>
				<IconClock size={15} />
			</span>
			<span class='cal-jump__label'>{label}</span>
			<span class='cal-jump__dir'>
				{direction === 'up' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
			</span>
		</button>
	);
}
