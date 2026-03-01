import { DateField, SelectField, TextField } from '@projective/fields';
import { DateTime, SelectOption } from '@projective/types';
import { UIStage } from '../ProjectStages.tsx';

interface Props {
	stage: UIStage;
	index: number;
	// deno-lint-ignore no-explicit-any
	updateStage: (field: keyof UIStage, value: any) => void;
}

export default function ProjectTimelineControlsFile({ stage, index, updateStage }: Props) {
	const durationModes: SelectOption<string>[] = [
		{ label: 'Relative Duration (Days)', value: 'relative_duration' },
		{ label: 'Fixed Deadline (Hard Date)', value: 'fixed_deadline' },
		{ label: 'No Due Date', value: 'no_due_date' },
	];

	return (
		<>
			<SelectField
				name={`duration-mode-${index}`}
				label='Timeline Execution Mode'
				options={durationModes}
				value={stage.file_duration_mode || 'relative_duration'}
				onChange={(v) => updateStage('file_duration_mode', v)}
				searchable={false}
				floating
				required
			/>

			{stage.file_duration_mode === 'relative_duration' && (
				<TextField
					label='Target Duration (Days)'
					type='number'
					value={stage.file_duration_days?.toString() || '7'}
					onChange={(v) => updateStage('file_duration_days', parseInt(v))}
					floating
					required
					hint='How many days they have to complete this once the stage starts.'
				/>
			)}

			{stage.file_duration_mode === 'fixed_deadline' && (
				<DateField
					label='Hard Due Date'
					value={stage.file_due_date as DateTime}
					onChange={(v) => updateStage('file_due_date', v)}
					floating
					required
					hint='The stage must be delivered by this exact date.'
				/>
			)}
		</>
	);
}
