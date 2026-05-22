import { Identifiable, Timestamped } from '../core/base-response.ts';
import { PricingModel } from '../session/enums.ts';

// #region 1. SERVICE BLUEPRINT RESPONSE
/**
 * @interface ServiceBlueprintResponse
 * @description The productized service listing created by a freelancer.
 */
export interface ServiceBlueprintResponse extends Identifiable, Timestamped {
	freelancer_profile_id: string;
	title: string;
	description: Record<string, any>;
	description_text: string;
	pricing_model: PricingModel;
	price_cents: number;
	currency: string;
	requires_upfront_escrow: boolean;
	max_seats_per_cohort: number;
	allow_continuous_enrollment: boolean;
	enrollment_window_days: number;
	session_template_rules: Record<string, any>;
	is_published: boolean;
}
// #endregion
