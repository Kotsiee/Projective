/**
 * @file Profile.ts
 * @description Type contracts for the public User Profile & Availability ecosystem.
 *
 * There is no backend for this surface yet — the whole page is driven by the
 * frontend seed in `../data/mockProfile.ts` (mirrors the Stage Submissions mock
 * approach). Shapes here are intentionally serialisable (dates as ISO strings)
 * so they can hydrate straight from a Service later without churn.
 */

// #region Kind & viewer relationship
/** What sort of entity the profile represents. Drives which CTAs render. */
export type ProfileKind = 'person' | 'business' | 'team';

/** Live presence indicator shown next to the name. */
export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline';

/**
 * The viewer's relationship to the profile. Determines the contextual CTA row
 * and whether the page flips into Editor Mode.
 */
export interface ViewerRelationship {
	/** The authenticated viewer IS the owner of this profile → Editor Mode. */
	isSelf: boolean;
	/** Viewer already follows this person/entity. */
	isFollowing: boolean;
	/** Viewer has saved/bookmarked this profile. */
	isSaved: boolean;
	/** Viewer is already connected (person↔person). */
	isConnected: boolean;
	/** Viewer is already a member of this team/business. */
	isMember: boolean;
}
// #endregion

// #region Competency & language proficiency
/** Ordered competency indicator for a skill tag. */
export type Competency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillTag {
	id: string;
	label: string;
	competency: Competency;
	/** Optional tabler icon name reference (rendered by a lookup in the component). */
	icon?: string;
}

export type LanguageFluency = 'Native' | 'Fluent' | 'Conversational' | 'Basic';

export interface LanguageProficiency {
	id: string;
	name: string;
	fluency: LanguageFluency;
	/** 0–100 proficiency ring value. */
	level: number;
}
// #endregion

// #region Meta sidebar
export interface RatingByRole {
	/** Rating as a freelancer/provider. */
	asFreelancer: { score: number; count: number };
	/** Rating as a client. */
	asClient: { score: number; count: number };
}

export interface ProfileMeta {
	location: string;
	/** IANA-ish label, e.g. "BST · UTC+1". */
	timezoneLabel: string;
	/** Offset in minutes from UTC, used to compute local time client-side. */
	utcOffsetMinutes: number;
	languages: LanguageProficiency[];
	/** Human response time, e.g. "~2 hrs". */
	responseTime: string;
	workplace: string;
	school: string;
	title: string;
	memberSince: string;
	ratings: RatingByRole;
}
// #endregion

// #region Tab payloads
export interface ServiceItem {
	id: string;
	title: string;
	summary: string;
	thumbnailUrl: string;
	priceLabel: string;
	deliveryLabel: string;
	rating: number;
	reviews: number;
	tags: string[];
	/** Session-based services surface inside the booking modal's left rail. */
	sessionBased?: boolean;
	/** Default session length in minutes for booking. */
	sessionMinutes?: number;
}

export type ProjectRelationship = 'owned' | 'worked_on';

export interface ProjectItem {
	id: string;
	name: string;
	description: string;
	relationship: ProjectRelationship;
	/** Corporate / team affiliation label + optional colour hint. */
	affiliation: string;
	role?: string;
	stack: string[];
	stars: number;
	contributions?: number;
	status: 'active' | 'completed' | 'archived';
	updatedAt: string;
}

export type PortfolioMediaKind = 'image' | 'video' | 'audio' | 'document' | 'link';

/** Coarse discipline used by the portfolio filter bar. */
export type PortfolioCategory = 'Design' | 'Code' | 'Writing' | 'Video' | 'Other';

export interface PortfolioItem {
	id: string;
	title: string;
	kind: PortfolioMediaKind;
	/** Discipline category driving the live filter bar. */
	category: PortfolioCategory;
	/** Cover/thumbnail (a poster frame for video/audio). */
	coverUrl: string;
	/** Aspect ratio hint used to size masonry bricks (w/h). */
	aspect: number;
	tags: string[];
}

export interface TimelineEntry {
	id: string;
	title: string;
	organisation: string;
	/** e.g. "2021 — Present". */
	period: string;
	startYear: number;
	endYear: number | null;
	description: string;
	tags: string[];
	current?: boolean;
}

