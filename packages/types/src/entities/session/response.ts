import { Identifiable, Timestamped } from '../core/base-response.ts';
import { CohortStatus, SessionEventStatus, WaitlistStatus } from './enums.ts';

// #region 1. COHORT RESPONSES
/**
 * @interface CohortResponse
 * @description Represents a group of clients enrolled in a specific iteration of a Service.
 */
export interface CohortResponse extends Identifiable, Timestamped {
	project_id: string;
	name: string;
	max_seats: number;
	status: CohortStatus;
}

/**
 * @interface CohortMembershipResponse
 * @description Maps a user to a Cohort.
 */
export interface CohortMembershipResponse extends Identifiable {
	cohort_id: string;
	user_id: string;
	status: string;
	joined_at: string;
}
// #endregion

// #region 2. EVENT & ATTENDANCE RESPONSES
/**
 * @interface SessionEventResponse
 * @description A specific time block within a Cohort schedule.
 * NOTE: UI does not receive the raw attendee_join_url. It uses /api/v1/sessions/join/:id
 */
export interface SessionEventResponse extends Identifiable, Timestamped {
	cohort_id: string;
	title: string;
	start_time: string;
	end_time: string;
	status: SessionEventStatus;
}

/**
 * @interface SessionAttendanceResponse
 * @description Immutable log of a user entering the session via the Gateway Bouncer.
 */
export interface SessionAttendanceResponse extends Identifiable {
	session_event_id: string;
	user_id: string;
	joined_at: string;
}
// #endregion

// #region 3. WAITLIST RESPONSES
/**
 * @interface WaitlistResponse
 * @description Represents a user queued for a Service Blueprint.
 */
export interface WaitlistResponse extends Identifiable, Timestamped {
	service_blueprint_id: string;
	user_id: string;
	status: WaitlistStatus;
}
// #endregion
