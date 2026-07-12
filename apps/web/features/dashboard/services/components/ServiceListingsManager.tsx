/**
 * @file ServiceListingsManager.tsx
 * @description The management table of the Services suite: each active/draft listing as an
 * executive row — service asset thumbnail, tier ladder, live performance chips, status, and the
 * edit-pricing / activate-pause affordances. Data + mutations are owned by the island; this is a
 * controlled view.
 */

import { Button, StatusBadge } from '@projective/ui';
import { IconEdit, IconPlayerPause, IconPlayerPlay, IconPlus } from '@tabler/icons-preact';
import type { ServiceListing } from '../contracts/services.ts';
import {
	formatCount,
	formatMoney,
	serviceStatusLabel,
	serviceStatusTone,
	startingPriceCents,
} from '../contracts/services.ts';

interface ServiceListingsManagerProps {
	listings: ServiceListing[];
	currency: string;
	onEdit: (listing: ServiceListing) => void;
	onToggleStatus: (id: string) => void;
	onCreate: () => void;
}

/** A square "asset" tile — the service's own thumbnail (gradient + initial fallback). */
function AssetThumb({ listing }: { listing: ServiceListing }) {
	const initial = (listing.title.trim()[0] ?? 'S').toUpperCase();
	return (
		<span class='svc-row__thumb' data-cat={listing.category}>
			{listing.thumbnailUrl
				? <img src={listing.thumbnailUrl} alt='' />
				: <span class='svc-row__thumb-fallback'>{initial}</span>}
		</span>
	);
}

function ListingRow(
	{ listing, currency, onEdit, onToggleStatus }: {
		listing: ServiceListing;
		currency: string;
		onEdit: (l: ServiceListing) => void;
		onToggleStatus: (id: string) => void;
	},
) {
	const isActive = listing.status === 'active';
	return (
		<article class='svc-row' data-status={listing.status}>
			<AssetThumb listing={listing} />

			<div class='svc-row__main'>
				<div class='svc-row__title-line'>
					<h3 class='svc-row__title'>{listing.title}</h3>
					<span class='svc-row__cat'>{listing.category}</span>
					<StatusBadge tone={serviceStatusTone(listing.status)} size='sm' dot>
						{serviceStatusLabel(listing.status)}
					</StatusBadge>
				</div>
				<p class='svc-row__summary'>{listing.summary}</p>
				<div class='svc-row__tiers'>
					{listing.tiers.map((t) => (
						<span key={t.id} class={`svc-tier-chip ${t.featured ? 'is-featured' : ''}`}>
							{t.name} · {formatMoney(t.priceCents, currency, true)}
						</span>
					))}
				</div>
			</div>

			<div class='svc-row__stats'>
				<div class='svc-row__stat'>
					<span class='svc-row__stat-value'>{formatCount(listing.stats.views30d)}</span>
					<span class='svc-row__stat-label'>Views</span>
				</div>
				<div class='svc-row__stat'>
					<span class='svc-row__stat-value'>{listing.stats.conversionPct}%</span>
					<span class='svc-row__stat-label'>Convert</span>
				</div>
				<div class='svc-row__stat'>
					<span class='svc-row__stat-value'>{listing.stats.activeClients}</span>
					<span class='svc-row__stat-label'>Clients</span>
				</div>
				<div class='svc-row__stat'>
					<span class='svc-row__stat-value'>
						{formatMoney(listing.stats.pipelineValueCents, currency, true)}
					</span>
					<span class='svc-row__stat-label'>Pipeline</span>
				</div>
			</div>

			<div class='svc-row__actions'>
				<span class='svc-row__from'>
					from {formatMoney(startingPriceCents(listing), currency, true)}
				</span>
				<div class='svc-row__buttons'>
					<Button variant='secondary' ghost size='small' onClick={() => onEdit(listing)}>
						<IconEdit size={15} /> Edit pricing
					</Button>
					<Button
						variant='secondary'
						ghost
						size='small'
						onClick={() => onToggleStatus(listing.id)}
						aria-label={isActive ? 'Pause listing' : 'Activate listing'}
					>
						{isActive ? <IconPlayerPause size={15} /> : <IconPlayerPlay size={15} />}
						{isActive ? 'Pause' : 'Activate'}
					</Button>
				</div>
			</div>
		</article>
	);
}

export default function ServiceListingsManager(
	{ listings, currency, onEdit, onToggleStatus, onCreate }: ServiceListingsManagerProps,
) {
	return (
		<section class='svc-listings'>
			<header class='svc-section__head'>
				<div>
					<span class='svc-section__eyebrow'>Catalogue</span>
					<h2 class='svc-section__title'>Manage listings</h2>
				</div>
				<Button variant='secondary' ghost size='small' onClick={onCreate}>
					<IconPlus size={16} /> New listing
				</Button>
			</header>

			{listings.length === 0
				? (
					<div class='svc-listings__empty'>
						<p>No services yet. Package your first offer to start selling.</p>
						<Button variant='primary' onClick={onCreate}>
							<IconPlus size={18} /> Create a service
						</Button>
					</div>
				)
				: (
					<div class='svc-listings__list'>
						{listings.map((l) => (
							<ListingRow
								key={l.id}
								listing={l}
								currency={currency}
								onEdit={onEdit}
								onToggleStatus={onToggleStatus}
							/>
						))}
					</div>
				)}
		</section>
	);
}
