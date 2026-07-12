/**
 * @file WorkspaceHero.tsx
 * @description The dashboard's command band: a persona-aware headline, primary actions, and a row of
 * live KPIs derived from the shared project list. Purely presentational over the passed signals.
 */

import { Button, MetricCard } from '@projective/ui';
import { type Signal, useComputed } from '@preact/signals';
import { IconBolt, IconCompass, IconFolders, IconPlus, IconStar } from '@tabler/icons-preact';
import type { DashboardProjectRow } from '../../contracts/dashboard.ts';

interface Props {
	persona: 'freelancer' | 'client';
	displayName: string | null;
	projects: Signal<DashboardProjectRow[]>;
	loading: Signal<boolean>;
	onCreate?: () => void;
}

export function WorkspaceHero({ persona, displayName, projects, loading, onCreate }: Props) {
	const stats = useComputed(() => {
		const all = projects.value;
		return {
			total: all.length,
			inMotion: all.filter((p) => p.status === 'active' || p.status === 'on_hold').length,
			unread: all.filter((p) => p.has_unread ?? p.is_unread).length,
			starred: all.filter((p) => p.is_starred).length,
		};
	});

	const first = displayName?.split(' ')[0];
	const lede = persona === 'client'
		? 'Track delivery, review work, and hire the talent your projects need — all in one place.'
		: 'Track your live work, jump back into any stage, and discover projects matched to your craft.';

	const n = (v: number) => (loading.value && projects.value.length === 0 ? '—' : String(v));

	return (
		<header class='pw-hero pw-panel--luxe'>
			<div class='pw-hero__bar'>
				<div class='pw-hero__intro'>
					<span class='pw-eyebrow pw-eyebrow--accent'>Projects Workspace</span>
					<h1 class='pw-hero__title'>
						{first ? <>Welcome back, {first}</> : 'Your Project Control Hub'}
					</h1>
					<p class='pw-hero__lede'>{lede}</p>
				</div>
				<div class='pw-hero__actions'>
					<Button variant='primary' startIcon={<IconPlus size={16} />} onClick={onCreate}>
						New Project
					</Button>
					<Button
						href='/explore?category=projects'
						variant='secondary'
						outlined
						startIcon={<IconCompass size={16} />}
						f-client-nav={false}
					>
						Explore
					</Button>
				</div>
			</div>

			<div class='pw-hero__kpis'>
				<MetricCard
					label='In motion'
					value={n(stats.value.inMotion)}
					accent='primary'
					icon={<IconBolt size={16} />}
					sublabel='active & on-hold'
				/>
				<MetricCard
					label='All projects'
					value={n(stats.value.total)}
					accent='mint'
					icon={<IconFolders size={16} />}
					sublabel='in your workspace'
				/>
				<MetricCard
					label='Needs attention'
					value={n(stats.value.unread)}
					accent='amber'
					sublabel='unread updates'
				/>
				<MetricCard
					label='Starred'
					value={n(stats.value.starred)}
					accent='violet'
					icon={<IconStar size={16} />}
					sublabel='pinned'
				/>
			</div>
		</header>
	);
}

export default WorkspaceHero;
