/**
 * @file ActionHub.tsx
 * @description The state-aware Action Hub — a persona-driven panel of high-conversion CTAs nudging the
 * user toward their next platform milestone. Every CTA is gated on a real DB signal from `getMe`
 * (owned/member businesses & teams, freelancer identity, active project count); once an action is
 * completed it is **permanently hidden** so the hub never nags a user who has already done it. When
 * every relevant action is done the hub renders nothing at all (no clutter).
 *
 * Server-rendered (no client state) and instant: each card's action uses the shared `Button`.
 */

import type { JSX } from 'preact';
import type { Persona } from '@projective/types';
import { Button } from '@projective/ui';
import {
	IconArrowRight,
	IconBriefcase,
	IconBuildingStore,
	IconRocket,
	IconUserPlus,
	IconUserSearch,
	IconUsersGroup,
} from '@tabler/icons-preact';

export interface ActionHubProps {
	persona: Persona;
	hasFreelancer: boolean;
	businessCount: number;
	teamCount: number;
	hasProjects: boolean;
}

interface Cta {
	key: string;
	title: string;
	body: string;
	ctaLabel: string;
	href: string;
	icon: JSX.Element;
	accent: string;
	/** Completed → the card is permanently hidden. */
	done: boolean;
}

function ctasFor(p: ActionHubProps): Cta[] {
	if (p.persona === 'client') {
		return [
			{
				key: 'start-project',
				title: 'Start your first project',
				body: 'Post a brief and let ranked talent come to you.',
				ctaLabel: 'Create a project',
				href: '/projects',
				icon: <IconRocket size={20} stroke={1.8} />,
				accent: 'gold',
				done: p.hasProjects,
			},
			{
				key: 'create-business',
				title: 'Create a business',
				body: 'Give your company a home to hire and manage work.',
				ctaLabel: 'New business',
				href: '/business',
				icon: <IconBuildingStore size={20} stroke={1.8} />,
				accent: 'violet',
				done: p.businessCount > 0,
			},
			{
				key: 'hire-talent',
				title: 'Hire top-tier talent',
				body: 'Browse ranked independent specialists ready to start.',
				ctaLabel: 'Explore talent',
				href: '/explore?type=freelancer',
				icon: <IconUserSearch size={20} stroke={1.8} />,
				accent: 'mint',
				done: false,
			},
		];
	}

	// Freelancer
	return [
		{
			key: 'find-workspace',
			title: 'Find a project workspace',
			body: 'Join an open stage and start delivering today.',
			ctaLabel: 'Find work',
			href: '/explore?type=project',
			icon: <IconBriefcase size={20} stroke={1.8} />,
			accent: 'gold',
			done: p.hasProjects,
		},
		{
			key: 'create-team',
			title: 'Create a team',
			body: 'Assemble a crew and take on bigger projects together.',
			ctaLabel: 'New team',
			href: '/teams',
			icon: <IconUsersGroup size={20} stroke={1.8} />,
			accent: 'violet',
			done: p.teamCount > 0,
		},
		{
			key: 'join-team',
			title: 'Join an active team',
			body: 'Team up with collectives hiring collaborators now.',
			ctaLabel: 'Browse teams',
			href: '/explore?type=team',
			icon: <IconUserPlus size={20} stroke={1.8} />,
			accent: 'mint',
			done: p.teamCount > 0,
		},
	];
}

export function ActionHub(props: ActionHubProps) {
	const visible = ctasFor(props).filter((c) => !c.done);
	if (!visible.length) return null;

	return (
		<section class='home-actions'>
			<header class='home-actions__head'>
				<span class='home-actions__eyebrow'>Recommended next steps</span>
				<h2 class='home-actions__title'>
					{props.persona === 'client' ? 'Get your work moving' : 'Grow your practice'}
				</h2>
			</header>

			<div class='home-actions__grid'>
				{visible.map((c, i) => (
					<article key={c.key} class={`home-actions__card accent-${c.accent}`}>
						<span class='home-actions__icon' aria-hidden='true'>{c.icon}</span>
						<div class='home-actions__body'>
							<h3 class='home-actions__card-title'>{c.title}</h3>
							<p class='home-actions__card-text'>{c.body}</p>
						</div>
						<Button
							variant={i === 0 ? 'premium' : 'secondary'}
							outlined={i !== 0}
							rounded
							href={c.href}
							className='home-actions__cta'
							endIcon={<IconArrowRight size={15} stroke={2} />}
						>
							{c.ctaLabel}
						</Button>
					</article>
				))}
			</div>
		</section>
	);
}

export default ActionHub;
