/**
 * @file ProfileTabs.tsx
 * @description The public content tab bar. Only rendered when NOT in Editor
 * Mode (self-view deconstructs tabs into sidebar routes instead). Counts are
 * surfaced as small chips beside the label.
 */

import { Button } from '@projective/ui';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ProfileTabKey } from '../../contracts/Profile.ts';

const TABS: { key: ProfileTabKey; label: string }[] = [
	{ key: 'services', label: 'Services' },
	{ key: 'projects', label: 'Projects' },
	{ key: 'portfolio', label: 'Portfolio' },
	{ key: 'experience', label: 'Experience' },
	{ key: 'education', label: 'Education' },
	{ key: 'teams', label: 'Teams' },
];

export default function ProfileTabs() {
	const { profile, activeTab, setTab } = useProfileContext();
	const counts = profile.value.counts;

	return (
		<nav class='profile-tabs' role='tablist' aria-label='Profile sections'>
			{TABS.map((t) => {
				const active = activeTab.value === t.key;
				const count = counts[t.key];
				return (
					<Button
						key={t.key}
						variant={active ? 'secondary' : 'link'}
						size='small'
						badge={typeof count === 'number' ? count : undefined}
						onClick={() => setTab(t.key)}
					>
						{t.label}
					</Button>
				);
			})}
		</nav>
	);
}
