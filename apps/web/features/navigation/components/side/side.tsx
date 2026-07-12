import { Button, IconButton, Tooltip } from '@projective/ui';
import { apps, INavApp } from '../../contracts/navigation.ts';
import '../../styles/components/side/side.css';
import '../../styles/components/side/quick-links.css';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useNavigationContext } from '../../contexts/NavigationContext.tsx';
import { useUserContext } from '../../contexts/UserContext.tsx';
import { IconChevronDown, IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import QuickLinkSubmenu from './QuickLinkSubmenu.tsx';

// Mini-component to handle local expansion state
function SidebarItem(
	{ app, isSidebarOpen, selected }: { app: INavApp; isSidebarOpen: boolean; selected: string },
) {
	const [isOpen, setIsOpen] = useState(false);
	const hasChildren = !!(app.children && app.children.length > 0);
	const hasQuickLinks = !!app.quickLinks;
	// Either kind of submenu earns a chevron + tooltip-suppression.
	const hasSubmenu = hasChildren || hasQuickLinks;

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
				disabled={isSidebarOpen || hasSubmenu}
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
			{hasSubmenu && (
				<div
					class='navigation__side__items__item__chevron'
					onClick={handleChevronClick}
				>
					<IconChevronDown size={16} />
				</div>
			)}

			{
				/* 3a. Dynamic quick-link reel (Projects / Services) — mounted only when opened, so the
			    lazy fetch fires on open and nav hydration pays nothing for it. */
			}
			{hasQuickLinks && isSidebarOpen && isOpen && (
				<QuickLinkSubmenu
					source={app.quickLinks!}
					open
					selected={selected}
				/>
			)}

			{/* 3b. Static submenu (e.g. Analytics): NOW strictly requires `isOpen` to be true */}
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
	const { user } = useUserContext();
	const [selected, setSelected] = useState('');

	useEffect(() => {
		if (typeof globalThis !== 'undefined') {
			const path = globalThis.location.pathname;
			setSelected(path);
		}
	}, []);

	// Persona/account visibility gates. Reading `user.value` here keeps the nav
	// reactive: switching persona (freelancer ⇄ business/team) or toggling
	// Operator Mode re-runs `me`, updates the signal, and the affected tabs mount
	// or unmount instantly — no full reload.
	// Teams is a freelancer-only space. It shows while acting as a freelancer — either the
	// active persona is the freelancer profile, or the freelancer has switched into one of
	// their team contexts (which clears activeProfileType but sets activeTeamId). It never
	// shows for clients (operator/business persona with no freelancer identity in play).
	const isFreelancer = user.value?.activeProfileType === 'freelancer' ||
		!!user.value?.activeTeamId;
	const isOperator = user.value?.isOperator === true;

	const visibleGroups = useMemo(() =>
		apps
			.map((group) =>
				group.filter((app) => {
					if (app.requires === 'freelancer') return isFreelancer;
					if (app.requires === 'operator') return isOperator;
					return true;
				})
			)
			.filter((group) => group.length > 0), [isFreelancer, isOperator]);

	return (
		<nav class='navigation__side'>
			<div class='navigation__side__apps'>
				{visibleGroups.map((group, i) => (
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
						{i < visibleGroups.length - 1 && <hr class='navigation__side__divider' />}
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
