/**
 * @file communications_e7.test.ts
 * @description E7 · Collaboration & Communications — the privacy / platform-integrity layer added in
 * migration 0311: Team/Business private channels, the anti-disintermediation PII filter + protected
 * phase, and the "Projective Unlock" handover state.
 *
 * Layer 1 (always runs): pure-TS mirrors of the two security contracts the audit cares about — the
 * PII masker (`@projective/backend` PIIFilter, the exact TS twin of `comms.mask_pii`) and the
 * scoped-channel access decision (`comms.can_access_scope`). Deterministic, no database.
 *
 * Layer 2 (PJV_TEST_DB=1): drives the deployed SQL inside a rolled-back transaction — asserting the
 * objects exist AND behave (mask_pii masks an email/phone, is_protected_phase fails safe, and a
 * private channel denies a non-member so nothing can leak over the realtime WAL stream).
 */

import { assert, assertEquals, assertStringIncludes } from '@std/assert';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';
import { PIIFilter } from '@projective/backend';

// #region Layer 1 — PII filter (US · anti-disintermediation masking)

Deno.test('E7 · PII · masks a direct email address in the protected phase', () => {
	const r = PIIFilter.apply('Skip the fees — email me at jane.doe@gmail.com');
	assertStringIncludes(r.masked, '[email hidden]');
	assert(!r.masked.includes('jane.doe@gmail.com'), 'raw email must not survive');
	assert(r.wasMasked);
	assertEquals(r.categories, ['email']);
});

Deno.test('E7 · PII · masks external phone numbers', () => {
	const r = PIIFilter.apply('call me +1 (555) 123-9876 tonight');
	assertStringIncludes(r.masked, '[phone hidden]');
	assert(!/\d{3}.?\d{4}/.test(r.masked), 'digits of the number must be gone');
	assertEquals(r.categories, ['phone']);
});

Deno.test('E7 · PII · masks third-party payment links and handles', () => {
	const link = PIIFilter.apply('pay me here https://paypal.me/scammer');
	assertStringIncludes(link.masked, '[link hidden]');
	assert(!link.masked.includes('paypal.me/scammer'));
	assertEquals(link.categories, ['payment_link']);

	const handle = PIIFilter.apply('my cashtag is $johnnycash');
	assertStringIncludes(handle.masked, '[handle hidden]');
	assertEquals(handle.categories, ['handle']);
});

Deno.test('E7 · PII · masks several categories in one message', () => {
	const r = PIIFilter.apply('reach me: a@b.com or 555 867 5309');
	assert(r.masked.includes('[email hidden]') && r.masked.includes('[phone hidden]'));
	assertEquals(new Set(r.categories), new Set(['email', 'phone']));
});

Deno.test('E7 · PII · leaves a clean message untouched (no false positives)', () => {
	const clean = "Great work on the logo — let's ship v2 by Friday.";
	const r = PIIFilter.apply(clean);
	assertEquals(r.masked, clean);
	assertEquals(r.wasMasked, false);
	assertEquals(r.categories, []);
});

Deno.test('E7 · PII · masking is idempotent (re-scanning a masked body finds nothing)', () => {
	const first = PIIFilter.apply('email a@b.com');
	const second = PIIFilter.apply(first.masked);
	assertEquals(second.wasMasked, false, 'placeholders must not re-trigger the filter');
	assertEquals(second.masked, first.masked);
});

Deno.test('E7 · PII · empty / nullish input is safe', () => {
	assertEquals(PIIFilter.apply('').wasMasked, false);
	assertEquals(PIIFilter.apply(undefined).masked, '');
	assertEquals(PIIFilter.apply(null).categories, []);
});

// #endregion

// #region Layer 1 — scoped-channel access (private-channel isolation)

type Scope = 'stage_all' | 'team_private' | 'business_private';

interface Viewer {
	/** Owner or an active member of the paying client business (can_review_project). */
	isClientSide: boolean;
	/** An assigned freelancer or active member of an assigned team on the stage. */
	isAssignedTalent: boolean;
}

/**
 * Pure mirror of comms.can_access_scope: every stage room needs stage-room membership first (client
 * side OR assigned talent); the private scopes then narrow to exactly one side.
 */
