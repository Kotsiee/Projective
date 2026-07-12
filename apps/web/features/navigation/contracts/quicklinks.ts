/**
 * @file quicklinks.ts
 * @description Contract for the sidebar quick-link submenus — the compact "high-priority
 * workspaces" reel that expands under the Projects and Services primary nav links. A quick link is a
 * presentation-only micro-row (circular thumbnail + status dot + two lines) that deep-links into a
 * workspace or listing. The list is the user's 3–5 most recently updated / favorited items for the
 * given source, resolved lazily when a submenu first opens so it never blocks nav hydration.
 *
 * Image-mapping rule (enforced by the seed / future backend, not the UI):
 *  - `projects` → `imageUrl` is the CLIENT's profile picture.
 *  - `services` → `imageUrl` is the service's custom asset thumbnail.
 * The renderer is source-agnostic; it just paints whatever `imageUrl` / `avatarName` it is handed.
 */

/** Which primary nav link a quick-link reel hangs under. */
export type QuickLinkSource = 'projects' | 'services';

/** Coarse lifecycle state driving the micro-row status dot. */
export type QuickLinkStatus = 'active' | 'on_hold' | 'review' | 'draft' | 'completed';

export interface QuickLinkItem {
	id: string;
	/** Workspace / listing headline (line 1). */
	title: string;
	/** Secondary line (line 2): client name for projects, tier summary for services. */
	subtitle: string;
	/** Deep link into the workspace or listing. */
	href: string;
	/**
	 * Circular thumbnail source. Projects → the client's avatar; services → the service's custom
	 * asset thumbnail. Null falls back to the deterministic gradient/initials in `Avatar`.
	 */
	imageUrl: string | null;
	/** Name backing the `Avatar` fallback + a11y label (client name / service name). */
	avatarName: string;
	status: QuickLinkStatus;
	/** ISO timestamp — the reel is ordered most-recent-first over this. */
	updatedAt: string;
	/** User-pinned; favorited items sort ahead of merely-recent ones. */
	favorite: boolean;
}

/** Map a lifecycle status to a `StatusBadge`/dot tone token. */
export function quickLinkTone(
	status: QuickLinkStatus,
): 'success' | 'warning' | 'info' | 'neutral' {
	switch (status) {
		case 'active':
			return 'success';
		case 'on_hold':
			return 'warning';
		case 'review':
			return 'info';
		case 'completed':
		case 'draft':
			return 'neutral';
	}
}

/** Short human label for the status dot tooltip. */
export function quickLinkStatusLabel(status: QuickLinkStatus): string {
	switch (status) {
		case 'active':
			return 'Active';
		case 'on_hold':
			return 'On hold';
		case 'review':
			return 'In review';
		case 'draft':
			return 'Draft';
		case 'completed':
			return 'Completed';
	}
}

/**
 * Order a raw list into the reel the submenu shows: favorites first, then most-recently-updated,
 * capped to a luxurious few (default 5). Pure so the API route and any client fallback agree.
 */
export function selectQuickLinks(items: QuickLinkItem[], limit = 5): QuickLinkItem[] {
	return [...items]
		.sort((a, b) => {
			if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
			return b.updatedAt.localeCompare(a.updatedAt);
		})
		.slice(0, limit);
}
