import '../../../../styles/components/view/body/stages/view-stages-tabs.css';

export interface ViewStagesTabsProps {
	stages: any[];
	activeIndex: number;
	onChange: (index: number) => void;
}

export default function ViewStagesTabs({ stages, activeIndex, onChange }: ViewStagesTabsProps) {
	return (
		<div className='view-stages-tabs'>
			{stages.map((stage, index) => (
				<button
					key={stage.id}
					className={`view-stages-tabs__btn ${
						index === activeIndex ? 'view-stages-tabs__btn--active' : ''
					}`}
					onClick={() => onChange(index)}
				>
					{stage.name}
				</button>
			))}
		</div>
	);
}
