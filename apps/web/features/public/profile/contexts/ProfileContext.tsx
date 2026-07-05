/**
 * @file ProfileContext.tsx
 * @description Client state for the profile ecosystem. One provider owns every
 * signal the page reads: the (mock) profile data, the viewer relationship, the
 * active tab, per-tab view toggles, the availability calendar cursor, the
 * booking-modal state and the Editor-Mode draft.
 *
 * Islands stay dumb — this holds no data-fetching; it hydrates from props the
 * route resolved and mutates local `@preact/signals` state only.
 */

import { type ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { computed, type ReadonlySignal, type Signal, useSignal } from '@preact/signals';
import type {
	ProfileData,
	ProfileDraft,
	ProfileTabKey,
	ViewerRelationship,
} from '../contracts/Profile.ts';

// #region Booking modal state
export interface BookingModalState {
	open: boolean;
	date: string;
	start: number;
	end: number;
	serviceId: string | null;
}
// #endregion

export type CalendarView = 'day' | 'week' | 'month';
export type ListGridView = 'grid' | 'list';

export interface ProfileState {
	profile: Signal<ProfileData>;
	viewer: Signal<ViewerRelationship>;
	isOwn: ReadonlySignal<boolean>;

	isEditing: Signal<boolean>;
	isScrolled: Signal<boolean>;
	activeTab: Signal<ProfileTabKey>;

	servicesView: Signal<ListGridView>;
	projectsView: Signal<ListGridView>;
	calendarView: Signal<CalendarView>;
	/** ISO date (YYYY-MM-DD) the calendar is centred on. */
	calendarCursor: Signal<string>;

	/** Whether the side-nav action rail is collapsed to icons (persisted). */
	railCollapsed: Signal<boolean>;

	draft: Signal<ProfileDraft>;
	bookingModal: Signal<BookingModalState>;

	// Actions
	setTab: (tab: ProfileTabKey) => void;
	startEditing: () => void;
	cancelEditing: () => void;
	saveEditing: () => void;
	updateDraft: (patch: Partial<ProfileDraft>) => void;

	toggleFollow: () => void;
	toggleSaved: () => void;
	toggleConnect: () => void;
	toggleMember: () => void;
	toggleRail: () => void;

	openBooking: (date: string, start: number, end?: number, serviceId?: string | null) => void;
	updateBooking: (patch: Partial<BookingModalState>) => void;
	closeBooking: () => void;
}

const ProfileContext = createContext<ProfileState | null>(null);

// #region Helpers
/** Builds the mutable Editor draft from the immutable profile source. */
function draftFromProfile(p: ProfileData): ProfileDraft {
	return {
		displayName: p.displayName,
		handle: p.handle,
		subtitle: p.subtitle,
		headline: p.headline,
		about: p.about,
		howIWork: [...p.howIWork],
		skills: p.skills.map((s) => ({ ...s })),
		location: p.meta.location,
		timezoneLabel: p.meta.timezoneLabel,
		workplace: p.meta.workplace,
		school: p.meta.school,
		title: p.meta.title,
		baseRate: p.meta.baseRate,
		languages: p.meta.languages.map((l) => ({ ...l })),
		publicBookingEnabled: p.availability.publicBookingEnabled,
	};
}
// #endregion

export interface ProfileProviderProps {
	profile: ProfileData;
	/** Whether the authenticated viewer owns this profile (drives Editor Mode). */
	isSelf?: boolean;
	/** Start in Editor Mode immediately (e.g. `?edit=1`). */
	startInEdit?: boolean;
	children: ComponentChildren;
}

export function ProfileProvider(
	{ profile, isSelf = false, startInEdit = false, children }: ProfileProviderProps,
) {
	const profileSig = useSignal<ProfileData>(profile);

	const viewer = useSignal<ViewerRelationship>({
		isSelf,
		isFollowing: false,
		isSaved: false,
		isConnected: false,
		isMember: false,
	});
	const isOwn = computed(() => viewer.value.isSelf);

	const isEditing = useSignal(isSelf && startInEdit);
	const isScrolled = useSignal(false);
	const activeTab = useSignal<ProfileTabKey>('services');

	const servicesView = useSignal<ListGridView>('grid');
	const projectsView = useSignal<ListGridView>('grid');
	const calendarView = useSignal<CalendarView>('week');
	const calendarCursor = useSignal<string>(firstBookableDate(profile));

	// Rail collapse — collapsed by default, restored from localStorage.
	const railCollapsed = useSignal<boolean>(readRailCollapsed());

	const draft = useSignal<ProfileDraft>(draftFromProfile(profile));

	const bookingModal = useSignal<BookingModalState>({
		open: false,
		date: '',
		start: 0,
		end: 0,
		serviceId: null,
	});

	// #region Actions
	const setTab = (tab: ProfileTabKey) => {
		activeTab.value = tab;
	};

	const startEditing = () => {
		draft.value = draftFromProfile(profileSig.value);
		isEditing.value = true;
	};

	const cancelEditing = () => {
		draft.value = draftFromProfile(profileSig.value);
		isEditing.value = false;
	};

	const saveEditing = () => {
		const d = draft.value;
		const p = profileSig.value;
		profileSig.value = {
			...p,
			displayName: d.displayName,
			handle: d.handle,
			subtitle: d.subtitle,
			headline: d.headline,
			about: d.about,
			howIWork: [...d.howIWork],
			skills: d.skills.map((s) => ({ ...s })),
			meta: {
				...p.meta,
				location: d.location,
				timezoneLabel: d.timezoneLabel,
				workplace: d.workplace,
				school: d.school,
				title: d.title,
				baseRate: d.baseRate,
				languages: d.languages.map((l) => ({ ...l })),
			},
			availability: { ...p.availability, publicBookingEnabled: d.publicBookingEnabled },
		};
		isEditing.value = false;
	};

	const updateDraft = (patch: Partial<ProfileDraft>) => {
		draft.value = { ...draft.value, ...patch };
	};

	const flip = (key: keyof ViewerRelationship) => {
		viewer.value = { ...viewer.value, [key]: !viewer.value[key] };
	};
	const toggleFollow = () => flip('isFollowing');
	const toggleSaved = () => flip('isSaved');
	const toggleConnect = () => flip('isConnected');
	const toggleMember = () => flip('isMember');

	const toggleRail = () => {
		const next = !railCollapsed.value;
		railCollapsed.value = next;
		if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
			globalThis.localStorage.setItem('profile_rail_collapsed', String(next));
		}
	};

	const openBooking = (
		date: string,
		start: number,
		end?: number,
		serviceId: string | null = null,
	) => {
		const slot = profileSig.value.availability.slotMinutes;
		bookingModal.value = {
			open: true,
			date,
			start,
			end: end ?? start + slot,
			serviceId,
		};
	};
	const updateBooking = (patch: Partial<BookingModalState>) => {
		bookingModal.value = { ...bookingModal.value, ...patch };
	};
	const closeBooking = () => {
		bookingModal.value = { ...bookingModal.value, open: false };
	};
	// #endregion

	return (
		<ProfileContext.Provider
			value={{
				profile: profileSig,
				viewer,
				isOwn,
				isEditing,
				isScrolled,
				activeTab,
				servicesView,
				projectsView,
				calendarView,
				calendarCursor,
				railCollapsed,
				draft,
				bookingModal,
				setTab,
				startEditing,
				cancelEditing,
				saveEditing,
				updateDraft,
				toggleFollow,
				toggleSaved,
				toggleConnect,
				toggleMember,
				toggleRail,
				openBooking,
				updateBooking,
				closeBooking,
			}}
		>
			{children}
		</ProfileContext.Provider>
	);
}

export function useProfileContext(): ProfileState {
	const ctx = useContext(ProfileContext);
	if (!ctx) {
		throw new Error('useProfileContext must be used within ProfileProvider');
	}
	return ctx;
}

// Re-export so nested contents (rendered via setMiddleNav) can re-wrap the value.
export { ProfileContext };

// #region Local helpers
/** Reads the persisted rail-collapse preference; defaults to collapsed. */
function readRailCollapsed(): boolean {
	if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
		const stored = globalThis.localStorage.getItem('profile_rail_collapsed');
		if (stored !== null) return stored === 'true';
	}
	return true; // collapsed by default
}

/** Picks a sensible starting date for the calendar cursor from seed bookings. */
function firstBookableDate(p: ProfileData): string {
	const dated = [...p.availability.bookings].sort((a, b) => a.date.localeCompare(b.date));
	return dated[0]?.date ?? '2026-07-06';
}
// #endregion
