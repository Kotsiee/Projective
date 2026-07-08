/**
 * @file notifications.test.ts
 * @description The notifications pipeline shared by US-005/US-007. The durable-write half is
 * `comms.fn_notify` (mig 0305); the live-push half is the SSE route
 * `apps/web/routes/api/v1/notifications/stream.ts`, which relays each `comms.notifications` INSERT
 * to the browser's `EventSource`. These tests cover the writer contract that feeds that stream.
 */

import { assert, assertEquals } from '@std/assert';
import { MockDb } from './support/mock_db.ts';

// #region comms.fn_notify writer contract
Deno.test('notify · writes a durable row and returns its id', () => {
	const db = new MockDb();
	const id = db.fnNotify(
		'u1',
		'stage_funded',
		'Funded',
		'Escrow secured',
		'project_stages',
		'stg-1',
	);
	assert(id, 'returns the new notification id');
	const rows = db.notificationsFor('u1');
	assertEquals(rows.length, 1);
	assertEquals(rows[0].type, 'stage_funded');
	assertEquals(rows[0].entity_table, 'project_stages');
	assertEquals(rows[0].entity_id, 'stg-1');
});

Deno.test('notify · a NULL recipient is a safe no-op (returns null, writes nothing)', () => {
	const db = new MockDb();
	const id = db.fnNotify(null, 'stage_funded', 'Funded', 'body');
	assertEquals(id, null);
	assertEquals(db.state.notifications.length, 0);
});
// #endregion

// #region pipeline reaches the loop from each money-loop transition
Deno.test('pipeline · funding, approval and fair-exit each enqueue exactly one notification per assignee', () => {
	const db = new MockDb();
	const { businessId } = db.seedBusiness('USD', 1_000_00);
	const projectId = db.seedProject(businessId, 'USD');
	const freelancerId = 'fl-note';
	db.seedWallet('freelancer', freelancerId, 'USD', 0);

	// Funded → approved
	const s1 = db.seedStage(projectId, 'assigned');
	db.seedStageAssignment(s1, 'freelancer', freelancerId);
	db.seedTicket(projectId, s1, freelancerId, 50_00);
	db.fundStage(s1);
	db.approveStage(s1);

	// Funded → fair-exit cancelled (fresh stage/ticket)
	const s2 = db.seedStage(projectId, 'assigned');
	db.seedStageAssignment(s2, 'freelancer', freelancerId);
	db.seedTicket(projectId, s2, freelancerId, 50_00);
	db.fundStage(s2);
	db.cancelStageFairExit(s2, 25);

	const types = db.notificationsFor(freelancerId).map((n) => n.type);
	assertEquals(types, ['stage_funded', 'stage_approved', 'stage_funded', 'stage_cancelled']);
});

Deno.test('pipeline · a stage assignee only receives their own notifications', () => {
	const db = new MockDb();
	const { businessId } = db.seedBusiness('USD', 1_000_00);
	const projectId = db.seedProject(businessId, 'USD');
	const flA = 'fl-a';
	const flB = 'fl-b';
	db.seedWallet('freelancer', flA, 'USD', 0);
	const stageId = db.seedStage(projectId, 'assigned');
	db.seedStageAssignment(stageId, 'freelancer', flA);
	db.seedTicket(projectId, stageId, flA, 30_00);
	db.fundStage(stageId);

	assertEquals(db.notificationsFor(flA).length, 1);
	assertEquals(db.notificationsFor(flB).length, 0);
});
// #endregion
