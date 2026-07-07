/**
 * @file NotificationsInbox.island.tsx
 * @description Live notifications feed. Backfills the recent list from GET /api/v1/notifications,
 * then subscribes to the SSE stream (/api/v1/notifications/stream) for real-time pushes — e.g. the
 * "stage funded" notification emitted by projects.fund_stage (US-005 AC5).
 *
 * Boundary (apps/web/CLAUDE.md): the island uses fetch + the native EventSource API only; it never
 * touches the Supabase client. The server route owns the Realtime subscription.
 */

// deno-lint-ignore-file no-explicit-any
import '../styles/inbox.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

interface InboxNotification {
	id: string;
	type: string;
	title: string;
	body: string;
	readAt: string | null;
	createdAt: string;
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

export default function NotificationsInbox() {
	const items = useSignal<InboxNotification[]>([]);
	const filter = useSignal<'all' | 'unread'>('all');
	const isLoading = useSignal(true);
	const error = useSignal<string | null>(null);

	// Initial backfill of the recent feed.
	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch('/api/v1/notifications');
				if (!res.ok) throw new Error(`Error ${res.status}`);
				const json = await res.json();
				if (active) items.value = json.notifications ?? [];
			} catch (err: any) {
				if (active) error.value = err?.message || 'Failed to load notifications';
			} finally {
				if (active) isLoading.value = false;
			}
		})();
		return () => {
			active = false;
		};
	}, []);

	// Live pushes via Server-Sent Events (browser auto-reconnects on drop).
	useEffect(() => {
		if (typeof EventSource === 'undefined') return;
		const es = new EventSource('/api/v1/notifications/stream');
		es.addEventListener('notification', (ev: MessageEvent) => {
			try {
				const n = JSON.parse(ev.data) as InboxNotification;
				items.value = [n, ...items.value.filter((x) => x.id !== n.id)];
			} catch {
				/* ignore malformed frame */
			}
		});
		return () => es.close();
	}, []);

	const visible = useComputed(() =>
		filter.value === 'unread' ? items.value.filter((n) => !n.readAt) : items.value
	);

	return (
		<section class='inbox'>
			<header class='inbox__header'>
				<div class='inbox__heading'>
					<h1 class='inbox__title'>Notifications</h1>
					<p class='inbox__subtitle'>Your full activity and inbox feed.</p>
				</div>
				<div class='inbox__filters'>
					<button
						type='button'
						class='inbox__filter'
						data-active={filter.value === 'all' ? 'true' : 'false'}
						onClick={() => (filter.value = 'all')}
					>
						All
					</button>
					<button
						type='button'
						class='inbox__filter'
						data-active={filter.value === 'unread' ? 'true' : 'false'}
						onClick={() => (filter.value = 'unread')}
					>
						Unread
					</button>
				</div>
			</header>

			{isLoading.value
				? <p class='inbox__empty'>Loading…</p>
				: error.value
				? <p class='inbox__empty'>{error.value}</p>
				: visible.value.length === 0
				? <p class='inbox__empty'>You're all caught up.</p>
				: (
					<ul class='inbox__list'>
						{visible.value.map((n) => (
							<li key={n.id} class='inbox__item' data-unread={!n.readAt ? 'true' : 'false'}>
								<span class='inbox__item-indicator' aria-hidden='true' />
								<div class='inbox__item-body'>
									<span class='inbox__item-title'>{n.title}</span>
									<span class='inbox__item-text'>{n.body}</span>
								</div>
								<span class='inbox__item-meta'>{timeAgo(n.createdAt)}</span>
							</li>
						))}
					</ul>
				)}
		</section>
	);
}
