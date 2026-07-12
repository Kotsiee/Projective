/**
 * @file home_feed.test.ts
 * @description Unit coverage for the two pure engines behind the persona-adaptive `/home` feed:
 *   - `computeProfileSetup` — the single completeness source shared by the home tracker, nav
 *     dropdown, and profile rail (baseline floor, persona-specific steps, 100% reconciliation,
 *     edit-deep-link hrefs).
 *   - `buildFeedPage` — the Mixed-Media Layout Rule Engine (reel-lead, sponsored insertion, unique
 *     feed-position keys, graceful termination of the "infinite" feed).
 *
 * Both are DB-free, so these run in the default green suite with no database.
 */

import { assert, assertEquals } from '@std/assert';
import {
	computeProfileSetup,
	type ProfileSetupInput,
} from '../apps/web/features/shared/profile/completeness.ts';
import {
	buildFeedPage,
	type FeedPools,
} from '../apps/web/features/dashboard/home/rules/mixedMedia.ts';
import {
	SEED_PROJECTS,
	SEED_SERVICES,
	SEED_TEAMS,
	SPONSORED_POOL,
	TEXT_POOL_FREELANCER,
} from '../apps/web/features/dashboard/home/data/homeSeed.ts';

// #region computeProfileSetup

const bare = (over: Partial<ProfileSetupInput> = {}): ProfileSetupInput => ({
	username: 'nadia',
	isFreelancer: true,
	hasAvatar: false,
	hasHeadline: false,
	hasBio: false,
	hasSkills: false,
	hasLanguages: false,
	serviceCount: 0,
	projectCount: 0,
	...over,
});

Deno.test('Home · completeness has a baseline floor for a brand-new account', () => {
	const s = computeProfileSetup(bare());
	assertEquals(s.completed, 1, 'only the account step is done');
	assert(s.percent > 0, 'baseline percent is above zero');
	assert(s.percent < 100, 'a bare profile is not complete');
	assertEquals(s.steps[0].key, 'account');
	assert(s.steps[0].done, 'account step is always done');
});

Deno.test('Home · a fully-populated profile reconciles to exactly 100%', () => {
	const s = computeProfileSetup(bare({
		hasAvatar: true,
		hasHeadline: true,
		hasBio: true,
		hasSkills: true,
		hasLanguages: true,
		serviceCount: 2,
		projectCount: 3,
	}));
	assertEquals(s.percent, 100);
	assertEquals(s.completed, s.total);
});

Deno.test('Home · freelancer vs client personas expose different step tails', () => {
	const fl = computeProfileSetup(bare({ isFreelancer: true }));
	const cl = computeProfileSetup(bare({ isFreelancer: false }));

	assert(fl.steps.some((x) => x.key === 'skills'), 'freelancer gets a skills step');
	assert(fl.steps.some((x) => x.key === 'service'), 'freelancer gets a first-service step');
	assert(!cl.steps.some((x) => x.key === 'skills'), 'client has no skills step');
	assert(cl.steps.some((x) => x.key === 'interests'), 'client gets an interests step');
});

Deno.test('Home · incomplete steps deep-link into the profile editor', () => {
	const s = computeProfileSetup(bare({ username: 'nadia' }));
	const headline = s.steps.find((x) => x.key === 'headline');
	assert(headline, 'headline step exists');
	assertEquals(headline!.href, '/nadia?edit=1#details');
});

Deno.test('Home · a missing username falls back to onboarding for hrefs', () => {
	const s = computeProfileSetup(bare({ username: null }));
	const pending = s.steps.find((x) => !x.done);
	assert(pending, 'there is a pending step');
	assertEquals(pending!.href, '/join');
});

Deno.test('Home · freelancers get a public go-live milestone; pure clients do not', () => {
	const fl = computeProfileSetup(bare({ isFreelancer: true }));
	const cl = computeProfileSetup(bare({ isFreelancer: false }));

	assert(fl.milestone, 'a freelancer exposes a go-live milestone');
	assert(fl.milestone!.percent > 0 && fl.milestone!.percent < 100, 'the marker sits mid-bar');
	assertEquals(fl.milestone!.reached, false, 'a bare profile has not reached go-live');
	assertEquals(cl.milestone, undefined, 'a hiring client has no go-live gate');
});

