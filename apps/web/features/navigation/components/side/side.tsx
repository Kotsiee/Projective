import { Button, IconButton, Tooltip } from '@projective/ui';
import { apps, INavApp } from '../../contracts/navigation.ts';
import '../../styles/components/side/side.css';
import { useEffect, useState } from 'preact/hooks';
import { useNavigationContext } from '../../contexts/NavigationContext.tsx';
import { IconChevronDown, IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';

// Mini-component to handle local expansion state
function SidebarItem(
	{ app, isSidebarOpen, selected }: { app: INavApp; isSidebarOpen: boolean; selected: string },
) {
	const [isOpen, setIsOpen] = useState(false);
	const hasChildren = app.children && app.children.length > 0;

	// This strictly handles the chevron click
	const handleChevronClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation(); // Stops the click from triggering the link underneath
		if (isSidebarOpen) {
			setIsOpen(!isOpen);
		}
	};

	// Close local dropdowns if the main sidebar collapses
	useEffect(() => {
		if (!isSidebarOpen) setIsOpen(false);
	}, [isSidebarOpen]);

	return (
		<li
			class={`navigation__side__items__item ${isOpen ? 'is-open' : ''}`}
			data-selected={selected === app.link}
		>
			{
				/* 1. Main Button: This is ALWAYS a functional link now.
			    The Tooltip is portaled to <body> so the collapsed-rail label can
			    never be clipped by the sidebar's overflow; it self-disables once
			    the sidebar is expanded (labels visible) or the item has a submenu. */
			}
			<Tooltip
				label={app.name}
				position='right'
				disabled={isSidebarOpen || hasChildren}
				className='navigation__side__items__item__tooltip'
			>
				<Button
					aria-label={app.name}
					ghost
					variant='secondary'
					className='navigation__side__items__item__button'
					href={app.link}
				>
					<div class='navigation__side__items__item__content'>
						<div class='navigation__side__items__item__icon'>
							<app.icon size={20} stroke={1.5} />
						</div>

						<div class='navigation__side__items__item__label'>
							{app.name}
						</div>
					</div>
				</Button>
			</Tooltip>

			{/* 2. Independent Toggle Button: Sits on the right edge */}
			{hasChildren && (
				<div
					class='navigation__side__items__item__chevron'
					onClick={handleChevronClick}
				>
					<IconChevronDown size={16} />
				</div>
			)}

			{/* 3. Submenu: NOW strictly requires `isOpen` to be true */}
			{hasChildren && isSidebarOpen && isOpen && (
				<div class='navigation__side__submenu'>
					{app.children?.map((child, k) => (
						<a
							key={k}
							href={child.link}
							class='navigation__side__submenu__link'
							data-selected={selected === child.link}
						>
							{child.name}
						</a>
					))}
				</div>
			)}
		</li>
	);
}

export default function NavigationSide() {
	const { isTopSideNavExpanded, toggleTopSideNav } = useNavigationContext();
	const [selected, setSelected] = useState('');

	useEffect(() => {
		if (typeof globalThis !== 'undefined') {
			const path = globalThis.location.pathname;
			setSelected(path);
		}
	}, []);

	return (
		<nav class='navigation__side'>
			<div class='navigation__side__apps'>
				{apps.map((group, i) => (
					<div key={i} style={{ width: '100%' }}>
						<ul class='navigation__side__items'>
							{group.map((app, j) => (
								<SidebarItem
									key={j}
									app={app}
									isSidebarOpen={isTopSideNavExpanded.value}
									selected={selected}
								/>
							))}
						</ul>
						{i < apps.length - 1 && <hr class='navigation__side__divider' />}
					</div>
				))}
			</div>

			<div class='navigation__side__open' style={{ paddingBottom: '1rem' }}>
				<IconButton
					aria-label='Toggle Sidebar'
					ghost
					onClick={toggleTopSideNav}
				>
					{isTopSideNavExpanded.value
						? <IconChevronLeft size={20} />
						: <IconChevronRight size={20} />}
				</IconButton>
			</div>
		</nav>
	);
}
