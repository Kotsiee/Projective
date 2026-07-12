/**
 * @file ActiveProjectsMatrix.tsx
 * @description The command grid of the user's ongoing projects. Receives the shared project list
 * (fetched once by the dashboard island) and enriches each row in parallel with its
 * `get_project_card_summary` so every tile carries real phase / health / velocity signals. Summary
 * failures degrade gracefully — the tile still renders from list data.
 */

import { Button } from '@projective/ui';
import { type Signal, useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconCompass, IconLayoutGrid, IconPlus } from '@tabler/icons-preact';
import type {
	DashboardProjectRow,
	MatrixProject,
	ProjectCardSummary,
} from '../../contracts/dashboard.ts';
import { toMatrixProject } from '../../contracts/dashboard.ts';
import ProjectMatrixCard from './ProjectMatrixCard.tsx';

const MATRIX_LIMIT = 9;

interface Props {
	rows: Signal<DashboardProjectRow[]>;
	loading: Signal<boolean>;
	error: Signal<string | null>;
	onCreate?: () => void;
}

export function ActiveProjectsMatrix({ rows, loading, error, onCreate }: Props) {
	const summaries = useSignal<Record<string, ProjectCardSummary>>({});
	const enriching = useSignal(false);
	/** Ids we've already requested a summary for, so revalidations don't re-fetch the world. */
	const requested = useSignal<Set<string>>(new Set());

	// Enrich each newly-seen project with its high-density summary, in parallel.
	useEffect(() => {
		const pending = rows.value
			.slice(0, MATRIX_LIMIT)
			.filter((r) => !requested.value.has(r.project_id));
		if (pending.length === 0) return;

		const next = new Set(requested.value);
		pending.forEach((r) => next.add(r.project_id));
		requested.value = next;

		enriching.value = true;
		Promise.all(pending.map(async (r) => {
			try {
				const res = await fetch(`/api/v1/dashboard/projects/${r.project_id}/summary`);
				if (!res.ok) return;
				const data = await res.json() as ProjectCardSummary;
				if (data && data.project_id) {
					summaries.value = { ...summaries.value, [r.project_id]: data };
				}
			} catch {
				/* leave this tile on list-only data */
			}
		})).finally(() => {
			enriching.value = false;
		});
	}, [rows.value]);

	const projects = useComputed<MatrixProject[]>(() => {
		const now = Date.now();
		return rows.value
			.slice(0, MATRIX_LIMIT)
			.map((r) => toMatrixProject(r, summaries.value[r.project_id] ?? null, now));
	});

	return (
		<section class='pw-panel pw-matrix' aria-label='Active projects'>
			<header class='pw-panel__head'>
				<div class='pw-panel__heading'>
					<span class='pw-eyebrow'>
						<IconLayoutGrid size={13} /> Portfolio
					</span>
					<h2 class='pw-panel__title'>Active Projects Matrix</h2>
				</div>
				<Button
					href='/explore?category=projects'
					variant='secondary'
					size='small'
					ghost
					f-client-nav={false}
					startIcon={<IconCompass size={15} />}
				>
					Explore
				</Button>
			</header>

			{loading.value
				? (
					<div class='pw-matrix__grid'>
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} class='pw-matrix-card pw-matrix-card--skeleton' aria-hidden='true' />
						))}
					</div>
				)
				: error.value
				? <p class='pw-panel__state'>{error.value}</p>
				: projects.value.length === 0
				? (
					<div class='pw-empty'>
						<div class='pw-empty__glyph'>
							<IconLayoutGrid size={26} stroke={1.5} />
						</div>
						<p class='pw-empty__title'>No active projects yet</p>
						<p class='pw-empty__text'>
							Spin one up from a template below, or explore open projects to join.
						</p>
						<div class='pw-empty__actions'>
							<Button
								variant='primary'
								size='small'
								startIcon={<IconPlus size={15} />}
								onClick={onCreate}
							>
								New Project
							</Button>
							<Button
								href='/explore?category=projects'
								variant='secondary'
								size='small'
								outlined
								f-client-nav={false}
							>
								Explore
							</Button>
						</div>
					</div>
				)
				: (
					<div class='pw-matrix__grid'>
						{projects.value.map((p) => (
							<ProjectMatrixCard key={p.id} project={p} loading={enriching.value} />
						))}
					</div>
				)}
		</section>
	);
}

export default ActiveProjectsMatrix;
