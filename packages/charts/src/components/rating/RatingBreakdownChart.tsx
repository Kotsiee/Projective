import '../../styles/rating/rating-breakdown.css';
import { IconStar } from '@tabler/icons-preact';
import type { RatingBreakdownChartProps, RatingSegment } from '../../types/rating.ts';

/**
 * The default tone alternates primary/secondary so the "dual" bars (e.g. Client vs
 * Freelancer) read as visually distinct even when no tone is supplied.
 */
const DEFAULT_TONES: NonNullable<RatingSegment['tone']>[] = ['primary', 'secondary'];

/**
 * Horizontal dual-bar chart visualizing segmented rating breakdowns — each segment renders
 * a labeled row with a track, a tone-coloured fill (width = rating / max), the numeric
 * rating and its review-count tally. Pure presentational (CSS bars, no canvas).
 */
export function RatingBreakdownChart({
	segments,
	max = 5,
	showValue = true,
	showReviewCount = true,
	className,
}: RatingBreakdownChartProps) {
	return (
		<div class={`rating-breakdown${className ? ` ${className}` : ''}`}>
			{segments.map((segment, index) => {
				const tone = segment.tone ?? DEFAULT_TONES[index % DEFAULT_TONES.length];
				const ratio = max > 0 ? Math.min(Math.max(segment.rating / max, 0), 1) : 0;

				return (
					<div class='rating-breakdown__row' key={segment.label}>
						<div class='rating-breakdown__head'>
							<span class='rating-breakdown__label'>{segment.label}</span>
							{showValue && (
								<span class='rating-breakdown__value'>
									<IconStar
										class='rating-breakdown__star'
										size={14}
										stroke={2}
									/>
									{segment.rating.toFixed(1)}
								</span>
							)}
						</div>

						<div class='rating-breakdown__track'>
							<div
								class={`rating-breakdown__fill rating-breakdown__fill--${tone}`}
								style={{ width: `${ratio * 100}%` }}
							/>
						</div>

						{showReviewCount && (
							<span class='rating-breakdown__count'>
								{segment.reviewCount} {segment.reviewCount === 1 ? 'review' : 'reviews'}
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
