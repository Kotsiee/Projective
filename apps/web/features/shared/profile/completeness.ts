/**
 * @file completeness.ts
 * @description The single source of truth for "profile setup completeness". Every surface that
 * renders the tracker — the `/home` hero + checklist modal, the nav profile dropdown, and the
 * profile page side rail — computes its percentage and remaining-steps checklist through
 * `computeProfileSetup()`, so the three can never disagree.
 *
 * There is no completeness column in the database (see the onboarding schema); instead this derives
 * one from cheaply-available signals. `getMe` feeds it live `org.users_public` fields (widened
 * select — same row, near-zero cost); the frontend-mock profile page feeds it from its `ProfileData`.
 * Both paths normalise to `ProfileSetupInput`, so the weighting logic lives in exactly one place.
 */

import type { ProfileSetupStep, ProfileSetupSummary } from '@projective/types';

/** The normalised signals the weighting engine reads. Persona tailors which steps apply. */
export interface ProfileSetupInput {
	/** Handle used to build profile-edit deep-links. Null → links fall back to onboarding. */
	username: string | null;
	/** Freelancer personas get skill/service steps (and the public go-live milestone). */
	isFreelancer: boolean;
	/**
	 * Whether the hiring-oriented client tail (interests + first brief) also applies. Defaults to
	 * `!isFreelancer` so the two tails stay mutually exclusive as before. A client who has unlocked a
	 * freelancer profile ("Become a Partner") is BOTH — pass `true` alongside `isFreelancer` to carry
	 * the dual-state checklist, which recalculates completeness downward against the added freelancer
	 * tasks until they are filled in.
	 */
	isClient?: boolean;
	hasAvatar: boolean;
	hasHeadline: boolean;
	hasBio: boolean;
	hasSkills: boolean;
	hasLanguages: boolean;
	/** Count of published services (freelancer) — a non-zero value completes the "first service" step. */
	serviceCount: number;
	/** Count of projects the user is engaged in — completes the "first project" step. */
	projectCount: number;
}

interface WeightedStep {
	key: string;
	label: string;
	description: string;
	weight: number;
	done: boolean;
	/** `#section` anchor on the profile editor, or an absolute route override. */
	target: string;
	/**
	 * Baseline steps that gate the public "go-live" milestone — enough to make the profile public,
	 * sell services, and apply to workspaces. When every `public` step is done the milestone is reached.
	 */
	public?: boolean;
}

/** Build a profile-editor deep-link (`/@handle?edit=1#section`) or an onboarding fallback. */
function editHref(username: string | null, target: string): string {
	if (target.startsWith('/')) return target;
	if (!username) return '/join';
	return `/${encodeURIComponent(username)}?edit=1${target}`;
}

/**
 * Compute the completeness summary. `percent` is a whole number 0–100 with a baseline floor for
 * having created the account, and always reconciles to the weighted steps (a fully-done checklist
 * is exactly 100%). Steps are returned in the order they should be presented.
 */
export function computeProfileSetup(input: ProfileSetupInput): ProfileSetupSummary {
	// A client who unlocked a freelancer profile is both personas at once (dual-state); by default the
	// two tails stay mutually exclusive, matching the pre-conversion behaviour.
	const showClientTail = input.isClient ?? !input.isFreelancer;

	// `public` steps form the identity baseline that gates the go-live milestone.
	const steps: WeightedStep[] = [
		{
			key: 'account',
			label: 'Create your account',
			description: 'You’re in — your Projective account is live.',
			weight: 14,
			done: true,
			target: '#details',
			public: true,
		},
		{
			key: 'avatar',
			label: 'Add a profile photo',
			description: 'Put a face to your name so people recognise you.',
			weight: 12,
			done: input.hasAvatar,
			target: '#details',
			public: true,
		},
		{
			key: 'headline',
			label: 'Write a headline',
			description: 'One sharp line on what you do best.',
			weight: 13,
			done: input.hasHeadline,
			target: '#details',
			public: true,
		},
		{
			key: 'bio',
			label: 'Tell your story',
			description: 'A short bio builds trust before the first message.',
			weight: 13,
			done: input.hasBio,
			target: '#details',
			public: true,
		},
		{
			key: 'languages',
			label: 'List your languages',
			description: 'Show collaborators how you can communicate.',
			weight: 10,
			done: input.hasLanguages,
			target: '#details',
		},
	];

	if (input.isFreelancer) {
		steps.push(
			{
				key: 'skills',
				label: 'Add your skills',
				description: 'Skills power the recommendations that reach you.',
				weight: 14,
				done: input.hasSkills,
				target: '#details',
				public: true,
			},
			{
				key: 'service',
				label: 'Publish your first service',
				description: 'A live service is your storefront on the marketplace.',
				weight: 12,
				done: input.serviceCount > 0,
				target: '#services',
			},
			{
				key: 'project',
				label: 'Showcase a project',
				description: 'Portfolio work is the strongest proof of skill.',
				weight: 12,
				done: input.projectCount > 0,
				target: '#projects',
			},
		);
	}

	if (showClientTail) {
		steps.push(
			{
				key: 'interests',
				label: 'Add your interests',
				description: 'Interests sharpen the talent and services we surface.',
				weight: 14,
				done: input.hasSkills,
				target: '#details',
			},
			{
				// Distinct key from the freelancer "project" (portfolio) step so dual-state checklists
				// keep unique keys.
				key: 'brief',
				label: 'Start your first project',
				description: 'Post a brief and start receiving proposals.',
				weight: 24,
				done: input.projectCount > 0,
				target: '/projects/new',
			},
		);
	}

	const total = steps.reduce((sum, s) => sum + s.weight, 0);
	const doneWeight = steps.reduce((sum, s) => sum + (s.done ? s.weight : 0), 0);
	const percent = total === 0 ? 0 : Math.round((doneWeight / total) * 100);

	const out: ProfileSetupStep[] = steps.map((s) => ({
		key: s.key,
		label: s.label,
		description: s.description,
		done: s.done,
		href: editHref(input.username, s.target),
	}));

	// The public go-live milestone is a freelancer concept — the point at which a seller has enough
	// baseline data to publish, sell premium services, and apply to project workspaces. Its marker
	// sits at the cumulative weight of the baseline steps; it is "reached" once they are all done.
	const publicSteps = steps.filter((s) => s.public);
	const publicWeight = publicSteps.reduce((sum, s) => sum + s.weight, 0);
	const milestone = input.isFreelancer && total > 0
		? {
			percent: Math.round((publicWeight / total) * 100),
			reached: publicSteps.every((s) => s.done),
			label: 'Go-live',
			description:
				'Enough baseline to publish your profile, sell premium services, and apply to workspaces.',
		}
		: undefined;

	return {
		percent,
		completed: steps.filter((s) => s.done).length,
		total: steps.length,
		steps: out,
		milestone,
	};
}
