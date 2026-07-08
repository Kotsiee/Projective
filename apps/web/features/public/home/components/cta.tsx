import { Button } from '@projective/ui';
import { IconArrowRight, IconSparkles } from '@tabler/icons-preact';

/**
 * @component HomeCTA
 * @description Closing conversion panel driving to Join / Explore. Static partial — the premium
 * button styling + hover glow are CSS; native link navigation works without hydration.
 */
export default function HomeCTA() {
	return (
		<section class='home-cta reveal'>
			<div class='home-shell'>
				<div class='home-cta__panel'>
					<div class='home-cta__inner'>
						<span class='home-eyebrow'>
							<IconSparkles size={14} />
							Start in minutes
						</span>
						<h2 class='home-cta__title'>
							Ready to build something <em>exceptional</em>?
						</h2>
						<p class='home-cta__body'>
							Join thousands of clients and freelancers shipping stage by stage — with every
							milestone protected by escrow.
						</p>
						<div class='home-cta__actions'>
							<Button
								variant='premium'
								size='large'
								rounded
								href='/join'
								startIcon={<IconSparkles size={18} />}
							>
								Join Projective free
							</Button>
							<Button
								variant='secondary'
								size='large'
								rounded
								outlined
								href='/explore'
								endIcon={<IconArrowRight size={18} />}
							>
								Explore the marketplace
							</Button>
						</div>
						<p class='home-cta__note'>No subscription · Only pay for work you approve</p>
					</div>
				</div>
			</div>
		</section>
	);
}
