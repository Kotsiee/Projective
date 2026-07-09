/**
 * @file ProfileTabs.tsx
 * @description The public content tab bar. Built on the bespoke `@projective/ui` NavTabs primitive
 * (ripple + sliding accent underline) rather than stacked generic Buttons. Labels carry no numeric
 * counters; selecting a tab reflects an elegant anchor hash (`#services`, `#reviews`, …) into the
 * URL and, on load, the hash restores the active tab. Owners see every tab; the public never sees a
 * tab the owner has toggled hidden.
 */

import { NavTabs } from '@projective/ui';
import { useEffect } from 'preact/hooks';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ProfileTabKey } from '../../contracts/Profile.ts';

const TABS: { key: ProfileTabKey; label: string }[] = [
	{ key: 'services', label: 'Services' },
	{ key: 'projects', label: 'Projects' },
	{ key: 'portfolio', label: 'Portfolio' },
	{ key: 'experience', label: 'Experience' },
	{ key: 'education', label: 'Education' },
	{ key: 'teams', label: 'Teams' },
	{ key: 'reviews', label: 'Reviews' },
];

const TAB_KEYS = new Set(TABS.map((t) => t.key));

export default function ProfileTabs() {
	const { activeTab, setTab, isOwn, hiddenTabs } = useProfileContext();

	// On mount, restore the active tab from the URL hash (e.g. `/nadiaux#reviews`).
	useEffect(() => {
		const raw = globalThis.location?.hash?.replace(/^#/, '') as ProfileTabKey;
		if (raw && TAB_KEYS.has(raw)) setTab(raw);
	}, []);

	const select = (key: string) => {
		const tab = key as ProfileTabKey;
		setTab(tab);
		// Reflect an elegant anchor hash without scrolling the page or a history spam.
		if (globalThis.history?.replaceState) {
			globalThis.history.replaceState(null, '', `#${tab}`);
		}
	};

	const own = isOwn.value;
	const hidden = hiddenTabs.value;
	const visible = TABS
		.filter((t) => own || !hidden.has(t.key))
		.map((t) => ({ id: t.key, label: t.label }));

	return (
		<NavTabs
			className='profile-tabs'
			ariaLabel='Profile sections'
			tabs={visible}
			activeId={activeTab.value}
			onSelect={select}
		/>
	);
}
