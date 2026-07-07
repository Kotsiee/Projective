/**
 * @file exploreSeed.ts
 * @description Frontend-only seed powering the Unified Explore & Discovery Engine. Mirrors the
 * established mock pattern used across the profile / workspace / submissions surfaces — there is no
 * backend dependency, so every discovery surface renders richly and deterministically. All records
 * conform to `@projective/types` `ExploreEntity`, and the helpers below implement the federated vs.
 * single-entity query semantics (recommended, per-type sections, related searches, filter + sort).
 */

import type {
	Availability,
	Category,
	EntityType,
	ExploreEntity,
	ExploreFilters,
	ExploreSort,
} from '@projective/types';

// #region 1. VISUAL PALETTE (gradient banners — load instantly, feel premium)

const GRADIENTS = {
	mint: 'linear-gradient(135deg, #0b3b34 0%, #10b981 55%, #34f5c5 100%)',
	violet: 'linear-gradient(135deg, #2a1b52 0%, #7c3aed 55%, #a78bfa 100%)',
	amber: 'linear-gradient(135deg, #43290a 0%, #f59e0b 55%, #fcd34d 100%)',
	dusk: 'linear-gradient(135deg, #0f172a 0%, #334155 50%, #64748b 100%)',
	ember: 'linear-gradient(135deg, #3b0764 0%, #db2777 55%, #fb7185 100%)',
	ocean: 'linear-gradient(135deg, #082f49 0%, #0284c7 55%, #38bdf8 100%)',
	forest: 'linear-gradient(135deg, #052e16 0%, #16a34a 55%, #86efac 100%)',
	slate: 'linear-gradient(135deg, #18181b 0%, #3f3f46 60%, #52525b 100%)',
} as const;

const cents = (dollars: number) => Math.round(dollars * 100);

// #endregion

// #region 2. HOME CATEGORY PILLS + RELATED SEARCHES

export const HOME_CATEGORIES: Category[] = [
	{ id: 'c-dev', name: 'Development', slug: 'development', icon: 'code', accent: 'mint' },
	{ id: 'c-design', name: 'Design', slug: 'design', icon: 'palette', accent: 'violet' },
	{ id: 'c-marketing', name: 'Marketing', slug: 'marketing', icon: 'speakerphone', accent: 'amber' },
	{ id: 'c-courses', name: 'Courses', slug: 'courses', icon: 'school', accent: 'primary' },
	{ id: 'c-video', name: 'Video & Motion', slug: 'video', icon: 'movie', accent: 'ember' },
	{ id: 'c-data', name: 'Data & AI', slug: 'data-ai', icon: 'brain', accent: 'ocean' },
	{ id: 'c-writing', name: 'Writing', slug: 'writing', icon: 'pencil', accent: 'neutral' },
	{ id: 'c-audio', name: 'Music & Audio', slug: 'audio', icon: 'music', accent: 'forest' },
];

const RELATED_BY_TERM: Record<string, string[]> = {
	default: [
		'React developers',
		'Brand identity',
		'Pitch deck design',
		'AI automation',
		'Motion graphics',
		'SaaS boilerplate',
		'Growth marketing',
	],
};

export function relatedSearches(query: string | null): string[] {
	const key = (query || '').trim().toLowerCase();
	return RELATED_BY_TERM[key] ?? RELATED_BY_TERM.default;
}

// #endregion

// #region 3. ENTITY BUILDER

interface Seed {
	id: string;
	entity_type: EntityType;
	title: string;
	description: string;
	owner_name: string;
	owner_handle: string;
	tags: string[];
	banner: keyof typeof GRADIENTS;
	accent: ExploreEntity['accent'];
	rating: number;
	reviews: number;
	sponsored?: boolean;
	featured?: number | null;
	taxonomy?: ExploreEntity['taxonomy'];
	price?: number | null;
	priceUnit?: ExploreEntity['price_unit'];
	availability?: Availability | null;
	location?: string | null;
	scope?: ExploreEntity['scope'];
}

const OWNER_TYPE: Record<EntityType, ExploreEntity['owner_type']> = {
	person: 'freelancer',
	team: 'team',
	business: 'business',
	service: 'freelancer',
	product: 'freelancer',
	project: 'business',
};

