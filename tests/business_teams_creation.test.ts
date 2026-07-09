/**
 * @file business_teams_creation.test.ts
 * @description US-002 · Organizational Structures — verifies the low-friction, draft-first
 * creation contract for Businesses and Teams: only a display Name and a unique `@handle`
 * are required, the handle sanitiser produces URL-safe slugs, and the relaxed Zod schemas
 * accept a minimal payload while still rejecting malformed handles.
 *
 * Pure unit layer (always runs, no DB): exercises `sanitizeHandle` and the create schemas.
 */

import { assert, assertEquals, assertFalse } from '@std/assert';
import { sanitizeHandle } from '../packages/fields/src/utils/handle.ts';
import { CreateBusinessSchema } from '../apps/web/features/dashboard/business/contracts/new/_validation.ts';
import { CreateTeamSchema } from '../apps/web/features/dashboard/teams/contracts/new/_validation.ts';

// #region sanitizeHandle
Deno.test('US-002 · sanitizeHandle lowercases and hyphenates spaces', () => {
	assertEquals(sanitizeHandle('Acme Studios'), 'acme-studios');
});

Deno.test('US-002 · sanitizeHandle strips invalid characters', () => {
	assertEquals(sanitizeHandle('Nörthwïnd & Co.!!'), 'nrthwnd-co');
});

Deno.test('US-002 · sanitizeHandle collapses repeated hyphens', () => {
	assertEquals(sanitizeHandle('a   b---c'), 'a-b-c');
});
// #endregion

// #region Business schema — only name + slug required
Deno.test('US-002 AC1 · CreateBusinessSchema accepts a minimal name + handle payload', () => {
	const res = CreateBusinessSchema.safeParse({ name: 'Acme', slug: 'acme-co' });
	assert(res.success, 'minimal business payload should validate');
	// Extended metadata is deferred; currency defaults so the draft can spin up a wallet.
	assertEquals(res.data.default_currency, 'USD');
});

Deno.test('US-002 AC1 · CreateBusinessSchema rejects an invalid handle', () => {
	const res = CreateBusinessSchema.safeParse({ name: 'Acme', slug: 'Bad Handle!' });
	assertFalse(res.success);
});

Deno.test('US-002 AC1 · CreateBusinessSchema no longer requires legal/billing fields', () => {
	const res = CreateBusinessSchema.safeParse({ name: 'Acme', slug: 'acme-co' });
	assert(res.success);
	// legal_name / billing_email / address are optional now (draft-first).
	assertEquals(res.data.legal_name, undefined);
});
// #endregion

// #region Team schema — only name + slug required
Deno.test('US-002 AC2 · CreateTeamSchema accepts a minimal name + handle payload', () => {
	const res = CreateTeamSchema.safeParse({ name: 'Northwind', slug: 'northwind' });
	assert(res.success, 'minimal team payload should validate');
	// Defaults keep the draft coherent without asking for financials up-front.
	assertEquals(res.data.payout_model, 'manager_discretion');
	assertEquals(res.data.invites, []);
});

Deno.test('US-002 AC2 · CreateTeamSchema rejects a too-short handle', () => {
	const res = CreateTeamSchema.safeParse({ name: 'Northwind', slug: 'no' });
	assertFalse(res.success);
});
// #endregion
