/**
 * @file session-enums.ts
 * @description Canonical enums for Marketplace and Session execution workflows.
 */

// #region 1. MARKETPLACE ENUMS
export enum PricingModel {
	FlatFee = 'flat_fee',
	PerSeat = 'per_seat',
	RecurringRetainer = 'recurring_retainer',
}
// #endregion

// #region 2. SESSION & COHORT ENUMS
export enum CohortStatus {
	Enrolling = 'enrolling',
	Active = 'active',
	Completed = 'completed',
	Cancelled = 'cancelled',
}

export enum SessionEventStatus {
	Scheduled = 'scheduled',
	Completed = 'completed',
	CancelledByFreelancer = 'cancelled_by_freelancer',
	CancelledByClient = 'cancelled_by_client',
}

export enum WaitlistStatus {
	Waiting = 'waiting',
	Invited = 'invited',
	Expired = 'expired',
	Converted = 'converted',
}
// #endregion