function build(s: Seed): ExploreEntity {
	return {
		id: s.id,
		entity_type: s.entity_type,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-06-01T00:00:00.000Z',
		rating_average: s.rating,
		rating_count: s.reviews,
		owner_id: `owner-${s.id}`,
		owner_type: OWNER_TYPE[s.entity_type],
		display_title: s.title,
		display_description: s.description,
		display_image: null,
		tags: s.tags,
		is_sponsored: s.sponsored ?? false,
		featured_rank: s.featured ?? null,
		taxonomy: s.taxonomy ?? null,
		owner_name: s.owner_name,
		owner_handle: s.owner_handle,
		owner_avatar: null,
		banner: GRADIENTS[s.banner],
		accent: s.accent,
		price_cents: s.price != null ? cents(s.price) : null,
		price_unit: s.priceUnit ?? (s.price != null ? 'from' : null),
		currency: 'USD',
		availability: s.availability ?? null,
		location: s.location ?? null,
		scope: s.scope ?? null,
	};
}

// #endregion

// #region 4. THE DATASET

const SERVICES: Seed[] = [
	{ id: 'svc-1', entity_type: 'service', title: 'Full-stack SaaS MVP in 4 weeks', description: 'End-to-end product build: auth, billing, dashboards, and a polished design system.', owner_name: 'Aria Okonkwo', owner_handle: 'ariabuilds', tags: ['React', 'Supabase', 'Stripe'], banner: 'mint', accent: 'mint', rating: 4.9, reviews: 214, sponsored: true, featured: 1, price: 6500, priceUnit: 'from', location: 'Lisbon, PT' },
	{ id: 'svc-2', entity_type: 'service', title: 'Conversion-focused brand identity', description: 'Logo, type system, and a full brand kit tuned for high-growth startups.', owner_name: 'Milo Fenwick', owner_handle: 'milodesigns', tags: ['Branding', 'Figma', 'Logo'], banner: 'violet', accent: 'violet', rating: 4.8, reviews: 178, price: 2400, priceUnit: 'fixed', location: 'Berlin, DE' },
	{ id: 'svc-3', entity_type: 'service', title: 'Investor-ready pitch deck', description: '12-slide narrative deck with financial models and a story that closes rounds.', owner_name: 'Priya Nair', owner_handle: 'priyadecks', tags: ['Pitch', 'Slides', 'Finance'], banner: 'amber', accent: 'amber', rating: 4.7, reviews: 96, price: 1800, priceUnit: 'from', location: 'Remote' },
	{ id: 'svc-4', entity_type: 'service', title: 'Technical SEO & growth audit', description: 'Full crawl, Core Web Vitals fixes, and a 90-day compounding growth roadmap.', owner_name: 'Devon Reyes', owner_handle: 'devongrowth', tags: ['SEO', 'Analytics', 'Growth'], banner: 'ocean', accent: 'ocean', rating: 4.6, reviews: 132, price: 1500, priceUnit: 'from', location: 'Austin, US' },
	{ id: 'svc-5', entity_type: 'service', title: 'Cinematic product launch video', description: '60-second hero film — script, 3D motion, sound design, and social cutdowns.', owner_name: 'Selene Vaughn', owner_handle: 'selenemotion', tags: ['Motion', 'After Effects', '3D'], banner: 'ember', accent: 'ember', rating: 4.9, reviews: 87, sponsored: true, price: 3200, priceUnit: 'from', location: 'London, UK' },
	{ id: 'svc-6', entity_type: 'service', title: 'AI agent & automation setup', description: 'Custom LLM workflows wired into your stack — retrieval, tools, and guardrails.', owner_name: 'Kenji Watari', owner_handle: 'kenjiml', tags: ['AI', 'LLM', 'Automation'], banner: 'forest', accent: 'mint', rating: 4.8, reviews: 64, price: 4200, priceUnit: 'from', location: 'Remote' },
];

