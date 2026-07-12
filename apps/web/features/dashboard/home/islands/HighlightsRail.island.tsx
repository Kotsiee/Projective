/**
 * @file HighlightsRail.island.tsx
 * @description The floating highlights strip (feed column 3): critical real-time updates, a live
 * deadline countdown, and inbox/milestone snippets. It is an island only because the deadline
 * countdown ticks; every row is seeded via props. Rows deep-link into the relevant surface.
 */

import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { HomeHighlight } from '@projective/types';
import { IconActivity, IconAlarm, IconMail, IconTrophy } from '@tabler/icons-preact';

const KIND_ICON = {
	deadline: IconAlarm,
	update: IconActivity,
	inbox: IconMail,
	milestone: IconTrophy,
} as const;

/** A minute-ticking countdown to an ISO deadline. */
function Countdown({ iso }: { iso: string }) {
	const now = useSignal(Date.now());
	useEffect(() => {
		const t = setInterval(() => (now.value = Date.now()), 60_000);
		return () => clearInterval(t);
	}, []);

	const ms = new Date(iso).getTime() - now.value;
	if (ms <= 0) {
		return <span class='home-highlights__count is-due'>Due now</span>;
	}
	const mins = Math.floor(ms / 60_000);
	const d = Math.floor(mins / 1440);
	const h = Math.floor((mins % 1440) / 60);
	const m = mins % 60;
	const label = d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`;
	const urgent = ms < 6 * 3600 * 1000;
	return <span class={`home-highlights__count ${urgent ? 'is-urgent' : ''}`}>{label}</span>;
}

function Row({ item }: { item: HomeHighlight }) {
	const Icon = KIND_ICON[item.kind];
	const inner = (
		<>
			<span
				class={`home-highlights__icon accent-${item.accent ?? 'primary'}`}
				aria-hidden='true'
			>
				<Icon size={16} stroke={1.9} />
			</span>
			<span class='home-highlights__body'>
				<span class='home-highlights__title'>{item.title}</span>
				<span class='home-highlights__meta'>
					{item.kind === 'deadline' && item.deadlineIso
						? <Countdown iso={item.deadlineIso} />
						: item.meta}
				</span>
			</span>
		</>
	);

	return item.href
		? <a class='home-highlights__row home-highlights__row--link' href={item.href}>{inner}</a>
		: <li class='home-highlights__row'>{inner}</li>;
}

export default function HighlightsRail({ highlights }: { highlights: HomeHighlight[] }) {
	if (!highlights.length) return null;
	return (
		<aside class='home-highlights'>
			<header class='home-highlights__head'>
				<span class='home-highlights__pulse' aria-hidden='true' />
				<h2 class='home-highlights__heading'>Highlights</h2>
			</header>
			<ul class='home-highlights__list'>
				{highlights.map((h) => <Row key={h.id} item={h} />)}
			</ul>
		</aside>
	);
}
