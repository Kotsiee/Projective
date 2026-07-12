import {
	Icon,
	IconBriefcase,
	IconBuilding,
	IconChartLine,
	IconCompass,
	IconHome,
	IconMessages,
	IconSettings,
	IconSparkles,
	IconUsers,
	IconWallet,
} from '@tabler/icons-preact';
import type { QuickLinkSource } from './quicklinks.ts';

export interface INavApp {
	icon: Icon;
	name: string;
	link?: string;
	/** Static submenu (e.g. Analytics). Mutually exclusive with `quickLinks`. */
	children?: { name: string; link: string }[];
	/**
	 * Dynamic quick-link reel. When set, the item's submenu renders the user's 3–5 most
	 * recent/favorited workspaces for this source (lazy-loaded on open) instead of a static list —
	 * see `QuickLinkSubmenu.tsx`.
	 */
	quickLinks?: QuickLinkSource;
	/**
	 * Persona/account gate. When set, the item only renders when the condition
	 * holds against the active user context (see `side.tsx`):
	 * - `operator`   → the account has opted into Client / Operator Mode.
	 * - `freelancer` → the active persona is a Freelancer profile (or a Team context, which is a
	 *   freelancer-only space).
	 * Omit for items that are always visible.
	 */
	requires?: 'operator' | 'freelancer';
}

export const apps1: INavApp[] = [
	{ icon: IconHome, name: 'Home', link: '/home' },
	{ icon: IconCompass, name: 'Explore', link: '/explore' },
	{ icon: IconMessages, name: 'Messages', link: '/messages' },
];

export const apps2: INavApp[] = [
	// Projects carries a live quick-link reel of recent/favorited workspaces (client avatars).
	{ icon: IconBriefcase, name: 'Projects', link: '/projects', quickLinks: 'projects' },
	// Services is a freelancer/team-only management suite; its reel shows recent listings (thumbnails).
	{
		icon: IconSparkles,
		name: 'Services',
		link: '/services',
		requires: 'freelancer',
		quickLinks: 'services',
	},
	// Teams is a freelancer-only space — never shown to clients.
	{ icon: IconUsers, name: 'Teams', link: '/teams', requires: 'freelancer' },
	// Businesses only appears once the account opts into Client / Operator Mode.
	{ icon: IconBuilding, name: 'Businesses', link: '/business', requires: 'operator' },
];

export const apps3: INavApp[] = [
	{
		icon: IconChartLine,
		name: 'Analytics',
		link: '/analytics',
		children: [
			{ name: 'Overview', link: '/analytics/overview' },
			{ name: 'Traffic', link: '/analytics/traffic' },
			{ name: 'Reports', link: '/analytics/reports' },
		],
	},
	{ icon: IconWallet, name: 'Wallet', link: '/wallet' },
	{ icon: IconSettings, name: 'Settings', link: '/settings' },
];

export const apps = [apps1, apps2, apps3];
