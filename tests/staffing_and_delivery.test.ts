/**
 * @file staffing_and_delivery.test.ts
 * @description US-004 · Stage Staffing & Assignment and US-006 · Collaboration & Stage Delivery.
 *
 * Layer 1 (always runs): MockDb re-implements the SECURITY DEFINER staffing contracts —
 *   - projects.create_stage_open_seat        (mig 0307)  · AC1
 *   - projects.apply_to_seat                 (mig 0307)  · AC2 / AC3
 *   - projects.assign_from_application        (mig 0307)  · AC4 / AC5 / AC6
 *   - projects.has_stage_access               (mig 0308)  · US-006 AC1
 * Layer 2 (PJV_TEST_DB=1): asserts the deployed schema/functions match (staffing RPCs, seat-skills,
 *   the active-assignee unique index, the 'seat' application target, and the submission version columns
 *   that back US-006 AC3/AC4).
 *
 * Case names map to project_management/USER_STORIES.md acceptance criteria.
 */

import { assert, assertEquals, assertThrows } from '@std/assert';
import { MockDb, SqlError } from './support/mock_db.ts';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';

// #region Fixtures
/** A client-owned, active project with one open stage; returns the owner + ids. */
function seedStaffingProject(
	db: MockDb,
	ownerId = 'owner',
): { owner: string; projectId: string; stageId: string } {
	db.handleNewUser({ id: ownerId, email: `${ownerId}@example.com`, objective: 'client' });
	const projectId = db.seedOwnedProject(ownerId);
	const stageId = db.seedStage(projectId, 'open');
	return { owner: ownerId, projectId, stageId };
}

function seedFreelancer(db: MockDb, id: string): string {
	db.handleNewUser({ id, email: `${id}@example.com`, objective: 'freelancer' });
	return id;
}
// #endregion

// #region US-004 AC1 — open-seat definition + required skills
Deno.test('US-004 AC1 · the client defines an open seat with required skills', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);

	const seatId = db.createOpenSeat(owner, stageId, {
		description: 'Senior motion designer',
		budgetMinCents: 120_000,
		budgetMaxCents: 200_000,
		skillIds: ['skill-motion', 'skill-ae'],
	});

	const seat = db.openSeat(seatId);
	assert(seat, 'the seat must persist');
	assertEquals(seat.status, 'open');
	assertEquals(seat.description_of_need, 'Senior motion designer');
	assertEquals(
		seat.skill_ids,
		['skill-motion', 'skill-ae'],
		'required skills are attached to the seat',
	);
});

Deno.test('US-004 AC1 · only the project owner may define seats', () => {
	const db = new MockDb();
	const { stageId } = seedStaffingProject(db);
	const outsider = seedFreelancer(db, 'outsider');

	assertThrows(() => db.createOpenSeat(outsider, stageId, { description: 'x' }), SqlError, 'owner');
});

Deno.test('US-004 AC1 · a seat budget minimum above its maximum is rejected', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	assertThrows(
		() =>
			db.createOpenSeat(owner, stageId, {
				description: 'x',
				budgetMinCents: 500,
				budgetMaxCents: 100,
			}),
		SqlError,
		'maximum',
	);
});
// #endregion

// #region US-004 AC2 — multi-type applications (freelancer + team)
Deno.test('US-004 AC2 · a freelancer applies to an open seat for their own profile', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });

	const appId = db.applyToSeat(ava, seatId, {
		type: 'freelancer',
		profileId: ava,
		message: 'Keen to help',
	});

	const app = db.seatApplication(appId);
	assert(app);
	assertEquals(app.status, 'pending');
	assertEquals(app.applicant_type, 'freelancer');
	assertEquals(app.applicant_profile_id, ava);
});

Deno.test('US-004 AC2 · a team lead applies on behalf of the team', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const lead = seedFreelancer(db, 'lead');
	const { teamId } = db.createTeam(lead, { slug: 'pixel-guild' }); // lead becomes team owner
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Build squad' });

	const appId = db.applyToSeat(lead, seatId, { type: 'team', profileId: teamId });
	assertEquals(db.seatApplication(appId)?.applicant_type, 'team');
});

Deno.test('US-004 AC2 · a freelancer cannot apply as someone else', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	seedFreelancer(db, 'noah');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });

	assertThrows(
		() => db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: 'noah' }),
		SqlError,
		'yourself',
	);
});

Deno.test('US-004 AC2 · a duplicate pending application to the same seat is rejected', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });

	db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: ava });
	assertThrows(
		() => db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: ava }),
		SqlError,
		'already',
	);
});
// #endregion

// #region US-004 AC3 — team-lead authority to apply
Deno.test('US-004 AC3 · a non-lead team member cannot apply on behalf of the team', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const lead = seedFreelancer(db, 'lead');
	const grunt = seedFreelancer(db, 'grunt');
	const { teamId } = db.createTeam(lead, { slug: 'pixel-guild' });
	db.seedTeamMember(teamId, grunt, 'member'); // ordinary member, not a lead
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Build squad' });

	assertThrows(
		() => db.applyToSeat(grunt, seatId, { type: 'team', profileId: teamId }),
		SqlError,
		'team lead',
	);
});

