/**
 * @file homeSeed.ts
 * @description Frontend seed powering the `/home` engagement feed when the live discovery engine is
 * unavailable or empty (mirrors the established seed pattern across explore / profile / wallet). Every
 * entity conforms to `@projective/types` `EntityCardModel` so it renders identically to a live result
 * mapped through `scoredToExplore`. Persona selects which pools become reels vs. standard cards, plus
 * bespoke insight/highlight/sponsored/text seeds.
 */

import type {
	Accent,
	EntityCardModel,
	FeedAccent,
	HomeHighlight,
	HomeInsights,
	Persona,
} from '@projective/types';

// #region Visual palette (instant-loading gradient banners)

const GRAD: Record<string, string> = {
	mint: 'linear-gradient(135deg, #0b3b34 0%, #10b981 55%, #34f5c5 100%)',
	violet: 'linear-gradient(135deg, #2a1b52 0%, #7c3aed 55%, #a78bfa 100%)',
	amber: 'linear-gradient(135deg, #43290a 0%, #f59e0b 55%, #fcd34d 100%)',
	ocean: 'linear-gradient(135deg, #082f49 0%, #0284c7 55%, #38bdf8 100%)',
	ember: 'linear-gradient(135deg, #3b0764 0%, #db2777 55%, #fb7185 100%)',
	forest: 'linear-gradient(135deg, #052e16 0%, #16a34a 55%, #86efac 100%)',
	slate: 'linear-gradient(135deg, #18181b 0%, #3f3f46 60%, #52525b 100%)',
	gold: 'linear-gradient(135deg, #3a2c07 0%, #b8860b 55%, #f5d78a 100%)',
};

const cents = (dollars: number) => Math.round(dollars * 100);

interface CardSeed {
	id: string;
	entity_type: EntityCardModel['entity_type'];
	title: string;
	desc: string;
	tags: string[];
	rating: number;
	ratingCount: number;
	owner: string;
	accent: Accent;
	price?: number;
	priceUnit?: EntityCardModel['price_unit'];
	availability?: EntityCardModel['availability'];
	location?: string;
	memberCount?: number;
	subtitle?: string;
	timeline?: string;
}

function card(s: CardSeed): EntityCardModel {
	return {
		id: s.id,
		entity_type: s.entity_type,
		display_title: s.title,
		display_description: s.desc,
		tags: s.tags,
		rating_average: s.rating,
		rating_count: s.ratingCount,
		owner_name: s.owner,
		owner_handle: s.owner.toLowerCase().replace(/[^a-z0-9]+/g, ''),
		owner_avatar: null,
		banner: GRAD[s.accent] ?? GRAD.slate,
		accent: s.accent,
		price_cents: s.price != null ? cents(s.price) : null,
		price_unit: s.price != null ? (s.priceUnit ?? 'from') : null,
		availability: s.availability ?? null,
		location: s.location ?? null,
		scope: null,
		taxonomy: null,
		is_sponsored: false,
		subtitle: s.subtitle,
		timeline_note: s.timeline,
		member_count: s.memberCount,
	};
}

// #endregion

// #region Entity pools

