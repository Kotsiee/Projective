/**
 * @file QuickLinkSubmenu.tsx
 * @description The luxurious quick-link reel that expands under the Projects / Services primary nav
 * links. Each entry is a compact micro-row: a circular media avatar (client picture for projects,
 * service thumbnail for services), a small status dot, and two tight lines. Data is fetched lazily
 * via `useQuickLinks` — only once this submenu is actually opened — so it never taxes nav hydration.
 */

import { Avatar } from '@projective/ui';
import { IconStarFilled } from '@tabler/icons-preact';
import type { QuickLinkSource } from '../../contracts/quicklinks.ts';
import { quickLinkStatusLabel, quickLinkTone } from '../../contracts/quicklinks.ts';
import { useQuickLinks } from '../../hooks/useQuickLinks.ts';

interface QuickLinkSubmenuProps {
	source: QuickLinkSource;
	/** True only when the parent item's submenu is open AND the sidebar is expanded. */
	open: boolean;
	/** Current pathname+search, for highlighting the active reel entry. */
	selected: string;
}

export default function QuickLinkSubmenu({ source, open, selected }: QuickLinkSubmenuProps) {
	const { items, loading, error, loadedOnce } = useQuickLinks(source, open);
	const allHref = source === 'projects' ? '/projects' : '/services';
	const allLabel = source === 'projects' ? 'All projects' : 'All services';

	return (
		<div class='navigation__side__quicklinks' role='group' aria-label={`${source} quick links`}>
			{/* First-open shimmer — three placeholder rows while the reel resolves. */}
			{loading.value && !loadedOnce.value &&
				[0, 1, 2].map((i) => (
					<div key={i} class='ql-row ql-row--skeleton' aria-hidden='true'>
						<span class='ql-row__media' />
						<span class='ql-row__body'>
							<span class='ql-row__title' />
							<span class='ql-row__sub' />
						</span>
					</div>
				))}

			{error.value && !loadedOnce.value && <div class='ql-empty'>Couldn’t load</div>}

			{loadedOnce.value && items.value.length === 0 && <div class='ql-empty'>Nothing here yet</div>}

			{items.value.map((item) => (
				<a
					key={item.id}
					href={item.href}
					class='ql-row'
					data-selected={selected === item.href}
				>
					<span class='ql-row__media'>
						<Avatar name={item.avatarName} src={item.imageUrl ?? undefined} size={30} />
						<span
							class='ql-row__dot'
							data-tone={quickLinkTone(item.status)}
							title={quickLinkStatusLabel(item.status)}
						/>
					</span>
					<span class='ql-row__body'>
						<span class='ql-row__title'>{item.title}</span>
						<span class='ql-row__sub'>{item.subtitle}</span>
					</span>
					{item.favorite && <IconStarFilled size={12} class='ql-row__fav' />}
				</a>
			))}

			{loadedOnce.value && items.value.length > 0 && (
				<a href={allHref} class='ql-row ql-row--all'>{allLabel} →</a>
			)}
		</div>
	);
}
