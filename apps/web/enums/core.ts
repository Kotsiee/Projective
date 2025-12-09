export enum Visibility {
	Public = 'public',
	InviteOnly = 'invite_only',
	Unlisted = 'unlisted',
}

export enum ProfileType {
	FREELANCER,
	BUSINESS,
}

export enum AssignmentType {
	FREELANCER,
	TEAM,
}

export enum ProjectStatus {
	DRAFT,
	ACTIVE,
	ON_HOLD,
	COMPLETED,
	CANCELLED,
}

export enum StageStatus {
	OPEN,
	ASSIGNED,
	IN_PROGRESS,
	SUBMITTED,
	APPROVED,
	REVISIONS,
	PAID,
}

export enum DisputeStatus {
	OPEN,
	UNDER_REVIEW,
	RESOLVED,
	REFUNDED,
}
