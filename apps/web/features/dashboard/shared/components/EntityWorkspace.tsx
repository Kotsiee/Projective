/**
 * @file EntityWorkspace.tsx
 * @description The shared 70/30 operational workspace shell used by both the Business and
 * Teams spaces. The 30% aside is a glass roster of the user's active entities; the 70%
 * main fills the canvas with a premium CTA header, quick-action nodes, a cross-cutting
 * activity feed and an organizational-health metric matrix. Purely presentational — the
 * owning island supplies data + handlers.
 */

import { ComponentChildren } from 'preact';
import {
	ActivityFeed,
	type ActivityItem,
	EntityRoster,
	GlassPanel,
	MetricPlaceholder,
	QuickActionCard,
	RippleSurface,
	type RosterEntity,
} from '@projective/ui';
import { IconPlus } from '@tabler/icons-preact';

export interface WorkspaceQuickAction {
	key: string;
	icon: ComponentChildren;
	title: string;
	description?: string;
	accent?: 'primary' | 'mint' | 'violet' | 'amber';
	href?: string;
	onClick?: () => void;
	disabled?: boolean;
}

export interface WorkspaceMetric {
	key: string;
	label: string;
	icon?: ComponentChildren;
	accent?: 'primary' | 'mint' | 'violet' | 'amber';
	hint?: string;
}

export interface EntityWorkspaceProps {
	title: string;
	subtitle: string;
	newLabel: string;
	rosterTitle: string;
	entities: RosterEntity[];
	activeId: string | null;
	emptyRoster: string;
	onSelect: (entity: RosterEntity) => void;
	onNew: () => void;
	quickActions: WorkspaceQuickAction[];
	activity: ActivityItem[];
	activitySubtitle: string;
	metrics: WorkspaceMetric[];
}

export function EntityWorkspace(props: EntityWorkspaceProps) {
	const {
		title,
		subtitle,
		newLabel,
		rosterTitle,
		entities,
		activeId,
		emptyRoster,
		onSelect,
		onNew,
		quickActions,
		activity,
		activitySubtitle,
		metrics,
	} = props;

	return (
		<div class='workspace'>
			<div class='workspace__grid'>
				{/* 30% — glass roster of active entities */}
				<aside class='workspace__aside'>
					<GlassPanel
						tone='strong'
						flush
						className='workspace__roster-panel'
						title={rosterTitle}
						subtitle={`${entities.length} ${entities.length === 1 ? 'entity' : 'entities'}`}
						actions={
							<button
								type='button'
								class='workspace__roster-add'
								aria-label={newLabel}
								onClick={onNew}
							>
								<IconPlus size={18} stroke={2.2} />
							</button>
						}
					>
						<EntityRoster
							entities={entities}
							activeId={activeId}
							onSelect={onSelect}
							emptyLabel={emptyRoster}
						/>
					</GlassPanel>
				</aside>

				{/* 70% — operational overview */}
				<main class='workspace__main'>
					<header class='workspace__header'>
						<div class='workspace__heading'>
							<h1 class='workspace__title'>{title}</h1>
							<p class='workspace__subtitle'>{subtitle}</p>
						</div>
						<RippleSurface
							as='button'
							premium
							type='button'
							class='workspace__cta'
							onClick={onNew}
						>
							<IconPlus size={18} stroke={2.2} />
							{newLabel}
						</RippleSurface>
					</header>

					<GlassPanel title='Quick actions' className='workspace__quick'>
						<div class='workspace__quick-grid'>
							{quickActions.map((qa) => (
								<QuickActionCard
									key={qa.key}
									icon={qa.icon}
									title={qa.title}
									description={qa.description}
									accent={qa.accent}
									href={qa.href}
									onClick={qa.onClick}
									disabled={qa.disabled}
								/>
							))}
						</div>
					</GlassPanel>

					<div class='workspace__split'>
						<GlassPanel
							title='Activity'
							subtitle={activitySubtitle}
							className='workspace__activity'
						>
							<ActivityFeed items={activity} emptyLabel='No recent activity yet.' />
						</GlassPanel>

						<GlassPanel
							title='Organizational health'
							subtitle='Metrics come online as your workspace fills up'
							className='workspace__health'
						>
							<div class='workspace__metric-grid'>
								{metrics.map((m) => (
									<MetricPlaceholder
										key={m.key}
										label={m.label}
										icon={m.icon}
										accent={m.accent}
										hint={m.hint}
									/>
								))}
							</div>
						</GlassPanel>
					</div>
				</main>
			</div>
		</div>
	);
}
