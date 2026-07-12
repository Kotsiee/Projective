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
import { onNavigate } from '@projective/data';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

interface InboxNotification {
	id: string;
	type: string;
	title: string;
	body: string;
	readAt: string | null;
	createdAt: string;
	/** Pre-computed deep link to the exact project sub-tab the event belongs to. */
	targetUrl?: string | null;
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

	// Fetch the recent feed. `{ silent: true }` refreshes in place (client navigation) without
	// flipping the loading state or clobbering the list on a transient failure.
	const hydrate = async (opts?: { silent?: boolean }) => {
		if (!opts?.silent) isLoading.value = true;
		try {
			const res = await fetch('/api/v1/notifications');
			if (!res.ok) throw new Error(`Error ${res.status}`);
			const json = await res.json();
			items.value = json.notifications ?? [];
			error.value = null;
		} catch (err: any) {
			if (!opts?.silent) error.value = err?.message || 'Failed to load notifications';
		} finally {
			if (!opts?.silent) isLoading.value = false;
		}
	};

	// Initial backfill of the recent feed.
	useEffect(() => {
		hydrate();
	}, []);

	// Refresh across Fresh client-side navigation. If a partial swap preserves this island, its
	// mount effect won't re-run — a silent re-hydrate keeps the list current without a hard refresh.
	// (The SSE stream below only delivers pushes that arrive while the island is already mounted.)
	useEffect(() => onNavigate(() => hydrate({ silent: true })), []);

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
								<a
									class='inbox__item-link'
									href={n.targetUrl ?? '/dashboard/notifications'}
									f-client-nav={false}
									aria-label={n.title}
								/>
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
