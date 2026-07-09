/**
 * @file ServicesTab.tsx
 * @description The "Services" panel. Renders each offering through the unified `ServiceCard`
 * (premium thumbnail + dense pricing/rating metadata). Per the card action guardrail, the only
 * face buttons are Save · Share · kebab — the former "Book session" / "View service" CTA now lives
 * inside the kebab menu.
 */

import '../../styles/components/services.css';

import { ServiceCard } from '@projective/ui';
import { IconCalendarEvent, IconExternalLink } from '@tabler/icons-preact';
import type { EntityCardMenuItem } from '@projective/ui';
import type { EntityCardModel } from '@projective/types';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { bannerBackground } from '../../utils.ts';
import type { ServiceItem } from '../../contracts/Profile.ts';

/** Adapts a profile `ServiceItem` into the unified card model. */
function serviceToCardModel(s: ServiceItem): EntityCardModel {
	return {
		id: s.id,
		entity_type: 'service',
		display_title: s.title,
		display_description: s.summary,
		tags: s.tags,
		rating_average: s.rating,
		rating_count: s.reviews,
		owner_name: '',
		owner_handle: '',
		owner_avatar: null,
		banner: bannerBackground(s.thumbnailUrl),
		accent: 'primary',
		price_cents: null,
		price_unit: null,
		price_label: s.priceLabel,
		availability: null,
		location: null,
		scope: null,
		taxonomy: null,
		is_sponsored: false,
		timeline_note: s.deliveryLabel,
	};
}

/** The kebab menu for a service — its primary action lives here, not on the card face. */
function serviceMenu(s: ServiceItem): EntityCardMenuItem[] {
	return s.sessionBased
		? [{ label: 'Book session', icon: <IconCalendarEvent size={15} />, onSelect: () => {} }]
		: [{ label: 'View service', icon: <IconExternalLink size={15} />, onSelect: () => {} }];
}

export default function ServicesTab() {
	const { profile, hiddenItems } = useProfileContext();
	// Owner-hidden items are dropped from the presentation surface (the control
	// centre in Editor Mode still lists every item with its hidden state).
	const hidden = hiddenItems.value;
	const services = profile.value.services.filter((s) => !hidden.has(s.id));

	return (
		<section class='svc'>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Services</h2>
					<p class='tab-head__sub'>{services.length} offerings you can hire or book</p>
				</div>
			</header>

			{services.length === 0
				? <div class='tab-empty'>No services listed yet.</div>
				: (
					<div class='svc-grid'>
						{services.map((s) => (
							<ServiceCard key={s.id} entity={serviceToCardModel(s)} menuItems={serviceMenu(s)} />
						))}
					</div>
				)}
		</section>
	);
}