/** Open projects a freelancer could join / a client owns. */
export const SEED_PROJECTS: EntityCardModel[] = [
	card({
		id: 'p-orbit',
		entity_type: 'project',
		title: 'Orbit — Fintech onboarding revamp',
		desc: 'Rebuild a KYC onboarding flow with a design-system-first pipeline. Two open stages.',
		tags: ['React', 'Design System', 'Fintech'],
		rating: 4.9,
		ratingCount: 32,
		owner: 'Northwind Labs',
		accent: 'mint',
		timeline: '2 open roles · 6 wks',
		subtitle: 'Pipeline · 4 stages',
	}),
	card({
		id: 'p-atlas',
		entity_type: 'project',
		title: 'Atlas — AI research dashboard',
		desc: 'Data-dense analytics surface with live model telemetry and forecast overlays.',
		tags: ['Data Viz', 'TypeScript', 'AI'],
		rating: 4.8,
		ratingCount: 21,
		owner: 'Vega Systems',
		accent: 'ocean',
		timeline: '3 open roles · 10 wks',
		subtitle: 'Pipeline · 5 stages',
	}),
	card({
		id: 'p-lumen',
		entity_type: 'project',
		title: 'Lumen — Brand & motion refresh',
		desc: 'End-to-end identity system with a motion language for launch.',
		tags: ['Branding', 'Motion', 'Figma'],
		rating: 5.0,
		ratingCount: 14,
		owner: 'Studio Kin',
		accent: 'violet',
		timeline: '1 open role · 4 wks',
		subtitle: 'One-off · 3 stages',
	}),
	card({
		id: 'p-harbor',
		entity_type: 'project',
		title: 'Harbor — Marketplace payments',
		desc: 'Escrow + split-payment rails for a two-sided marketplace.',
		tags: ['Payments', 'Node', 'Postgres'],
		rating: 4.7,
		ratingCount: 40,
		owner: 'Harbor Inc.',
		accent: 'forest',
		timeline: '2 open roles · 8 wks',
		subtitle: 'Pipeline · 6 stages',
	}),
	card({
		id: 'p-nova',
		entity_type: 'project',
		title: 'Nova — Mobile growth experiments',
		desc: 'Rapid A/B experiment framework for a consumer app at scale.',
		tags: ['Growth', 'Swift', 'Analytics'],
		rating: 4.6,
		ratingCount: 27,
		owner: 'Nova Mobile',
		accent: 'ember',
		timeline: '1 open role · 5 wks',
		subtitle: 'Session · 2 stages',
	}),
];

/** Premium services a client could buy / a freelancer offers. */
export const SEED_SERVICES: EntityCardModel[] = [
	card({
		id: 's-brand',
		entity_type: 'service',
		title: 'Signature brand identity system',
		desc: 'Logo, type, palette, and a living brand book delivered in 10 days.',
		tags: ['Branding', 'Design'],
		rating: 5.0,
		ratingCount: 88,
		owner: 'Mara Ellison',
		accent: 'violet',
		price: 2400,
		priceUnit: 'from',
		timeline: '10-day delivery',
	}),
	card({
		id: 's-webflow',
		entity_type: 'service',
		title: 'Conversion-first landing pages',
		desc: 'High-craft marketing pages engineered for launch velocity.',
		tags: ['Webflow', 'CRO'],
		rating: 4.9,
		ratingCount: 132,
		owner: 'Deacon Park',
		accent: 'mint',
		price: 1800,
		priceUnit: 'from',
		timeline: '7-day delivery',
	}),
	card({
		id: 's-motion',
		entity_type: 'service',
		title: 'Product launch motion reel',
		desc: 'A cinematic 30-second launch film with sound design.',
		tags: ['Motion', 'After Effects'],
		rating: 4.9,
		ratingCount: 54,
		owner: 'Isla Fenwick',
		accent: 'ember',
		price: 3200,
		priceUnit: 'from',
		timeline: '2-week delivery',
	}),
	card({
		id: 's-ai',
		entity_type: 'service',
		title: 'AI workflow automation sprint',
		desc: 'Ship an internal copilot over your data in a two-week sprint.',
		tags: ['AI', 'Automation', 'Python'],
		rating: 4.8,
		ratingCount: 41,
		owner: 'Kaito Mori',
		accent: 'ocean',
		price: 5600,
		priceUnit: 'from',
		timeline: '2-week sprint',
	}),
	card({
		id: 's-audit',
		entity_type: 'service',
		title: 'Frontend performance audit',
		desc: 'A forensic performance pass with a prioritised remediation plan.',
		tags: ['Performance', 'React'],
		rating: 5.0,
		ratingCount: 63,
		owner: 'Priya Nair',
		accent: 'forest',
		price: 900,
		priceUnit: 'from',
		timeline: '4-day delivery',
	}),
];

