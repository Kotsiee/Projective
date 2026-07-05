/**
 * @file BookSessionModal.tsx
 * @description The session-request modal, opened from a double-click on an open
 * calendar cell (or a service's "Book" CTA). Controlled off the `bookingModal`
 * signal in ProfileContext for open/date/timeslot/service — no backend.
 *
 * LEFT rail lists the freelancer's session-based services; picking one prefills
 * the session name and stretches the end to the service's default length. The
 * MAIN form captures a name, purpose, an editable timeslot and the digital
 * location (restricted to Zoom / MS Teams / Google Meet). Confirm just toasts.
 *
 * Fields with no home on `BookingModalState` (name, purpose, platform) live in
 * local signals that reset whenever the modal (re)opens.
 */

import '../../styles/components/availability.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, IconButton, Modal, toast } from '@projective/ui';
import { TextField } from '@projective/fields';
import { IconClock, IconX } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { MeetingPlatform, ServiceItem } from '../../contracts/Profile.ts';
import { minutesToTime, MONTH_LABELS, parseIso } from '../../utils.ts';
import { PlatformIcon, platformLabel } from './platformIcon.tsx';

const PLATFORMS: MeetingPlatform[] = ['zoom', 'teams', 'meet'];

/** Human date label for the booking header, e.g. "Mon, Jul 6". */
function dateLabel(iso: string): string {
	if (!iso) return '';
	const d = parseIso(iso);
	const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
	return `${dow}, ${MONTH_LABELS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export default function BookSessionModal() {
	const { profile, bookingModal, updateBooking, closeBooking } = useProfileContext();
	const state = bookingModal.value;

	const services = profile.value.services.filter((s) => s.sessionBased);

	// Local form state for fields the shared BookingModalState doesn't carry.
	const sessionName = useSignal('');
	const purpose = useSignal('');
	const platform = useSignal<MeetingPlatform>('zoom');

	// Reset the local fields each time the modal opens.
	useEffect(() => {
		if (!state.open) return;
		const svc = services.find((s) => s.id === state.serviceId) ?? null;
		sessionName.value = svc ? svc.title : '';
		purpose.value = '';
		platform.value = 'zoom';
	}, [state.open]);

	const selectService = (svc: ServiceItem) => {
		sessionName.value = svc.title;
		updateBooking({
			serviceId: svc.id,
			end: svc.sessionMinutes ? state.start + svc.sessionMinutes : state.end,
		});
	};

	const selected = services.find((s) => s.id === state.serviceId) ?? null;

	const confirm = () => {
		toast.success('Session requested');
		closeBooking();
	};

	return (
		<Modal isOpen={state.open} onClose={closeBooking} width={860} className='avail-book'>
			<div class='avail-book__wrap'>
				{/* #region Header */}
				<header class='avail-book__header'>
					<div>
						<h1 class='avail-book__title'>Request a session</h1>
						<p class='avail-book__subtitle'>
							Pick a session type and confirm a time — {profile.value.displayName}{' '}
							approves the request.
						</p>
					</div>
					<IconButton aria-label='Close' variant='secondary' onClick={closeBooking}>
						<IconX size={20} />
					</IconButton>
				</header>
				{/* #endregion */}

				<div class='avail-book__body'>
					{/* #region Service rail */}
					<aside class='avail-book__rail'>
						<span class='avail-book__rail-title'>Session types</span>
						{services.length === 0
							? <p class='avail-book__rail-empty'>No bookable sessions.</p>
							: (
								<ul class='avail-book__services'>
									{services.map((svc) => {
										const isSel = svc.id === state.serviceId;
										return (
											<li key={svc.id}>
												<Button
													variant={isSel ? 'secondary' : 'link'}
													fullWidth
													className={`avail-book__service${isSel ? ' is-selected' : ''}`}
													onClick={() => selectService(svc)}
												>
													<span class='avail-book__service-top'>
														<span class='avail-book__service-title'>{svc.title}</span>
														<span class='avail-book__service-price'>{svc.priceLabel}</span>
													</span>
													<span class='avail-book__service-meta'>
														<IconClock size={12} />
														{svc.sessionMinutes ?? 30} min
													</span>
												</Button>
											</li>
										);
									})}
								</ul>
							)}
					</aside>
					{/* #endregion */}

					{/* #region Form */}
					<div class='avail-book__form'>
						<div class='avail-book__field'>
							<label class='avail-book__label'>Session name</label>
							<TextField
								value={sessionName}
								onChange={(v) => (sessionName.value = v)}
								placeholder='e.g. Design systems office hours'
							/>
						</div>

						<div class='avail-book__field'>
							<label class='avail-book__label'>Purpose</label>
							<TextField
								value={purpose}
								onChange={(v) => (purpose.value = v)}
								multiline
								rows={3}
								placeholder='What would you like to cover? Share links or context…'
							/>
						</div>

						<div class='avail-book__field'>
							<label class='avail-book__label'>Timeslot</label>
							<div class='avail-book__slot'>
								<span class='avail-book__slot-date'>{dateLabel(state.date)}</span>
								<span class='avail-book__slot-time'>
									<IconClock size={14} />
									{minutesToTime(state.start)} – {minutesToTime(state.end)}
								</span>
							</div>
						</div>

						<div class='avail-book__field'>
							<label class='avail-book__label'>Digital location</label>
							<div class='avail-book__platforms'>
								{PLATFORMS.map((p) => (
									<Button
										key={p}
										variant={p === platform.value ? 'secondary' : 'link'}
										size='small'
										startIcon={<PlatformIcon platform={p} size={16} />}
										onClick={() => (platform.value = p)}
									>
										{platformLabel(p)}
									</Button>
								))}
							</div>
						</div>
					</div>
					{/* #endregion */}
				</div>

				{/* #region Footer */}
				<footer class='avail-book__footer'>
					{selected && (
						<span class='avail-book__footer-summary'>
							{selected.title} · {selected.priceLabel}
						</span>
					)}
					<div class='avail-book__footer-actions'>
						<Button variant='secondary' ghost onClick={closeBooking}>Cancel</Button>
						<Button variant='primary' onClick={confirm}>Confirm booking</Button>
					</div>
				</footer>
				{/* #endregion */}
			</div>
		</Modal>
	);
}
