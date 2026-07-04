import InboxShell from '@features/dashboard/inbox/components/InboxShell.tsx';

/**
 * Route: /dashboard/notifications
 * Thin entry point for the full notifications/inbox list context. Renders inside
 * the shared `(dashboard)` layout; all structure lives in {@link InboxShell}.
 */
export default function NotificationsPage() {
	return <InboxShell />;
}
