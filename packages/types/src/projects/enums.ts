// --- Status Enums ---

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

// --- Configuration Enums ---

export enum StageType {
	FileBased = 'file_based',
	SessionBased = 'session_based',
	GroupSessionBased = 'group_session_based',
	ManagementBased = 'management_based',
	MaintenanceBased = 'maintenance_based',
}

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

export enum StaffingModelType {
	DefinedRoles = 'defined_roles',
	OpenSeats = 'open_seats',
}

export enum DependencyTriggerEvent {
	AfterCompletion = 'after_completion',
	BeforeDeadline = 'before_deadline',
	AfterStart = 'after_start',
}

export enum DurationMode {
	FixedDeadline = 'fixed_deadline',
	RelativeDuration = 'relative_duration',
	NoDueDate = 'no_due_date',
}

// --- Scheduling & Management ---

export enum SchedulingWindowMode {
	SpecificDates = 'specific_dates',
	ToBeAgreed = 'to_be_agreed',
	RelativeWindow = 'relative_window',
}

export enum ContractMode {
	FixedDates = 'fixed_dates',
	DurationFromStart = 'duration_from_start',
}

export enum ReportingFrequency {
	Daily = 'daily',
	Weekly = 'weekly',
}

export enum MaintenanceCycleInterval {
	Weekly = 'weekly',
	Monthly = 'monthly',
}

export enum TerminationCondition {
	FixedDate = 'fixed_date',
	NumberOfCycles = 'number_of_cycles',
	Indefinite = 'indefinite',
}