Deno.test('Home · the go-live milestone is reached once the baseline is filled in', () => {
	// Baseline = avatar + headline + bio + skills (account is always done). Service/project/languages
	// are intentionally still missing, so overall completeness is below 100.
	const s = computeProfileSetup(bare({
		isFreelancer: true,
		hasAvatar: true,
		hasHeadline: true,
		hasBio: true,
		hasSkills: true,
	}));

	assert(s.milestone, 'milestone exists');
	assertEquals(s.milestone!.reached, true, 'baseline complete → go-live reached');
	assert(s.percent < 100, 'the profile can go public before it is 100% complete');
});

Deno.test('Home · a client who unlocks a freelancer profile carries a dual-state checklist', () => {
	// The "Become a Partner" recalculation: isFreelancer flips true while the client footprint stays,
	// so both tails apply and the incomplete freelancer tasks pull completeness back down.
	const converted = computeProfileSetup(bare({
		isFreelancer: true,
		isClient: true,
		hasAvatar: true,
		hasHeadline: true,
		hasBio: true,
		hasLanguages: true,
		hasSkills: true,
		// New freelancer tasks are not done yet.
		serviceCount: 0,
		projectCount: 0,
	}));

	assert(converted.steps.some((x) => x.key === 'skills'), 'freelancer skills step present');
	assert(converted.steps.some((x) => x.key === 'service'), 'freelancer first-service step present');
	assert(converted.steps.some((x) => x.key === 'interests'), 'client interests step still present');
	assert(converted.steps.some((x) => x.key === 'brief'), 'client first-brief step still present');

	const keys = converted.steps.map((x) => x.key);
	assertEquals(new Set(keys).size, keys.length, 'every step key stays unique across both tails');

	assert(converted.percent < 100, 'incomplete freelancer tasks pull completeness back below 100');
	assert(
		converted.milestone?.reached,
		'the baseline is done, so the profile can already go public',
	);
});

// #endregion

// #region buildFeedPage (Mixed-Media Layout Rule Engine)

const pools = (): FeedPools => ({
	standard: SEED_PROJECTS.map((e) => ({ entity: e, variant: 'project' as const })),
	reels: [{ title: 'Reel', entities: SEED_TEAMS, variant: 'profile' }],
	sponsored: SPONSORED_POOL,
	text: TEXT_POOL_FREELANCER,
});

Deno.test('Home · a feed page leads with a reel and carries a sponsored slot', () => {
	const page = buildFeedPage(0, pools());
	assertEquals(page.items[0].kind, 'reel', 'the page opens with a horizontal reel');
	assert(page.items.some((i) => i.kind === 'sponsored'), 'a sponsored slot is inserted');
	assert(page.items.some((i) => i.kind === 'card'), 'standard cards are present');
});

Deno.test('Home · every feed item id is unique so infinite-scroll keys are stable', () => {
	const seen = new Set<string>();
	for (let offset = 0; offset < 4; offset++) {
		for (const item of buildFeedPage(offset, pools()).items) {
			assert(!seen.has(item.id), `duplicate feed item id: ${item.id}`);
			seen.add(item.id);
		}
	}
});

Deno.test('Home · the feed advances then terminates gracefully', () => {
	assertEquals(buildFeedPage(0, pools()).nextOffset, 1, 'first page points at the next');
	assertEquals(buildFeedPage(7, pools()).nextOffset, null, 'the feed exhausts (nextOffset null)');
});

Deno.test('Home · empty pools never throw and never fabricate items', () => {
	const empty: FeedPools = { standard: [], reels: [], sponsored: [], text: [] };
	const page = buildFeedPage(0, empty);
	assertEquals(page.items.length, 0, 'no pools → no items');
});

// #endregion
