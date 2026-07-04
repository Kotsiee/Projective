import type { AvailabilityStatus } from '../../contracts/Profile.ts';

/** A small presence indicator dot coloured by availability status. */
export function StatusDot({ status }: { status: AvailabilityStatus }) {
	return <span class={`status-dot status-dot--${status}`} aria-hidden='true' />;
}
