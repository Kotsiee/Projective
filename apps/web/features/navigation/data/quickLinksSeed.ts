/**
 * @file quickLinksSeed.ts
 * @description Frontend seed for the sidebar quick-link submenus (see `contracts/quicklinks.ts`).
 * Kept server-side (imported only by the `/api/v1/navigation/quick-links` route) so the seed never
 * ships in the nav island bundle. When a real backend lands, replace the route's use of this seed
 * with a Service call returning the same `QuickLinkItem[]`; nothing downstream changes.
 *
 * Image-mapping rule, made concrete here:
 *  - Projects rows put the CLIENT's avatar in `imageUrl` (here null → gradient fallback keyed to the
 *    client name), and the client name in `avatarName`.
 *  - Services rows put the service's custom asset thumbnail in `imageUrl`, and the service name in
 *    `avatarName`.
 */

import type { QuickLinkItem, QuickLinkSource } from '../contracts/quicklinks.ts';

export const QUICK_LINKS_SEED: Record<QuickLinkSource, QuickLinkItem[]> = {
	projects: [
		{
			id: 'p-northwind',
			title: 'Northwind Rebrand',
			subtitle: 'Northwind Studios',
			href: '/projects/p-northwind',
			imageUrl: null,
			avatarName: 'Northwind Studios',
			status: 'active',
			updatedAt: '2026-07-10T09:20:00Z',
			favorite: true,
		},
		{
			id: 'p-lumen',
			title: 'Lumen App Launch',
			subtitle: 'Lumen Health',
			href: '/projects/p-lumen',
			imageUrl: null,
			avatarName: 'Lumen Health',
			status: 'review',
			updatedAt: '2026-07-09T16:05:00Z',
			favorite: true,
		},
		{
			id: 'p-atlas',
			title: 'Atlas Motion System',
			subtitle: 'Atlas Freight Co.',
			href: '/projects/p-atlas',
			imageUrl: null,
			avatarName: 'Atlas Freight Co.',
			status: 'active',
			updatedAt: '2026-07-09T11:40:00Z',
			favorite: false,
		},
		{
			id: 'p-verano',
			title: 'Verano Campaign Films',
			subtitle: 'Verano Spirits',
			href: '/projects/p-verano',
			imageUrl: null,
			avatarName: 'Verano Spirits',
			status: 'on_hold',
			updatedAt: '2026-07-07T13:15:00Z',
			favorite: false,
		},
		{
			id: 'p-monarch',
			title: 'Monarch Editorial Site',
			subtitle: 'Monarch Press',
			href: '/projects/p-monarch',
			imageUrl: null,
			avatarName: 'Monarch Press',
			status: 'draft',
			updatedAt: '2026-07-05T08:00:00Z',
			favorite: false,
		},
		{
			id: 'p-solace',
			title: 'Solace Packaging',
			subtitle: 'Solace Skincare',
			href: '/projects/p-solace',
			imageUrl: null,
			avatarName: 'Solace Skincare',
			status: 'completed',
			updatedAt: '2026-07-01T10:30:00Z',
			favorite: false,
		},
	],
	services: [
		{
			id: 's-brand-system',
			title: 'Signature Brand System',
			subtitle: '3 tiers · from $4,500',
			href: '/services?listing=s-brand-system',
			imageUrl: null,
			avatarName: 'Signature Brand System',
			status: 'active',
			updatedAt: '2026-07-10T10:10:00Z',
			favorite: true,
		},
		{
			id: 's-motion-reel',
			title: 'Motion Identity Reel',
			subtitle: '2 tiers · from $2,800',
			href: '/services?listing=s-motion-reel',
			imageUrl: null,
			avatarName: 'Motion Identity Reel',
			status: 'active',
			updatedAt: '2026-07-09T18:45:00Z',
			favorite: true,
		},
		{
			id: 's-webflow-build',
			title: 'Webflow Flagship Build',
			subtitle: '3 tiers · from $6,200',
			href: '/services?listing=s-webflow-build',
			imageUrl: null,
			avatarName: 'Webflow Flagship Build',
			status: 'review',
			updatedAt: '2026-07-08T14:20:00Z',
			favorite: false,
		},
		{
			id: 's-art-direction',
			title: 'Art Direction Retainer',
			subtitle: 'Monthly · $3,900',
			href: '/services?listing=s-art-direction',
			imageUrl: null,
			avatarName: 'Art Direction Retainer',
			status: 'active',
			updatedAt: '2026-07-06T09:00:00Z',
			favorite: false,
		},
		{
			id: 's-launch-audit',
			title: 'Product Launch Audit',
			subtitle: '1 tier · $1,500',
			href: '/services?listing=s-launch-audit',
			imageUrl: null,
			avatarName: 'Product Launch Audit',
			status: 'draft',
			updatedAt: '2026-07-03T12:00:00Z',
			favorite: false,
		},
	],
};
