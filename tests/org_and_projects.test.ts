/**
 * @file org_and_projects.test.ts
 * @description US-002 · Org-Unit Formation and US-003 · Modular Project Creation.
 *
 * Layer 1 (always runs): MockDb re-implements the SECURITY DEFINER contracts —
 *   - org.create_business / org.create_team           (migs 0110 / 0107)
 *   - context.ts switchActiveProfile / switchActiveTeam (session_context upserts)
 *   - projects.create_project                         (mig 0101)
 *   - projects.update_entity_project_counts trigger   (mig 0114)
 * Layer 2 (PJV_TEST_DB=1): asserts the deployed schema/functions match.
 *
 * Case names map to project_management/USER_STORIES.md acceptance criteria.
 */

import { assert, assertEquals, assertThrows } from '@std/assert';
import { MockDb, SqlError } from './support/mock_db.ts';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';

// A client account starts with an all-NULL session context (US-001); US-002 fills it in.
function seedClient(db: MockDb, id = 'user-client'): string {
	db.handleNewUser({ id, email: `${id}@example.com`, objective: 'client' });
	return id;
}

// #region US-002 AC5 — Team Vault / Business Wallet initialisation
Deno.test('US-002 AC5 · creating a business initialises its Business Wallet (0 balance)', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const businessId = db.createBusiness(user, { slug: 'acme', name: 'Acme', currency: 'GBP' });

	const wallet = db.wallet('business', businessId, 'GBP');
	assert(wallet, 'a business wallet must exist for the new business');
	assertEquals(wallet.balance_cents, 0);
});

Deno.test('US-002 AC5 · creating a team initialises a Team Vault and links treasury_wallet_id', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const { teamId, walletId } = db.createTeam(user, { slug: 'pixel-guild', currency: 'USD' });

	const vault = db.wallet('team', teamId, 'USD');
	assert(vault, 'a team vault (wallet) must exist for the new team');
	assertEquals(vault.balance_cents, 0);
	assertEquals(db.orgTeam(teamId)?.treasury_wallet_id, walletId, 'team must reference its vault');
});
// #endregion

// #region US-002 AC6 — business.created / team.created audit trail
Deno.test('US-002 AC6 · business creation writes a clean business.created audit row', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const businessId = db.createBusiness(user, { slug: 'acme', name: 'Acme Ltd' });

	const log = db.auditLogsFor(user).find((l) => l.action === 'business.created');
	assert(log, 'a business.created audit row must be written');
	assertEquals(log.entity_table, 'org.business_profiles');
	assertEquals(log.entity_id, businessId);
	assertEquals(log.actor_profile_id, businessId, 'actor is the newly-created business');
	assertEquals(log.metadata.slug, 'acme');
});

Deno.test('US-002 AC6 · team creation writes a clean team.created audit row (actor_team_id set)', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const { teamId } = db.createTeam(user, { slug: 'pixel-guild', name: 'Pixel Guild' });

	const log = db.auditLogsFor(user).find((l) => l.action === 'team.created');
	assert(log, 'a team.created audit row must be written');
	assertEquals(log.entity_table, 'org.teams');
	assertEquals(log.entity_id, teamId);
	assertEquals(log.actor_team_id, teamId);
});

Deno.test('US-002 AC6 · the authenticated role still cannot write audit_logs directly', () => {
	const db = new MockDb();
	assertThrows(
		() =>
			db.insertAuditLogAsAuthenticated({
				user_id: 'user-x',
				action: 'business.created',
				entity_table: 'org.business_profiles',
				entity_id: 'biz-x',
				metadata: {},
				actor_profile_id: null,
			}),
		SqlError,
		'permission denied',
	);
});
// #endregion

// #region US-002 AC3 — context switch to active_profile_id / active_team_id
Deno.test('US-002 AC3 · creating a business switches the session context to it', () => {
	const db = new MockDb();
	const user = seedClient(db);
	assertEquals(db.sessionContextFor(user)?.active_profile_type, null); // client starts NULL

	const businessId = db.createBusiness(user, { slug: 'acme' });
	const ctx = db.sessionContextFor(user);
	assertEquals(ctx?.active_profile_type, 'business');
	assertEquals(ctx?.active_profile_id, businessId);
	assertEquals(ctx?.active_team_id, null);
});

Deno.test('US-002 AC3 · switching to a team sets active_team_id and clears the profile (mutually exclusive)', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const businessId = db.createBusiness(user, { slug: 'acme' }); // now in business context
	const { teamId } = db.createTeam(user, { slug: 'guild' });

	db.switchToTeam(user, teamId);
	let ctx = db.sessionContextFor(user);
	assertEquals(ctx?.active_team_id, teamId);
	assertEquals(ctx?.active_profile_id, null);
	assertEquals(ctx?.active_profile_type, null);

	// Switching back to the business clears the team.
	db.switchToProfile(user, businessId, 'business');
	ctx = db.sessionContextFor(user);
	assertEquals(ctx?.active_profile_id, businessId);
	assertEquals(ctx?.active_team_id, null);
});

Deno.test('US-002 AC3 · a non-member cannot switch into a team (ownership guard)', () => {
	const db = new MockDb();
	const owner = seedClient(db, 'owner');
	const outsider = seedClient(db, 'outsider');
	const { teamId } = db.createTeam(owner, { slug: 'guild' });

	assertThrows(() => db.switchToTeam(outsider, teamId), SqlError, 'active member');
});
// #endregion

