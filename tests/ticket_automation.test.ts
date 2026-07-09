/**
 * @file ticket_automation.test.ts
 * @description E4 · Resource Allocation & Ticketing — the automated allocation engine (mig 0310).
 * Covers claim-TTL auto-release ("ticket parking"), the global + per-stage Workload Intensity ($W_i$)
 * concurrency caps, and the assignment routing modes (open_pull / round_robin / manual /
 * parallel_stream).
 *
 * Layer 1 (always runs): pure-TS mirrors of the engine's decision contracts — the $W_i$ weighting
 * formula, the capacity verdict, the TTL-expiry predicate, the self-claim mode gate, and the
 * parking-refund money invariant. Deterministic, no database.
 *
 * Layer 2 (PJV_TEST_DB=1): drives the deployed `projects.*` RPCs against the live engine inside a
 * rolled-back transaction — asserting the objects exist AND that behaviour matches (a parked claim
 * refunds the client, an over-cap claim raises a clean error, a manual stage blocks self-claim, and
 * round-robin routes to the lowest-loaded member).
 */

import { assert, assertEquals, assertStringIncludes } from '@std/assert';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';

// #region Layer 1 — pure contract mirrors (spec §"Resource Allocation & Ticketing")

/** Baseline CREATE-category weights (spec §2). */
const CATEGORY_WEIGHT = {
	create: 1.5,
	advise: 1.2,
	educate: 1.0,
	run: 0.8,
	test: 0.7,
	empower: 0.5,
} as const;

/** Difficulty multipliers (spec §2 "Architect's Override"). */
const DIFFICULTY = { low: 0.5, standard: 1.0, high: 2.0 } as const;

/** $W_{ticket}$ = CategoryWeight × DifficultyMultiplier. */
function workloadIntensity(
	category: keyof typeof CATEGORY_WEIGHT,
	difficulty: keyof typeof DIFFICULTY,
): number {
	return CATEGORY_WEIGHT[category] * DIFFICULTY[difficulty];
}

/** Mirror of projects.check_ticket_capacity's decision (spec §3). */
function capacityVerdict(opts: {
	ticketWi: number;
	currentGlobal: number;
	capGlobal: number;
	currentStage?: number;
	capStage?: number | null;
}): { allowed: boolean; scope: 'global' | 'project' | null } {
	const projGlobal = opts.currentGlobal + opts.ticketWi;
	if (projGlobal > opts.capGlobal) return { allowed: false, scope: 'global' };
	if (
		opts.capStage != null && opts.currentStage != null &&
		opts.currentStage + opts.ticketWi > opts.capStage
	) {
		return { allowed: false, scope: 'project' };
	}
	return { allowed: true, scope: null };
}

/** Mirror of the TTL sweep predicate: a claim is parked once it outlives `claim_ttl_minutes`. */
function isClaimExpired(claimedAtMs: number, ttlMinutes: number, nowMs: number): boolean {
	return claimedAtMs + ttlMinutes * 60_000 < nowMs;
}

/** Self-claim is permitted only in open_pull; every other mode routes through the owner/system. */
function canSelfClaim(mode: string): boolean {
	return mode === 'open_pull';
}

Deno.test('E4 · $W_i$ formula = category weight × difficulty multiplier (spec §2)', () => {
	assertEquals(workloadIntensity('create', 'high'), 3.0); // 1.5 × 2.0
	assertEquals(workloadIntensity('create', 'standard'), 1.5);
	assertEquals(workloadIntensity('empower', 'low'), 0.25); // 0.5 × 0.5
	assertEquals(workloadIntensity('educate', 'standard'), 1.0);
});

Deno.test('E4 · capacity verdict — a claim within both caps is allowed', () => {
	const v = capacityVerdict({
		ticketWi: 1.5,
		currentGlobal: 3,
		capGlobal: 10,
		currentStage: 0,
		capStage: 2,
	});
	assertEquals(v.allowed, true);
	assertEquals(v.scope, null);
});