const PRODUCTS: Seed[] = [
	{ id: 'prd-1', entity_type: 'product', title: 'Nebula UI — Design System Kit', description: '480+ Figma components with a matching React library.', owner_name: 'Studio Aurora', owner_handle: 'studioaurora', tags: ['UI Kit', 'Figma'], banner: 'violet', accent: 'violet', rating: 4.9, reviews: 1203, sponsored: true, price: 89, priceUnit: 'fixed' },
	{ id: 'prd-2', entity_type: 'product', title: 'SaaS Starter — Fresh + Supabase', description: 'Production boilerplate with auth, billing, and RBAC.', owner_name: 'Aria Okonkwo', owner_handle: 'ariabuilds', tags: ['Boilerplate', 'Deno'], banner: 'mint', accent: 'mint', rating: 4.8, reviews: 642, price: 129, priceUnit: 'fixed' },
	{ id: 'prd-3', entity_type: 'product', title: 'Lumen Icon Pack (2,400 icons)', description: 'Pixel-perfect stroke icons in SVG + font formats.', owner_name: 'Milo Fenwick', owner_handle: 'milodesigns', tags: ['Icons', 'SVG'], banner: 'amber', accent: 'amber', rating: 4.7, reviews: 388, price: 39, priceUnit: 'fixed' },
	{ id: 'prd-4', entity_type: 'product', title: 'Prompt Engineering Playbook', description: '220-page field guide with 150 production prompt patterns.', owner_name: 'Kenji Watari', owner_handle: 'kenjiml', tags: ['AI', 'Ebook'], banner: 'forest', accent: 'mint', rating: 4.6, reviews: 511, price: 29, priceUnit: 'fixed' },
	{ id: 'prd-5', entity_type: 'product', title: 'Motion Presets — Vol. 3', description: '120 drag-and-drop After Effects transitions.', owner_name: 'Selene Vaughn', owner_handle: 'selenemotion', tags: ['Motion', 'AE'], banner: 'ember', accent: 'ember', rating: 4.9, reviews: 274, price: 49, priceUnit: 'fixed' },
	{ id: 'prd-6', entity_type: 'product', title: 'Analytics Dashboard Template', description: 'Realtime charts, cohorts, and funnels — plug in your data.', owner_name: 'Devon Reyes', owner_handle: 'devongrowth', tags: ['Dashboard', 'Charts'], banner: 'ocean', accent: 'ocean', rating: 4.5, reviews: 197, price: 59, priceUnit: 'fixed' },
	{ id: 'prd-7', entity_type: 'product', title: 'Type Foundry — Grotesk Family', description: '9 weights with variable font + web licenses.', owner_name: 'Studio Aurora', owner_handle: 'studioaurora', tags: ['Fonts', 'Type'], banner: 'slate', accent: 'neutral', rating: 4.8, reviews: 156, price: 75, priceUnit: 'fixed' },
	{ id: 'prd-8', entity_type: 'product', title: 'Notion OS for Founders', description: 'A complete second-brain workspace for early teams.', owner_name: 'Priya Nair', owner_handle: 'priyadecks', tags: ['Notion', 'Template'], banner: 'dusk', accent: 'primary', rating: 4.4, reviews: 902, price: 45, priceUnit: 'fixed' },
];

