/**
 * @file PortfolioTab.tsx
 * @description The "Portfolio" panel. A fluid multi-column masonry of media
 * bricks; each brick's height is derived from its aspect ratio and carries a
 * media-kind badge plus a hover title overlay.
 */

import '../../styles/components/portfolio.css';

import { useSignal } from '@preact/signals';
import {
	type Icon,
	IconFileText,
	IconLink,
	IconMusic,
	IconPhoto,
	IconVideo,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { mediaBackground } from '../../utils.ts';
import type {
	PortfolioCategory,
	PortfolioItem,
	PortfolioMediaKind,
} from '../../contracts/Profile.ts';

const CATEGORY_ORDER: PortfolioCategory[] = ['Design', 'Code', 'Writing', 'Video', 'Other'];

const KIND_ICON: Record<PortfolioMediaKind, Icon> = {
	image: IconPhoto,
	video: IconVideo,
	audio: IconMusic,
	document: IconFileText,
	link: IconLink,
};

const KIND_LABEL: Record<PortfolioMediaKind, string> = {
	image: 'Image',
	video: 'Video',
	audio: 'Audio',
	document: 'Document',
	link: 'Link',
};

function Brick({ item }: { item: PortfolioItem }) {
	const Icon = KIND_ICON[item.kind];
	// aspect = w/h → paddingTop (h/w) gives the intrinsic-height placeholder.
	const paddingTop = `${(1 / item.aspect) * 100}%`;

	return (
		<figure class='pfolio-brick' data-kind={item.kind}>
			<div class='pfolio-brick__frame' style={{ paddingTop }}>
				<div class='pfolio-brick__cover' style={mediaBackground(item.coverUrl)} />

				<span class='pfolio-brick__badge'>
					<Icon size={13} /> {KIND_LABEL[item.kind]}
				</span>

				<figcaption class='pfolio-brick__overlay'>
					<span class='pfolio-brick__title'>{item.title}</span>
					{item.tags.length > 0 && (
						<span class='pfolio-brick__tags'>
							{item.tags.map((t) => <span key={t} class='pfolio-brick__tag'>{t}</span>)}
						</span>
					)}
				</figcaption>
			</div>
		</figure>
	);
}

export default function PortfolioTab() {
	const { profile, hiddenItems } = useProfileContext();
	// Owner-hidden pieces are dropped from the presentation surface.
	const hidden = hiddenItems.value;
	const portfolio = profile.value.portfolio.filter((i) => !hidden.has(i.id));
	const active = useSignal<'All' | PortfolioCategory>('All');

	// Filter chips: "All" + the disciplines actually present, in canonical order.
	const present = CATEGORY_ORDER.filter((c) => portfolio.some((i) => i.category === c));
	const filters: ('All' | PortfolioCategory)[] = ['All', ...present];

	const items = active.value === 'All'
		? portfolio
		: portfolio.filter((i) => i.category === active.value);

	return (
		<section class='pfolio'>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Portfolio</h2>
					<p class='tab-head__sub'>{portfolio.length} selected pieces of work</p>
				</div>
			</header>

			<div class='profile-filters' role='tablist' aria-label='Filter portfolio'>
				{filters.map((f) => (
					<button
						key={f}
						type='button'
						role='tab'
						aria-selected={active.value === f}
						class={`profile-filter ${active.value === f ? 'profile-filter--active' : ''}`}
						onClick={() => (active.value = f)}
					>
						{f}
					</button>
				))}
			</div>

			{items.length === 0
				? <div class='tab-empty'>No portfolio pieces in this category.</div>
				: (
					<div class='pfolio-masonry'>
						{items.map((item) => <Brick key={item.id} item={item} />)}
					</div>
				)}
		</section>
	);
}
