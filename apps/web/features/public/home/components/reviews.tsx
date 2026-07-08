import { IconStarFilled } from '@tabler/icons-preact';
import { REVIEWS } from '../data/homeSeed.ts';
import SectionHeading from './section-heading.tsx';

/** First letter of up to the first two words → avatar monogram. */
function initials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase();
}

/**
 * @component Reviews
 * @description Grid of client testimonials on a CSS-columns masonry. Static partial.
 */
export default function Reviews() {
	return (
		<section class='home-section home-reviews reveal'>
			<div class='home-shell'>
				<SectionHeading
					eyebrow='Loved by both sides'
					title={
						<>
							What clients &amp; freelancers <em>say</em>
						</>
					}
					sub='Real outcomes from teams and makers who ship on Projective.'
				/>

				<div class='home-reviews__grid'>
					{REVIEWS.map((r) => (
						<article
							class={`home-review accent-${r.accent} ${r.featured ? 'home-review--featured' : ''}`}
							key={r.name}
						>
							<span class='home-review__stars' aria-label={`${r.rating} out of 5`}>
								{Array.from({ length: r.rating }).map((_, i) => (
									<IconStarFilled
										key={i}
										size={14}
									/>
								))}
							</span>
							<p class='home-review__quote'>“{r.quote}”</p>
							<div class='home-review__author'>
								<span class='home-review__avatar' aria-hidden='true'>{initials(r.name)}</span>
								<span>
									<span class='home-review__name'>{r.name}</span>
									<span class='home-review__role'>{r.role}</span>
								</span>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