/** Top-rated independent talent (freelancer profiles). */
export const SEED_TALENT: EntityCardModel[] = [
	card({
		id: 't-mara',
		entity_type: 'person',
		title: 'Mara Ellison',
		desc: 'Brand designer crafting identity systems for ambitious founders.',
		tags: ['Branding', 'Art Direction'],
		rating: 5.0,
		ratingCount: 88,
		owner: 'Mara Ellison',
		accent: 'violet',
		availability: 'available',
		location: 'Lisbon',
		subtitle: 'Brand Designer',
	}),
	card({
		id: 't-kaito',
		entity_type: 'person',
		title: 'Kaito Mori',
		desc: 'AI engineer shipping production copilots and RAG pipelines.',
		tags: ['AI', 'TypeScript', 'Python'],
		rating: 4.9,
		ratingCount: 57,
		owner: 'Kaito Mori',
		accent: 'ocean',
		availability: 'busy',
		location: 'Tokyo',
		subtitle: 'AI Engineer',
	}),
	card({
		id: 't-priya',
		entity_type: 'person',
		title: 'Priya Nair',
		desc: 'Performance-obsessed frontend engineer for high-scale apps.',
		tags: ['React', 'Performance'],
		rating: 5.0,
		ratingCount: 63,
		owner: 'Priya Nair',
		accent: 'forest',
		availability: 'available',
		location: 'Bangalore',
		subtitle: 'Frontend Engineer',
	}),
	card({
		id: 't-deacon',
		entity_type: 'person',
		title: 'Deacon Park',
		desc: 'Conversion designer turning traffic into revenue.',
		tags: ['CRO', 'Webflow'],
		rating: 4.9,
		ratingCount: 132,
		owner: 'Deacon Park',
		accent: 'mint',
		availability: 'available',
		location: 'Austin',
		subtitle: 'Conversion Designer',
	}),
	card({
		id: 't-isla',
		entity_type: 'person',
		title: 'Isla Fenwick',
		desc: 'Motion director for launch films and product reels.',
		tags: ['Motion', 'Sound'],
		rating: 4.9,
		ratingCount: 54,
		owner: 'Isla Fenwick',
		accent: 'ember',
		availability: 'unavailable',
		location: 'London',
		subtitle: 'Motion Director',
	}),
];

/** Collaborative teams gaining momentum. */
export const SEED_TEAMS: EntityCardModel[] = [
	card({
		id: 'tm-kin',
		entity_type: 'team',
		title: 'Studio Kin',
		desc: 'A five-person brand & product studio for venture-backed launches.',
		tags: ['Branding', 'Product'],
		rating: 5.0,
		ratingCount: 24,
		owner: 'Studio Kin',
		accent: 'violet',
		memberCount: 5,
		subtitle: 'Design Studio',
	}),
	card({
		id: 'tm-vega',
		entity_type: 'team',
		title: 'Vega Systems',
		desc: 'Data & AI collective building analytics products end-to-end.',
		tags: ['Data', 'AI'],
		rating: 4.8,
		ratingCount: 18,
		owner: 'Vega Systems',
		accent: 'ocean',
		memberCount: 7,
		subtitle: 'Data Collective',
	}),
	card({
		id: 'tm-harbor',
		entity_type: 'team',
		title: 'Harbor Guild',
		desc: 'Payments & marketplace engineers shipping resilient rails.',
		tags: ['Payments', 'Backend'],
		rating: 4.7,
		ratingCount: 31,
		owner: 'Harbor Guild',
		accent: 'forest',
		memberCount: 6,
		subtitle: 'Engineering Guild',
	}),
	card({
		id: 'tm-north',
		entity_type: 'team',
		title: 'Northwind Labs',
		desc: 'Fintech product team with a design-system-first practice.',
		tags: ['Fintech', 'Design System'],
		rating: 4.9,
		ratingCount: 22,
		owner: 'Northwind Labs',
		accent: 'mint',
		memberCount: 9,
		subtitle: 'Product Team',
	}),
];

// #endregion

