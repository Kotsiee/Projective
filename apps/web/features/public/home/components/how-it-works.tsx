import { IconCircleCheck, IconEdit, IconShieldLock, IconTruckDelivery } from '@tabler/icons-preact';
import SectionHeading from './section-heading.tsx';

/**
 * @component HowItWorks
 * @description The escrow / stage loop as four connected steps. Static partial.
 */

const STEPS = [
	{
		icon: <IconEdit size={20} />,
		title: 'Scope in stages',
		body:
			'Break the work into clear milestones with deliverables, timelines, and budgets everyone agrees on.',
	},
	{
		icon: <IconShieldLock size={20} />,
		title: 'Fund into escrow',
		body:
			'Deposit a single stage. Funds are protected — visible to the freelancer, released by no one but the flow.',
	},
	{
		icon: <IconTruckDelivery size={20} />,
		title: 'Ship & review',
		body:
			'Work is delivered against the stage. You review, request changes, or approve — no end-of-project surprises.',
	},
	{
		icon: <IconCircleCheck size={20} />,
		title: 'Release & rate',
		body:
			'Approval releases the escrow instantly and mints a verified rating. Then roll straight into the next stage.',
	},
];

export default function HowItWorks() {
	return (
		<section class='home-section home-how reveal'>
			<div class='home-shell'>
				<SectionHeading
					eyebrow='The loop'
					title={
						<>
							How the <em>escrow stage loop</em> works
						</>
					}
					sub='One dependable rhythm from first brief to final release.'
				/>

				<ol class='home-how__steps'>
					{STEPS.map((s, i) => (
						<li class='home-how__step' key={s.title}>
							<span class='home-how__num'>{i + 1}</span>
							<span class='home-how__step-icon'>{s.icon}</span>
							<h3 class='home-how__step-title'>{s.title}</h3>
							<p class='home-how__step-body'>{s.body}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