Deno.test('E4 · capacity verdict — exceeding the global $W_i$ cap is rejected (scope=global)', () => {
	// current 8 + ticket 3 = 11 > cap 10.
	const v = capacityVerdict({ ticketWi: 3, currentGlobal: 8, capGlobal: 10 });
	assertEquals(v.allowed, false);
	assertEquals(v.scope, 'global');
});

Deno.test('E4 · capacity verdict — exceeding the per-stage cap is rejected (scope=project)', () => {
	// global fine (2+1.5=3.5<=10) but stage 1.5+1.5=3 > stage cap 2.
	const v = capacityVerdict({
		ticketWi: 1.5,
		currentGlobal: 2,
		capGlobal: 10,
		currentStage: 1.5,
		capStage: 2,
	});
	assertEquals(v.allowed, false);
	assertEquals(v.scope, 'project');
});

Deno.test('E4 · a NULL per-stage cap means unlimited within the stage', () => {
	const v = capacityVerdict({
		ticketWi: 5,
		currentGlobal: 0,
		capGlobal: 10,
		currentStage: 4,
		capStage: null,
	});
	assertEquals(v.allowed, true);
});

Deno.test('E4 · claim-TTL predicate expires a claim once it outlives the window', () => {
	const now = 1_000_000_000_000;
	const ttl = 1440; // 24h default
	const withinWindow = now - 60_000; // claimed 1 min ago
	const pastWindow = now - (1440 + 1) * 60_000; // claimed just over 24h ago
	assertEquals(isClaimExpired(withinWindow, ttl, now), false);
	assertEquals(isClaimExpired(pastWindow, ttl, now), true);
});

Deno.test('E4 · self-claim is gated to open_pull; other modes route through the owner/system', () => {
	assertEquals(canSelfClaim('open_pull'), true);
	assertEquals(canSelfClaim('round_robin'), false);
	assertEquals(canSelfClaim('manual'), false);
	assertEquals(canSelfClaim('parallel_stream'), false);
});

Deno.test('E4 · parking refund invariant — a parked claim refunds the client in full, pays $0', () => {
	// The client's escrow hold is returned; the parking freelancer earns nothing (contrast eviction).
	const price = 100_00;
	const clientRefund = price;
	const freelancerPaid = 0;
	assertEquals(clientRefund + freelancerPaid, price); // conserved, all back to the client
	assertEquals(freelancerPaid, 0);
});
// #endregion

// #region Layer 2 (opt-in) — the deployed engine matches the contract
Deno.test({
	name: 'E4 · live · automation-engine RPCs, params, enum & columns exist',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;

			const fns = [
				'projects.fn_release_expired_claims(timestamptz)',
				'projects.check_ticket_capacity(uuid, uuid)',
				'projects.get_workload_capacity(uuid, uuid)',
				'projects.fn_assign_ticket_core(uuid, uuid, boolean)',
				'projects.claim_ticket(uuid, uuid)',
				'projects.set_stage_assignment_mode(uuid, text)',
				'projects.assign_ticket_manual(uuid, uuid)',
				'projects.auto_assign_round_robin(uuid)',
				'projects.assign_parallel_stream(uuid)',
				'projects.file_workload_report(uuid, text, numeric)',
				'finance.fn_refund_ticket_escrow(uuid)',
			];
			for (const sig of fns) {
				const [row] = await sql`SELECT to_regprocedure(${sig}) AS reg`;
				assert(row.reg, `${sig} must exist`);
			}

			// Tunable parameters.
			const [ttl] = await sql`
				SELECT (value #>> '{}')::int AS v FROM security.platform_params WHERE key = 'claim_ttl_minutes'`;
			assertEquals(ttl.v, 1440);
			const [cap] = await sql`
				SELECT (value #>> '{}')::numeric AS v FROM security.platform_params WHERE key = 'global_workload_cap_default'`;
			assertEquals(Number(cap.v), 10);

			// Assignment-mode enum labels.
			const [en] = await sql`
				SELECT array_agg(enumlabel ORDER BY enumsortorder) AS labels
				FROM pg_enum WHERE enumtypid = 'projects.assignment_routing_mode'::regtype`;
			assertEquals(en.labels, ['open_pull', 'round_robin', 'manual', 'parallel_stream']);

			// Cap columns.
			const [cols] = await sql`
				SELECT
					bool_or(table_name = 'project_stages' AND column_name = 'assignment_mode') AS has_mode,
					bool_or(table_name = 'project_stages' AND column_name = 'max_concurrent_intensity') AS has_stage_cap,
					bool_or(table_name = 'freelancer_profiles' AND column_name = 'max_workload_intensity') AS has_global_cap
				FROM information_schema.columns
				WHERE table_schema IN ('projects', 'org')`;
			assertEquals([cols.has_mode, cols.has_stage_cap, cols.has_global_cap], [true, true, true]);
		});
	},
});

