import NotificationsInbox from '@features/dashboard/inbox/islands/NotificationsInbox.island.tsx';

/**
 * @component InboxShell
 * @description Entry point for the full notifications/inbox list context. Renders inside the
 * dashboard layout and mounts the live {@link NotificationsInbox} island, which backfills the feed
 * from the API and subscribes to the SSE stream for real-time pushes.
 *
 * @returns {preact.JSX.Element} The inbox layout.
 */
export default function InboxShell() {
	return <NotificationsInbox />;
}
