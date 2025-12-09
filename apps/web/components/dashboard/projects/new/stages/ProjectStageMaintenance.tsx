import { UIStage } from '../ProjectStages.tsx';
import { SelectField } from '@projective/fields';

export default function ProjectStageMaintenance(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	return (
		<div>
			<SelectField
				name='cycle-interval'
				label='Cycle Interval'
				options={[
					{ label: 'Weekly', value: 'weekly' },
					{ label: 'Monthly', value: 'monthly' },
				]}
				// Using 'as any' assuming this maps to JSONB config in backend
				value={stage['maintenance_cycle_interval'] || 'monthly'}
				onChange={(v) => updateStage('maintenance_cycle_interval' as any, v as string)}
				searchable={false}
				multiple={false}
				floating
			/>
		</div>
	);
}