export interface EntityCard {
	id: string;
	name: string;
	handle: string;
	kind: 'team' | 'business';
	role: string;
	logoUrl?: string;
	memberCount: number;
	description: string;
	tags: string[];
}

/** Which side of an engagement a review was written about. */
export type ReviewRole = 'freelancer' | 'client';

/** A single review in the profile's live review history (Reviews tab). */
export interface ReviewItem {
	id: string;
	/** Whether this rates the profile as a freelancer/provider or as a client. */
	role: ReviewRole;
	/** 0–5 stars (halves allowed). */
	rating: number;
	title: string;
	body: string;
	authorName: string;
	authorHandle: string;
	authorAvatarUrl?: string;
	/** Context the review was left in (service/project name). */
	context: string;
	/** ISO date the review was posted. */
	date: string;
}
// #endregion

// #region Availability engine
export type MeetingPlatform = 'zoom' | 'teams' | 'meet';

/** A single working window inside a day (minutes from midnight). */
export interface TimeSlot {
	/** Minutes from 00:00, e.g. 540 = 09:00. */
	start: number;
	/** Minutes from 00:00, e.g. 720 = 12:00. */
	end: number;
	label?: string;
}

/**
 * A recurring weekly rule. `days` are ISO weekday numbers (1=Mon … 7=Sun).
 * Multiple `slots` model irregular schedules with breaks between windows.
 */
export interface AvailabilityRule {
	id: string;
	label: string;
	days: number[];
	slots: TimeSlot[];
	colour: string;
}

/** A holiday / time-off block that overrides availability for a date range. */
export interface TimeOffBlock {
	id: string;
	label: string;
	/** Inclusive ISO date (YYYY-MM-DD). */
	startDate: string;
	endDate: string;
}

/** An existing booking rendered as a filled cell on the calendar. */
export interface BookingEntry {
	id: string;
	title: string;
	/** ISO date (YYYY-MM-DD). */
	date: string;
	start: number;
	end: number;
	platform: MeetingPlatform;
	with: string;
	serviceId?: string;
}

export interface AvailabilitySettings {
	/** Global toggle — when false, public booking is disabled ("Bookings Offline"). */
	publicBookingEnabled: boolean;
	/** Booking granularity in minutes (each clickable cell). */
	slotMinutes: number;
	rules: AvailabilityRule[];
	timeOff: TimeOffBlock[];
	bookings: BookingEntry[];
}
// #endregion

// #region Root profile
export type ProfileTabKey =
	| 'services'
	| 'projects'
	| 'portfolio'
	| 'experience'
	| 'education'
	| 'teams'
	| 'reviews';

export interface ProfileData {
	id: string;
	kind: ProfileKind;
	displayName: string;
	handle: string;
	subtitle: string;
	verified: boolean;
	/** Number of products the entity lists (no dedicated tab; shown in the stat row). */
	productCount: number;
	avatarUrl?: string;
	bannerUrl?: string;
	/** Gradient fallback when no banner image is set (CSS value). */
	bannerGradient?: string;
	status: AvailabilityStatus;
	statusLabel: string;
	headline: string;
	about: string;
	/** Bullet list rendered under "How I work". */
	howIWork: string[];
	skills: SkillTag[];
	meta: ProfileMeta;

	services: ServiceItem[];
	projects: ProjectItem[];
	portfolio: PortfolioItem[];
	experience: TimelineEntry[];
	education: TimelineEntry[];
	teams: EntityCard[];
	businesses: EntityCard[];
	/** Live review history surfaced in the Reviews tab. */
	reviews: ReviewItem[];

	availability: AvailabilitySettings;

	/** Per-tab counts shown as chips in the tab bar. */
	counts: Partial<Record<ProfileTabKey, number>>;
}

/** Draft shape used by Editor Mode — the mutable subset of the profile. */
export interface ProfileDraft {
	displayName: string;
	handle: string;
	subtitle: string;
	headline: string;
	about: string;
	howIWork: string[];
	skills: SkillTag[];
	location: string;
	timezoneLabel: string;
	workplace: string;
	school: string;
	title: string;
	languages: LanguageProficiency[];
	publicBookingEnabled: boolean;
}
// #endregion
