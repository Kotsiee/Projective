import {
	Icon,
	IconBriefcase,
	IconBuilding,
	IconChartLine,
	IconCompass,
	IconHome,
	IconMessages,
	IconSettings,
	IconUsers,
	IconWallet,
} from '@tabler/icons-preact';

export interface INavApp {
	icon: Icon;
	name: string;
	link?: string;
	children?: { name: string; link: string }[];
	/**
	 * Persona/account gate. When set, the item only renders when the condition
	 * holds against the active user context (see `side.tsx`):
	 * - `operator`   → the account has opted into Client / Operator Mode.
	 * - `freelancer` → the active persona is a Freelancer profile.
	 * Omit for items that are always visible.
	 */
	requires?: 'operator' | 'freelancer';
}

export const apps1: INavApp[] = [
	{ icon: IconHome, name: 'Dashboard', link: '/dashboard' },
	{ icon: IconCompass, name: 'Explore', link: '/explore' },
	{ icon: IconMessages, name: 'Messages', link: '/messages' },
];

export const apps2: INavApp[] = [
	{ icon: IconBriefcase, name: 'Projects', link: '/projects' },
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
