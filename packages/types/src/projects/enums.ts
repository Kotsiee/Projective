/**
 * @file project-enums.ts
 * @description Canonical enums for Projective domain logic as defined in the business documentation.
 */

// #region 1. STATUS ENUMS
/**
 * @description Project work-flow format. Mirrors the `project_format` Postgres enum.
 */
export enum ProjectFormat {
	OneOff = 'one_off',
	Pipeline = 'pipeline',
	Session = 'session',
}

/**
 * @description Structural cardinality tier for a project, enforced at write time by
 * `projects.fn_enforce_structure_variation`. Mirrors the `projects.structure_variation` enum.
 */
export enum StructureVariation {
	Standard = 'standard',
	OneOff = 'one_off',
	SingleTask = 'single_task',
	SingleStage = 'single_stage',
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

/**
 * @description Pipeline ticket lifecycle state. Mirrors the `ticket_status` Postgres enum.
 * `reported_hidden` marks a ticket suspended inside an active workload-report window.
 */
export enum TicketStatus {
	Backlog = 'backlog',
	Todo = 'todo',
	Claimed = 'claimed',
	InProgress = 'in_progress',
	InReview = 'in_review',
	Completed = 'completed',
	Cancelled = 'cancelled',
	ReportedHidden = 'reported_hidden',
}

/**
 * @description Ticket escrow/installment payment state. Mirrors the `payment_status` Postgres enum.
 */
export enum PaymentStatus {
	Unpaid = 'unpaid',
	EscrowFunded = 'escrow_funded',
	PartiallyReleased = 'partially_released',
	Released = 'released',
	Refunded = 'refunded',
}

/**
 * @description Lifecycle of a freelancer workload-intensity mismatch report. Mirrors the
 * `projects.workload_report_status` enum. Drives the 48-hour hidden window and penalty outcomes.
 */
export enum WorkloadReportStatus {
	Open = 'open',
	Acknowledged = 'acknowledged',
	Adjusted = 'adjusted',
	ExpiredPenalized = 'expired_penalized',
	DismissedBadFaith = 'dismissed_bad_faith',
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
