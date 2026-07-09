/**
 * @file ReviewsTab.tsx
 * @description The "Reviews" panel. Surfaces the profile's live review history, split by the role
 * the profile was rated in (as a freelancer vs. as a client). Opened either from the tab bar or by
 * clicking the freelancer/client rating badges in the meta sidebar — those badges deep-link here
 * via `openReviews(role)`, which pre-selects the matching filter.
 */

import '../../styles/components/reviews.css';

import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Avatar } from '@projective/ui';
import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ReviewItem, ReviewRole } from '../../contracts/Profile.ts';

type Filter = 'all' | ReviewRole;

/** Renders a 5-star row for a 0–5 rating (halves supported). */
function Stars({ rating }: { rating: number }) {
	return (
		<span class='rv-stars' aria-label={`${rating} out of 5`}>
			{Array.from({ length: 5 }, (_, i) => {
				const pos = i + 1;
				if (rating >= pos) return <IconStarFilled key={i} size={15} />;
				if (rating >= pos - 0.5) return <IconStarHalfFilled key={i} size={15} />;
				return <IconStar key={i} size={15} />;
			})}
		</span>
	);
}

function fmtDate(iso: string): string {
	const [y, m, d] = iso.split('-').map(Number);
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	return `${d} ${months[m - 1]} ${y}`;
}

function ReviewRow({ r }: { r: ReviewItem }) {
	return (
		<article class='rv-card'>
			<header class='rv-card__head'>
				<Avatar name={r.authorName} src={r.authorAvatarUrl} size={40} />
				<div class='rv-card__id'>
					<span class='rv-card__author'>{r.authorName}</span>
					<span class='rv-card__handle'>@{r.authorHandle}</span>
				</div>
				<div class='rv-card__meta'>
					<Stars rating={r.rating} />
					<span class='rv-card__date'>{fmtDate(r.date)}</span>
				</div>
			</header>
			<h3 class='rv-card__title'>{r.title}</h3>
			<p class='rv-card__body'>{r.body}</p>
			<footer class='rv-card__foot'>
				<span class={`rv-card__role rv-card__role--${r.role}`}>
					{r.role === 'freelancer' ? 'As freelancer' : 'As client'}
				</span>
				<span class='rv-card__context'>{r.context}</span>
			</footer>
		</article>
	);
}

export default function ReviewsTab() {
	const { profile, reviewsFilter } = useProfileContext();
	const reviews = profile.value.reviews;
	// The filter is shared state so the meta-sidebar badges can pre-select it.
	const filter = reviewsFilter;
	const local = useSignal<Filter>(filter.value);

	// Keep the local mirror in sync when the badges change the shared filter.
	useEffect(() => {
		local.value = filter.value;
	}, [filter.value]);

	const setFilter = (f: Filter) => {
		local.value = f;
		filter.value = f;
	};

	const freelancer = reviews.filter((r) => r.role === 'freelancer');
	const client = reviews.filter((r) => r.role === 'client');
	const shown = local.value === 'all' ? reviews : reviews.filter((r) => r.role === local.value);

	const avg = (list: ReviewItem[]) =>
		list.length ? (list.reduce((a, r) => a + r.rating, 0) / list.length) : 0;

	const FILTERS: { id: Filter; label: string; count: number }[] = [
		{ id: 'all', label: 'All reviews', count: reviews.length },
		{ id: 'freelancer', label: 'As freelancer', count: freelancer.length },
		{ id: 'client', label: 'As client', count: client.length },
	];

	return (
		<section class='rv'>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Reviews</h2>
					<p class='tab-head__sub'>
						{reviews.length} reviews · {avg(freelancer).toFixed(1)}★ as freelancer ·{' '}
						{avg(client).toFixed(1)}★ as client
					</p>
				</div>
			</header>

			{/* Filter chips — the Projects-sidebar pattern. */}
			<div class='profile-filters' role='tablist' aria-label='Filter reviews'>
				{FILTERS.map((f) => (
					<button
						key={f.id}
						type='button'
						role='tab'
						aria-selected={local.value === f.id}
						class={`profile-filter ${local.value === f.id ? 'profile-filter--active' : ''}`}
						onClick={() => setFilter(f.id)}
					>
						{f.label}
						<span class='profile-filter__count'>{f.count}</span>
					</button>
				))}
			</div>

			{shown.length === 0
				? <div class='tab-empty'>No reviews in this category yet.</div>
				: (
					<div class='rv-list'>
						{shown.map((r) => <ReviewRow key={r.id} r={r} />)}
					</div>
				)}
		</section>
	);
}
