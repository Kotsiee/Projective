/**
 * @file mock_db.ts
 * @description In-memory mock of the Postgres finance/onboarding engine used by the integration
 * tests. It is a *faithful re-implementation of the SQL contracts* (not a stub): the fee math,
 * spending-cap enforcement, team-split basis points, fair-exit tiers, session-context persona
 * routing and audit-grant rules mirror the SECURITY DEFINER functions in
 *   - supabase/migrations/0009_finance_tables.sql   (finance.fn_* engine)
 *   - supabase/migrations/0304_onboarding_session_and_audit.sql (public.handle_new_user)
 *   - supabase/migrations/0305_stage_funding_payout.sql (projects.* stage wrappers, comms.fn_notify)
 *
 * Every mutation runs against in-memory tables. `begin()` snapshots all state and `rollback()`
 * restores it, so integration tests mutate freely and leave no residue between cases — the same
 * guarantee the live-DB layer gets from a real `BEGIN ... ROLLBACK`.
 *
 * SQL semantics preserved deliberately:
 *   - integer division truncates toward zero  → Math.trunc(a * bp / 10000)
 *   - security.audit_logs has NO grant to `authenticated` (see 0205) → only the definer path writes.
 */

// #region TYPES
export type AssignmentType = 'team' | 'freelancer';
export type StageStatus =
	| 'draft'
	| 'open'
	| 'assigned'
	| 'in_progress'
	| 'submitted'
	| 'approved'
	| 'revisions'
	| 'paid'
	| 'cancelled';
export type PaymentStatus =
	| 'unpaid'
	| 'escrow_funded'
	| 'partially_released'
	| 'released';

interface Wallet {
	owner_type: string;
	owner_id: string;
	currency: string;
	balance_cents: number;
}
interface Transaction {
	wallet_id: string;
	direction: 'credit' | 'debit';
	amount_cents: number;
	currency: string;
	reason: string;
	ref_table: string | null;
	ref_id: string | null;
	balance_after_cents: number;
}
interface Escrow {
	id: string;
	project_stage_id: string;
	ticket_id: string | null;
	payer_business_id: string;
	payee_type: AssignmentType;
	payee_id: string;
	amount_cents: number;
	platform_fee_cents: number;
	deadline_bonus_cents: number;
	currency: string;
	status: 'held' | 'released';
}
interface PayoutSplit {
	escrow_id: string;
	member_user_id: string;
	amount_cents: number;
	currency: string;
}
interface SpendingLimit {
	wallet_id: string;
	member_user_id: string;
	cap_cents: number;
	spent_cents: number;
}
interface ContributionAgreement {
	team_id: string;
	member_user_id: string;
	percent_bp: number;
}
interface Project {
	id: string;
	client_business_id: string | null;
	currency: string;
	owner_user_id?: string;
	timeline_preset?: string;
	ip_ownership_mode?: string;
	status?: string;
}
interface Stage {
	id: string;
	project_id: string;
	status: StageStatus;
	name: string;
	unit_price_cents: number | null;
	sort_order?: number;
	ip_ownership_override?: string | null;
	ip_mode?: string;
	start_trigger_type?: string;
	start_dependency_stage_id?: string | null;
	/** Scheduled window bounds for the AC6 overlapping-slot conflict check (ms epoch, null = open). */
	fixed_start_date?: number | null;
	file_due_date?: number | null;
}

// #region US-004 Staffing model (migs 0007 tables + 0307 RPCs)
interface OpenSeat {
	id: string;
	project_stage_id: string;
	description_of_need: string;
	budget_min_cents: number | null;
	budget_max_cents: number | null;
	require_proposals: boolean;
	status: 'open' | 'filled' | 'closed';
	filled_assignment_id: string | null;
	skill_ids: string[];
}
interface SeatApplication {
	id: string;
	project_id: string;
	seat_id: string;
	applicant_user_id: string;
	applicant_type: AssignmentType;
	applicant_profile_id: string;
	message: string | null;
	status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}
// #endregion
interface BusinessProfile {
	id: string;
	slug: string;
	owner_user_id: string;
	default_currency: string;
	total_project_count: number;
	active_project_count: number;
}
interface OrgTeam {
	id: string;
	slug: string;
	owner_user_id: string;
	currency: string;
	treasury_wallet_id: string | null;
}
interface OrgMembership {
	org_id: string;
	user_id: string;
	role: string;
	status: string;
}
interface Ticket {
	id: string;
	project_id: string;
	current_stage_id: string | null;
	current_assignee_id: string | null;
	unit_price_cents: number | null;
	payment_status: PaymentStatus;
	status: string;
	total_amount_paid: number;
}
interface StageAssignment {
	project_stage_id: string;
	assignee_type: AssignmentType;
	team_id: string | null;
	freelancer_profile_id: string | null;
	status: string;
}
interface SessionContext {
	user_id: string;
	active_profile_type: string | null;
	active_profile_id: string | null;
	active_team_id: string | null;
}
interface AuditLog {
	user_id: string;
	action: string;
	entity_table: string;
	entity_id: string;
	metadata: Record<string, unknown>;
	actor_profile_id: string | null;
	actor_team_id?: string | null;
}
interface Notification {
	id: string;
	user_id: string;
	type: string;
	title: string;
	body: string;
	entity_table: string | null;
	entity_id: string | null;
}
export interface NewUserMeta {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	username?: string;
	dob?: string;
	objective?: string;
	skills?: string[];
	interests?: string[];
}

