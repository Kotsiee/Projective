import '../../styles/components/nav-tabs.css';
import type { ComponentChildren } from 'preact';
import { RippleSurface } from '../ripple/RippleSurface.tsx';

/* #region Types */
export interface NavTab {
	/** Stable identifier used for the active comparison and the URL hash. */
	id: string;
	label: string;
	/** Optional leading glyph. */
	icon?: ComponentChildren;
	/** Optional href — when set the tab renders as an anchor (SSR-navigable). */
	href?: string;
}

export interface NavTabsProps {
	tabs: NavTab[];
	activeId: string;
	onSelect: (id: string) => void;
	className?: string;
	/** Accessible label for the tablist. */
	ariaLabel?: string;
}
/* #endregion */

/**
 * @function NavTabs
 * @description A premium, navigation-optimised tab strip — the bespoke alternative to stacking
 * generic {@link Button}s for section navigation. Each tab is a {@link RippleSurface} so the
 * platform's material ripple fires on tap; the active tab is conveyed purely by a sliding accent
 * underline (no chips, no counters). Fully token-driven, so it re-themes for Light/Dark instantly.
 */
export function NavTabs({ tabs, activeId, onSelect, className, ariaLabel }: NavTabsProps) {
	const classes = ['nav-tabs', className].filter(Boolean).join(' ');

	return (
		<nav class={classes} role='tablist' aria-label={ariaLabel}>
			{tabs.map((tab) => {
				const active = tab.id === activeId;
				return (
					<RippleSurface
						key={tab.id}
						as={tab.href ? 'a' : 'button'}
						href={tab.href}
						type={tab.href ? undefined : 'button'}
						role='tab'
						aria-selected={active}
						class='nav-tabs__tab'
						data-active={active ? 'true' : 'false'}
						onClick={(e: MouseEvent) => {
							if (!tab.href) e.preventDefault();
							onSelect(tab.id);
						}}
					>
						{tab.icon && <span class='nav-tabs__icon' aria-hidden='true'>{tab.icon}</span>}
						<span class='nav-tabs__label'>{tab.label}</span>
					</RippleSurface>
				);
			})}
		</nav>
	);
}

export default NavTabs;
