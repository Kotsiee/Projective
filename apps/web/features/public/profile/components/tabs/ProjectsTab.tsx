/**
 * @file ProjectsTab.tsx
 * @description The "Projects" panel. Clean, banner-free cards (via the unified `ProjectCard`)
 * grouped into "Projects owned" and "Projects worked on" sections through the shared
 * `@projective/ui` Accordion primitive — the same accordion used elsewhere on the platform, with
 * no numerical tags on the headers. The layout is locked to a responsive grid (no list toggle) to
 * match the Explore discovery surface.
 */

import '../../styles/components/projects.css';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	ProjectCard,
} from '@projective/ui';
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

/** A grouped section of projects rendered as one shared-Accordion item (no count tag). */
function ProjectSection(
	{ value, label, items }: { value: string; label: string; items: ProjectItem[] },
) {
	if (items.length === 0) return null;
	return (
		<AccordionItem value={value}>
			<AccordionTrigger>{label}</AccordionTrigger>
			<AccordionContent>
				<div class='repo-grid'>
					{items.map((p) => <ProjectCard key={p.id} entity={projectToCardModel(p)} />)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

export default function ProjectsTab() {
	const { profile, hiddenItems } = useProfileContext();
	// Owner-hidden items are dropped from the presentation surface.
	const hidden = hiddenItems.value;
	const projects = profile.value.projects.filter((p) => !hidden.has(p.id));

	const owned = projects.filter((p) => p.relationship === 'owned');
	const workedOn = projects.filter((p) => p.relationship === 'worked_on');

	return (
		<section class='repo'>
			<header class='tab-head'>
				<div>
					<h2 class='tab-head__title'>Projects</h2>
					<p class='tab-head__sub'>{projects.length} projects owned & contributed to</p>
				</div>
			</header>

			{projects.length === 0
				? <div class='tab-empty'>No projects yet.</div>
				: (
					<Accordion type='multiple' defaultValue={['owned', 'worked_on']} variant='ghost'>
						<ProjectSection value='owned' label='Projects owned' items={owned} />
						<ProjectSection value='worked_on' label='Projects worked on' items={workedOn} />
					</Accordion>
				)}
		</section>
	);
}
