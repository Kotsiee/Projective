/**
 * @file ProjectsTab.tsx
 * @description The "Projects" panel. Clean, banner-free cards (via the unified `ProjectCard`)
 * split into "Projects owned" and "Projects worked on" sections. A grid/list toggle is bound to
 * the `projectsView` signal.
 */

import '../../styles/components/projects.css';

import { useSignal } from '@preact/signals';
import { Button, IconButton, ProjectCard } from '@projective/ui';
import { IconChevronRight, IconLayoutGrid, IconList } from '@tabler/icons-preact';
import type { EntityCardModel, EntityCardStatusTone } from '@projective/types';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ProjectItem } from '../../contracts/Profile.ts';

const STATUS_TONE: Record<ProjectItem['status'], EntityCardStatusTone> = {
	active: 'success',
	completed: 'neutral',
	archived: 'warning',
};

function fmtDate(iso: string): string {
	const [y, m] = iso.split('-');
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	return `${months[Number(m) - 1]} ${y}`;
}

/** Adapts a profile `ProjectItem` into the unified card model (project = metadata only). */
function projectToCardModel(p: ProjectItem): EntityCardModel {
	const stats: EntityCardModel['stats'] = [{ key: 'stars', value: p.stars }];
	if (typeof p.contributions === 'number') {
		stats.push({ key: 'contributions', value: p.contributions });
	}

	return {
		id: p.id,
		entity_type: 'project',
		display_title: p.name,
		display_description: p.description,
		tags: p.stack,
		rating_average: 0,
		rating_count: 0,
		owner_name: '',
		owner_handle: '',
		owner_avatar: null,
		banner: null,
		accent: 'primary',
		price_cents: null,
		price_unit: null,
		availability: null,
		location: null,
		scope: null,
		taxonomy: null,
		is_sponsored: false,
		subtitle: p.role ? `${p.affiliation} · ${p.role}` : p.affiliation,
		stats,
		status: { label: p.status, tone: STATUS_TONE[p.status] },
		timeline_note: `Updated ${fmtDate(p.updatedAt)}`,
	};
}

/** A collapsible accordion branch grouping projects by relationship. */
function ProjectSection(
	{ label, items, defaultOpen = true }: {
		label: string;
		items: ProjectItem[];
		defaultOpen?: boolean;
	},
) {
	const open = useSignal(defaultOpen);
	if (items.length === 0) return null;

	return (
		<section class='repo-branch' data-open={open.value}>
			<Button
				variant='link'
				size='small'
				fullWidth
				startIcon={<IconChevronRight size={16} class='repo-branch__chevron' />}
				badge={items.length}
				onClick={() => (open.value = !open.value)}
			>
				{label}
			</Button>
			{open.value && (
				<div class='repo-grid'>
					{items.map((p) => <ProjectCard key={p.id} entity={projectToCardModel(p)} />)}
				</div>
			)}
		</section>
	);
}

export default function ProjectsTab() {
	const { profile, projectsView } = useProfileContext();
	const projects = profile.value.projects;
	const view = projectsView.value;

	const owned = projects.filter((p) => p.relationship === 'owned');
	const workedOn = projects.filter((p) => p.relationship === 'worked_on');

	return (
		<section class='repo' data-view={view}>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Projects</h2>
					<p class='tab-head__sub'>{projects.length} projects owned & contributed to</p>
				</div>
				<div class='view-toggle' role='group' aria-label='View mode'>
					<IconButton
						aria-label='Grid view'
						variant={view === 'grid' ? 'primary' : 'secondary'}
						ghost={view !== 'grid'}
						size='small'
						onClick={() => (projectsView.value = 'grid')}
					>
						<IconLayoutGrid size={17} />
					</IconButton>
					<IconButton
						aria-label='List view'
						variant={view === 'list' ? 'primary' : 'secondary'}
						ghost={view !== 'list'}
						size='small'
						onClick={() => (projectsView.value = 'list')}
					>
						<IconList size={17} />
					</IconButton>
				</div>
			</header>

			{projects.length === 0 ? <div class='tab-empty'>No projects yet.</div> : (
				<>
					<ProjectSection label='Projects owned' items={owned} />
					<ProjectSection label='Projects worked on' items={workedOn} />
				</>
			)}
		</section>
	);
}
