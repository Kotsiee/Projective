/**
 * @file ProjectMatrixCard.tsx
 * @description A single tile in the Active Projects Matrix. Renders the phase, health and velocity
 * indicators derived from the live list row + `get_project_card_summary`. Enters the project on
 * click (full nav — matches the app's project-entry convention so the workspace layout boots clean).
 */

import { Avatar, ProgressMeter, StatusBadge } from '@projective/ui';
import {
	IconChevronRight,
	IconClock,
	IconLayersSubtract,
	IconListCheck,
	IconStarFilled,
} from '@tabler/icons-preact';
import type { MatrixProject } from '../../contracts/dashboard.ts';

export function ProjectMatrixCard(
	{ project, loading }: { project: MatrixProject; loading?: boolean },
) {
	const s = project.summary;

	return (
		<a class='pw-matrix-card' href={project.href} f-client-nav={false} data-f-preload>
			<div class='pw-matrix-card__top'>
				<span class='pw-matrix-card__phase'>{project.phase}</span>
				<div class='pw-matrix-card__flags'>
					{project.isStarred && (
						<IconStarFilled size={14} class='pw-matrix-card__star' aria-label='Starred' />
					)}
					{project.hasUnread && <span class='pw-matrix-card__unread' title='Unread activity' />}
					<StatusBadge tone={project.health.tone} variant='soft' size='sm' dot>
						{project.health.label}
					</StatusBadge>
				</div>
			</div>

			<h3 class='pw-matrix-card__title'>{project.title}</h3>

			<div class='pw-matrix-card__progress'>
				<ProgressMeter
					value={project.progress}
					tone='gold'
					showValue
					ariaLabel={`${project.title} progress`}
				/>
				<span class='pw-matrix-card__velocity' data-loading={loading ? 'true' : 'false'}>
					{loading && !s ? 'Reading the board…' : project.velocity}
				</span>
			</div>

			{s && (
				<div class='pw-matrix-card__scope'>
					<span class='pw-matrix-card__scope-cell'>
						<IconLayersSubtract size={14} />
						{s.stage_count} {s.stage_count === 1 ? 'stage' : 'stages'}
					</span>
					<span class='pw-matrix-card__scope-cell'>
						<IconListCheck size={14} />
						{s.tickets.active} active
					</span>
					{s.pending_submissions > 0 && (
						<span class='pw-matrix-card__scope-cell pw-matrix-card__scope-cell--alert'>
							{s.pending_submissions} to review
						</span>
					)}
				</div>
			)}

			<div class='pw-matrix-card__foot'>
				<span class='pw-matrix-card__owner'>
					<Avatar name={project.ownerName} size={22} />
					<span class='pw-matrix-card__owner-name'>{project.ownerName}</span>
				</span>
				<span class='pw-matrix-card__meta'>
					{project.milestone && (
						<span class='pw-matrix-card__milestone'>
							<IconClock size={13} />
							{project.milestone}
						</span>
					)}
					<IconChevronRight size={16} class='pw-matrix-card__go' />
				</span>
			</div>
		</a>
	);
}

export default ProjectMatrixCard;