// #region US-003 · Bug fix — update_entity_project_counts on user-owned projects
Deno.test('US-003 bug · the counts trigger runs on a user-owned project without dereferencing team_id', () => {
	const db = new MockDb();
	const user = seedClient(db, 'solo');
	// Personal project (client_business_id NULL). The old trigger errored here on NEW.team_id.
	db.createProject(user, { stages: [{ name: 'Concept' }] });
	assertEquals(db.usersPublicRow('solo')?.total_project_count, 1);
});

Deno.test('US-003 bug · counts route to the owning business for a business-owned project', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const businessId = db.createBusiness(user, { slug: 'acme' });

	db.createProject(user, { businessId, stages: [{ name: 'Concept' }] });
	db.createProject(user, { businessId, stages: [{ name: 'Concept' }] });
	assertEquals(db.businessProfile(businessId)?.total_project_count, 2);
	assertEquals(
		db.usersPublicRow(user)?.total_project_count,
		0,
		'business projects do not count as personal',
	);
});
// #endregion

// #region US-003 AC1 — project header (title, global IP mode) + AC5 timeline sequencing
Deno.test('US-003 AC1/AC5 · project header captures the global IP mode and timeline preset', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const businessId = db.createBusiness(user, { slug: 'acme' });

	const projectId = db.createProject(user, {
		businessId,
		ip_ownership_mode: 'licensed_use',
		timeline_preset: 'simultaneous',
	});
	const project = db.state.projects.find((p) => p.id === projectId);
	assertEquals(project?.ip_ownership_mode, 'licensed_use');
	assertEquals(project?.timeline_preset, 'simultaneous');
	assertEquals(project?.status, 'draft', 'AC6 · projects start as a draft');
});
// #endregion

// #region US-003 AC4 — per-stage IP override + AC5 sequential dependencies
Deno.test('US-003 AC4/AC5 · stages persist per-stage IP overrides and sequential dependencies', () => {
	const db = new MockDb();
	const user = seedClient(db);
	const businessId = db.createBusiness(user, { slug: 'acme' });

	const projectId = db.createProject(user, {
		businessId,
		ip_ownership_mode: 'exclusive_transfer',
		stages: [
			{ id: 'stage-a', name: 'Research', sort_order: 0 }, // inherits project IP mode
			{
				id: 'stage-b',
				name: 'Design',
				sort_order: 1,
				ip_ownership_override: 'shared_ownership', // AC4 override
				start_trigger_type: 'dependent_on_stage', // AC5 sequencing
				start_dependency_stage_id: 'stage-a',
			},
		],
	});

	const stages = db.stagesForProject(projectId).sort((a, b) =>
		(a.sort_order ?? 0) - (b.sort_order ?? 0)
	);
	assertEquals(stages.length, 2);

	// AC4 — the first stage inherits (no override); the second overrides to shared ownership.
	assertEquals(stages[0].ip_ownership_override ?? null, null);
	assertEquals(stages[1].ip_ownership_override, 'shared_ownership');
	assertEquals(stages[1].ip_mode, 'shared_ownership');

	// AC5 — the second stage waits on the first.
	assertEquals(stages[1].start_trigger_type, 'dependent_on_stage');
	assertEquals(stages[1].start_dependency_stage_id, 'stage-a');
});

Deno.test('US-003 · creating a project for a business you are not a member of is rejected', () => {
	const db = new MockDb();
	const owner = seedClient(db, 'owner');
	const outsider = seedClient(db, 'outsider');
	const businessId = db.createBusiness(owner, { slug: 'acme' });

	assertThrows(() => db.createProject(outsider, { businessId }), SqlError, 'not an active member');
});
// #endregion

// #region LIVE DB (opt-in) — deployed schema matches the US-002/US-003 contracts
Deno.test({
	name: 'US-002/US-003 · live · org RPCs, wallet init and stage IP columns exist',
	ignore: !isLiveDbEnabled(),
	async fn() {
		await withRolledBackTx(async (sqlUnknown) => {
			// deno-lint-ignore no-explicit-any
			const sql = sqlUnknown as any;

			// The org-formation and project-creation RPCs are deployed.
			for (
				const proc of [
					'org.create_business(jsonb)',
					'org.create_team(jsonb)',
					'projects.create_project(jsonb)',
				]
			) {
				const [row] = await sql`SELECT to_regprocedure(${proc}) AS reg`;
				assert(row.reg, `${proc} must exist`);
			}

			// AC5 — org.teams can hold a treasury wallet reference.
			const [treasury] = await sql`
				SELECT 1 AS ok FROM information_schema.columns
				WHERE table_schema = 'org' AND table_name = 'teams' AND column_name = 'treasury_wallet_id'`;
			assert(treasury?.ok, 'org.teams.treasury_wallet_id must exist');

			// AC4 — the per-stage IP override column exists.
			const [ipCol] = await sql`
				SELECT 1 AS ok FROM information_schema.columns
				WHERE table_schema = 'projects' AND table_name = 'project_stages' AND column_name = 'ip_ownership_override'`;
			assert(ipCol?.ok, 'projects.project_stages.ip_ownership_override must exist');

			// AC5 — the project-level timeline preset column exists.
			const [tl] = await sql`
				SELECT 1 AS ok FROM information_schema.columns
				WHERE table_schema = 'projects' AND table_name = 'projects' AND column_name = 'timeline_preset'`;
			assert(tl?.ok, 'projects.projects.timeline_preset must exist');

			// The counts trigger is present and fires on projects.projects.
			const [trig] = await sql`
				SELECT tgname FROM pg_trigger WHERE tgname = 'trg_update_project_counts' AND NOT tgisinternal`;
			assert(trig, 'trg_update_project_counts must exist');
		});
	},
});
// #endregion