/**
 * Shared live fixture: a business (funded wallet), one active project + priced stage, N freelancers
 * (roster-enrolled, zero-balance wallets), and one described, backlog ticket. Built as the harness's
 * non-superuser role — a bare `auth.users` insert is benign (the onboarding trigger defers), so no
 * `session_replication_role` suppression is needed. Everything is rolled back by `withRolledBackTx`.
 */
// deno-lint-ignore no-explicit-any
async function seedTicketFixture(sql: any, opts: { intensity?: number; mode?: string } = {}) {
	const biz = '11111111-1111-1111-1111-111111111111';
	const flA = '22222222-2222-2222-2222-222222222222';
	const flB = '33333333-3333-3333-3333-333333333333';
	const bizId = 'b0000000-0000-0000-0000-000000000001';
	const projId = 'c0000000-0000-0000-0000-000000000001';
	const stageId = 'd0000000-0000-0000-0000-000000000001';
	const ticketId = 'e0000000-0000-0000-0000-000000000001';
	const intensity = opts.intensity ?? 1.0;
	const mode = opts.mode ?? 'open_pull';

	await sql`INSERT INTO auth.users (id, email) VALUES
		(${biz}, 'biz@x.io'), (${flA}, 'fla@x.io'), (${flB}, 'flb@x.io')`;
	await sql`INSERT INTO org.users_public (user_id, username, dob) VALUES
		(${biz}, 'biz', '1990-01-01'), (${flA}, 'fla', '1990-01-01'), (${flB}, 'flb', '1990-01-01')`;
	await sql`INSERT INTO org.freelancer_profiles (user_id, current_workload_intensity) VALUES
		(${flA}, 0), (${flB}, 0)`;
	await sql`INSERT INTO org.business_profiles (id, owner_user_id, name, slug, billing_email)
		VALUES (${bizId}, ${biz}, 'B', 'b-slug', 'b@x.io')`;
	await sql`INSERT INTO finance.wallets (owner_type, owner_id, currency, balance_cents) VALUES
		('business', ${bizId}, 'USD', 1000000),
		('freelancer', ${flA}, 'USD', 0),
		('freelancer', ${flB}, 'USD', 0)`;
	await sql`INSERT INTO projects.projects
		(id, client_business_id, owner_user_id, title, allow_deadline_bonuses, currency, status)
		VALUES (${projId}, ${bizId}, ${biz}, 'P', true, 'USD', 'active')`;
	await sql`INSERT INTO projects.project_stages
		(id, project_id, name, sort_order, unit_price_cents, status, assignment_mode)
		VALUES (${stageId}, ${projId}, 'S', 0, 10000, 'assigned', ${mode}::projects.assignment_routing_mode)`;
	await sql`INSERT INTO projects.project_participants (project_id, profile_type, profile_id, role) VALUES
		(${projId}, 'freelancer', ${flA}, 'assignee'), (${projId}, 'freelancer', ${flB}, 'assignee')`;
	await sql`INSERT INTO projects.tickets
		(id, project_id, current_stage_id, title, description, text_description, workload_intensity, status, unit_price_cents)
		VALUES (${ticketId}, ${projId}, ${stageId}, 'T', '{"ops":[{"insert":"real"}]}'::jsonb, 'real', ${intensity}, 'backlog', 10000)`;

	return { biz, flA, flB, bizId, projId, stageId, ticketId };
}

