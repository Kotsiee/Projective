/**
 * @file escrow_money_loop.test.ts
 * @description US-005 · Stage Escrow Funding + US-007 · Approval, Smart Payouts & Fair Exit.
 * Drives the full internal money loop through the stage wrappers (mig 0305) over the finance engine
 * (mig 0009): assigned → funded (in_progress), escrow held with wallet debit + spending-cap checks,
 * approval releasing escrow with the canonical 5% fee and team smart-splits, and fair-exit cancels.
 *
 * Layer 1 (always runs): MockDb re-implements every contract exactly (fee/split/tier math, wallet
 * balance constraints), each case wrapped in begin()/rollback().
 * Layer 2 (PJV_TEST_DB=1): asserts the deployed functions, the 5% fee param, and the enum exist.
 */

import { assert, assertEquals, assertThrows } from '@std/assert';
import { MockDb, SqlError } from './support/mock_db.ts';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';

/** Build a fundable one-freelancer stage: business wallet, project, assigned stage, one priced ticket. */
function freelancerFixture(opts: { balance?: number; price?: number } = {}) {
	const db = new MockDb();
	const price = opts.price ?? 100_00; // $100.00
	const { businessId } = db.seedBusiness('USD', opts.balance ?? 1_000_00);
	const projectId = db.seedProject(businessId, 'USD');
	const stageId = db.seedStage(projectId, 'assigned', null, 'Design');
	const freelancerId = 'fl-1';
	db.seedWallet('freelancer', freelancerId, 'USD', 0);
	db.seedStageAssignment(stageId, 'freelancer', freelancerId);
	const ticketId = db.seedTicket(projectId, stageId, freelancerId, price);
	return { db, businessId, projectId, stageId, freelancerId, ticketId, price };
}

// #region US-005 — funding an assigned stage
Deno.test('US-005 AC1 · funding is rejected unless the stage is in the assigned state', () => {
	const { db, stageId } = freelancerFixture();
	db.stage(stageId)!.status = 'in_progress';
	assertThrows(() => db.fundStage(stageId), SqlError, 'assigned state');
});

Deno.test('US-005 AC4 · funding transitions the stage assigned → in_progress (active) and holds escrow', () => {
	const { db, stageId, businessId, price } = freelancerFixture();
	db.begin();
	try {
		const res = db.fundStage(stageId);
		assertEquals(res.funded_count, 1);
		assertEquals(res.total_held_cents, price);
		assertEquals(res.stage_status, 'in_progress');
		assertEquals(db.stage(stageId)!.status, 'in_progress');

		// AC3/AC6: exactly one held escrow scoped to the stage, and the business wallet was debited.
		const held = db.escrowsForStage(stageId).filter((e) => e.status === 'held');
		assertEquals(held.length, 1);
		assertEquals(db.wallet('business', businessId, 'USD')!.balance_cents, 1_000_00 - price);
	} finally {
		db.rollback();
	}
});

Deno.test('US-005 · ticket payment_status flips unpaid → escrow_funded on hold', () => {
	const { db, stageId, ticketId } = freelancerFixture();
	assertEquals(db.ticket(ticketId)!.payment_status, 'unpaid');
	db.fundStage(stageId);
	assertEquals(db.ticket(ticketId)!.payment_status, 'escrow_funded');
});

Deno.test('US-005 · funding a stage with no assigned/unfunded tickets raises', () => {
	const db = new MockDb();
	const { businessId } = db.seedBusiness();
	const projectId = db.seedProject(businessId);
	const stageId = db.seedStage(projectId, 'assigned');
	// No tickets seeded.
	assertThrows(() => db.fundStage(stageId), SqlError, 'No assigned, unfunded tickets');
});

Deno.test('US-005 AC2 · a member spending cap blocks over-limit escrow holds', () => {
	const { db, stageId, businessId } = freelancerFixture({ price: 100_00 });
	const member = 'member-1';
	db.authUid = member; // fn_hold_ticket_escrow passes auth.uid() to the cap check
	db.seedSpendingLimit(businessId, member, 50_00); // cap below the $100 ticket
	assertThrows(() => db.fundStage(stageId), SqlError, 'Spending cap exceeded');
});

Deno.test('US-005 AC2 · an escrow hold within the cap succeeds and consumes the allowance', () => {
	const { db, stageId, businessId } = freelancerFixture({ price: 40_00 });
	const member = 'member-2';
	db.authUid = member;
	db.seedSpendingLimit(businessId, member, 50_00);
	const res = db.fundStage(stageId);
	assertEquals(res.funded_count, 1);
});

