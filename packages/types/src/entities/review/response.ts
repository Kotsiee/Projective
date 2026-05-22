import { Identifiable, Timestamped } from '../core/base-response.ts';

// #region 1. REVIEW TARGETS
export type ReviewTargetType = 'user' | 'freelancer' | 'business' | 'team' | 'service_blueprint';
// #endregion

// #region 2. REVIEW RESPONSE
/**
 * @interface ReviewResponse
 * @description Represents a verified review on the platform, including any official replies.
 */
export interface ReviewResponse extends Identifiable, Timestamped {
	target_entity_id: string;
	target_entity_type: ReviewTargetType;
	reviewer_user_id: string;
	project_id: string | null;
	rating: number;
	comment: string;
	reply_comment: string | null;
	replied_at: string | null;
}
// #endregion