interface DbState {
	usersPublic: {
		user_id: string;
		is_freelancer: boolean;
		total_project_count: number;
		active_project_count: number;
	}[];
	userEmails: { user_id: string; email: string }[];
	freelancerProfiles: { user_id: string; skills: string[] }[];
	sessionContext: Map<string, SessionContext>;
	auditLogs: AuditLog[];
	notifications: Notification[];
	platformParams: Map<string, string>;
	businesses: Set<string>;
	businessProfiles: BusinessProfile[];
	orgTeams: OrgTeam[];
	businessMembers: OrgMembership[];
	teamMembers: OrgMembership[];
	wallets: Wallet[];
	transactions: Transaction[];
	escrows: Escrow[];
	payoutSplits: PayoutSplit[];
	spendingLimits: SpendingLimit[];
	contributionAgreements: ContributionAgreement[];
	projects: Project[];
	stages: Stage[];
	tickets: Ticket[];
	stageAssignments: StageAssignment[];
	openSeats: OpenSeat[];
	seatApplications: SeatApplication[];
}
// #endregion

/** Raised where the SQL functions `RAISE EXCEPTION`; carries an optional SQLSTATE. */
export class SqlError extends Error {
	constructor(message: string, public code?: string) {
		super(message);
		this.name = 'SqlError';
	}
}

export class MockDb {
	private s: DbState;
	private snapshot: DbState | null = null;
	/** Mirrors `auth.uid()` inside SECURITY DEFINER functions (null unless a member is acting). */
	authUid: string | null = null;
	private seq = 0;

	constructor() {
		this.s = MockDb.emptyState();
		// 0305 activates the canonical 5% platform fee (US-005 AC6 / US-007 AC2).
		this.s.platformParams.set('platform_fee_bp', '500');
	}

	private static emptyState(): DbState {
		return {
			usersPublic: [],
			userEmails: [],
			freelancerProfiles: [],
			sessionContext: new Map(),
			auditLogs: [],
			notifications: [],
			platformParams: new Map(),
			businesses: new Set(),
			businessProfiles: [],
			orgTeams: [],
			businessMembers: [],
			teamMembers: [],
			wallets: [],
			transactions: [],
			escrows: [],
			payoutSplits: [],
			spendingLimits: [],
			contributionAgreements: [],
			projects: [],
			stages: [],
			tickets: [],
			stageAssignments: [],
			openSeats: [],
			seatApplications: [],
		};
	}

	private id(prefix: string): string {
		this.seq += 1;
		return `${prefix}-${this.seq.toString().padStart(4, '0')}`;
	}

	// #region TRANSACTION — snapshot / rollback (parity with BEGIN ... ROLLBACK)
	begin(): void {
		this.snapshot = structuredClone({
			...this.s,
			sessionContext: [...this.s.sessionContext],
			platformParams: [...this.s.platformParams],
			businesses: [...this.s.businesses],
		}) as unknown as DbState;
	}

	rollback(): void {
		if (!this.snapshot) return;
		const snap = this.snapshot as unknown as {
			sessionContext: [string, SessionContext][];
			platformParams: [string, string][];
			businesses: string[];
		} & DbState;
		this.s = {
			...snap,
			sessionContext: new Map(snap.sessionContext),
			platformParams: new Map(snap.platformParams),
			businesses: new Set(snap.businesses),
		};
		this.snapshot = null;
	}
	// #endregion

	// #region READ HELPERS (test assertions read through these)
	get state(): Readonly<DbState> {
		return this.s;
	}
	wallet(ownerType: string, ownerId: string, currency: string): Wallet | undefined {
		return this.s.wallets.find(
			(w) => w.owner_type === ownerType && w.owner_id === ownerId && w.currency === currency,
		);
	}
	sessionContextFor(userId: string): SessionContext | undefined {
		return this.s.sessionContext.get(userId);
	}
	auditLogsFor(userId: string): AuditLog[] {
		return this.s.auditLogs.filter((a) => a.user_id === userId);
	}
	notificationsFor(userId: string): Notification[] {
		return this.s.notifications.filter((n) => n.user_id === userId);
	}
	escrowsForStage(stageId: string): Escrow[] {
		return this.s.escrows.filter((e) => e.project_stage_id === stageId);
	}
	ticket(id: string): Ticket | undefined {
		return this.s.tickets.find((t) => t.id === id);
	}
	stage(id: string): Stage | undefined {
		return this.s.stages.find((st) => st.id === id);
	}
	// #endregion

	// #region FIXTURE BUILDERS
	seedBusiness(currency = 'USD', balanceCents = 0): { businessId: string; walletId: string } {
		const businessId = this.id('biz');
		this.s.businesses.add(businessId);
		const walletId = this.id('wal');
		this.s.wallets.push({
			owner_type: 'business',
			owner_id: businessId,
			currency,
			balance_cents: balanceCents,
		});
		return { businessId, walletId };
	}

	seedWallet(ownerType: string, ownerId: string, currency = 'USD', balanceCents = 0): void {
		this.s.wallets.push({
			owner_type: ownerType,
			owner_id: ownerId,
			currency,
			balance_cents: balanceCents,
		});
	}

	seedSpendingLimit(
		businessId: string,
		memberUserId: string,
		capCents: number,
		currency = 'USD',
	): void {
		const wallet = this.wallet('business', businessId, currency);
		if (!wallet) throw new Error('seedSpendingLimit: business wallet missing');
		this.s.spendingLimits.push({
			wallet_id: `${wallet.owner_type}:${wallet.owner_id}:${wallet.currency}`,
			member_user_id: memberUserId,
			cap_cents: capCents,
			spent_cents: 0,
		});
	}

	seedContribution(teamId: string, memberUserId: string, percentBp: number): void {
		this.s.contributionAgreements.push({
			team_id: teamId,
			member_user_id: memberUserId,
			percent_bp: percentBp,
		});
	}

	seedProject(businessId: string | null, currency = 'USD'): string {
		const id = this.id('proj');
		this.s.projects.push({ id, client_business_id: businessId, currency });
		return id;
	}

	seedStage(
		projectId: string,
		status: StageStatus = 'assigned',
		unitPriceCents: number | null = null,
		name = 'Stage',
	): string {
		const id = this.id('stg');
		this.s.stages.push({
			id,
			project_id: projectId,
			status,
			name,
			unit_price_cents: unitPriceCents,
		});
		return id;
	}

