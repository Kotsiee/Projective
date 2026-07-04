/**
 * @file submissionsSeed.ts
 * @description Mock data backing the Submissions surface until the backend exists.
 * Mirrors the approach used by the packaged UploadFile library's seed.ts.
 */

import type {
	RevisionPolicy,
	StageFreelancer,
	StageTicket,
	Submission,
} from '../contracts/Submissions.ts';

export const SEED_FREELANCERS: StageFreelancer[] = [
	{ id: 'fl-ava', name: 'Ava Mercer', avatarUrl: null },
	{ id: 'fl-noah', name: 'Noah Bright', avatarUrl: null },
];

export const SEED_TICKETS: StageTicket[] = [
	{
		id: 'tk-hero',
		title: 'Hero illustration set',
		requiresFiles: true, // file-only
		checklist: [],
	},
	{
		id: 'tk-launch',
		title: 'Launch checklist sign-off',
		requiresFiles: false, // checklist-only
		checklist: [
			{ id: 'ck-copy', label: 'Marketing copy proofed', done: false },
			{ id: 'ck-links', label: 'All CTA links verified', done: false },
			{ id: 'ck-legal', label: 'Legal disclaimer added', done: false },
		],
	},
	{
		id: 'tk-brand',
		title: 'Brand kit delivery',
		requiresFiles: true, // hybrid
		checklist: [
			{ id: 'ck-logo', label: 'Logo exported (SVG + PNG)', done: false },
			{ id: 'ck-palette', label: 'Colour palette documented', done: false },
			{ id: 'ck-type', label: 'Type scale defined', done: false },
		],
	},
];

export const SEED_SUBMISSIONS: Submission[] = [
	{
		id: 'sub-1001',
		number: 1,
		title: 'New Submission #1',
		ticketId: 'tk-brand',
		description: '<p>First pass on the brand kit. Logo lockups and the core palette are in. ' +
			'Type scale still needs the display weight — flagged for the next round.</p>',
		files: [
			{
				id: 'sf-logo-svg',
				name: 'logo-primary.svg',
				url: 'https://placehold.co/600x400/1f2933/ffffff?text=logo.svg',
				mimeType: 'image/svg+xml',
				size: 24_500,
				directory: 'Logos',
			},
			{
				id: 'sf-logo-png',
				name: 'logo-primary@2x.png',
				url: 'https://placehold.co/600x400/1f2933/ffffff?text=logo.png',
				mimeType: 'image/png',
				size: 148_200,
				directory: 'Logos',
			},
			{
				id: 'sf-palette',
				name: 'palette.pdf',
				url: 'https://placehold.co/600x400/0e7490/ffffff?text=palette.pdf',
				mimeType: 'application/pdf',
				size: 512_000,
				directory: 'Documentation',
			},
		],
		checkedItemIds: ['ck-logo', 'ck-palette'],
		status: 'pending_review',
		submittedAt: '2026-06-28T14:20:00.000Z',
		authorId: 'fl-ava',
		authorName: 'Ava Mercer',
	},
	{
		id: 'sub-1002',
		number: 2,
		title: 'New Submission #2',
		ticketId: 'tk-hero',
		description: '<p>Hero illustration set — three compositions at final resolution.</p>',
		files: [
			{
				id: 'sf-hero-a',
				name: 'hero-composition-a.png',
				url: 'https://placehold.co/600x400/155e75/ffffff?text=hero-a',
				mimeType: 'image/png',
				size: 980_000,
			},
			{
				id: 'sf-hero-b',
				name: 'hero-composition-b.png',
				url: 'https://placehold.co/600x400/155e75/ffffff?text=hero-b',
				mimeType: 'image/png',
				size: 1_020_000,
			},
		],
		checkedItemIds: [],
		status: 'revisions_requested',
		submittedAt: '2026-06-22T09:05:00.000Z',
		authorId: 'fl-noah',
		authorName: 'Noah Bright',
		feedback: {
			global: 'Strong direction. Composition B is the winner — push the contrast a touch.',
			perFile: {
				'sf-hero-b': 'Bump the foreground contrast so the subject reads on mobile.',
			},
			createdAt: '2026-06-23T16:40:00.000Z',
		},
	},
];

export const SEED_REVISION_POLICY: RevisionPolicy = {
	freeRevisions: 2,
	usedRevisions: 1,
	perRevisionCents: 7_500,
	currency: 'USD',
};