const PROFILES: Seed[] = [
	{ id: 'per-1', entity_type: 'person', title: 'Aria Okonkwo', description: 'Senior full-stack engineer — ships production SaaS end-to-end.', owner_name: 'Aria Okonkwo', owner_handle: 'ariabuilds', tags: ['React', 'Deno', 'Postgres'], banner: 'mint', accent: 'mint', rating: 4.9, reviews: 214, taxonomy: 'solo', availability: 'available', price: 95, priceUnit: 'per_hour', location: 'Lisbon, PT' },
	{ id: 'team-1', entity_type: 'team', title: 'Northwind Collective', description: 'Product design squad for venture-backed startups.', owner_name: 'Northwind Collective', owner_handle: 'northwind', tags: ['Design', 'Product', 'Brand'], banner: 'violet', accent: 'violet', rating: 4.8, reviews: 156, sponsored: true, taxonomy: 'agency', availability: 'busy', price: 140, priceUnit: 'per_hour', location: 'Berlin, DE' },
	{ id: 'biz-1', entity_type: 'business', title: 'Helios Studios', description: 'Full-service motion & video production house.', owner_name: 'Helios Studios', owner_handle: 'heliostudios', tags: ['Video', 'Motion', '3D'], banner: 'ember', accent: 'ember', rating: 4.9, reviews: 302, taxonomy: 'business', availability: 'available', price: 180, priceUnit: 'per_hour', location: 'London, UK' },
	{ id: 'per-2', entity_type: 'person', title: 'Priya Nair', description: 'Pitch & narrative designer — helped raise $40M+ collectively.', owner_name: 'Priya Nair', owner_handle: 'priyadecks', tags: ['Pitch', 'Story', 'Slides'], banner: 'amber', accent: 'amber', rating: 4.7, reviews: 96, taxonomy: 'solo', availability: 'available', price: 85, priceUnit: 'per_hour', location: 'Remote' },
	{ id: 'per-3', entity_type: 'person', title: 'Kenji Watari', description: 'ML engineer specializing in LLM agents & retrieval systems.', owner_name: 'Kenji Watari', owner_handle: 'kenjiml', tags: ['AI', 'Python', 'RAG'], banner: 'forest', accent: 'mint', rating: 4.8, reviews: 64, taxonomy: 'solo', availability: 'busy', price: 120, priceUnit: 'per_hour', location: 'Remote' },
	{ id: 'team-2', entity_type: 'team', title: 'Studio Aurora', description: 'Design-systems studio crafting UI kits & type.', owner_name: 'Studio Aurora', owner_handle: 'studioaurora', tags: ['UI', 'Systems', 'Type'], banner: 'slate', accent: 'neutral', rating: 4.9, reviews: 1203, taxonomy: 'studio', availability: 'available', price: 110, priceUnit: 'per_hour', location: 'Amsterdam, NL' },
];

const PROJECTS: Seed[] = [
	{ id: 'prj-1', entity_type: 'project', title: 'Fintech mobile app — end-to-end build', description: 'Seeking a cross-functional squad to design and ship a regulated consumer fintech app across iOS & Android.', owner_name: 'Meridian Bank', owner_handle: 'meridian', tags: ['React Native', 'Fintech', 'Design', 'Security'], banner: 'ocean', accent: 'ocean', rating: 4.7, reviews: 12, sponsored: true, location: 'Remote (EU)', scope: { role_count: 5, stage_count: 6, duration_weeks: 20, budget_min_cents: cents(80000), budget_max_cents: cents(120000), format: 'pipeline' } },
	{ id: 'prj-2', entity_type: 'project', title: 'Rebrand + design system for D2C brand', description: 'Complete visual rebrand, packaging, and a scalable design system rollout across web and retail.', owner_name: 'Bloom & Co', owner_handle: 'bloomco', tags: ['Branding', 'Packaging', 'Design System'], banner: 'violet', accent: 'violet', rating: 4.6, reviews: 8, location: 'London, UK', scope: { role_count: 3, stage_count: 4, duration_weeks: 12, budget_min_cents: cents(35000), budget_max_cents: cents(55000), format: 'one_off' } },
	{ id: 'prj-3', entity_type: 'project', title: 'AI customer-support copilot', description: 'Build a retrieval-augmented support agent integrated with Zendesk and an internal knowledge base.', owner_name: 'Vertex SaaS', owner_handle: 'vertex', tags: ['AI', 'LLM', 'Integrations'], banner: 'mint', accent: 'mint', rating: 4.8, reviews: 5, location: 'Remote', scope: { role_count: 2, stage_count: 5, duration_weeks: 10, budget_min_cents: cents(40000), budget_max_cents: cents(70000), format: 'pipeline' } },
	{ id: 'prj-4', entity_type: 'project', title: 'Launch film + paid social campaign', description: 'Hero launch video plus a 6-week paid social sprint with weekly creative iterations.', owner_name: 'Helios Studios', owner_handle: 'heliostudios', tags: ['Video', 'Paid Social', 'Motion'], banner: 'ember', accent: 'ember', rating: 4.9, reviews: 9, location: 'Hybrid — LA', scope: { role_count: 4, stage_count: 3, duration_weeks: 8, budget_min_cents: cents(25000), budget_max_cents: cents(45000), format: 'session' } },
];

const ALL: ExploreEntity[] = [...SERVICES, ...PRODUCTS, ...PROFILES, ...PROJECTS].map(build);