	seedTicket(
		projectId: string,
		stageId: string,
		assigneeId: string | null,
		unitPriceCents: number | null,
		opts: { paymentStatus?: PaymentStatus; status?: string } = {},
	): string {
		const id = this.id('tkt');
		this.s.tickets.push({
			id,
			project_id: projectId,
			current_stage_id: stageId,
			current_assignee_id: assigneeId,
			unit_price_cents: unitPriceCents,
			payment_status: opts.paymentStatus ?? 'unpaid',
			status: opts.status ?? 'in_progress',
			total_amount_paid: 0,
		});
		return id;
	}

	seedStageAssignment(
		stageId: string,
		type: AssignmentType,
		id: string,
		status = 'accepted',
	): void {
		this.s.stageAssignments.push({
			project_stage_id: stageId,
			assignee_type: type,
			team_id: type === 'team' ? id : null,
			freelancer_profile_id: type === 'freelancer' ? id : null,
			status,
		});
	}
	// #endregion

	// #region US-004 STAGE STAFFING & ASSIGNMENT — projects.* staffing RPCs (0307)
	/** A project owned by `ownerId` (owner_user_id set), for the staffing fixtures. */
	seedOwnedProject(ownerId: string, currency = 'USD'): string {
		const id = this.id('proj');
		this.s.projects.push({
			id,
			client_business_id: null,
			currency,
			owner_user_id: ownerId,
			status: 'active',
		});
		return id;
	}

	/** Sets a stage's scheduled [start, end) window (ms epoch) for the AC6 overlap check. */
	setStageWindow(stageId: string, startMs: number | null, endMs: number | null): void {
		const stage = this.stage(stageId);
		if (!stage) throw new SqlError('Stage not found');
		stage.fixed_start_date = startMs;
		stage.file_due_date = endMs;
	}

	/** Adds a team member with an explicit role (owner/lead/admin/member). */
	seedTeamMember(teamId: string, userId: string, role = 'member', status = 'active'): void {
		this.s.teamMembers.push({ org_id: teamId, user_id: userId, role, status });
	}

	// -- guards (mirror the SQL helpers) --------------------------------------------------------
	/** projects.can_review_project: owner or an active member of the paying business. */
	private canReviewProject(actor: string | null, projectId: string): boolean {
		if (!actor) return false;
		const p = this.s.projects.find((pr) => pr.id === projectId);
		if (!p) return false;
		if (p.owner_user_id === actor) return true;
		return !!p.client_business_id &&
			this.s.businessMembers.some((m) =>
				m.org_id === p.client_business_id && m.user_id === actor && m.status === 'active'
			);
	}

	/** org.is_team_lead: team owner or an active member holding an authority role. */
	isTeamLead(teamId: string, actor: string | null): boolean {
		if (!actor) return false;
		if (this.s.orgTeams.some((t) => t.id === teamId && t.owner_user_id === actor)) return true;
		return this.s.teamMembers.some((m) =>
			m.org_id === teamId && m.user_id === actor && m.status === 'active' &&
			['owner', 'lead', 'admin'].includes(m.role)
		);
	}

	/** projects.has_stage_access: paying side OR live assignee (freelancer or team member) of the stage. */
	hasStageAccess(actor: string | null, stageId: string): boolean {
		if (!actor) return false;
		const stage = this.stage(stageId);
		if (!stage) return false;
		if (this.canReviewProject(actor, stage.project_id)) return true;

		const live = (a: StageAssignment) => !['released', 'cancelled', 'declined'].includes(a.status);
		const flAssigned = this.s.stageAssignments.some((a) =>
			a.project_stage_id === stageId && a.assignee_type === 'freelancer' &&
			a.freelancer_profile_id === actor && live(a)
		);
		if (flAssigned) return true;

		return this.s.stageAssignments.some((a) =>
			a.project_stage_id === stageId && a.assignee_type === 'team' && live(a) &&
			this.s.teamMembers.some((m) =>
				m.org_id === a.team_id && m.user_id === actor && m.status === 'active'
			)
		);
	}

	/** Half-open [start,end) overlap; null bounds are -inf / +inf. */
	private windowsOverlap(a: Stage, b: Stage): boolean {
		const aS = a.fixed_start_date ?? -Infinity, aE = a.file_due_date ?? Infinity;
		const bS = b.fixed_start_date ?? -Infinity, bE = b.file_due_date ?? Infinity;
		return aS < bE && bS < aE;
	}

	/** projects.fn_assignee_slot_conflict: a live assignment on another overlapping stage. */
	private assigneeSlotConflict(stageId: string, type: AssignmentType, profileId: string): boolean {
		const stage = this.stage(stageId)!;
		const live = (a: StageAssignment) =>
			!['released', 'cancelled', 'declined', 'completed'].includes(a.status);
		return this.s.stageAssignments.some((a) => {
			if (a.project_stage_id === stageId || !live(a) || a.assignee_type !== type) return false;
			const same = type === 'freelancer'
				? a.freelancer_profile_id === profileId
				: a.team_id === profileId;
			if (!same) return false;
			const other = this.stage(a.project_stage_id);
			return !!other && this.windowsOverlap(stage, other);
		});
	}

	// -- RPCs -----------------------------------------------------------------------------------
	/** projects.create_stage_open_seat (AC1): owner defines a seat + required skills. */
	createOpenSeat(
		actor: string | null,
		stageId: string,
		opts: {
			description?: string;
			budgetMinCents?: number | null;
			budgetMaxCents?: number | null;
			requireProposals?: boolean;
			skillIds?: string[];
		} = {},
	): string {
		const stage = this.stage(stageId);
		if (!stage) throw new SqlError('Stage not found.', 'P0002');
		if (!this.canReviewProject(actor, stage.project_id)) {
			throw new SqlError('Only the project owner may define open seats.', '42501');
		}
		const min = opts.budgetMinCents ?? null, max = opts.budgetMaxCents ?? null;
		if (min != null && max != null && min > max) {
			throw new SqlError('Seat budget minimum cannot exceed the maximum.', '23514');
		}
		const id = this.id('seat');
		this.s.openSeats.push({
			id,
			project_stage_id: stageId,
			description_of_need: opts.description?.trim() || 'Open seat',
			budget_min_cents: min,
			budget_max_cents: max,
			require_proposals: opts.requireProposals ?? true,
			status: 'open',
			filled_assignment_id: null,
			skill_ids: [...(opts.skillIds ?? [])],
		});
		return id;
	}

