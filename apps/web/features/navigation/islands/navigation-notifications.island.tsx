import { IconButton } from '@projective/ui';
import { onNavigate } from '@projective/data';
import { IconBell } from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import '../styles/components/header/notifications.css';

// #region Types
/** Client-shape of a single notification row from `comms.notifications`. */
interface NotificationRecord {
	id: string;
	type: string;
	title: string;
	body: string;
	readAt: string | null;
	createdAt: string;
	/** Pre-computed deep link to the exact project sub-tab the event belongs to. */
	targetUrl?: string | null;
}
// #endregion

/**
 * @island NavigationNotifications
 * @description Header notifications hub. Toggling the bell opens a floating tray
 * that lazily fetches a recent summary from the thin `/api/v1/notifications` route
 * (islands never touch Supabase directly). Read/unread state is surfaced per row,
 * and a pinned footer links to the full inbox.
 *
 * Reactive signals: `isOpen` (tray visibility), `isLoading`, `hasLoaded`
 * (one-shot fetch guard), `error`, and `items` (the feed).
 *
 * @returns {preact.JSX.Element} The bell trigger, unread badge and toggleable tray.
 */
export default function NavigationNotifications() {
	// #region State & Refs
	const rootRef = useRef<HTMLDivElement>(null);
	const isOpen = useSignal(false);
	const isLoading = useSignal(false);
	const hasLoaded = useSignal(false);
	const error = useSignal<string | null>(null);
	const items = useSignal<NotificationRecord[]>([]);

	const unreadCount = items.value.filter((n) => !n.readAt).length;
	// #endregion

	// #region Data
	/**
	 * Fetch the recent summary. Pass `{ silent: true }` for a background refresh (client navigation):
	 * it leaves the visible tray untouched on failure and never flips the loading spinner, so the
	 * badge + list update in place instead of flashing "Loading…".
	 */
	const load = async (opts?: { silent?: boolean }) => {
		if (!opts?.silent) isLoading.value = true;
		try {
			const res = await fetch('/api/v1/notifications');
			if (!res.ok) throw new Error(`Error ${res.status}`);
			const data = await res.json();
			items.value = Array.isArray(data.notifications) ? data.notifications : [];
			hasLoaded.value = true;
			error.value = null;
		} catch (err) {
			if (!opts?.silent) {
				error.value = err instanceof Error ? err.message : 'Failed to load notifications';
			}
		} finally {
			if (!opts?.silent) isLoading.value = false;
		}
	};

	const toggle = () => {
		isOpen.value = !isOpen.value;
		// Lazy-load on first open (respects the islands "no eager mount fetch" rule).
		if (isOpen.value && !hasLoaded.value) load();
	};

	// This tray lives in the persistent header — it sits OUTSIDE any swapped <Partial>, so Fresh
	// never remounts it on a client-side navigation and its data would otherwise freeze at the first
	// open until a hard refresh. Once the initial lazy load has happened, silently re-fetch on every
	// client navigation so the unread badge and list stay current.
	useEffect(() =>
		onNavigate(() => {
			if (hasLoaded.value) load({ silent: true });
		}), []);
	// #endregion

	// #region Outside-click / Escape dismissal
	useEffect(() => {
		if (!isOpen.value) return;

		const onPointer = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				isOpen.value = false;
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') isOpen.value = false;
		};

		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [isOpen.value]);
	// #endregion

	// #region Render
	return (
		<div class='navigation__notifications' ref={rootRef}>
			<IconButton
				aria-label='Notifications'
				className='navigation__notifications__trigger'
				rounded
				variant='secondary'
				onClick={toggle}
			>
				<IconBell />
			</IconButton>

			{unreadCount > 0 && (
				<span class='navigation__notifications__badge' aria-hidden='true'>
					{unreadCount > 99 ? '99+' : unreadCount}
				</span>
			)}

			{isOpen.value && (
				<div class='navigation__notifications__tray' role='dialog' aria-label='Notifications'>
					<header class='navigation__notifications__header'>
						<span class='navigation__notifications__heading'>Notifications</span>
						{unreadCount > 0 && (
							<span class='navigation__notifications__count'>{unreadCount} unread</span>
						)}
					</header>

					<div class='navigation__notifications__feed'>
						{isLoading.value
							? <p class='navigation__notifications__state'>Loading…</p>
							: error.value
							? <p class='navigation__notifications__state'>{error.value}</p>
							: items.value.length === 0
							? <p class='navigation__notifications__state'>You're all caught up.</p>
							: items.value.map((n) => (
								<a
									key={n.id}
									href={n.targetUrl ?? '/dashboard/notifications'}
									f-client-nav={false}
									class='navigation__notifications__item'
									data-unread={!n.readAt}
								>
									<span class='navigation__notifications__dot' aria-hidden='true' />
									<span class='navigation__notifications__body'>
										<span class='navigation__notifications__item-title'>{n.title}</span>
										<span class='navigation__notifications__item-text'>{n.body}</span>
									</span>
								</a>
							))}
					</div>

					<a class='navigation__notifications__all' href='/dashboard/notifications'>
						View all notifications
					</a>
				</div>
			)}
		</div>
	);
	// #endregion
}
