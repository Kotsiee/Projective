import '@styles/components/navigation/nav-bar-user-side.css';
import { apps } from '@contracts/navigation.ts';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-preact';
import { useEffect, useState } from 'preact/hooks';
import { signal } from '@preact/signals';

const open = signal(false);

export default function NavBarUserSide() {
	const navApps = apps;
	const [selected, setSelected] = useState('');

	useEffect(() => {
		const loc = globalThis.location.pathname.substring(1).split('/')[0];
		setSelected(`/${loc.trim()}`);
	}, [globalThis.location]);

	const handleButtonClick = (_: MouseEvent) => {
		open.value = !open.value;
	};

	return (
		<aside class='nav-bar-user-side' data-sidebar-open={open.value}>
			<nav class='nav-bar-user-side__container'>
				{navApps.map((group) => {
					return (
						<div class='nav-bar-user-side__group'>
							{group.map((app) => {
								return (
									<a
										class='nav-bar-user-side__app'
										href={app.link}
										data-selected={selected === app.link}
										data-tooltip={app.name}
									>
										<app.icon />
										{open.value && <span>{app.name}</span>}
									</a>
								);
							})}
							<hr />
						</div>
					);
				})}
				<button type='button' class='nav-bar-user-side__open' onClick={handleButtonClick}>
					{open.value ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
				</button>
			</nav>
		</aside>
	);
}