	/** projects.apply_to_seat (AC2/AC3): a freelancer or lead-gated team applies. */
	applyToSeat(
		actor: string | null,
		seatId: string,
		input: { type: AssignmentType; profileId: string; message?: string | null },
	): string {
		if (!actor) throw new SqlError('Authentication required to apply.', '42501');
		const seat = this.s.openSeats.find((s) => s.id === seatId);
		if (!seat) throw new SqlError('Open seat not found.', 'P0002');
		if (seat.status !== 'open') {
			throw new SqlError('This seat is no longer open for applications.', '23514');
		}
		const stage = this.stage(seat.project_stage_id)!;

		// AC3 — a team application requires team-lead authority; a freelancer applies as themselves.
		if (input.type === 'team') {
			if (!this.isTeamLead(input.profileId, actor)) {
				throw new SqlError('Only a team lead may apply on behalf of the team.', '42501');
			}
		} else if (input.profileId !== actor) {
			throw new SqlError('You may only apply as yourself.', '42501');
		}

		const dup = this.s.seatApplications.some((a) =>
			a.seat_id === seatId && a.applicant_type === input.type &&
			a.applicant_profile_id === input.profileId && a.status === 'pending'
		);
		if (dup) throw new SqlError('You already have a pending application for this seat.', '23505');

		const id = this.id('app');
		this.s.seatApplications.push({
			id,
			project_id: stage.project_id,
			seat_id: seatId,
			applicant_user_id: actor,
			applicant_type: input.type,
			applicant_profile_id: input.profileId,
			message: input.message?.trim() || null,
			status: 'pending',
		});
		return id;
	}

	/** projects.assign_from_application (AC4/AC5/AC6): atomic accept → conflict-guarded assignment. */
	assignFromApplication(actor: string | null, applicationId: string): string {
		const app = this.s.seatApplications.find((a) => a.id === applicationId);
		if (!app) throw new SqlError('Seat application not found.', 'P0002');
		if (!this.canReviewProject(actor, app.project_id)) {
			throw new SqlError('Only the project owner may accept applications.', '42501');
		}
		const seat = this.s.openSeats.find((s) => s.id === app.seat_id)!;
		const stageId = seat.project_stage_id;
		const profileId = app.applicant_profile_id;
		const type = app.applicant_type;
		const live = (a: StageAssignment) =>
			!['released', 'cancelled', 'declined', 'completed'].includes(a.status);

		// AC6 — same-stage duplicate.
		const dupStage = this.s.stageAssignments.some((a) =>
			a.project_stage_id === stageId && a.assignee_type === type &&
			(type === 'freelancer' ? a.freelancer_profile_id : a.team_id) === profileId && live(a)
		);
		if (dupStage) throw new SqlError('This candidate is already assigned to the stage.', '23505');

		// AC6 — overlapping active slot on another stage.
		if (this.assigneeSlotConflict(stageId, type, profileId)) {
			throw new SqlError(
				'This candidate is already booked on an overlapping active stage.',
				'23P01',
			);
		}

		const assignmentId = this.id('assign');
		this.s.stageAssignments.push({
			project_stage_id: stageId,
			assignee_type: type,
			team_id: type === 'team' ? profileId : null,
			freelancer_profile_id: type === 'freelancer' ? profileId : null,
			status: 'assigned',
		});

		app.status = 'accepted';
		// Auto-reject the other pending applicants for the now-filled seat.
		for (const other of this.s.seatApplications) {
			if (other.seat_id === seat.id && other.id !== app.id && other.status === 'pending') {
				other.status = 'rejected';
			}
		}
		seat.status = 'filled';
		seat.filled_assignment_id = assignmentId;

		// AC5 — an open stage moves to "assigned" on its first fill.
		const stage = this.stage(stageId)!;
		if (stage.status === 'open') stage.status = 'assigned';

		return assignmentId;
	}

	// -- read helpers ---------------------------------------------------------------------------
	openSeat(id: string): OpenSeat | undefined {
		return this.s.openSeats.find((s) => s.id === id);
	}
	seatsForStage(stageId: string): OpenSeat[] {
		return this.s.openSeats.filter((s) => s.project_stage_id === stageId);
	}
	seatApplication(id: string): SeatApplication | undefined {
		return this.s.seatApplications.find((a) => a.id === id);
	}
	applicationsForSeat(seatId: string): SeatApplication[] {
		return this.s.seatApplications.filter((a) => a.seat_id === seatId);
	}
	assignmentsForStage(stageId: string): StageAssignment[] {
		return this.s.stageAssignments.filter((a) => a.project_stage_id === stageId);
	}
	// #endregion

	// #region ONBOARDING — public.handle_new_user (mig 0304, SECURITY DEFINER trigger)
	handleNewUser(meta: NewUserMeta): void {
		const objective = meta.objective;
		const isFreelancer = objective === 'freelancer' || objective === 'seller';

		this.s.usersPublic.push({
			user_id: meta.id,
			is_freelancer: isFreelancer,
			total_project_count: 0,
			active_project_count: 0,
		});
		this.s.userEmails.push({ user_id: meta.id, email: meta.email });

		let activeType: string | null = null;
		let activeId: string | null = null;
		if (isFreelancer) {
			this.s.freelancerProfiles.push({ user_id: meta.id, skills: meta.skills ?? [] });
			// freelancer_profiles are keyed by user_id → active profile id == user id.
			activeType = 'freelancer';
			activeId = meta.id;
		}

		// AC4 — idempotent session_context upsert (ON CONFLICT (user_id) DO UPDATE).
		this.s.sessionContext.set(meta.id, {
			user_id: meta.id,
			active_profile_type: activeType,
			active_profile_id: activeId,
			active_team_id: null,
		});

		// AC6 — immutable onboarding audit entry, written from the definer context.
		this.insertAuditLogAsDefiner({
			user_id: meta.id,
			action: 'user.onboarded',
			entity_table: 'org.users_public',
			entity_id: meta.id,
			metadata: {
				objective: objective ?? null,
				is_freelancer: isFreelancer,
				username: meta.username ?? null,
				active_profile_type: activeType,
			},
			actor_profile_id: activeId,
		});
	}

