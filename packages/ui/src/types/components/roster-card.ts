/**
 * RosterCard types. A card for the stage-staffing surface: it renders an open seat (its required
 * skills, budget and applicants) or, once filled, the assigned talent. Reused by the client's staffing
 * panel and the freelancer's "apply" surface so seats read the same wherever they appear.
 */
export interface RosterSkill {
	id: string;
	name: string;
}

export interface RosterApplicant {
	/** The application id (used by onAssign). */
	id: string;
	name: string;
	avatarUrl?: string;
	type: 'freelancer' | 'team';
	message?: string | null;
	status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export interface RosterCardProps {
	/** Seat headline (its description of need / role title). */
	title: string;
	status: 'open' | 'filled' | 'closed';
	requiredSkills?: RosterSkill[];
	/** Pre-formatted budget range, e.g. "$1,200 – $2,000". */
	budgetLabel?: string;
	/** Applicants to this seat (client/owner view). */
	applicants?: RosterApplicant[];
	/** The assigned talent once the seat is filled. */
	assignee?: { name: string; avatarUrl?: string; type: 'freelancer' | 'team' };
	/**
	 * Freelancer/team "apply" affordance. When provided (and the seat is open) an Apply button shows.
	 */
	onApply?: () => void;
	/** Owner affordance: accept an applicant → assign. Receives the application id. */
	onAssign?: (applicationId: string) => void;
	/** Whether the current viewer may assign (owner/client). Gates the per-applicant Assign button. */
	canAssign?: boolean;
	/** Disables all actions (e.g. while a mutation is in flight). */
	busy?: boolean;
	className?: string;
}
