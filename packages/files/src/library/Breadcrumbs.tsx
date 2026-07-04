import { IconChevronDown, IconChevronRight } from '@tabler/icons-preact';
import { LibraryStore } from './useLibraryStore.ts';
import { DirectoryNode, SOURCE_LABELS } from './types.ts';
import { Menu, MenuItem } from './Menu.tsx';

interface BreadcrumbsProps {
	store: LibraryStore;
}

/**
 * Column 2 breadcrumb navigation. Each segment is clickable, and hovering a
 * segment reveals a chevron that opens a menu of sibling directories at that
 * hierarchy level for fast hopping.
 */
export function Breadcrumbs({ store }: BreadcrumbsProps) {
	const source = store.activeSource.value;
	const path = store.directoryPath(store.activeDirId.value, source);

	const siblingItems = (siblings: DirectoryNode[], activeId: string | null): MenuItem[] =>
		siblings.map((d) => ({
			key: d.id,
			label: d.name,
			disabled: d.id === activeId,
			onSelect: () => store.navigateTo(source, d.id),
		}));

	// Root crumb — jumps into any top-level folder of the active source.
	const rootSiblings = store.childDirectories(null, source);

	return (
		<nav class='uf-crumbs' aria-label='Breadcrumb'>
			<Crumb
				label={SOURCE_LABELS[source]}
				isLast={path.length === 0}
				onNavigate={() => store.navigateTo(source, null)}
				menuItems={siblingItems(rootSiblings, store.activeDirId.value)}
			/>

			{path.map((dir, i) => {
				const siblings = store.childDirectories(dir.parentId, source);
				return (
					<span key={dir.id} class='uf-crumbs__group'>
						<IconChevronRight size={14} class='uf-crumbs__sep' />
						<Crumb
							label={dir.name}
							isLast={i === path.length - 1}
							onNavigate={() => store.navigateTo(source, dir.id)}
							menuItems={siblingItems(siblings, dir.id)}
						/>
					</span>
				);
			})}
		</nav>
	);
}

interface CrumbProps {
	label: string;
	isLast: boolean;
	onNavigate: () => void;
	menuItems: MenuItem[];
}

function Crumb({ label, isLast, onNavigate, menuItems }: CrumbProps) {
	return (
		<span class={`uf-crumb ${isLast ? 'uf-crumb--current' : ''}`}>
			<button type='button' class='uf-crumb__label' onClick={onNavigate}>
				{label}
			</button>
			{menuItems.length > 0 && (
				<Menu
					align='left'
					className='uf-crumb__menu'
					trigger={
						<span class='uf-crumb__chevron' aria-label={`Jump to a folder beside ${label}`}>
							<IconChevronDown size={13} />
						</span>
					}
					items={menuItems}
				/>
			)}
		</span>
	);
}
