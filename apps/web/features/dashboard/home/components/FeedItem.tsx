/**
 * @file FeedItem.tsx
 * @description Pure renderer for one `HomeFeedItem` — the switch behind the Mixed-Media Layout Rule
 * Engine's output. Shared by the server-rendered first page and the client-appended pages inside
 * `FeedStream.island`, so the two are always visually identical. Standard cards + reel slides use the
 * shared luxury `EntityCard`; reels wrap them in the `HScroll` carousel; sponsored/text items use the
 * dedicated `packages/ui` primitives.
 */

import type { EntityCardModel, HomeFeedItem } from '@projective/types';
import { EntityCard, FeedTextCard, HScroll, SponsoredCard } from '@projective/ui';

/**
 * Route-agnostic destination for a card. Marketplace listings (service / product / project) open
 * discovery; everything else is a profile-family entity (person / team / business — and the discovery
 * engine's `freelancer` / `user` values, which aren't in `EntityType`) and deep-links to its public
 * profile. Checking the inverse keeps live freelancer cards linking correctly.
 */
function cardHref(entity: EntityCardModel): string {
	const t = entity.entity_type;
	if (t === 'service' || t === 'product' || t === 'project') return '/explore';
	return `/${entity.owner_handle}`;
}

export function FeedItem({ item }: { item: HomeFeedItem }) {
	switch (item.kind) {
		case 'card':
			return (
				<div class='home-feed__card'>
					{item.reason && (
						<span class='home-feed__reason'>
							<span class='home-feed__reason-dot' aria-hidden='true' />
							{item.reason}
						</span>
					)}
					<EntityCard entity={item.entity} variant={item.variant} href={cardHref(item.entity)} />
				</div>
			);

		case 'reel':
			return (
				<section class='home-reel'>
					<header class='home-reel__head'>
						<div class='home-reel__heading'>
							{item.eyebrow && <span class='home-reel__eyebrow'>{item.eyebrow}</span>}
							<h2 class='home-reel__title'>{item.title}</h2>
						</div>
						{item.subtitle && <p class='home-reel__sub'>{item.subtitle}</p>}
					</header>
					<HScroll ariaLabel={item.title} gap={16}>
						{item.entities.map((e) => (
							<div key={e.id} class='home-reel__slide'>
								<EntityCard entity={e} variant={item.variant} href={cardHref(e)} />
							</div>
						))}
					</HScroll>
				</section>
			);

		case 'sponsored':
			return (
				<SponsoredCard
					label={item.label}
					title={item.title}
					body={item.body}
					ctaLabel={item.ctaLabel}
					ctaHref={item.ctaHref}
					sponsorName={item.sponsorName}
					sponsorAvatar={item.sponsorAvatar}
					media={item.media}
					accent={item.accent}
				/>
			);

		case 'text':
			return (
				<FeedTextCard
					tone={item.tone}
					eyebrow={item.eyebrow}
					title={item.title}
					body={item.body}
					author={item.author}
					ctaLabel={item.ctaLabel}
					ctaHref={item.ctaHref}
					accent={item.accent}
				/>
			);
	}
}

export default FeedItem;
