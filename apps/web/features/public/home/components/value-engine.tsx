import { IconLock, IconRosetteDiscountCheck, IconScale } from '@tabler/icons-preact';

/**
 * @component ValueEngine
 * @description The "what Projective is" statement + the three pillars of its high-integrity
 * ecosystem: staged escrow, verified reputation, and built-in dispute fairness. Static partial.
 */

const PILLARS = [
	{
		key: 'mint',
		icon: <IconLock size={22} />,
		title: 'Staged escrow',
		body:
			'Fund one milestone at a time. Money is held safely and released only when a stage is reviewed and approved — never paid blindly upfront.',
	},
	{
		key: 'violet',
		icon: <IconRosetteDiscountCheck size={22} />,
		title: 'Verified reputation',
		body:
			'Ratings are earned from completed, escrow-backed work — not vanity metrics. Signal is real, so the best talent rises and stays.',
	},
	{
		key: 'amber',
		icon: <IconScale size={22} />,
		title: 'Fair by design',
		body:
			'Every stage is reviewable and every dispute has a structured resolution path that protects clients and freelancers alike.',
	},
];

export default function ValueEngine() {
	return (
		<section class='home-section home-value reveal' id='value'>
			<div class='home-shell'>
				<div class='home-value__intro'>
					<h2 class='home-value__statement'>
						A marketplace built on <em>proof</em>, not promises.
					</h2>
					<p class='home-value__intro-copy'>
						Traditional freelancing asks you to pay first and hope. Projective replaces hope with a
						loop: scope the work into stages, fund each stage into escrow, review what ships, and
						release. Integrity is the product — and it compounds with every project.
					</p>
				</div>

				<div class='home-value__pillars'>
					{PILLARS.map((p) => (
						<article class={`home-value__pillar home-value__pillar--${p.key}`} key={p.title}>
							<span class='home-value__pillar-icon'>{p.icon}</span>
							<h3 class='home-value__pillar-title'>{p.title}</h3>
							<p class='home-value__pillar-body'>{p.body}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
