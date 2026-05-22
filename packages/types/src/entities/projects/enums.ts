/**
 * @file project-enums.ts
 * @description Canonical enums for Projective domain logic as defined in the business documentation.
 */

// #region 1. STATUS ENUMS
export enum ProjectFormat {
	OneOff = 'one_off',
	Pipeline = 'pipeline',
}

export enum ProjectStatus {
	Draft = 'draft',
	Active = 'active',
	OnHold = 'on_hold',
	Completed = 'completed',
	Cancelled = 'cancelled',
}

export enum StageStatus {
	Open = 'open',
	Assigned = 'assigned',
	InProgress = 'in_progress',
	Submitted = 'submitted',
	Approved = 'approved',
	Revisions = 'revisions',
	Paid = 'paid',
}

export enum TicketStatus {
	Backlog = 'backlog',
	Todo = 'todo',
	InProgress = 'in_progress',
	InReview = 'in_review',
	Completed = 'completed',
	Cancelled = 'cancelled',
}
// #endregion

// #region 2. CONFIGURATION ENUMS
export enum BudgetType {
	FixedPrice = 'fixed_price',
	HourlyCap = 'hourly_cap',
}

export enum StartTriggerType {
	FixedDate = 'fixed_date',
	OnProjectStart = 'on_project_start',
	OnHireConfirmed = 'on_hire_confirmed',
	DependentOnStage = 'dependent_on_stage',
}

export enum TimelinePreset {
	Sequential = 'sequential',
	Simultaneous = 'simultaneous',
	Staggered = 'staggered',
	Custom = 'custom',
}

export enum IPOptionMode {
	ExclusiveTransfer = 'exclusive_transfer',
	LicensedUse = 'licensed_use',
	SharedOwnership = 'shared_ownership',
	ProjectivePartner = 'projective_partner',
}

export enum PortfolioDisplayRights {
	Allowed = 'allowed',
	Forbidden = 'forbidden',
	Embargoed = 'embargoed',
}
// #endregion

// #region 3. SCHEDULING & LIFECYCLE
export enum DurationMode {
	FixedDeadline = 'fixed_deadline',
	RelativeDuration = 'relative_duration',
	NoDueDate = 'no_due_date',
}

export enum SchedulingWindowMode {
	SpecificDates = 'specific_dates',
	ToBeAgreed = 'to_be_agreed',
	RelativeWindow = 'relative_window',
}

export enum MaintenanceCycleInterval {
	Weekly = 'weekly',
	Monthly = 'monthly',
}
// #endregion