// #region Sponsored + text seeds (kind/id assigned by the rule engine)

export interface SponsoredSeed {
	label: string;
	title: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
	sponsorName: string;
	accent: FeedAccent;
	media: string;
}

export const SPONSORED_POOL: SponsoredSeed[] = [
	{
		label: 'Sponsored',
		title: 'Ship invoices in minutes, not weeks',
		body: 'Ledger-grade billing built for independent studios and teams.',
		ctaLabel: 'Explore Ledger',
		ctaHref: '/wallet',
		sponsorName: 'Ledger',
		accent: 'teal',
		media: GRAD.gold,
	},
	{
		label: 'Partner',
		title: 'The obsidian keyboard, reimagined',
		body: 'A machined desk companion for people who make things.',
		ctaLabel: 'Discover',
		ctaHref: '/explore',
		sponsorName: 'Monolith',
		accent: 'violet',
		media: GRAD.slate,
	},
	{
		label: 'Sponsored',
		title: 'Cloud that scales with your craft',
		body: 'Deploy studio projects on infrastructure that never blinks.',
		ctaLabel: 'Start free',
		ctaHref: '/explore',
		sponsorName: 'Aether Cloud',
		accent: 'ocean',
		media: GRAD.ocean,
	},
];

export interface TextSeed {
	tone: 'insight' | 'quote' | 'prompt' | 'milestone';
	eyebrow: string;
	title: string;
	body?: string;
	author?: { name: string; handle?: string };
	ctaLabel?: string;
	ctaHref?: string;
	accent?: FeedAccent;
}

export const TEXT_POOL_FREELANCER: TextSeed[] = [
	{
		tone: 'insight',
		eyebrow: 'Insight',
		title: 'Freelancers who reply within an hour win 3× more work',
		body: 'Response time is the single strongest signal in how we rank talent.',
		accent: 'mint',
	},
	{
		tone: 'prompt',
		eyebrow: 'For you',
		title: 'Two projects match your React and design-system skills',
		body: 'Open roles are refreshed daily — apply while they’re warm.',
		ctaLabel: 'See matching roles',
		ctaHref: '/explore?type=project',
		accent: 'teal',
	},
	{
		tone: 'quote',
		eyebrow: 'From the community',
		title: '“A tight portfolio beat a long CV every single time.”',
		author: { name: 'Mara Ellison', handle: 'maraellison' },
		accent: 'violet',
	},
];

export const TEXT_POOL_CLIENT: TextSeed[] = [
	{
		tone: 'insight',
		eyebrow: 'Insight',
		title: 'Briefs with a clear scope get 40% more proposals',
		body: 'The best clients define the first stage, not the whole roadmap.',
		accent: 'mint',
	},
	{
		tone: 'prompt',
		eyebrow: 'For you',
		title: 'Ready to start something? Post your first project',
		body: 'Describe the outcome and let ranked talent come to you.',
		ctaLabel: 'Start a project',
		ctaHref: '/projects/new',
		accent: 'teal',
	},
	{
		tone: 'quote',
		eyebrow: 'From the community',
		title: '“We staffed a full launch team in Projective in two days.”',
		author: { name: 'Northwind Labs', handle: 'northwindlabs' },
		accent: 'violet',
	},
];

// #endregion

// #region Insights + highlights seeds

/** A future ISO datetime `hoursAhead` from now (deadlines are relative to load). */
function inHours(hoursAhead: number): string {
	return new Date(Date.now() + hoursAhead * 3600_000).toISOString();
}