Deno.test('US-004 AC3 · an admin/lead member does have authority to apply for the team', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const founder = seedFreelancer(db, 'founder');
	const captain = seedFreelancer(db, 'captain');
	const { teamId } = db.createTeam(founder, { slug: 'pixel-guild' });
	db.seedTeamMember(teamId, captain, 'lead');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Build squad' });

	const appId = db.applyToSeat(captain, seatId, { type: 'team', profileId: teamId });
	assertEquals(db.seatApplication(appId)?.status, 'pending');
});
// #endregion

// #region US-004 AC4/AC5 — atomic assignment + status transition
Deno.test('US-004 AC4/AC5 · accepting an application assigns the talent and moves the stage to assigned', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });
	const appId = db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: ava });

	assertEquals(db.stage(stageId)?.status, 'open');
	const assignmentId = db.assignFromApplication(owner, appId);

	assert(assignmentId, 'an assignment id is returned');
	assertEquals(db.seatApplication(appId)?.status, 'accepted');
	assertEquals(db.openSeat(seatId)?.status, 'filled', 'AC4 · the seat is filled');
	assertEquals(db.assignmentsForStage(stageId).length, 1);
	assertEquals(db.stage(stageId)?.status, 'assigned', 'AC5 · open → assigned on first fill');
});

Deno.test('US-004 AC4 · only the owner may accept an application', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });
	const appId = db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: ava });

	assertThrows(() => db.assignFromApplication(ava, appId), SqlError, 'owner');
});

Deno.test('US-004 AC4 · filling a seat auto-rejects the other pending applicants', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const noah = seedFreelancer(db, 'noah');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });
	const avaApp = db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: ava });
	const noahApp = db.applyToSeat(noah, seatId, { type: 'freelancer', profileId: noah });

	db.assignFromApplication(owner, avaApp);
	assertEquals(db.seatApplication(avaApp)?.status, 'accepted');
	assertEquals(
		db.seatApplication(noahApp)?.status,
		'rejected',
		'the losing applicant is auto-rejected',
	);
});
// #endregion

// #region US-004 AC6 — conflict prevention (no double-assign to overlapping slots)
Deno.test('US-004 AC6 · a freelancer cannot be assigned twice to the same stage', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const seat1 = db.createOpenSeat(owner, stageId, { description: 'Seat A' });
	const seat2 = db.createOpenSeat(owner, stageId, { description: 'Seat B' });
	const app1 = db.applyToSeat(ava, seat1, { type: 'freelancer', profileId: ava });
	const app2 = db.applyToSeat(ava, seat2, { type: 'freelancer', profileId: ava });

	db.assignFromApplication(owner, app1);
	assertThrows(() => db.assignFromApplication(owner, app2), SqlError, 'already assigned');
});

Deno.test('US-004 AC6 · a freelancer cannot be booked on two overlapping active stages', () => {
	const db = new MockDb();
	const { owner, projectId, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');

	// Stage A: Jan 1 → Feb 1. Stage B: Jan 15 → Mar 1 (overlaps A).
	const jan1 = Date.UTC(2026, 0, 1), feb1 = Date.UTC(2026, 1, 1);
	const jan15 = Date.UTC(2026, 0, 15), mar1 = Date.UTC(2026, 2, 1);
	db.setStageWindow(stageId, jan1, feb1);
	const stageB = db.seedStage(projectId, 'open');
	db.setStageWindow(stageB, jan15, mar1);

	const seatA = db.createOpenSeat(owner, stageId, { description: 'A' });
	const seatB = db.createOpenSeat(owner, stageB, { description: 'B' });
	db.assignFromApplication(
		owner,
		db.applyToSeat(ava, seatA, { type: 'freelancer', profileId: ava }),
	);

	assertThrows(
		() =>
			db.assignFromApplication(
				owner,
				db.applyToSeat(ava, seatB, { type: 'freelancer', profileId: ava }),
			),
		SqlError,
		'overlapping',
	);
});

Deno.test('US-004 AC6 · non-overlapping stages may share the same freelancer', () => {
	const db = new MockDb();
	const { owner, projectId, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');

	// Stage A: Jan 1 → Feb 1. Stage B: Mar 1 → Apr 1 (no overlap).
	db.setStageWindow(stageId, Date.UTC(2026, 0, 1), Date.UTC(2026, 1, 1));
	const stageB = db.seedStage(projectId, 'open');
	db.setStageWindow(stageB, Date.UTC(2026, 2, 1), Date.UTC(2026, 3, 1));

	const seatA = db.createOpenSeat(owner, stageId, { description: 'A' });
	const seatB = db.createOpenSeat(owner, stageB, { description: 'B' });
	db.assignFromApplication(
		owner,
		db.applyToSeat(ava, seatA, { type: 'freelancer', profileId: ava }),
	);
	const secondAssignment = db.assignFromApplication(
		owner,
		db.applyToSeat(ava, seatB, { type: 'freelancer', profileId: ava }),
	);

	assert(secondAssignment, 'the second, non-overlapping assignment is allowed');
	assertEquals(db.assignmentsForStage(stageB).length, 1);
});
// #endregion

// #region US-006 AC1 — workspace access control (assigned talent + owner only)
Deno.test('US-006 AC1 · the project owner can access the stage workspace', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	assert(db.hasStageAccess(owner, stageId));
});

Deno.test('US-006 AC1 · a freelancer assigned to the stage gains workspace access; an unrelated one does not', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const ava = seedFreelancer(db, 'ava');
	const bystander = seedFreelancer(db, 'bystander');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Designer' });
	db.assignFromApplication(
		owner,
		db.applyToSeat(ava, seatId, { type: 'freelancer', profileId: ava }),
	);

	assert(db.hasStageAccess(ava, stageId), 'the assigned talent can enter the stage room');
	assert(!db.hasStageAccess(bystander, stageId), 'an unassigned freelancer is locked out');
});

