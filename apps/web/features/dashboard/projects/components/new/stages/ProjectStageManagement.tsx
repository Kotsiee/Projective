import { SelectField } from '@projective/fields';
import { UIStage } from '../ProjectStages.tsx';

export default function ProjectStageManagement(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	return (
		<div>
			<SelectField
				name='contract-mode'
				label='Contract Mode'
				options={[
					{ label: 'Fixed Dates', value: 'fixed_dates' },
					{ label: 'Duration from Start', value: 'duration_from_start' },
				]}
				// Using 'as any' because this specific field might store into the JSONB config column in real DB
				value={stage['management_contract_mode'] || 'fixed_dates'}
				onChange={(v) => updateStage('management_contract_mode' as any, v as string)}
				searchable={false}
				multiple={false}
				floating
			/>
		</div>
	);
}