	/** SECURITY DEFINER write path (the trigger). Always permitted. */
	private insertAuditLogAsDefiner(row: AuditLog): void {
		this.s.auditLogs.push(row);
	}

	/**
	 * App-layer (`authenticated` role) write path. security.audit_logs is NOT granted to
	 * `authenticated` (0205), so this is rejected — the reason the write lives in the trigger.
	 */
	insertAuditLogAsAuthenticated(_row: AuditLog): never {
		throw new SqlError('permission denied for table audit_logs', '42501');
	}
	// #endregion

	// #region NOTIFICATIONS — comms.fn_notify (mig 0305)
	fnNotify(
		userId: string | null,
		type: string,
		title: string,
		body: string,
		entityTable: string | null = null,
		entityId: string | null = null,
	): string | null {
		if (userId === null) return null;
		const id = this.id('ntf');
		this.s.notifications.push({
			id,
			user_id: userId,
			type,
			title,
			body,
			entity_table: entityTable,
			entity_id: entityId,
		});
		return id;
	}
	// #endregion

	// #region FINANCE ENGINE — finance.fn_* (mig 0009)
	private feeBp(): number {
		return parseInt(this.s.platformParams.get('platform_fee_bp') ?? '0', 10);
	}

	private walletKey(w: Wallet): string {
		return `${w.owner_type}:${w.owner_id}:${w.currency}`;
	}

	private walletCredit(
		ownerId: string,
		ownerType: string,
		currency: string,
		amount: number,
		reason: string,
		refId: string | null,
	): void {
		if (amount == null || amount <= 0) return;
		const w = this.wallet(ownerType, ownerId, currency);
		if (!w) return;
		w.balance_cents += amount;
		this.s.transactions.push({
			wallet_id: this.walletKey(w),
			direction: 'credit',
			amount_cents: amount,
			currency,
			reason,
			ref_table: 'escrows',
			ref_id: refId,
			balance_after_cents: w.balance_cents,
		});
	}

	private walletDebit(
		ownerId: string,
		ownerType: string,
		currency: string,
		amount: number,
		reason: string,
		refId: string | null,
	): void {
		if (amount == null || amount <= 0) return;
		const w = this.wallet(ownerType, ownerId, currency);
		if (!w) return;
		// balance_cents CHECK (>= 0): a debit below zero is rejected, mirroring the column constraint.
		if (w.balance_cents - amount < 0) {
			throw new SqlError(
				'new row for relation "wallets" violates check constraint (balance_cents >= 0)',
				'23514',
			);
		}
		w.balance_cents -= amount;
		this.s.transactions.push({
			wallet_id: this.walletKey(w),
			direction: 'debit',
			amount_cents: amount,
			currency,
			reason,
			ref_table: 'escrows',
			ref_id: refId,
			balance_after_cents: w.balance_cents,
		});
	}

	/** finance.fn_check_spending_limit — enforce a member cap, increment spent when allowed. */
	fnCheckSpendingLimit(
		businessId: string,
		currency: string,
		member: string | null,
		amount: number,
	): boolean {
		if (member === null) return true;
		const w = this.wallet('business', businessId, currency);
		if (!w) return true;
		const key = this.walletKey(w);
		const lim = this.s.spendingLimits.find((l) =>
			l.wallet_id === key && l.member_user_id === member
		);
		if (!lim) return true;
		if (lim.spent_cents + amount > lim.cap_cents) return false;
		lim.spent_cents += amount;
		return true;
	}

	/** finance.fn_split_team_payout — distribute across the contribution agreement (else team wallet). */
	fnSplitTeamPayout(escrowId: string, teamId: string, payout: number, currency: string): void {
		const members = this.s.contributionAgreements.filter((c) => c.team_id === teamId);
		if (members.length > 0) {
			for (const m of members) {
				const share = Math.trunc((payout * m.percent_bp) / 10000);
				this.s.payoutSplits.push({
					escrow_id: escrowId,
					member_user_id: m.member_user_id,
					amount_cents: share,
					currency,
				});
				this.walletCredit(m.member_user_id, 'user', currency, share, 'team_split', escrowId);
			}
		} else {
			this.walletCredit(teamId, 'team', currency, payout, 'escrow_release', escrowId);
		}
	}