Deno.test('US-006 AC1 · an active member of an assigned team gains access; a non-member does not', () => {
	const db = new MockDb();
	const { owner, stageId } = seedStaffingProject(db);
	const lead = seedFreelancer(db, 'lead');
	const member = seedFreelancer(db, 'member');
	const stranger = seedFreelancer(db, 'stranger');
	const { teamId } = db.createTeam(lead, { slug: 'pixel-guild' });
	db.seedTeamMember(teamId, member, 'member');
	const seatId = db.createOpenSeat(owner, stageId, { description: 'Squad' });
	db.assignFromApplication(
		owner,
		db.applyToSeat(lead, seatId, { type: 'team', profileId: teamId }),
	);

	assert(db.hasStageAccess(member, stageId), 'a team member of the assigned team is in');
	assert(!db.hasStageAccess(stranger, stageId), 'a stranger is out');
});
// #endregion

// #region LIVE DB (opt-in) — deployed staffing + delivery schema matches the contracts
Deno.test({
	name:
		'US-004/US-006 · live · staffing RPCs, seat-skills, conflict guard and submission versioning exist',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;

			// The staffing + workspace RPCs are deployed (0307 / 0308).
			for (
				const proc of [
					'projects.create_stage_open_seat(uuid,text,bigint,bigint,boolean,uuid[])',
					'projects.apply_to_seat(uuid,text,uuid,text)',
					'projects.assign_from_application(uuid)',
					'projects.get_stage_staffing(uuid,uuid)',
					'projects.has_stage_access(uuid)',
					'projects.fn_assignee_slot_conflict(uuid,assignment_type,uuid,uuid)',
					'org.is_team_lead(uuid)',
					'projects.submit_deliverable(uuid,uuid,text,jsonb,jsonb,uuid[])',
				]
			) {
				const [row] = await sql`SELECT to_regprocedure(${proc}) AS reg`;
				assert(row.reg, `${proc} must exist`);
			}

			// AC1 — the seat required-skills link table + the seat fill-state column exist.
			const [skillsTbl] = await sql`
				SELECT to_regclass('projects.stage_open_seat_skills') AS reg`;
			assert(skillsTbl.reg, 'projects.stage_open_seat_skills must exist');
			const [seatStatus] = await sql`
				SELECT 1 AS ok FROM information_schema.columns
				WHERE table_schema = 'projects' AND table_name = 'stage_open_seats' AND column_name = 'status'`;
			assert(seatStatus?.ok, 'projects.stage_open_seats.status must exist');

			// AC2 — applications can target a 'seat'.
			const [seatTarget] = await sql`
				SELECT 1 AS ok FROM pg_enum e
				JOIN pg_type t ON t.oid = e.enumtypid
				JOIN pg_namespace n ON n.oid = t.typnamespace
				WHERE n.nspname = 'projects' AND t.typname = 'application_target_type' AND e.enumlabel = 'seat'`;
			assert(seatTarget?.ok, `'seat' must be a projects.application_target_type value`);

			// AC6 — the partial unique index guarding one active assignment per (stage, assignee) exists.
			const [uniq] = await sql`
				SELECT 1 AS ok FROM pg_indexes
				WHERE schemaname = 'projects' AND indexname = 'uq_stage_assignment_active_assignee'`;
			assert(uniq?.ok, 'the active-assignee unique index must exist');

			// US-006 AC4 — submission version columns (sequential number + timestamp) are present.
			for (const col of ['number', 'created_at']) {
				const [c] = await sql`
					SELECT 1 AS ok FROM information_schema.columns
					WHERE table_schema = 'projects' AND table_name = 'stage_submissions' AND column_name = ${col}`;
				assert(c?.ok, `projects.stage_submissions.${col} must exist`);
			}
		});
	},
});
// #endregion
