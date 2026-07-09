/**
 * @file EntityControlCenter.tsx
 * @description A reusable owner-only management panel for a class of profile entities (Services,
 * Projects, Portfolio, Teams, Experience, Education, Members…). It provides the three controls the
 * spec calls for on every entity control centre:
 *   1. An in-context "Add …" button to create a new instance.
 *   2. A per-item visibility toggle to selectively hide/show an individual entry from the public.
 *   3. A master toggle for the public visibility of the parent tab itself (when the section maps to
 *      a public tab).
 *
 * There is no backend yet — Add is a stub toast; the visibility toggles mutate the local
 * `hiddenItems` / `hiddenTabs` signals in ProfileContext, which the public tab bar & panels honour.
 */

import { Button, toast } from '@projective/ui';
import { IconEye, IconEyeOff, IconPencil, IconPlus } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ProfileTabKey } from '../../contracts/Profile.ts';

export interface ControlItem {
	id: string;
	title: string;
	subtitle?: string;
	/** Optional group heading (e.g. "Teams" vs "Businesses") for mixed lists. */
	group?: string;
}

export interface EntityControlCenterProps {
	title: string;
	description: string;
	addLabel: string;
	items: ControlItem[];
	emptyHint: string;
	/** When set, exposes a master toggle for that tab's public visibility. */
	tabKey?: ProfileTabKey;
}

export default function EntityControlCenter(
	{ title, description, addLabel, items, emptyHint, tabKey }: EntityControlCenterProps,
) {
	const { hiddenItems, hiddenTabs, toggleItemHidden, toggleTabHidden } = useProfileContext();
	const hidden = hiddenItems.value;
	const tabHidden = tabKey ? hiddenTabs.value.has(tabKey) : false;

	// Preserve incoming order but bucket by optional group heading.
	const groups = new Map<string, ControlItem[]>();
	for (const it of items) {
		const key = it.group ?? '';
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key)!.push(it);
	}

	return (
		<div class='pedit'>
			<section class='pedit__card'>
				<div class='ecc__head'>
					<div>
						<h3 class='pedit__card-title pedit__card-title--lg'>{title}</h3>
						<p class='ecc__desc'>{description}</p>
					</div>
					<Button
						variant='primary'
						size='small'
						startIcon={<IconPlus size={16} />}
						onClick={() => toast.success(`${addLabel} — new item drafted`)}
					>
						{addLabel}
					</Button>
				</div>

				{tabKey && (
					<label class='ecc__master'>
						<span class='ecc__master-text'>
							<span class='ecc__master-title'>Show this section publicly</span>
							<span class='ecc__master-desc'>
								When off, the “{title}” tab is hidden from everyone but you.
							</span>
						</span>
						<input
							type='checkbox'
							class='ecc__switch'
							checked={!tabHidden}
							onChange={() => toggleTabHidden(tabKey)}
						/>
					</label>
				)}

				{items.length === 0 ? <div class='tab-empty'>{emptyHint}</div> : (
					<div class='ecc__list'>
						{[...groups.entries()].map(([group, list]) => (
							<div key={group || 'default'} class='ecc__group'>
								{group && <h4 class='ecc__group-title'>{group}</h4>}
								{list.map((it) => {
									const isHidden = hidden.has(it.id);
									return (
										<div key={it.id} class='ecc__row' data-hidden={isHidden ? 'true' : 'false'}>
											<div class='ecc__row-id'>
												<span class='ecc__row-title'>{it.title}</span>
												{it.subtitle && <span class='ecc__row-sub'>{it.subtitle}</span>}
											</div>
											<div class='ecc__row-actions'>
												<Button
													variant='secondary'
													ghost
													size='small'
													startIcon={<IconPencil size={15} />}
													onClick={() =>
														toast.success(`Editing “${it.title}”`)}
												>
													Edit
												</Button>
												<Button
													variant={isHidden ? 'secondary' : 'link'}
													ghost
													size='small'
													startIcon={isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
													onClick={() =>
														toggleItemHidden(it.id)}
												>
													{isHidden ? 'Hidden' : 'Visible'}
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