	/** finance.fn_hold_ticket_escrow — hold funds for a ticket. Returns escrow id, or null when skipped. */
	fnHoldTicketEscrow(ticketId: string): string | null {
		const t = this.ticket(ticketId);
		if (!t) return null;
		const project = this.s.projects.find((p) => p.id === t.project_id);
		const stage = t.current_stage_id ? this.stage(t.current_stage_id) : undefined;
		const amount = t.unit_price_cents ?? stage?.unit_price_cents ?? null;
		const payer = project?.client_business_id ?? null;
		const currency = project?.currency ?? 'USD';

		// Prefer an accepted team assignment on the ticket's stage (payout splits at release).
		const teamAssign = this.s.stageAssignments.find(
			(a) =>
				a.project_stage_id === t.current_stage_id && a.assignee_type === 'team' &&
				a.status === 'accepted' && a.team_id,
		);
		let payeeType: AssignmentType;
		let payeeId: string | null;
		if (teamAssign?.team_id) {
			payeeType = 'team';
			payeeId = teamAssign.team_id;
		} else {
			payeeType = 'freelancer';
			payeeId = t.current_assignee_id;
		}

		if (
			payer === null || t.current_stage_id === null || payeeId === null || amount === null ||
			amount <= 0
		) {
			return null;
		}
		if (this.s.escrows.some((e) => e.ticket_id === ticketId && e.status === 'held')) return null;

		if (!this.fnCheckSpendingLimit(payer, currency, this.authUid, amount)) {
			throw new SqlError('Spending cap exceeded for this member on the business wallet.');
		}

		const escrowId = this.id('esc');
		this.s.escrows.push({
			id: escrowId,
			project_stage_id: t.current_stage_id,
			ticket_id: ticketId,
			payer_business_id: payer,
			payee_type: payeeType,
			payee_id: payeeId,
			amount_cents: amount,
			platform_fee_cents: 0,
			deadline_bonus_cents: 0,
			currency,
			status: 'held',
		});
		this.walletDebit(payer, 'business', currency, amount, 'escrow_hold', escrowId);
		t.payment_status = 'escrow_funded';
		return escrowId;
	}

	/** finance.fn_release_ticket_escrow — release held escrow (5% fee, team splits, ticket update). */
	fnReleaseTicketEscrow(ticketId: string): void {
		const feeBp = this.feeBp();
		const t = this.ticket(ticketId);
		for (const r of this.s.escrows.filter((e) => e.ticket_id === ticketId && e.status === 'held')) {
			const fee = Math.trunc((r.amount_cents * feeBp) / 10000);
			let payout = r.amount_cents + r.deadline_bonus_cents - fee;
			if (payout < 0) payout = 0;
			r.status = 'released';
			r.platform_fee_cents = fee;
			if (r.payee_type === 'team') {
				this.fnSplitTeamPayout(r.id, r.payee_id, payout, r.currency);
			} else {
				this.walletCredit(r.payee_id, 'freelancer', r.currency, payout, 'escrow_release', r.id);
			}
			if (t) {
				t.total_amount_paid += payout;
				t.payment_status = t.status === 'completed' ? 'released' : 'partially_released';
			}
		}
	}

	/** finance.fn_fair_exit_release — pay p_bp% of principal (net fee), refund remainder to client. */
	fnFairExitRelease(ticketId: string, bp: number): void {
		const feeBp = this.feeBp();
		const t = this.ticket(ticketId);
		for (const r of this.s.escrows.filter((e) => e.ticket_id === ticketId && e.status === 'held')) {
			const share = Math.trunc((r.amount_cents * bp) / 10000);
			const fee = Math.trunc((share * feeBp) / 10000);
			let payout = share - fee;
			if (payout < 0) payout = 0;
			let refund = r.amount_cents - share;
			if (refund < 0) refund = 0;
			r.status = 'released';
			r.platform_fee_cents = fee;
			if (r.payee_type === 'team') {
				this.fnSplitTeamPayout(r.id, r.payee_id, payout, r.currency);
			} else {
				this.walletCredit(r.payee_id, 'freelancer', r.currency, payout, 'fair_exit_release', r.id);
			}
			this.walletCredit(
				r.payer_business_id,
				'business',
				r.currency,
				refund,
				'fair_exit_refund',
				r.id,
			);
			if (t) {
				t.total_amount_paid += payout;
				t.payment_status = 'partially_released';
			}
		}
	}
	// #endregion

	// #region STAGE WRAPPERS — projects.* (mig 0305, has_project_access-guarded)
	fundStage(
		stageId: string,
	): { funded_count: number; total_held_cents: number; currency: string; stage_status: string } {
		const stage = this.stage(stageId);
		if (!stage) throw new SqlError('Stage not found for this project.');
		const project = this.s.projects.find((p) => p.id === stage.project_id);
		const currency = project?.currency ?? 'USD';

		// AC1: only an assigned stage may be funded.
		if (stage.status !== 'assigned') {
			throw new SqlError(
				`Stage must be in the assigned state to fund escrow (current: ${stage.status}).`,
			);
		}

		let funded = 0;
		for (
			const t of this.s.tickets.filter(
				(tk) =>
					tk.current_stage_id === stageId && tk.current_assignee_id !== null &&
					tk.payment_status === 'unpaid',
			)
		) {
			const escrowId = this.fnHoldTicketEscrow(t.id);
			if (escrowId !== null) funded += 1;
		}
		if (funded === 0) {
			throw new SqlError('No assigned, unfunded tickets available to fund in this stage.');
		}

		const total = this.escrowsForStage(stageId)
			.filter((e) => e.status === 'held')
			.reduce((sum, e) => sum + e.amount_cents, 0);

		// AC4: assigned -> in_progress ("active").
		stage.status = 'in_progress';

		// AC5: notify each distinct assignee.
		for (const uid of this.distinctAssignees(stageId)) {
			this.fnNotify(
				uid,
				'stage_funded',
				'Stage funded',
				`Escrow for "${stage.name}" is secured — work can begin.`,
				'project_stages',
				stageId,
			);
		}

		return { funded_count: funded, total_held_cents: total, currency, stage_status: 'in_progress' };
	}

