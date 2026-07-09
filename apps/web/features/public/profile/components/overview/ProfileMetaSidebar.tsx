/**
 * @file ProfileMetaSidebar.tsx
 * @description The right-hand details pane. No structural "Details" heading.
 * The current availability status + local time anchor the very top; the
 * remaining meta (location, response time, rate, member since) and languages
 * (plain text + fluency) stack below. The freelancer/client ratings are premium
 * interactive buttons — the raw numeric score is hidden; clicking opens the
 * Reviews tab pre-filtered to that role.
 */

import {
	IconBolt,
	IconCalendarStats,
	IconChevronRight,
	IconClock,
	IconMapPin,
	IconStar,
	IconStarFilled,
	IconStarHalfFilled,
	IconUserStar,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ReviewsFilter } from '../../contexts/ProfileContext.tsx';
import { localTimeAtOffset } from '../../utils.ts';
import { StatusDot } from '../header/StatusDot.tsx';

/** Compact star row for a 0–5 score (halves supported); no numeric text. */
function StarRow({ score }: { score: number }) {
	return (
		<span class='pmeta-rating__stars' aria-hidden='true'>
			{Array.from({ length: 5 }, (_, i) => {
				const pos = i + 1;
				if (score >= pos) return <IconStarFilled key={i} size={14} />;
				if (score >= pos - 0.5) return <IconStarHalfFilled key={i} size={14} />;
				return <IconStar key={i} size={14} />;
			})}
		</span>
	);
}

function Row(
	{ icon, label, value }: { icon: preact.ComponentChildren; label: string; value: string },
) {
	return (
		<div class='pmeta-row'>
			<span class='pmeta-row__icon'>{icon}</span>
			<span class='pmeta-row__label'>{label}</span>
			<span class='pmeta-row__value'>{value}</span>
		</div>
	);
}

/** Premium interactive rating badge → deep-links into the Reviews tab. */
function RatingButton(
	{ icon, label, score, count, onOpen }: {
		icon: preact.ComponentChildren;
		label: string;
		score: number;
		count: number;
		onOpen: () => void;
	},
) {
	return (
		<button
			type='button'
			class='pmeta-rating'
			onClick={onOpen}
			aria-label={`${label} — view ${count} reviews`}
		>
			<span class='pmeta-rating__icon'>{icon}</span>
			<span class='pmeta-rating__id'>
				<span class='pmeta-rating__label'>{label}</span>
				<span class='pmeta-rating__reviews'>{count} reviews</span>
			</span>
			<StarRow score={score} />
			<IconChevronRight size={15} class='pmeta-rating__chevron' />
		</button>
	);
}

export default function ProfileMetaSidebar() {
	const { profile, openReviews } = useProfileContext();
	const m = profile.value.meta;
	const p = profile.value;
	const open = (role: ReviewsFilter) => openReviews(role);

	return (
		<aside class='pmeta'>
			{/* Top-prioritised: presence + local time */}
			<div class='pmeta-top'>
				<div class='pmeta-top__status'>
					<StatusDot status={p.status} />
					<span class='pmeta-top__status-label'>{p.statusLabel}</span>
				</div>
				<div class='pmeta-top__time'>
					<span class='pmeta-top__clock'>
						<IconClock size={14} /> {localTimeAtOffset(m.utcOffsetMinutes)}
					</span>
					<span class='pmeta-top__tz'>{m.timezoneLabel}</span>
				</div>
			</div>

			<div class='pmeta-divider' />

			<div class='pmeta-rows'>
				<Row icon={<IconMapPin size={15} />} label='Location' value={m.location} />
				<Row icon={<IconBolt size={15} />} label='Responds' value={m.responseTime} />
				<Row icon={<IconCalendarStats size={15} />} label='Member since' value={m.memberSince} />
			</div>

			<div class='pmeta-divider' />

			<div class='pmeta-ratings'>
				<RatingButton
					icon={<IconStarFilled size={15} />}
					label='As freelancer'
					score={m.ratings.asFreelancer.score}
					count={m.ratings.asFreelancer.count}
					onOpen={() => open('freelancer')}
				/>
				<RatingButton
					icon={<IconUserStar size={15} />}
					label='As client'
					score={m.ratings.asClient.score}
					count={m.ratings.asClient.count}
					onOpen={() => open('client')}
				/>
			</div>

			<div class='pmeta-divider' />

			<div class='pmeta-langs'>
				{m.languages.map((l) => (
					<div key={l.id} class='pmeta-lang'>
						<span class='pmeta-lang__name'>{l.name}</span>
						<span class='pmeta-lang__fluency'>{l.fluency}</span>
					</div>
				))}
			</div>
		</aside>
	);
}
