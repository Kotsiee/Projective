export interface RatingSegment {
	label: string; // e.g. 'As a Freelancer'
	rating: number; // 0..5
	reviewCount: number; // tally
	tone?: 'primary' | 'secondary' | 'success' | 'warning';
}

export interface RatingBreakdownChartProps {
	segments: RatingSegment[]; // typically 2 (dual), but render N
	max?: number; // default 5
	showValue?: boolean; // default true (numeric rating on the right)
	showReviewCount?: boolean; // default true ("128 reviews")
	className?: string;
}
