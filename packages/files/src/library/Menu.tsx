import { JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import {
	IconChevronLeft,
	IconChevronRight,
	IconCornerDownRight,
	IconFolder,
} from '@tabler/icons-preact';
import { LibraryStore } from './useLibraryStore.ts';
import { DirectoryNode, SOURCE_LABELS, StorageSource } from './types.ts';

export interface MenuItem {
	key: string;
	label: string;
	icon?: JSX.Element;
	danger?: boolean;
	disabled?: boolean;
	/** Tree depth for nested folder lists; adds left padding when > 0. */
	indent?: number;
	/** When present, selecting the item drills into this nested list. */
	submenu?: MenuItem[];
	/** Header shown at the top of the drilled-in submenu. */
	submenuTitle?: string;
	onSelect?: () => void;
}

interface MenuProps {
	/** The clickable element that opens the menu. */
	trigger: JSX.Element;
	items: MenuItem[];
	align?: 'left' | 'right';
	className?: string;
}

/** A compact, click-away dropdown menu anchored to a trigger element. */
export function Menu({ trigger, items, align = 'right', className }: MenuProps) {
	const open = useSignal(false);
	// Drill-in stack: each entry is a submenu the user has descended into.
	const stack = useSignal<{ title?: string; items: MenuItem[] }[]>([]);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open.value) return;
		const onDown = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) close();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		document.addEventListener('mousedown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [open.value]);

	const close = () => {
		open.value = false;
		stack.value = [];
	};

	const level = stack.value[stack.value.length - 1];
	const current = level ? level.items : items;

	return (
		<div class={`uf-menu ${className ?? ''}`} ref={ref}>
			<div
				class='uf-menu__trigger'
				onClick={(e) => {
					e.stopPropagation();
					open.value ? close() : (open.value = true);
				}}
			>
				{trigger}
			</div>

			{open.value && (
				<div class={`uf-menu__list uf-menu__list--${align}`} role='menu'>
					{level && (
						<button
							type='button'
							class='uf-menu__back'
							onClick={(e) => {
								e.stopPropagation();
								stack.value = stack.value.slice(0, -1);
							}}
						>
							<IconChevronLeft size={14} />
							<span>{level.title ?? 'Back'}</span>
						</button>
					)}
					{current.map((item) => (
						<button
							key={item.key}
							type='button'
							role='menuitem'
							disabled={item.disabled}
							class={`uf-menu__item ${item.danger ? 'uf-menu__item--danger' : ''}`}
							style={item.indent ? { paddingLeft: `${0.5 + item.indent * 0.75}rem` } : undefined}
							onClick={(e) => {
								e.stopPropagation();
								if (item.disabled) return;
								if (item.submenu) {
									stack.value = [
										...stack.value,
										{ title: item.submenuTitle ?? item.label, items: item.submenu },
									];
									return;
								}
								close();
								item.onSelect?.();
							}}
						>
							{item.icon && <span class='uf-menu__item-icon'>{item.icon}</span>}
							<span class='uf-menu__item-label'>{item.label}</span>
							{item.submenu && <IconChevronRight size={14} class='uf-menu__item-more' />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Builds the "Move file" menu options: every directory across every source,
 * indented by depth, plus each source's root. Selecting one relocates the file.
 */
export function buildMoveOptions(store: LibraryStore, fileId: string): MenuItem[] {
	const options: MenuItem[] = [];
	const sources: StorageSource[] = ['local', 'google-drive', 'onedrive', 'dropbox'];

	for (const source of sources) {
		// Source root.
		options.push({
			key: `${source}:root`,
			label: SOURCE_LABELS[source],
			icon: <IconFolder size={15} />,
			onSelect: () => store.moveFile(fileId, null, source),
		});
		// Directories under this source, depth-first for a natural tree order.
		const walk = (parentId: string | null, depth: number) => {
			for (const dir of store.childDirectories(parentId, source)) {
				options.push(dirOption(store, fileId, dir, depth));
				walk(dir.id, depth + 1);
			}
		};
		walk(null, 1);
	}

	return options;
}

function dirOption(
	store: LibraryStore,
	fileId: string,
	dir: DirectoryNode,
	depth: number,
): MenuItem {
	return {
		key: `${dir.source}:${dir.id}`,
		label: dir.name,
		indent: depth,
		icon: depth > 1 ? <IconCornerDownRight size={14} /> : <IconFolder size={15} />,
		onSelect: () => store.moveFile(fileId, dir.id, dir.source),
	};
}
