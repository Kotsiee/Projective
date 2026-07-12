/**
 * @file ProfileSetupCard.island.tsx
 * @description The home-page profile-setup tracker: a premium linear progress bar plus an action that
 * opens a checklist modal of the remaining steps, each deep-linking into the relevant profile-edit
 * section. Reads the completeness summary computed once by `getMe` (the same numbers the nav dropdown
 * and profile rail show). Only the modal open-state is client state.
 */

import { useSignal } from '@preact/signals';
import type { ProfileSetupSummary } from '@projective/types';
import { Button, Modal, ProgressMeter } from '@projective/ui';
import {
	IconArrowRight,
	IconCircle,
	IconCircleCheckFilled,
	IconSparkles,
} from '@tabler/icons-preact';

interface ProfileSetupCardProps {
	setup: ProfileSetupSummary;
}

export default function ProfileSetupCard({ setup }: ProfileSetupCardProps) {
	const open = useSignal(false);
	const remaining = Math.max(0, setup.total - setup.completed);
	const complete = setup.percent >= 100;

	return (
		<section class='home-setup'>
			<div class='home-setup__row'>
				<div class='home-setup__meta'>
					<span class='home-setup__eyebrow'>
						<IconSparkles size={14} stroke={2} />
						Profile setup
					</span>
					<h3 class='home-setup__title'>
						{complete ? 'Your profile shines' : 'Finish your profile'}
					</h3>
					<p class='home-setup__sub'>
						{remaining > 0
							? `${remaining} step${remaining > 1 ? 's' : ''} to a standout profile`
							: 'Every step complete — you’re all set.'}
					</p>
				</div>
				{!complete && (
					<Button
						variant='premium'
						rounded
						endIcon={<IconArrowRight size={16} stroke={2} />}
						onClick={() => (open.value = true)}
					>
						Complete profile
					</Button>
				)}
			</div>

			<ProgressMeter
				value={setup.percent}
				tone='teal'
				label='Completeness'
				showValue
				milestone={setup.milestone}
			/>

			<Modal
				isOpen={open.value}
				onClose={() => (open.value = false)}
				title='Complete your profile'
				width={480}
			>
				<div class='home-setup__modal'>
					<div class='home-setup__modal-head'>
						<ProgressMeter variant='radial' value={setup.percent} size={68} tone='teal' />
						<div>
							<strong class='home-setup__modal-count'>
								{setup.completed} of {setup.total} done
							</strong>
							<p class='home-setup__modal-hint'>
								A complete profile earns more trust and better recommendations.
							</p>
						</div>
					</div>

					<ul class='home-setup__checklist'>
						{setup.steps.map((step) => (
							<li
								key={step.key}
								class={`home-setup__item ${step.done ? 'is-done' : ''}`}
							>
								<span class='home-setup__item-icon' aria-hidden='true'>
									{step.done
										? <IconCircleCheckFilled size={20} />
										: <IconCircle size={20} stroke={1.75} />}
								</span>
								<span class='home-setup__item-body'>
									<span class='home-setup__item-label'>{step.label}</span>
									<span class='home-setup__item-desc'>{step.description}</span>
								</span>
								{!step.done && (
									<a class='home-setup__item-link' href={step.href}>
										Add
										<IconArrowRight size={14} stroke={2} />
									</a>
								)}
							</li>
						))}
					</ul>
				</div>
			</Modal>
		</section>
	);
}
