/**
 * @file BookingsOffline.tsx
 * @description Placeholder shown when `availability.publicBookingEnabled` is
 * false — the freelancer has closed public booking. Uses the shared `.tab-empty`
 * chrome so it matches the other tabs' empty states.
 */

import '../../styles/components/availability.css';
import { IconCalendarOff } from '@tabler/icons-preact';

export default function BookingsOffline() {
	return (
		<div class='tab-empty avail-offline'>
			<IconCalendarOff size={40} stroke={1.5} />
			<p class='avail-offline__title'>Bookings offline</p>
			<p class='avail-offline__sub'>
				This person isn't accepting new sessions right now. Follow them to be notified when their
				calendar reopens.
			</p>
		</div>
	);
}
