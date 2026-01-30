import '@styles/components/navigation/nav-bar-user-side.css';
import { apps } from '@contracts/navigation.ts';
import { useEffect, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import {
	IconLayoutSidebarLeftCollapse,
	IconLayoutSidebarLeftExpand,
	IconMoon,
	IconSun,
} from '@tabler/icons-preact';
import { theme } from '@projective/ui';

const open = signal(false);

export default function NavBarUserSide() {
	const navApps = apps;
	const [selected, setSelected] = useState('');

	useEffect(() => {
		if (typeof globalThis !== 'undefined') {
			const loc = globalThis.location.pathname.substring(1).split('/')[0];
			setSelected(`/${loc.trim()}`);
		}
	}, []);

	const toggleSidebar = () => {
		open.value = !open.value;
	};

	const toggleTheme = () => {
		theme.value = theme.value === 'light' ? 'dark' : 'light';
	};

	return (
		<aside class='nav-bar-user-side' data-sidebar-open={open.value}>
			<nav class='nav-bar-user-side__container'>
				{/* --- Scrollable App List --- */}
				<div class='nav-bar-user-side__scroll-area'>
					{navApps.map((group, groupIdx) => (
						<div class='nav-bar-user-side__group' key={groupIdx}>
							{group.map((app) => (
								<a
									key={app.link}
									class='nav-bar-user-side__item'
									href={app.link}
									data-selected={selected === app.link}
									data-tooltip={!open.value ? app.name : undefined}
									data-tooltip-position='right'
								>
									<div class='nav-bar-user-side__icon'>
										<app.icon size={20} stroke={1.5} />
									</div>
									<span class='nav-bar-user-side__label'>
										{app.name}
									</span>
								</a>
							))}
							{groupIdx < navApps.length - 1 && <hr class='nav-bar-user-side__divider' />}
						</div>
					))}
				</div>

				{/* --- Fixed Footer --- */}
				<div class='nav-bar-user-side__footer'>
					<button
						type='button'
						class='nav-bar-user-side__item'
						onClick={toggleTheme}
						data-tooltip={!open.value ? 'Toggle Theme' : undefined}
						data-tooltip-position='right'
					>
						<div class='nav-bar-user-side__icon'>
							{theme.value === 'light'
								? <IconMoon size={20} stroke={1.5} />
								: <IconSun size={20} stroke={1.5} />}
						</div>
						<span class='nav-bar-user-side__label'>
							{theme.value === 'light' ? 'Dark Mode' : 'Light Mode'}
						</span>
					</button>

					<button
						type='button'
						class='nav-bar-user-side__item'
						onClick={toggleSidebar}
						data-tooltip={!open.value ? 'Expand' : undefined}
						data-tooltip-position='right'
					>
						<div class='nav-bar-user-side__icon'>
							{open.value
								? <IconLayoutSidebarLeftCollapse size={20} stroke={1.5} />
								: <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />}
						</div>
						<span class='nav-bar-user-side__label'>
							Collapse
						</span>
					</button>
				</div>
			</nav>
		</aside>
	);
}