// #endregion

// #region 5. QUERY HELPERS

/** Profile-family entity types collapse onto a single card foundation. */
const PROFILE_TYPES: EntityType[] = ['person', 'team', 'business'];

export function isProfileType(t: EntityType): boolean {
	return PROFILE_TYPES.includes(t);
}

export function allEntities(): ExploreEntity[] {
	return ALL;
}

export function byType(type: EntityType): ExploreEntity[] {
	if (isProfileType(type)) return ALL.filter((e) => isProfileType(e.entity_type));
	return ALL.filter((e) => e.entity_type === type);
}

/** Editorially featured/sponsored entities for cinematic + recommended carousels. */
export function recommended(): ExploreEntity[] {
	return [...ALL]
		.filter((e) => e.is_sponsored || e.featured_rank != null || e.rating_average >= 4.8)
		.sort((a, b) => (a.featured_rank ?? 99) - (b.featured_rank ?? 99) || b.rating_average - a.rating_average)
		.slice(0, 8);
}

export function trending(type: EntityType, limit = 8): ExploreEntity[] {
	return [...byType(type)].sort((a, b) => b.rating_count - a.rating_count).slice(0, limit);
}

/** The federated home/search section map (order matters — matches the spec hierarchy). */
export interface EntitySection {
	type: EntityType;
	title: string;
	layout: 'carousel' | 'grid' | 'masonry' | 'wide';
}

export const HOME_SECTIONS: EntitySection[] = [
	{ type: 'service', title: 'Popular Services', layout: 'carousel' },
	{ type: 'product', title: 'Trending Products', layout: 'masonry' },
	{ type: 'person', title: 'Top Talent & Teams', layout: 'grid' },
	{ type: 'project', title: 'Open Projects', layout: 'wide' },
];

export const SEARCH_SECTIONS: EntitySection[] = [
	{ type: 'service', title: 'Services', layout: 'grid' },
	{ type: 'person', title: 'Profiles', layout: 'grid' },
	{ type: 'product', title: 'Products', layout: 'masonry' },
	{ type: 'project', title: 'Projects', layout: 'wide' },
];

// #endregion

// #region 6. SEARCH / FILTER / SORT (single-entity semantics)

function matchesQuery(e: ExploreEntity, q: string): boolean {
	if (!q) return true;
	const hay = `${e.display_title} ${e.display_description ?? ''} ${e.owner_name} ${e.tags.join(' ')}`
		.toLowerCase();
	return q.toLowerCase().split(/\s+/).every((tok) => hay.includes(tok));
}

function passesFilters(e: ExploreEntity, f: ExploreFilters): boolean {
	if (f.min_rating > 0 && e.rating_average < f.min_rating) return false;
	if (f.availability && e.availability !== f.availability) return false;
	if (e.price_cents != null) {
		if (e.price_cents < f.budget_min_cents || e.price_cents > f.budget_max_cents) return false;
	}
	return true;
}

const SORTERS: Record<ExploreSort, (a: ExploreEntity, b: ExploreEntity) => number> = {
	recommended: (a, b) =>
		Number(b.is_sponsored) - Number(a.is_sponsored) || b.rating_average - a.rating_average,
	rating: (a, b) => b.rating_average - a.rating_average,
	recent: (a, b) => (a.id < b.id ? 1 : -1),
	price: (a, b) => (a.price_cents ?? Infinity) - (b.price_cents ?? Infinity),
	popularity: (a, b) => b.rating_count - a.rating_count,
};

/**
 * Single-entity query. Sorting + filtering only take effect here — the federated view calls
 * `byType` directly and never passes filters, enforcing the discovery guardrail at the data layer.
 */
export function search(
	type: EntityType,
	query: string | null,
	filters: ExploreFilters,
	sort: ExploreSort,
): ExploreEntity[] {
	const q = (query || '').trim();
	return byType(type)
		.filter((e) => matchesQuery(e, q) && passesFilters(e, filters))
		.sort(SORTERS[sort] ?? SORTERS.recommended);
}

export function byId(id: string): ExploreEntity | undefined {
	return ALL.find((e) => e.id === id);
}

// #endregion
