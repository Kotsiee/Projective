import { useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Skeleton } from '@projective/ui';
import { MarkdownParser } from '@projective/utils';
import { useViewContext } from '../../../../contexts/ViewContext.tsx';
import ViewStagesTabs from './stages-tabs.tsx';
import ViewStagesMeta from './stages-meta.tsx';
import ViewStagesSkills from './stages-skills.tsx';
import ViewStagesSeats from './stages-seats.tsx';
import ViewStagesDescription from './stages-description.tsx';
import '../../../../styles/components/view/body/stages/view-stages.css';

export default function ViewStages() {
	const { entityType, data, isLoading } = useViewContext();
	const activeIndex = useSignal(0);

	// Deep linking listener for the Overview breadcrumbs
	useEffect(() => {
		if (typeof globalThis === 'undefined' || !data.value?.stages) return;

		const handleHash = () => {
			const hash = globalThis.location.hash;
			if (hash.startsWith('#stage-')) {
				const id = hash.replace('#stage-', '');
				const idx = data.value.stages.findIndex((s: any) => s.id === id);
				if (idx !== -1) activeIndex.value = idx;
			}
		};

		handleHash(); // Check on mount
		globalThis.addEventListener('hashchange', handleHash);
		return () => globalThis.removeEventListener('hashchange', handleHash);
	}, [data.value?.stages]);

	// --- HOISTED HOOKS: Compute active stage and parse descriptions BEFORE early returns ---
	const stages = data.value?.stages || [];
	const roles = data.value?.roles || [];
	const activeStage = stages[activeIndex.value] || stages[0];

	if (isLoading.value) {
		return (
			<div className='view-stages'>
				<Skeleton variant='text' width='120px' height='1.75rem' className='view__section-title' />
				<div className='view-stages__content'>
					<Skeleton variant='button' width='100%' height='45px' />
					<div
						className='view-stages__tab-content'
						style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
					>
						<Skeleton variant='text' width='200px' height='1.5rem' />
						<Skeleton variant='text' width='100%' height='4rem' />
					</div>
				</div>
			</div>
		);
	}

	// Guard: Only Projects and Services have stages
	if (entityType.value !== 'project' && entityType.value !== 'service') return null;
	if (stages.length === 0) return null;

	return (
		<div className='view-stages'>
			<h3 className='view-stages__title view__section-title'>Stages</h3>

			<div className='view-stages__content'>
				<ViewStagesTabs
					stages={stages}
					activeIndex={activeIndex.value}
					onChange={(idx) => activeIndex.value = idx}
				/>

				<div className='view-stages__tab-content'>
					{/* The scroll-target anchor */}
					<div id={`stage-${activeStage.id}`} style={{ scrollMarginTop: '100px' }} />

					<h4 className='view-stages__header'>{activeStage.name}</h4>

					<ViewStagesMeta stage={activeStage} />
					<ViewStagesDescription stage={activeStage} />
					<ViewStagesSkills stage={activeStage} />
					<ViewStagesSeats stage={activeStage} roles={roles} />
				</div>
			</div>
		</div>
	);
}
