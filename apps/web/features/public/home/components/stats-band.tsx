import { HOME_STATS } from '../data/homeSeed.ts';

/**
 * @component StatsBand
 * @description Headline platform metrics in oversized gradient numerals. Static partial.
 */
export default function StatsBand() {
	return (
		<section class='home-section home-stats reveal' aria-label='Platform metrics'>
			<div class='home-stats__glow' aria-hidden='true' />
			<div class='home-shell'>
				<div class='home-stats__grid'>
					{HOME_STATS.map((s) => (
						<div class='home-stat' key={s.label}>
							<div class='home-stat__value'>{s.value}</div>
							<div class='home-stat__label'>{s.label}</div>
							<div class='home-stat__sub'>{s.sub}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