	approveStage(stageId: string): {
		released_count: number;
		total_paid_cents: number;
		fee_cents: number;
		splits: PayoutSplit[];
		stage_status: string;
	} {
		const stage = this.stage(stageId);
		if (!stage) throw new SqlError('Stage not found for this project.');

		const heldTicketIds = [
			...new Set(
				this.escrowsForStage(stageId).filter((e) => e.status === 'held' && e.ticket_id).map((e) =>
					e.ticket_id as string
				),
			),
		];
		let released = 0;
		for (const ticketId of heldTicketIds) {
			this.fnReleaseTicketEscrow(ticketId);
			released += 1;
		}
		if (released === 0) throw new SqlError('No funded (held) escrow to release for this stage.');

		const releasedEscrows = this.escrowsForStage(stageId).filter((e) => e.status === 'released');
		const paid = releasedEscrows.reduce(
			(s, e) => s + e.amount_cents + e.deadline_bonus_cents - e.platform_fee_cents,
			0,
		);
		const fee = releasedEscrows.reduce((s, e) => s + e.platform_fee_cents, 0);
		const splits = this.s.payoutSplits.filter((p) =>
			releasedEscrows.some((e) => e.id === p.escrow_id)
		);

		stage.status = 'paid';
		for (const uid of this.distinctAssignees(stageId)) {
			this.fnNotify(
				uid,
				'stage_approved',
				'Stage approved & paid',
				`"${stage.name}" was approved — your payout has been released.`,
				'project_stages',
				stageId,
			);
		}
		return {
			released_count: released,
			total_paid_cents: paid,
			fee_cents: fee,
			splits,
			stage_status: 'paid',
		};
	}

	cancelStageFairExit(stageId: string, tier: number): {
		tier: number;
		cancelled_count: number;
		freelancer_paid_cents: number;
		client_refunded_cents: number;
		stage_status: string;
	} {
		const stage = this.stage(stageId);
		if (!stage) throw new SqlError('Stage not found for this project.');
		if (![25, 50, 75].includes(tier)) {
			throw new SqlError(`Fair-exit tier must be 25, 50, or 75 (got ${tier}).`);
		}
		const bp = tier * 100;

		const heldTicketIds = [
			...new Set(
				this.escrowsForStage(stageId).filter((e) => e.status === 'held' && e.ticket_id).map((e) =>
					e.ticket_id as string
				),
			),
		];
		let cnt = 0;
		for (const ticketId of heldTicketIds) {
			this.fnFairExitRelease(ticketId, bp);
			cnt += 1;
		}
		if (cnt === 0) throw new SqlError('No funded (held) escrow to cancel for this stage.');

		const stageEscrowIds = new Set(this.escrowsForStage(stageId).map((e) => e.id));
		const paid = this.s.transactions
			.filter((tx) =>
				tx.ref_table === 'escrows' && tx.ref_id && stageEscrowIds.has(tx.ref_id) &&
				(tx.reason === 'fair_exit_release' || tx.reason === 'team_split')
			)
			.reduce((s, tx) => s + tx.amount_cents, 0);
		const refunded = this.s.transactions
			.filter((tx) =>
				tx.ref_table === 'escrows' && tx.ref_id && stageEscrowIds.has(tx.ref_id) &&
				tx.reason === 'fair_exit_refund'
			)
			.reduce((s, tx) => s + tx.amount_cents, 0);

		stage.status = 'cancelled';
		for (const uid of this.distinctAssignees(stageId)) {
			this.fnNotify(
				uid,
				'stage_cancelled',
				'Stage cancelled (fair exit)',
				`"${stage.name}" was cancelled — you were paid ${tier}% for work delivered.`,
				'project_stages',
				stageId,
			);
		}
		return {
			tier,
			cancelled_count: cnt,
			freelancer_paid_cents: paid,
			client_refunded_cents: refunded,
			stage_status: 'cancelled',
		};
	}

	private distinctAssignees(stageId: string): string[] {
		return [
			...new Set(
				this.s.tickets
					.filter((t) => t.current_stage_id === stageId && t.current_assignee_id !== null)
					.map((t) => t.current_assignee_id as string),
			),
		];
	}
	// #endregion

	// #region ORG-UNIT FORMATION — org.create_business / org.create_team (mig 0110 / 0107)
	/** org.create_business (0110): profile + owner membership + Business Wallet + context + audit. */
	createBusiness(
		userId: string | null,
		opts: { slug: string; name?: string; currency?: string },
	): string {
		if (!userId) throw new SqlError('Not authenticated');
		if (this.s.businessProfiles.some((b) => b.slug === opts.slug)) {
			throw new SqlError('Business handle already taken', '23505');
		}
		const currency = opts.currency ?? 'USD';
		const businessId = this.id('biz');
		this.s.businessProfiles.push({
			id: businessId,
			slug: opts.slug,
			owner_user_id: userId,
			default_currency: currency,
			total_project_count: 0,
			active_project_count: 0,
		});
		this.s.businesses.add(businessId);
		this.s.businessMembers.push({
			org_id: businessId,
			user_id: userId,
			role: 'owner',
			status: 'active',
		});

		// AC5 — initialise the Business Wallet.
		this.s.wallets.push({
			owner_type: 'business',
			owner_id: businessId,
			currency,
			balance_cents: 0,
		});

		// The definer function switches the caller into the new business context.
		this.s.sessionContext.set(userId, {
			user_id: userId,
			active_profile_type: 'business',
			active_profile_id: businessId,
			active_team_id: null,
		});

		// AC6 — audit (definer path; authenticated cannot write audit_logs).
		this.insertAuditLogAsDefiner({
			user_id: userId,
			action: 'business.created',
			entity_table: 'org.business_profiles',
			entity_id: businessId,
			metadata: { slug: opts.slug, name: opts.name ?? null, default_currency: currency },
			actor_profile_id: businessId,
		});
		return businessId;
	}

	/** org.create_team (0107): team + owner membership + Team Vault (treasury_wallet_id) + audit. */
	createTeam(
		userId: string | null,
		opts: { slug: string; name?: string; currency?: string },
	): { teamId: string; walletId: string } {
		if (!userId) throw new SqlError('Not authenticated');
		if (this.s.orgTeams.some((t) => t.slug === opts.slug)) {
			throw new SqlError('Team handle already exists', '23505');
		}
		const currency = opts.currency ?? 'USD';
		const teamId = this.id('team');
		const team: OrgTeam = {
			id: teamId,
			slug: opts.slug,
			owner_user_id: userId,
			currency,
			treasury_wallet_id: null,
		};
		this.s.orgTeams.push(team);
		this.s.teamMembers.push({ org_id: teamId, user_id: userId, role: 'owner', status: 'active' });

		// AC5 — initialise the Team Vault and link it as the treasury.
		const walletId = this.id('wal');
		this.s.wallets.push({ owner_type: 'team', owner_id: teamId, currency, balance_cents: 0 });
		team.treasury_wallet_id = walletId;

		// AC6 — audit (definer path).
		this.insertAuditLogAsDefiner({
			user_id: userId,
			action: 'team.created',
			entity_table: 'org.teams',
			entity_id: teamId,
			metadata: { slug: opts.slug, name: opts.name ?? null, currency },
			actor_profile_id: null,
			actor_team_id: teamId,
		});
		return { teamId, walletId };
	}

