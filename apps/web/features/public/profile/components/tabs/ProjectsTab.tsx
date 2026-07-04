/**
 * @file ProjectsTab.tsx
 * @description The "Projects" panel. Clean, repo/data-style cards (no imagery)
 * split into "Projects owned" and "Projects worked on" sections. A grid/list
 * toggle is bound to the `projectsView` signal.
 */

import '../../styles/components/projects.css';

import { useSignal } from '@preact/signals';
import { Tag } from '@projective/ui';
import {
	IconChevronRight,
	IconGitFork,
	IconLayoutGrid,
	IconList,
	IconStarFilled,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { ProjectItem } from '../../contracts/Profile.ts';

const STATUS_COLOR: Record<ProjectItem['status'], 'success' | 'neutral' | 'warning'> = {
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

function ProjectCard({ p }: { p: ProjectItem }) {
	return (
		<article class='repo-card'>
			<div class='repo-card__head'>
				<h3 class='repo-card__name'>{p.name}</h3>
				<span class='repo-card__affiliation'>{p.affiliation}</span>
			</div>

			{p.role && <span class='repo-card__role'>{p.role}</span>}

			<p class='repo-card__desc'>{p.description}</p>

			{p.stack.length > 0 && (
				<div class='repo-card__stack'>
					{p.stack.map((s) => (
						<Tag key={s} size='small' color='neutral' variant='outline'>{s}</Tag>
					))}
				</div>
			)}

			<div class='repo-card__stats'>
				<span class='repo-card__stat'>
					<IconStarFilled size={14} /> {p.stars}
				</span>
				{typeof p.contributions === 'number' && (
					<span class='repo-card__stat'>
						<IconGitFork size={14} /> {p.contributions}
					</span>
				)}
				<Tag size='small' color={STATUS_COLOR[p.status]} variant='subtle' rounded>
					{p.status}
				</Tag>
				<span class='repo-card__updated'>Updated {fmtDate(p.updatedAt)}</span>
			</div>
		</article>
	);
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
			<button
				type='button'
				class='repo-branch__toggle'
				aria-expanded={open.value}
				onClick={() => (open.value = !open.value)}
			>
				<IconChevronRight size={16} class='repo-branch__chevron' />
				<span class='repo-branch__label'>{label}</span>
				<span class='repo-branch__count'>{items.length}</span>
			</button>
			{open.value && (
				<div class='repo-grid'>
					{items.map((p) => <ProjectCard key={p.id} p={p} />)}
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
					<button
						type='button'
						class='view-toggle__btn'
						data-active={view === 'grid'}
						aria-label='Grid view'
						onClick={() => (projectsView.value = 'grid')}
					>
						<IconLayoutGrid size={17} />
					</button>
					<button
						type='button'
						class='view-toggle__btn'
						data-active={view === 'list'}
						aria-label='List view'
						onClick={() => (projectsView.value = 'list')}
					>
						<IconList size={17} />
					</button>
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