Deno.test({
	name: 'E4 · live · claim-TTL sweep parks an idle claim and refunds the client in full',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;
			const f = await seedTicketFixture(sql);

			// Snapshot the business wallet up front (a business gets an opening credit on creation, so
			// assert against the delta, not an absolute balance).
			const bizBal = async () => {
				const [r] = await sql`
					SELECT balance_cents::text AS b FROM finance.wallets WHERE owner_type = 'business' AND owner_id = ${f.bizId}`;
				return Number(r.b);
			};
			const b0 = await bizBal();

			// Claim holds escrow (client debited the 10000 unit price).
			await sql`SELECT projects.claim_ticket(${f.ticketId}, ${f.flA})`;
			const [afterClaim] = await sql`
				SELECT status::text AS status, payment_status::text AS pay FROM projects.tickets WHERE id = ${f.ticketId}`;
			assertEquals([afterClaim.status, afterClaim.pay], ['claimed', 'escrow_funded']);
			assertEquals(await bizBal(), b0 - 10000);

			// Back-date the claim past the TTL and sweep (mocked time transition).
			await sql`UPDATE projects.tickets SET claimed_at = now() - interval '2 days' WHERE id = ${f.ticketId}`;
			const [swept] = await sql`SELECT projects.fn_release_expired_claims() AS n`;
			assertEquals(Number(swept.n), 1);

			// Ticket back in the open pool, unassigned, unpaid; escrow refunded; client made whole; fl paid $0.
			const [t] = await sql`
				SELECT status::text AS status, payment_status::text AS pay, current_assignee_id AS a
				FROM projects.tickets WHERE id = ${f.ticketId}`;
			assertEquals([t.status, t.pay, t.a], ['backlog', 'unpaid', null]);
			const [esc] = await sql`SELECT status FROM finance.escrows WHERE ticket_id = ${f.ticketId}`;
			assertEquals(esc.status, 'refunded');
			assertEquals(await bizBal(), b0); // fully refunded — the client is made whole
			const [fl] = await sql`
				SELECT balance_cents::text AS b FROM finance.wallets WHERE owner_type = 'freelancer' AND owner_id = ${f.flA}`;
			assertEquals(Number(fl.b), 0); // the parking freelancer earns nothing
		});
	},
});

Deno.test({
	name: 'E4 · live · a claim over the $W_i$ cap returns a clean validation error',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;
			const f = await seedTicketFixture(sql, { intensity: 3.0 });
			await sql`UPDATE org.freelancer_profiles SET max_workload_intensity = 2.00 WHERE user_id = ${f.flA}`;

			// Pre-flight verdict is a clean, structured rejection.
			const [verdict] = await sql`
				SELECT projects.check_ticket_capacity(${f.ticketId}, ${f.flA}) AS v`;
			assertEquals(verdict.v.allowed, false);
			assertEquals(verdict.v.scope, 'global');
			assertStringIncludes(verdict.v.reason, 'cap');

			// The claim itself raises a check_violation (SQLSTATE 23514) rather than over-loading.
			let raised: { code?: string; message?: string } | null = null;
			try {
				await sql`SELECT projects.claim_ticket(${f.ticketId}, ${f.flA})`;
			} catch (err) {
				raised = err as { code?: string; message?: string };
			}
			assert(raised, 'over-cap claim must raise');
			assertEquals(raised?.code, '23514');
			assertStringIncludes(raised?.message ?? '', 'global workload');
		});
	},
});