export function personaInsights(persona: Persona): HomeInsights {
	if (persona === 'freelancer') {
		return {
			headline: 'Your week at a glance',
			visibilityPercent: 72,
			visibilityLabel: 'Profile visibility',
			metrics: [
				{
					key: 'views',
					label: 'Profile views',
					value: '318',
					delta: 18,
					spark: [4, 6, 5, 9, 8, 12, 14],
				},
				{
					key: 'interest',
					label: 'New interest',
					value: '24',
					delta: 9,
					spark: [1, 2, 2, 4, 3, 5, 7],
				},
				{ key: 'response', label: 'Avg. response', value: '42m', delta: -12 },
			],
			cashLabel: 'Earnings · last 8 weeks',
			cashCurrency: 'USD',
			cashSeries: [
				{ t: '2026-05-18', value_cents: cents(1200) },
				{ t: '2026-05-25', value_cents: cents(1650) },
				{ t: '2026-06-01', value_cents: cents(1400) },
				{ t: '2026-06-08', value_cents: cents(2100) },
				{ t: '2026-06-15', value_cents: cents(2600) },
				{ t: '2026-06-22', value_cents: cents(2300) },
				{ t: '2026-06-29', value_cents: cents(3100) },
				{ t: '2026-07-06', value_cents: cents(3550) },
			],
		};
	}
	return {
		headline: 'Your week at a glance',
		visibilityPercent: 64,
		visibilityLabel: 'Hiring reach',
		metrics: [
			{
				key: 'proposals',
				label: 'New proposals',
				value: '46',
				delta: 22,
				spark: [3, 5, 4, 8, 9, 11, 12],
			},
			{
				key: 'shortlist',
				label: 'Shortlisted',
				value: '11',
				delta: 6,
				spark: [1, 1, 2, 3, 3, 4, 5],
			},
			{ key: 'active', label: 'Active projects', value: '3', delta: 0 },
		],
		cashLabel: 'Spend · last 8 weeks',
		cashCurrency: 'USD',
		cashSeries: [
			{ t: '2026-05-18', value_cents: cents(3400) },
			{ t: '2026-05-25', value_cents: cents(2800) },
			{ t: '2026-06-01', value_cents: cents(3900) },
			{ t: '2026-06-08', value_cents: cents(3200) },
			{ t: '2026-06-15', value_cents: cents(4600) },
			{ t: '2026-06-22', value_cents: cents(4100) },
			{ t: '2026-06-29', value_cents: cents(5200) },
			{ t: '2026-07-06', value_cents: cents(4800) },
		],
	};
}

export function personaHighlights(persona: Persona): HomeHighlight[] {
	if (persona === 'freelancer') {
		return [
			{
				id: 'h-deadline',
				kind: 'deadline',
				title: 'Lumen — motion cut due',
				meta: 'Stage 2 · Studio Kin',
				href: '/projects',
				deadlineIso: inHours(29),
				accent: 'amber',
			},
			{
				id: 'h-inbox',
				kind: 'inbox',
				title: 'Northwind Labs replied to your proposal',
				meta: 'Messages',
				href: '/messages',
				accent: 'mint',
			},
			{
				id: 'h-update',
				kind: 'update',
				title: 'You ranked in the top 5% for “React” this week',
				meta: 'Discovery',
				accent: 'violet',
			},
			{
				id: 'h-milestone',
				kind: 'milestone',
				title: 'Escrow released — $3,200 cleared to your wallet',
				meta: 'Wallet',
				href: '/wallet',
				accent: 'forest',
			},
		];
	}
	return [
		{
			id: 'h-deadline',
			kind: 'deadline',
			title: 'Atlas — shortlist review closes',
			meta: '3 finalists awaiting your call',
			href: '/projects',
			deadlineIso: inHours(21),
			accent: 'amber',
		},
		{
			id: 'h-inbox',
			kind: 'inbox',
			title: 'Priya Nair accepted your interview',
			meta: 'Messages',
			href: '/messages',
			accent: 'mint',
		},
		{
			id: 'h-update',
			kind: 'update',
			title: '12 new proposals on “Orbit onboarding revamp”',
			meta: 'Projects',
			href: '/projects',
			accent: 'ocean',
		},
		{
			id: 'h-milestone',
			kind: 'milestone',
			title: 'Stage 1 funded — Harbor payments kicked off',
			meta: 'Wallet',
			href: '/wallet',
			accent: 'forest',
		},
	];
}

// #endregion