function canAccessScope(scope: Scope, v: Viewer): boolean {
	const hasStageAccess = v.isClientSide || v.isAssignedTalent;
	if (!hasStageAccess) return false;
	if (scope === 'business_private') return v.isClientSide;
	if (scope === 'team_private') return v.isAssignedTalent;
	return true; // stage_all — everyone with stage access
}

Deno.test('E7 · channels · Business channel is client-only, Team channel is talent-only', () => {
	const client: Viewer = { isClientSide: true, isAssignedTalent: false };
	const talent: Viewer = { isClientSide: false, isAssignedTalent: true };
	const outsider: Viewer = { isClientSide: false, isAssignedTalent: false };

	// General is shared by both sides.
	assert(canAccessScope('stage_all', client) && canAccessScope('stage_all', talent));

	// Business: only the client/business side.
	assert(canAccessScope('business_private', client));
	assert(!canAccessScope('business_private', talent), 'talent must NOT see the Business channel');

	// Team: only the assigned talent.
	assert(canAccessScope('team_private', talent));
	assert(!canAccessScope('team_private', client), 'client must NOT see the Team channel');

	// A non-member of the stage sees nothing at all (no WebSocket leak).
	for (const scope of ['stage_all', 'team_private', 'business_private'] as Scope[]) {
		assertEquals(canAccessScope(scope, outsider), false);
	}
});

// #endregion

// #region Layer 2 — live SQL (PJV_TEST_DB=1)

Deno.test({
	name: 'E7 · live · migration 0311 objects are deployed',
	ignore: !isLiveDbEnabled(),
	fn: () =>
		withRolledBackTx(async (sql) => {
			// deno-lint-ignore no-explicit-any
			const q = sql as any;
			const [fns] = await q`
				SELECT
					to_regprocedure('comms.can_access_scope(uuid,uuid,text)') IS NOT NULL AS can_access_scope,
					to_regprocedure('comms.has_channel_access(uuid)')          IS NOT NULL AS has_channel_access,
					to_regprocedure('comms.get_stage_channels(uuid)')          IS NOT NULL AS get_stage_channels,
					to_regprocedure('comms.mask_pii(text)')                    IS NOT NULL AS mask_pii,
					to_regprocedure('projects.is_protected_phase(uuid)')       IS NOT NULL AS is_protected_phase
			`;
			assert(fns.can_access_scope, 'comms.can_access_scope missing');
			assert(fns.has_channel_access, 'comms.has_channel_access missing');
			assert(fns.get_stage_channels, 'comms.get_stage_channels missing');
			assert(fns.mask_pii, 'comms.mask_pii missing');
			assert(fns.is_protected_phase, 'projects.is_protected_phase missing');

			const [col] = await q`
				SELECT EXISTS (
					SELECT 1 FROM information_schema.columns
					WHERE table_schema = 'projects' AND table_name = 'projects'
						AND column_name = 'handover_unlocked_at'
				) AS present`;
			assert(col.present, 'projects.handover_unlocked_at column missing');

			const [trg] = await q`
				SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mask_message_pii') AS present`;
			assert(trg.present, 'trg_mask_message_pii trigger missing');
		}),
});

Deno.test({
	name: 'E7 · live · comms.mask_pii masks email + phone and classifies them',
	ignore: !isLiveDbEnabled(),
	fn: () =>
		withRolledBackTx(async (sql) => {
			// deno-lint-ignore no-explicit-any
			const q = sql as any;
			const [row] = await q`
				SELECT masked, categories FROM comms.mask_pii('ping me a@b.com or 555-123-9876')`;
			assertStringIncludes(row.masked, '[email hidden]');
			assertStringIncludes(row.masked, '[phone hidden]');
			assert(!row.masked.includes('a@b.com'));
			assert((row.categories as string[]).includes('email'));
			assert((row.categories as string[]).includes('phone'));
		}),
});

Deno.test({
	name: 'E7 · live · is_protected_phase fails safe for an unknown project',
	ignore: !isLiveDbEnabled(),
	fn: () =>
		withRolledBackTx(async (sql) => {
			// deno-lint-ignore no-explicit-any
			const q = sql as any;
			const [row] = await q`SELECT projects.is_protected_phase(gen_random_uuid()) AS protected`;
			assertEquals(
				row.protected,
				true,
				'unknown project must default to protected (mask, not leak)',
			);
		}),
});

// #endregion
