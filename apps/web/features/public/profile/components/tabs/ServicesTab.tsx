/**
 * @file ServicesTab.tsx
 * @description The "Services" panel. Prominent image-thumbnail cards for each
 * offering, with a grid/list view toggle bound to the `servicesView` signal.
 * Session-based services surface a small "Bookable" chip.
 */

import '../../styles/components/services.css';

import { Button, Tag } from '@projective/ui';
import {
	IconCalendarEvent,
	IconClock,
	IconLayoutGrid,
	IconList,
	IconStarFilled,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { mediaBackground } from '../../utils.ts';
import type { ServiceItem } from '../../contracts/Profile.ts';

function ServiceCard({ s }: { s: ServiceItem }) {
	return (
		<article class='svc-card'>
			<div class='svc-card__cover' style={mediaBackground(s.thumbnailUrl)}>
				{s.sessionBased && (
					<span class='svc-card__chip'>
						<IconCalendarEvent size={13} /> Bookable
					</span>
				)}
			</div>

			<div class='svc-card__body'>
				<h3 class='svc-card__title'>{s.title}</h3>
				<p class='svc-card__summary'>{s.summary}</p>

				<div class='svc-card__meta'>
					<span class='svc-card__price'>{s.priceLabel}</span>
					<span class='svc-card__dot' aria-hidden='true'>·</span>
					<span class='svc-card__delivery'>
						<IconClock size={14} /> {s.deliveryLabel}
					</span>
					<span class='svc-card__rating'>
						<IconStarFilled size={14} /> {s.rating.toFixed(1)}
						<span class='svc-card__reviews'>({s.reviews})</span>
					</span>
				</div>

				{s.tags.length > 0 && (
					<div class='svc-card__tags'>
						{s.tags.map((t) => (
							<Tag key={t} size='small' color='neutral' variant='subtle' rounded>{t}</Tag>
						))}
					</div>
				)}
			</div>

			<div class='svc-card__foot'>
				<Button
					variant={s.sessionBased ? 'primary' : 'secondary'}
					size='small'
					outlined={!s.sessionBased}
				>
					{s.sessionBased ? 'Book session' : 'View service'}
				</Button>
			</div>
		</article>
	);
}

export default function ServicesTab() {
	const { profile, servicesView } = useProfileContext();
	const services = profile.value.services;
	const view = servicesView.value;

	return (
		<section class='svc' data-view={view}>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Services</h2>
					<p class='tab-head__sub'>{services.length} offerings you can hire or book</p>
				</div>
				<div class='view-toggle' role='group' aria-label='View mode'>
					<button
						type='button'
						class='view-toggle__btn'
						data-active={view === 'grid'}
						aria-label='Grid view'
						onClick={() => (servicesView.value = 'grid')}
					>
						<IconLayoutGrid size={17} />
					</button>
					<button
						type='button'
						class='view-toggle__btn'
						data-active={view === 'list'}
						aria-label='List view'
						onClick={() => (servicesView.value = 'list')}
					>
						<IconList size={17} />
					</button>
				</div>
			</header>

			{services.length === 0
				? <div class='tab-empty'>No services listed yet.</div>
				: (
					<div class='svc-grid'>
						{services.map((s) => <ServiceCard key={s.id} s={s} />)}
					</div>
				)}
		</section>
	);
}
