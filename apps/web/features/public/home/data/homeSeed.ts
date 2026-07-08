/**
 * @file homeSeed.ts
 * @description Frontend-only seed for the guest landing page — testimonials, headline stats, trust
 * logos, and the hero's rotating search terms. Entity showcases (services / projects / talent) reuse
 * the shared `exploreSeed` dataset so the home and Explore surfaces stay visually consistent. No
 * backend dependency: the landing renders richly and deterministically.
 */

import type { Accent } from '@projective/types';

/** Cinematic hero search — cycled by the SearchInput typewriter while idle. */
export const HERO_ROTATING: string[] = [
	'a full-stack SaaS build',
	'a brand identity system',
	'an investor pitch deck',
	'an AI automation engineer',
	'a launch film in 4 weeks',
];

/** Social-proof marquee. Text wordmarks — no external logo assets, instant paint. */
export const TRUST_LOGOS: string[] = [
	'Meridian',
	'Northwind',
	'Helios',
	'Vertex',
	'Bloom & Co',
	'Aurora',
	'Lumen',
	'Cascade',
	'Obsidian',
	'Fathom',
];

/** Headline metrics band. */
export interface HomeStat {
	value: string;
	label: string;
	sub: string;
}

export const HOME_STATS: HomeStat[] = [
	{ value: '$48M+', label: 'Escrowed & released', sub: 'Funds protected at every stage' },
	{ value: '12,400', label: 'Projects shipped', sub: 'Across 60+ countries' },
	{ value: '4.9/5', label: 'Average rating', sub: 'From 84,000+ reviews' },
	{ value: '98%', label: 'On-time delivery', sub: 'Stage deadlines met' },
];

/** Client testimonials for the reviews grid. */
export interface Review {
	quote: string;
	name: string;
	role: string;
	rating: number;
	accent: Accent;
	featured?: boolean;
}

export const REVIEWS: Review[] = [
	{
		quote:
			'The stage-based escrow changed how we hire. We fund one milestone, review the work, and release — no more paying upfront and hoping. It de-risked our entire contractor budget.',
		name: 'Elena Vasquez',
		role: 'Head of Product · Meridian',
		rating: 5,
		accent: 'mint',
		featured: true,
	},
	{
		quote:
			'I found a design squad, scoped four stages, and shipped a full rebrand in six weeks. Every handoff was reviewable. Best hiring experience I have had.',
		name: 'Marcus Cole',
		role: 'Founder · Bloom & Co',
		rating: 5,
		accent: 'violet',
	},
	{
		quote:
			'As a freelancer, getting paid was always the anxious part. Here the money is already escrowed before I start — I just do great work and release happens automatically.',
		name: 'Aria Okonkwo',
		role: 'Full-stack Engineer',
		rating: 5,
		accent: 'ocean',
	},
	{
		quote:
			'The dispute resolution is genuinely fair. One stage went sideways and the resolution flow protected both sides. That trust is why we keep coming back.',
		name: 'Priya Nair',
		role: 'Narrative Designer',
		rating: 5,
		accent: 'amber',
	},
	{
		quote:
			'We scaled from one contractor to a twelve-person pipeline without changing tools. The reputation signal is real — top talent actually shows up.',
		name: 'Devon Reyes',
		role: 'Growth Lead · Vertex',
		rating: 5,
		accent: 'ember',
	},
	{
		quote:
			'Reviewable stages mean no nasty surprises at the end. We catch course-corrections early and the final delivery is always what we expected.',
		name: 'Selene Vaughn',
		role: 'Creative Director · Helios',
		rating: 5,
		accent: 'forest',
	},
];
