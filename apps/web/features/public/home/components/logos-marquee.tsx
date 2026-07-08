import { TRUST_LOGOS } from '../data/homeSeed.ts';

/**
 * @component LogosMarquee
 * @description Social-proof wordmark ribbon. Static + server-rendered; the infinite scroll is pure
 * CSS. The list is duplicated so the -50% translate loops seamlessly.
 */
export default function LogosMarquee() {
	const loop = [...TRUST_LOGOS, ...TRUST_LOGOS];
	return (
		<section class='home-marquee home-section--tight' aria-label='Trusted by'>
			<span class='home-marquee__label'>Trusted by fast-moving teams worldwide</span>
			<div class='home-marquee__track'>
				{loop.map((name, i) => (
					<span
						class='home-marquee__item'
						key={`${name}-${i}`}
						aria-hidden={i >= TRUST_LOGOS.length}
					>
						{name}
					</span>
				))}
			</div>
		</section>
	);
}
