/**
 * @file onboarding.test.ts
 * @description US-001 · Multi-Persona Onboarding — verifies the success path of
 * `public.handle_new_user` (mig 0304): AC4 initialises `security.session_context` with the resolved
 * active profile, and AC6 writes a clean `user.onboarded` row to `security.audit_logs`.
 *
 * Layer 1 (always runs): MockDb re-implements the trigger's contract.
 * Layer 2 (PJV_TEST_DB=1): asserts the deployed schema matches — trigger present, grant rules intact.
 */

import { assert, assertEquals, assertThrows } from '@std/assert';
import { MockDb, SqlError } from './support/mock_db.ts';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';

// #region UNIT — persona routing into session_context (AC4)
Deno.test('US-001 AC4 · freelancer onboarding sets active_profile to the user id', () => {
	const db = new MockDb();
	db.handleNewUser({
		id: 'user-fl',
		email: 'fl@example.com',
		objective: 'freelancer',
		skills: ['design'],
	});

	const ctx = db.sessionContextFor('user-fl');
	assert(ctx, 'session_context row must exist');
	assertEquals(ctx.active_profile_type, 'freelancer');
	assertEquals(ctx.active_profile_id, 'user-fl'); // freelancer_profiles keyed by user_id
	assertEquals(ctx.active_team_id, null);
});

Deno.test("US-001 AC4 · 'seller' objective is routed as a freelancer persona", () => {
	const db = new MockDb();
	db.handleNewUser({ id: 'user-sl', email: 'sl@example.com', objective: 'seller' });
	assertEquals(db.sessionContextFor('user-sl')?.active_profile_type, 'freelancer');
});

Deno.test('US-001 AC4 · client onboarding starts with an all-NULL context (Business created in US-002)', () => {
	const db = new MockDb();
	db.handleNewUser({ id: 'user-cl', email: 'cl@example.com', objective: 'client' });

	const ctx = db.sessionContextFor('user-cl');
	assert(ctx, 'context row is still created for a client');
	assertEquals(ctx.active_profile_type, null);
	assertEquals(ctx.active_profile_id, null);
});

Deno.test('US-001 AC4 · re-running onboarding is idempotent (ON CONFLICT DO UPDATE, no stale context)', () => {
	const db = new MockDb();
	db.handleNewUser({ id: 'user-idem', email: 'x@example.com', objective: 'freelancer' });
	db.handleNewUser({ id: 'user-idem', email: 'x@example.com', objective: 'freelancer' });

	const rows = [...db.state.sessionContext.values()].filter((c) => c.user_id === 'user-idem');
	assertEquals(rows.length, 1, 'upsert must not create a second context row');
});
// #endregion

// #region UNIT — audit_logs write (AC6)
Deno.test('US-001 AC6 · onboarding writes exactly one clean user.onboarded audit row', () => {
	const db = new MockDb();
	db.handleNewUser({
		id: 'user-audit',
		email: 'a@example.com',
		objective: 'freelancer',
		username: 'ada',
		skills: ['rust'],
	});

	const logs = db.auditLogsFor('user-audit');
	assertEquals(logs.length, 1);
	const log = logs[0];
	assertEquals(log.action, 'user.onboarded');
	assertEquals(log.entity_table, 'org.users_public');
	assertEquals(log.entity_id, 'user-audit');
	assertEquals(log.actor_profile_id, 'user-audit'); // mirrors the active profile at event time
	assertEquals(log.metadata.is_freelancer, true);
	assertEquals(log.metadata.username, 'ada');
	assertEquals(log.metadata.active_profile_type, 'freelancer');
});

Deno.test('US-001 AC6 · a client audit row records the NULL active profile', () => {
	const db = new MockDb();
	db.handleNewUser({ id: 'user-c2', email: 'c2@example.com', objective: 'client' });
	const log = db.auditLogsFor('user-c2')[0];
	assertEquals(log.metadata.is_freelancer, false);
	assertEquals(log.actor_profile_id, null);
	assertEquals(log.metadata.active_profile_type, null);
});

Deno.test('US-001 AC6 · the authenticated role cannot write audit_logs (grant lives only in the definer trigger)', () => {
	const db = new MockDb();
	// Rationale for putting the write in the trigger: no grant to `authenticated` (mig 0205).
	assertThrows(
		() =>
			db.insertAuditLogAsAuthenticated({
				user_id: 'user-x',
				action: 'user.onboarded',
				entity_table: 'org.users_public',
				entity_id: 'user-x',
				metadata: {},
				actor_profile_id: null,
			}),
		SqlError,
		'permission denied',
	);
});
// #endregion

// #region INTEGRATION — session_context + audit written atomically in one flow
Deno.test('US-001 · onboarding initialises session_context AND audit_logs in the same pass', () => {
	const db = new MockDb();
	db.begin();
	try {
		db.handleNewUser({ id: 'user-atomic', email: 'at@example.com', objective: 'freelancer' });
		assert(db.sessionContextFor('user-atomic'), 'context set');
		assertEquals(db.auditLogsFor('user-atomic').length, 1, 'audit written');
	} finally {
		db.rollback();
	}
	// After rollback the flow leaves no residue.
	assertEquals(db.sessionContextFor('user-atomic'), undefined);
	assertEquals(db.auditLogsFor('user-atomic').length, 0);
});
// #endregion

// #region LIVE DB (opt-in) — deployed schema matches the onboarding contract
Deno.test({
	name: 'US-001 · live · trigger present and audit_logs grant rules intact',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;

			const [trig] = await sql`
				SELECT tgname FROM pg_trigger
				WHERE tgname = 'on_auth_user_created' AND NOT tgisinternal`;
			assert(trig, 'on_auth_user_created trigger must exist on auth.users');

			const [fn] = await sql`SELECT to_regprocedure('public.handle_new_user()') AS reg`;
			assert(fn.reg, 'public.handle_new_user() must exist');

			// AC6 rationale: authenticated has NO insert grant on security.audit_logs...
			const [audit] = await sql`
				SELECT has_table_privilege('authenticated', 'security.audit_logs', 'INSERT') AS can_insert`;
			assertEquals(audit.can_insert, false);

			// ...but session_context IS manageable by authenticated (RLS-scoped to own row).
			const [ctx] = await sql`
				SELECT has_table_privilege('authenticated', 'security.session_context', 'INSERT') AS can_insert`;
			assertEquals(ctx.can_insert, true);
		});
	},
});
// #endregion
