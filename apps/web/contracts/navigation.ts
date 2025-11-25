import {
	Icon,
	IconBriefcase,
	IconBuilding,
	IconChartLine,
	IconCompass,
	IconHome,
	IconMessages,
	IconPlug,
	IconSettings,
	IconUsers,
	IconWallet,
} from '@tabler/icons-preact';

export interface INavApp {
	icon: Icon;
	name: string;
	link: string;
}

export const apps1: INavApp[] = [
	{
		icon: IconHome,
		name: 'Dashboard',
		link: '/dashboard',
	},
	{
		icon: IconCompass,
		name: 'Explore',
		link: '/explore',
	},
	{
		icon: IconMessages,
		name: 'Messages',
		link: '/messages',
	},
];

export const apps2: INavApp[] = [
	{
		icon: IconBriefcase,
		name: 'Projects',
		link: '/projects',
	},
	{
		icon: IconUsers,
		name: 'Teams',
		link: '/teams',
	},
	{
		icon: IconBuilding,
		name: 'Businesses',
		link: '/businesses',
	},
];

export const apps3: INavApp[] = [
	{
		icon: IconChartLine,
		name: 'Analytics',
		link: '/analytics',
	},
	{
		icon: IconWallet,
		name: 'Earnings',
		link: '/earnings',
	},
	{
		icon: IconSettings,
		name: 'Settings',
		link: '/settings',
	},
];

export const apps = [apps1, apps2, apps3];