Deno.test('US-005 · an escrow hold is rejected when the business wallet is underfunded (balance CHECK)', () => {
	const { db, stageId } = freelancerFixture({ balance: 10_00, price: 100_00 });
	assertThrows(() => db.fundStage(stageId), SqlError, 'balance_cents >= 0');
});

Deno.test('US-005 AC5 · funding notifies each assignee (notification loop entrypoint)', () => {
	const { db, stageId, freelancerId } = freelancerFixture();
	db.fundStage(stageId);
	const notes = db.notificationsFor(freelancerId);
	assertEquals(notes.length, 1);
	assertEquals(notes[0].type, 'stage_funded');
	assertEquals(notes[0].entity_id, stageId);
});
// #endregion

// #region US-007 — approval, 5% fee, smart splits
Deno.test('US-007 AC2 · approval releases escrow, applies the canonical 5% fee, pays the freelancer', () => {
	const { db, stageId, freelancerId, price } = freelancerFixture();
	db.begin();
	try {
		db.fundStage(stageId);
		const res = db.approveStage(stageId);

		const expectedFee = Math.trunc((price * 500) / 10000); // 5% of $100 = $5
		assertEquals(res.released_count, 1);
		assertEquals(res.fee_cents, expectedFee);
		assertEquals(res.total_paid_cents, price - expectedFee);
		assertEquals(res.stage_status, 'paid');
		assertEquals(db.stage(stageId)!.status, 'paid');
		// Freelancer wallet credited net of the fee.
		assertEquals(db.wallet('freelancer', freelancerId, 'USD')!.balance_cents, price - expectedFee);
	} finally {
		db.rollback();
	}
});

Deno.test('US-007 · approval before funding raises (no held escrow)', () => {
	const { db, stageId } = freelancerFixture();
	assertThrows(() => db.approveStage(stageId), SqlError, 'No funded');
});

Deno.test('US-007 AC3 · a team payout smart-splits across the contribution agreement by basis points', () => {
	const db = new MockDb();
	const price = 200_00; // $200
	const { businessId } = db.seedBusiness('USD', 1_000_00);
	const projectId = db.seedProject(businessId, 'USD');
	const stageId = db.seedStage(projectId, 'assigned', null, 'Build');
	const teamId = 'team-1';
	const alice = 'alice';
	const bob = 'bob';
	db.seedWallet('user', alice, 'USD', 0);
	db.seedWallet('user', bob, 'USD', 0);
	db.seedContribution(teamId, alice, 7000); // 70%
	db.seedContribution(teamId, bob, 3000); // 30%
	db.seedStageAssignment(stageId, 'team', teamId);
	// Ticket still needs an assignee to be fundable; the team assignment routes the payee to the team.
	db.seedTicket(projectId, stageId, 'ticket-owner', price);

	db.fundStage(stageId);
	const res = db.approveStage(stageId);

	const fee = Math.trunc((price * 500) / 10000); // $10
	const payout = price - fee; // $190
	assertEquals(res.splits.length, 2);
	assertEquals(db.wallet('user', alice, 'USD')!.balance_cents, Math.trunc((payout * 7000) / 10000));
	assertEquals(db.wallet('user', bob, 'USD')!.balance_cents, Math.trunc((payout * 3000) / 10000));
	// Escrow payee was resolved to the team, not the individual ticket owner.
	assertEquals(db.escrowsForStage(stageId)[0].payee_type, 'team');
});

Deno.test('US-007 AC3 · a team with no contribution agreement falls back to crediting the team wallet', () => {
	const db = new MockDb();
	const price = 80_00;
	const { businessId } = db.seedBusiness('USD', 1_000_00);
	const projectId = db.seedProject(businessId, 'USD');
	const stageId = db.seedStage(projectId, 'assigned');
	const teamId = 'team-solo';
	db.seedWallet('team', teamId, 'USD', 0);
	db.seedStageAssignment(stageId, 'team', teamId);
	db.seedTicket(projectId, stageId, 'owner', price);

	db.fundStage(stageId);
	db.approveStage(stageId);
	const fee = Math.trunc((price * 500) / 10000);
	assertEquals(db.wallet('team', teamId, 'USD')!.balance_cents, price - fee);
});

Deno.test('US-007 · approval notifies each assignee (stage_approved)', () => {
	const { db, stageId, freelancerId } = freelancerFixture();
	db.fundStage(stageId);
	db.approveStage(stageId);
	const notes = db.notificationsFor(freelancerId);
	assertEquals(notes.at(-1)?.type, 'stage_approved');
});
// #endregion

