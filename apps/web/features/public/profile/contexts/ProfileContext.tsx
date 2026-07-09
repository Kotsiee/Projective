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
	ReviewRole,
	ViewerRelationship,
} from '../contracts/Profile.ts';

export type ReviewsFilter = 'all' | ReviewRole;

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

/** The specialised editing modules mounted into the side rail during Editor Mode. */
export type EditSectionKey =
	| 'details'
	| 'services'
	| 'projects'
	| 'portfolio'
	| 'teams'
	| 'experience'
	| 'education'
	| 'members'
	| 'settings'
	| 'availability';

/** localStorage key for the persisted side-nav collapse state (spec-mandated name). */
export const SIDEBAR_COLLAPSED_KEY = 'profile_sidebar_collapsed';

export interface ProfileState {
	profile: Signal<ProfileData>;
	viewer: Signal<ViewerRelationship>;
	isOwn: ReadonlySignal<boolean>;

	isEditing: Signal<boolean>;
	isScrolled: Signal<boolean>;
	activeTab: Signal<ProfileTabKey>;

	/** The active editing module while in Editor Mode. */
	editSection: Signal<EditSectionKey>;

	/** Which role's reviews the Reviews tab is filtered to (set by the rating badges). */
	reviewsFilter: Signal<ReviewsFilter>;

	calendarView: Signal<CalendarView>;
	/** ISO date (YYYY-MM-DD) the calendar is centred on. */
	calendarCursor: Signal<string>;

	/** Whether the side-nav action rail is collapsed to icons (persisted). */
	railCollapsed: Signal<boolean>;

	/** Owner-only: tab keys whose public visibility is toggled off. */
	hiddenTabs: Signal<Set<ProfileTabKey>>;
	/** Owner-only: individual entity ids (services/projects/etc.) hidden from the public. */
	hiddenItems: Signal<Set<string>>;

	draft: Signal<ProfileDraft>;
	bookingModal: Signal<BookingModalState>;

	// Actions
	setTab: (tab: ProfileTabKey) => void;
	/** Opens the Reviews tab, optionally pre-filtered to a role (freelancer/client). */
	openReviews: (role?: ReviewsFilter) => void;
	setEditSection: (section: EditSectionKey) => void;
	startEditing: () => void;
	cancelEditing: () => void;
	saveEditing: () => void;
	updateDraft: (patch: Partial<ProfileDraft>) => void;
	toggleTabHidden: (tab: ProfileTabKey) => void;
	toggleItemHidden: (id: string) => void;

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
	const editSection = useSignal<EditSectionKey>('details');
	const reviewsFilter = useSignal<ReviewsFilter>('all');

	const calendarView = useSignal<CalendarView>('week');
	const calendarCursor = useSignal<string>(firstBookableDate(profile));

	// Rail collapse — collapsed by default when viewing, restored from localStorage.
	// If the page opens straight into Editor Mode, start expanded (see startEditing).
	const railCollapsed = useSignal<boolean>(
		isSelf && startInEdit ? false : readRailCollapsed(),
	);

	const hiddenTabs = useSignal<Set<ProfileTabKey>>(new Set());
	const hiddenItems = useSignal<Set<string>>(new Set());

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

	const openReviews = (role: ReviewsFilter = 'all') => {
		reviewsFilter.value = role;
		activeTab.value = 'reviews';
		if (typeof globalThis !== 'undefined' && globalThis.history?.replaceState) {
			globalThis.history.replaceState(null, '', '#reviews');
		}
	};

	const setEditSection = (section: EditSectionKey) => {
		editSection.value = section;
	};

	const startEditing = () => {
		draft.value = draftFromProfile(profileSig.value);
		editSection.value = 'details';
		isEditing.value = true;
		// Entering Editor Mode auto-expands the side nav and persists that state.
		railCollapsed.value = false;
		writeSidebarCollapsed(false);
	};

	const cancelEditing = () => {
		draft.value = draftFromProfile(profileSig.value);
		isEditing.value = false;
		// Back to the normal-view default: collapsed, persisted.
		railCollapsed.value = true;
		writeSidebarCollapsed(true);
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
				languages: d.languages.map((l) => ({ ...l })),
			},
			availability: { ...p.availability, publicBookingEnabled: d.publicBookingEnabled },
		};
		isEditing.value = false;
		// Back to the normal-view default: collapsed, persisted.
		railCollapsed.value = true;
		writeSidebarCollapsed(true);
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
		writeSidebarCollapsed(next);
	};

	const toggleTabHidden = (tab: ProfileTabKey) => {
		const next = new Set(hiddenTabs.value);
		next.has(tab) ? next.delete(tab) : next.add(tab);
		hiddenTabs.value = next;
	};

	const toggleItemHidden = (id: string) => {
		const next = new Set(hiddenItems.value);
		next.has(id) ? next.delete(id) : next.add(id);
		hiddenItems.value = next;
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
				editSection,
				reviewsFilter,
				calendarView,
				calendarCursor,
				railCollapsed,
				hiddenTabs,
				hiddenItems,
				draft,
				bookingModal,
				setTab,
				openReviews,
				setEditSection,
				startEditing,
				cancelEditing,
				saveEditing,
				updateDraft,
				toggleTabHidden,
				toggleItemHidden,
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
/** Reads the persisted sidebar-collapse preference; defaults to collapsed. */
function readRailCollapsed(): boolean {
	if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
		const stored = globalThis.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
		if (stored !== null) return stored === 'true';
	}
	return true; // collapsed by default
}

/** Persists the sidebar-collapse preference. Safe on the server (no-op). */
function writeSidebarCollapsed(next: boolean): void {
	if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
		globalThis.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
	}
}

/** Picks a sensible starting date for the calendar cursor from seed bookings. */
function firstBookableDate(p: ProfileData): string {
	const dated = [...p.availability.bookings].sort((a, b) => a.date.localeCompare(b.date));
	return dated[0]?.date ?? '2026-07-06';
}
// #endregion
