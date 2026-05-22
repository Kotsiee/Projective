import { IconChevronRight } from '@tabler/icons-preact';
import { Skeleton } from '@projective/ui';
import { useViewContext } from '../../../contexts/ViewContext.tsx';
import '../../../styles/components/view/body/view-stages-overview.css';

export default function ViewStagesOverview() {
	const { entityType, data, isLoading } = useViewContext();

	if (entityType.value !== 'project') return null;

	// 1. Loading State
	if (isLoading.value) {
		return (
			<div className='view-stages-overview'>
				<Skeleton variant='text' width='150px' height='1.75rem' className='view__section-title' />
				<div className='view-stages-overview__list'>
					<Skeleton variant='text' width='80px' height='1.25rem' />
					<IconChevronRight className='view-stages-overview__chevron' size={16} />
					<Skeleton variant='text' width='120px' height='1.25rem' />
					<IconChevronRight className='view-stages-overview__chevron' size={16} />
					<Skeleton variant='text' width='90px' height='1.25rem' />
				</div>
			</div>
		);
	}

	const stages = data.value?.stages || [];

	// 2. Empty State
	if (stages.length === 0) return null;

	// 3. Loaded State
	return (
		<div className='view-stages-overview'>
			<div className='view-stages-overview__list'>
				{stages.map((stage: any, index: number) => (
					<div key={stage.id} className='view-stages-overview__item-wrapper'>
						<a
							href={`#stage-${stage.id}`}
							className='view-stages-overview__item'
							onClick={(e) => {
								e.preventDefault();
								const target = document.getElementById(`stage-${stage.id}`);
								if (target) {
									target.scrollIntoView({ behavior: 'smooth', block: 'start' });
								}
							}}
						>
							{stage.name}
						</a>

						{/* Render chevron for all except the very last stage */}
						{index < stages.length - 1 && (
							<IconChevronRight className='view-stages-overview__chevron' size={16} />
						)}
					</div>
				))}
			</div>
		</div>
	);
}