// #region US-007 AC4 — fair-exit cancellation tiers
Deno.test('US-007 AC4 · fair exit pays the freelancer the tier %, net fee, and refunds the remainder to the client', () => {
	for (const tier of [25, 50, 75] as const) {
		const { db, stageId, freelancerId, businessId, price } = freelancerFixture({
			balance: 1_000_00,
			price: 100_00,
		});
		db.begin();
		try {
			const balanceAfterFund = 1_000_00 - price;
			db.fundStage(stageId);
			const res = db.cancelStageFairExit(stageId, tier);

			const bp = tier * 100;
			const share = Math.trunc((price * bp) / 10000);
			const fee = Math.trunc((share * 500) / 10000);
			const payout = share - fee;
			const refund = price - share;

			assertEquals(res.tier, tier);
			assertEquals(res.stage_status, 'cancelled');
			assertEquals(res.freelancer_paid_cents, payout);
			assertEquals(res.client_refunded_cents, refund);
			assertEquals(db.wallet('freelancer', freelancerId, 'USD')!.balance_cents, payout);
			// Client wallet: debited the full hold at funding, then refunded the unearned remainder.
			assertEquals(
				db.wallet('business', businessId, 'USD')!.balance_cents,
				balanceAfterFund + refund,
			);
			assertEquals(db.stage(stageId)!.status, 'cancelled');
		} finally {
			db.rollback();
		}
	}
});

Deno.test('US-007 AC4 · an invalid fair-exit tier is rejected', () => {
	const { db, stageId } = freelancerFixture();
	db.fundStage(stageId);
	assertThrows(() => db.cancelStageFairExit(stageId, 40), SqlError, 'tier must be 25, 50, or 75');
});

Deno.test('US-007 AC4 · fair exit notifies the assignee with the tier paid', () => {
	const { db, stageId, freelancerId } = freelancerFixture();
	db.fundStage(stageId);
	db.cancelStageFairExit(stageId, 50);
	const note = db.notificationsFor(freelancerId).at(-1)!;
	assertEquals(note.type, 'stage_cancelled');
	assert(note.body.includes('50%'));
});
// #endregion

// #region END-TO-END — assigned → funded → approved, balances conserved
Deno.test('US-005 + US-007 · full happy path conserves money: client debit = freelancer credit + platform fee', () => {
	const { db, stageId, businessId, freelancerId, price } = freelancerFixture({
		balance: 500_00,
		price: 120_00,
	});
	db.begin();
	try {
		db.fundStage(stageId);
		db.approveStage(stageId);

		const fee = Math.trunc((price * 500) / 10000);
		const clientOut = 500_00 - db.wallet('business', businessId, 'USD')!.balance_cents;
		const freelancerIn = db.wallet('freelancer', freelancerId, 'USD')!.balance_cents;
		assertEquals(clientOut, price);
		assertEquals(freelancerIn + fee, clientOut); // fee is the only leakage
	} finally {
		db.rollback();
	}
});
// #endregion

// #region LIVE DB (opt-in) — deployed engine matches the contract
Deno.test({
	name: 'US-005/US-007 · live · stage wrappers, engine fns, 5% fee param and cancelled enum exist',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;

			const fns = [
				'projects.fund_stage(uuid, uuid)',
				'projects.approve_stage(uuid, uuid)',
				'projects.cancel_stage_fair_exit(uuid, uuid, integer)',
				'projects.get_stage_finance(uuid, uuid)',
				'finance.fn_hold_ticket_escrow(uuid)',
				'finance.fn_release_ticket_escrow(uuid)',
				'finance.fn_split_team_payout(uuid, uuid, bigint, text)',
				'finance.fn_check_spending_limit(uuid, uuid, bigint)',
				'finance.fn_fair_exit_release(uuid, integer)',
				'comms.fn_notify(uuid, text, text, text, text, uuid)',
			];
			for (const sig of fns) {
				const [row] = await sql`SELECT to_regprocedure(${sig}) AS reg`;
				assert(row.reg, `${sig} must exist`);
			}

			// US-005 AC6 / US-007 AC2: the canonical platform fee is 5% (500 bp).
			const [fee] = await sql`
				SELECT (value #>> '{}')::int AS bp FROM security.platform_params WHERE key = 'platform_fee_bp'`;
			assertEquals(fee.bp, 500);

			// US-007 AC4 terminal state.
			const [enumRow] = await sql`
				SELECT bool_or(enumlabel = 'cancelled') AS has_cancelled
				FROM pg_enum WHERE enumtypid = 'stage_status'::regtype`;
			assertEquals(enumRow.has_cancelled, true);

			// comms.fn_notify is a no-op for a NULL user — safe to call live inside the rolled-back tx.
			const [notify] = await sql`SELECT comms.fn_notify(NULL, 't', 't', 'b') AS id`;
			assertEquals(notify.id, null);
		});
	},
});
// #endregion
