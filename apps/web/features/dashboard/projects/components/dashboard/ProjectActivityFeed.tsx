/**
 * @file ProjectActivityFeed.tsx
 * @description The right-rail live activity stream. Backfills from `GET /api/v1/notifications`, then
 * subscribes to the SSE stream for real-time pushes. Every row is a deep link (`targetUrl`) to the
 * exact project sub-tab the event belongs to (redesign requirement §2) — a funded stage opens that
 * stage's Finance tab, a handover opens the project, etc. Re-hydrates silently across client nav.
 */

import { onNavigate } from '@projective/data';
import { Button } from '@projective/ui';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import {
	IconArrowsExchange,
	IconBell,
	IconCircleCheck,
	IconCircleX,
	IconCoin,
} from '@tabler/icons-preact';
import {
	type NotificationSummary,
	notificationTargetUrl,
} from '@features/navigation/contracts/notifications.ts';

type Tone = 'success' | 'danger' | 'violet' | 'neutral';
type TablerIcon = typeof IconBell;

const TYPE_GLYPH: Record<string, { icon: TablerIcon; tone: Tone }> = {
	stage_funded: { icon: IconCoin, tone: 'success' },
	stage_paid: { icon: IconCoin, tone: 'success' },
	stage_approved: { icon: IconCircleCheck, tone: 'success' },
	stage_cancelled: { icon: IconCircleX, tone: 'danger' },
	project_handover: { icon: IconArrowsExchange, tone: 'violet' },
};

function glyph(type: string): { icon: TablerIcon; tone: Tone } {
	return TYPE_GLYPH[type] ?? { icon: IconBell, tone: 'neutral' };
}

function timeAgo(iso: string): string {
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return '';
	const mins = Math.floor((Date.now() - then) / 60000);
	if (mins < 1) return 'now';
	if (mins < 60) return `${mins}m`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h`;
	return `${Math.floor(hrs / 24)}d`;
}

/** Client-side belt-and-braces: prefer the server's targetUrl, else compute from the pointer. */
function hrefFor(n: NotificationSummary): string {
	if (n.targetUrl) return n.targetUrl;
	return notificationTargetUrl({
		entityTable: n.entityTable,
		entityId: n.entityId,
		type: n.type,
		projectId: n.projectId,
	});
}

export function ProjectActivityFeed() {
	const items = useSignal<NotificationSummary[]>([]);
	const filter = useSignal<'all' | 'unread'>('all');
	const isLoading = useSignal(true);
	const error = useSignal<string | null>(null);

	const hydrate = async (opts?: { silent?: boolean }) => {
		if (!opts?.silent) isLoading.value = true;
		try {
			const res = await fetch('/api/v1/notifications');
			if (!res.ok) throw new Error(`Error ${res.status}`);
			const json = await res.json();
			items.value = Array.isArray(json.notifications) ? json.notifications : [];
			error.value = null;
		} catch (err) {
			if (!opts?.silent) {
				error.value = err instanceof Error ? err.message : 'Failed to load activity';
			}
		} finally {
			if (!opts?.silent) isLoading.value = false;
		}
	};

	useEffect(() => {
		hydrate();
	}, []);
	useEffect(() => onNavigate(() => hydrate({ silent: true })), []);

	// Live pushes (browser auto-reconnects). New rows land at the top, de-duped.
	useEffect(() => {
		if (typeof EventSource === 'undefined') return;
		const es = new EventSource('/api/v1/notifications/stream');
		es.addEventListener('notification', (ev: MessageEvent) => {
			try {
				const n = JSON.parse(ev.data) as NotificationSummary;
				items.value = [n, ...items.value.filter((x) => x.id !== n.id)];
			} catch {
				/* ignore malformed frame */
			}
		});
		return () => es.close();
	}, []);

	const unreadCount = useComputed(() => items.value.filter((n) => !n.readAt).length);
	const visible = useComputed(() =>
		filter.value === 'unread' ? items.value.filter((n) => !n.readAt) : items.value
	);

	return (
		<section class='pw-panel pw-activity' aria-label='Project activity'>
			<header class='pw-panel__head'>
				<div class='pw-panel__heading'>
					<span class='pw-eyebrow'>
						<IconBell size={13} /> Live
					</span>
					<h2 class='pw-panel__title'>Activity</h2>
				</div>
				<div class='pw-activity__filters' role='tablist' aria-label='Filter activity'>
					<button
						type='button'
						class='pw-activity__filter'
						data-active={filter.value === 'all'}
						onClick={() => (filter.value = 'all')}
					>
						All
					</button>
					<button
						type='button'
						class='pw-activity__filter'
						data-active={filter.value === 'unread'}
						onClick={() => (filter.value = 'unread')}
					>
						Unread{unreadCount.value > 0 ? ` · ${unreadCount.value}` : ''}
					</button>
				</div>
			</header>

			{isLoading.value
				? (
					<ul class='pw-activity__list'>
						{Array.from({ length: 4 }).map((_, i) => (
							<li
								key={i}
								class='pw-activity__item pw-activity__item--skeleton'
								aria-hidden='true'
							/>
						))}
					</ul>
				)
				: error.value
				? <p class='pw-panel__state'>{error.value}</p>
				: visible.value.length === 0
				? <p class='pw-panel__state'>You're all caught up.</p>
				: (
					<ul class='pw-activity__list'>
						{visible.value.map((n) => {
							const g = glyph(n.type);
							const Icon = g.icon;
							return (
								<li key={n.id}>
									<a
										class='pw-activity__item'
										href={hrefFor(n)}
										f-client-nav={false}
										data-unread={!n.readAt ? 'true' : 'false'}
									>
										<span
											class={`pw-activity__glyph pw-activity__glyph--${g.tone}`}
											aria-hidden='true'
										>
											<Icon size={16} />
										</span>
										<span class='pw-activity__body'>
											<span class='pw-activity__title'>{n.title}</span>
											<span class='pw-activity__text'>{n.body}</span>
										</span>
										<span class='pw-activity__time'>{timeAgo(n.createdAt)}</span>
									</a>
								</li>
							);
						})}
					</ul>
				)}

			<Button
				href='/dashboard/notifications'
				variant='secondary'
				size='small'
				ghost
				fullWidth
				f-client-nav={false}
				className='pw-activity__all'
			>
				View all activity
			</Button>
		</section>
	);
}

export default ProjectActivityFeed;