	/** context.ts switchActiveProfile — ownership-guarded upsert; clears the team context. */
	switchToProfile(userId: string, profileId: string, type: 'freelancer' | 'business'): void {
		const owns = type === 'business'
			? this.s.businessMembers.some((m) =>
				m.org_id === profileId && m.user_id === userId && m.status === 'active'
			)
			: this.s.freelancerProfiles.some((f) => f.user_id === userId && userId === profileId);
		if (!owns) throw new SqlError('You do not own this profile.', '42501');
		this.s.sessionContext.set(userId, {
			user_id: userId,
			active_profile_type: type,
			active_profile_id: profileId,
			active_team_id: null,
		});
	}

	/** context.ts switchActiveTeam — membership-guarded upsert; clears the profile context. */
	switchToTeam(userId: string, teamId: string): void {
		const member = this.s.teamMembers.some((m) =>
			m.org_id === teamId && m.user_id === userId && m.status === 'active'
		);
		if (!member) throw new SqlError('You are not an active member of this team.', '42501');
		this.s.sessionContext.set(userId, {
			user_id: userId,
			active_profile_type: null,
			active_profile_id: null,
			active_team_id: teamId,
		});
	}
	// #endregion

	// #region MODULAR PROJECT CREATION — projects.create_project (mig 0101) + counts trigger (0114)
	createProject(
		userId: string | null,
		opts: {
			businessId?: string | null;
			timeline_preset?: string;
			ip_ownership_mode?: string;
			status?: string;
			currency?: string;
			stages?: {
				id?: string;
				name: string;
				sort_order?: number;
				ip_ownership_override?: string | null;
				ip_mode?: string;
				start_trigger_type?: string;
				start_dependency_stage_id?: string | null;
			}[];
		} = {},
	): string {
		if (!userId) throw new SqlError('Not authenticated');
		const businessId = opts.businessId ?? null;
		if (businessId !== null) {
			const member = this.s.businessMembers.some((m) =>
				m.org_id === businessId && m.user_id === userId && m.status === 'active'
			);
			if (!member) throw new SqlError('You are not an active member of this business', '42501');
		}

		const projectId = this.id('proj');
		const project: Project = {
			id: projectId,
			client_business_id: businessId,
			owner_user_id: userId,
			currency: opts.currency ?? 'USD',
			timeline_preset: opts.timeline_preset ?? 'sequential',
			ip_ownership_mode: opts.ip_ownership_mode ?? 'exclusive_transfer',
			status: opts.status ?? 'draft',
		};
		this.s.projects.push(project);

		let order = 0;
		for (const st of opts.stages ?? []) {
			const override = st.ip_ownership_override ?? null;
			this.s.stages.push({
				id: st.id ?? this.id('stg'),
				project_id: projectId,
				status: 'draft',
				name: st.name,
				unit_price_cents: null,
				sort_order: st.sort_order ?? order,
				// AC4: per-stage IP override, null = inherit the project's global mode.
				ip_ownership_override: override,
				ip_mode: st.ip_mode ?? override ?? 'exclusive_transfer',
				// AC5: sequencing.
				start_trigger_type: st.start_trigger_type ?? 'on_project_start',
				start_dependency_stage_id: st.start_dependency_stage_id ?? null,
			});
			order += 1;
		}

		// The AFTER-INSERT counts trigger (0114) fires — it is no longer suppressed (0101).
		this.updateEntityProjectCounts(project);
		return projectId;
	}

	/**
	 * projects.update_entity_project_counts (0114). Owner is a business (client_business_id) or an
	 * individual (owner_user_id) — there is NO project-level team_id to dereference. Modelled here to
	 * lock in the fix and prove the trigger runs on user-owned projects without erroring.
	 */
	private updateEntityProjectCounts(row: Project): void {
		if (row.client_business_id != null) {
			const biz = this.s.businessProfiles.find((b) => b.id === row.client_business_id);
			if (biz) {
				biz.total_project_count = this.s.projects.filter((p) =>
					p.client_business_id === row.client_business_id
				).length;
				biz.active_project_count = this.s.projects.filter((p) =>
					p.client_business_id === row.client_business_id && p.status === 'active'
				).length;
			}
		} else {
			const usr = this.s.usersPublic.find((u) => u.user_id === row.owner_user_id);
			if (usr) {
				usr.total_project_count = this.s.projects.filter((p) =>
					p.client_business_id == null && p.owner_user_id === row.owner_user_id
				).length;
				usr.active_project_count = this.s.projects.filter((p) =>
					p.client_business_id == null && p.owner_user_id === row.owner_user_id &&
					p.status === 'active'
				).length;
			}
		}
	}

	stagesForProject(projectId: string): Stage[] {
		return this.s.stages.filter((s) => s.project_id === projectId);
	}
	businessProfile(id: string): BusinessProfile | undefined {
		return this.s.businessProfiles.find((b) => b.id === id);
	}
	orgTeam(id: string): OrgTeam | undefined {
		return this.s.orgTeams.find((t) => t.id === id);
	}
	usersPublicRow(
		userId: string,
	): { user_id: string; total_project_count: number; active_project_count: number } | undefined {
		return this.s.usersPublic.find((u) => u.user_id === userId);
	}
	// #endregion
}
