import { useSignal } from '@preact/signals';
import {
	IconBookmark,
	IconBookmarkFilled,
	IconDots,
	IconFlag,
	IconShare3,
} from '@tabler/icons-preact';
import type { EntityCardMenuItem } from '../../types/components/entity-card.ts';

/**
 * @interface CardActionsProps
 * @description The guardrailed face-action cluster. By hard design, the ONLY buttons that ever
 * render on a card face are Save · Share · kebab — every secondary / destructive action lives
 * inside the kebab (⋮) menu, never on the face.
 */
interface CardActionsProps {
	/** Title used for the native share sheet. */
	title: string;
	/** Absolute/relative URL to share; defaults to the current location. */
	shareUrl?: string;
	/** Controlled saved state; falls back to internal state when omitted. */
	saved?: boolean;
	onSave?: (saved: boolean) => void;
	/** Kebab items. Defaults to a single "Report Listing" entry. */
	menuItems?: EntityCardMenuItem[];
}

const stop = (e: Event) => e.stopPropagation();

export function CardActions({ title, shareUrl, saved, onSave, menuItems }: CardActionsProps) {
	const internalSaved = useSignal(false);
	const menuOpen = useSignal(false);
	const isSaved = saved ?? internalSaved.value;

	const toggleSave = () => {
		const next = !isSaved;
		if (onSave) onSave(next);
		else internalSaved.value = next;
	};

	const share = () => {
		const url = new URL(shareUrl ?? globalThis.location.href, globalThis.location.origin).href;
		const nav = globalThis.navigator as Navigator & { share?: (d: unknown) => Promise<void> };
		if (nav?.share) nav.share({ title, url }).catch(() => {});
		else nav?.clipboard?.writeText(url).catch(() => {});
	};

	const items: EntityCardMenuItem[] = menuItems ?? [
		{ label: 'Report Listing', danger: true, icon: <IconFlag size={15} />, onSelect: () => {} },
	];

	return (
		<div class='entity-card__actions' onClick={stop}>
			<button
				type='button'
				class={`entity-card__action ${isSaved ? 'is-active' : ''}`}
				aria-pressed={isSaved}
				aria-label={isSaved ? 'Unsave' : 'Save'}
				onClick={toggleSave}
			>
				{isSaved ? <IconBookmarkFilled size={17} /> : <IconBookmark size={17} />}
			</button>
			<button type='button' class='entity-card__action' aria-label='Share' onClick={share}>
				<IconShare3 size={17} />
			</button>
			<div class='entity-card__menu'>
				<button
					type='button'
					class='entity-card__action'
					aria-label='More actions'
					aria-haspopup='menu'
					aria-expanded={menuOpen.value}
					onClick={() => menuOpen.value = !menuOpen.value}
				>
					<IconDots size={17} />
				</button>
				{menuOpen.value && (
					<>
						<div class='entity-card__menu-backdrop' onClick={() => menuOpen.value = false} />
						<div class='entity-card__menu-pop' role='menu'>
							{items.map((item) => (
								<button
									type='button'
									key={item.label}
									class={`entity-card__menu-item ${
										item.danger ? 'entity-card__menu-item--danger' : ''
									}`}
									role='menuitem'
									onClick={() => {
										item.onSelect();
										menuOpen.value = false;
									}}
								>
									{item.icon}
									{item.label}
								</button>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