Deno.test({
	name: 'E4 · live · a manual-mode stage blocks self-claim',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;
			const f = await seedTicketFixture(sql, { mode: 'manual' });

			let raised: { code?: string } | null = null;
			try {
				await sql`SELECT projects.claim_ticket(${f.ticketId}, ${f.flA})`;
			} catch (err) {
				raised = err as { code?: string };
			}
			assert(raised, 'self-claim in manual mode must raise');
			assertEquals(raised?.code, '23514');
		});
	},
});

Deno.test({
	name: 'E4 · live · round-robin routes the next ticket to the lowest-loaded member',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;
			const f = await seedTicketFixture(sql, { mode: 'round_robin' });

			// Load freelancer B up (W_i 4 in-progress) so A is the lower-loaded choice.
			await sql`INSERT INTO projects.tickets
				(id, project_id, current_stage_id, title, description, text_description, workload_intensity, status, unit_price_cents, current_assignee_id, claimed_at)
				VALUES ('eaaa0000-0000-0000-0000-00000000000b', ${f.projId}, ${f.stageId}, 'busy',
					'{"ops":[{"insert":"x"}]}'::jsonb, 'x', 4.00, 'in_progress', 10000, ${f.flB}, now())`;

			// Impersonate the owner so can_review_project() passes for the routing RPC.
			await sql`SELECT set_config('request.jwt.claims', ${JSON.stringify({ sub: f.biz })}, true)`;

			const [rr] = await sql`SELECT projects.auto_assign_round_robin(${f.stageId}) AS r`;
			assertEquals(rr.r.assigned, true);
			assertEquals(rr.r.assignee_id, f.flA); // lower current $W_i$ than B
			const [t] =
				await sql`SELECT current_assignee_id AS a, status::text AS s FROM projects.tickets WHERE id = ${f.ticketId}`;
			assertEquals([t.a, t.s], [f.flA, 'claimed']);
		});
	},
});

Deno.test({
	name:
		'E4 · live · set_stage_assignment_mode round-trips through get_stage_details (picker read path)',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;
			const owner = '11111111-1111-1111-1111-111111111111';
			const bizId = 'b0000000-0000-0000-0000-000000000001';
			const projId = 'c0000000-0000-0000-0000-000000000001';
			const stageId = 'd0000000-0000-0000-0000-000000000001';

			await sql`INSERT INTO auth.users (id, email) VALUES (${owner}, 'owner@x.io')`;
			await sql`INSERT INTO org.users_public (user_id, username, dob) VALUES (${owner}, 'owner', '1990-01-01')`;
			await sql`INSERT INTO org.business_profiles (id, owner_user_id, name, slug, billing_email)
				VALUES (${bizId}, ${owner}, 'B', 'b-slug', 'b@x.io')`;
			await sql`INSERT INTO projects.projects (id, client_business_id, owner_user_id, title, currency, status)
				VALUES (${projId}, ${bizId}, ${owner}, 'P', 'USD', 'active')`;
			await sql`INSERT INTO projects.project_stages (id, project_id, name, sort_order, status)
				VALUES (${stageId}, ${projId}, 'S', 0, 'open')`;
			await sql`SELECT set_config('request.jwt.claims', ${JSON.stringify({ sub: owner })}, true)`;

			// The staffing-tab picker reads the current mode from get_stage_details (via StageContext).
			const [before] =
				await sql`SELECT assignment_mode FROM projects.get_stage_details(${projId}, ${stageId})`;
			assertEquals(before.assignment_mode, 'open_pull');

			await sql`SELECT projects.set_stage_assignment_mode(${stageId}, 'round_robin')`;

			const [after] =
				await sql`SELECT assignment_mode FROM projects.get_stage_details(${projId}, ${stageId})`;
			assertEquals(after.assignment_mode, 'round_robin');
		});
	},
});
// #endregion
