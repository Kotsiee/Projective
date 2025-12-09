import { DateTime, SelectOption } from '@projective/types';
import { UIStage } from '../ProjectStages.tsx';
import { DateField, MoneyField, SelectField, TextField } from '@projective/fields';

export default function ProjectStageFile(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	const durationModes: SelectOption<string>[] = [
		{ label: 'Fixed Deadline', value: 'fixed_deadline' },
		{ label: 'Relative Duration', value: 'relative_duration' },
		{ label: 'No Due Date', value: 'no_due_date' },
	];

	// Note: These fields (file_due_date, etc) might not be in the strict 'Stage' DB interface
	// but usually would be handled by a specific config column or specific fields.
	// Assuming you will add these specific fields to your DB or type definition if not present.
	// For now I am keeping them as they were in your original code, assuming they exist on the interface.

	return (
		<div>
			<SelectField
				name='duration-mode'
				label='Duration Mode'
				options={durationModes}
				value={stage['file_duration_mode'] || 'fixed_deadline'}
				onChange={(v) => updateStage('file_duration_mode' as any, v as string)}
				searchable={false}
				multiple={false}
				floating
			/>

			{stage['file_duration_mode'] === 'fixed_deadline' && (
				<DateField
					label='Due Date'
					value={stage.file_due_date as DateTime || new DateTime()}
					onChange={(v) => updateStage('file_due_date' as any, v)}
					minDate={new DateTime()}
					format='dd/MM/yyyy'
					floating
				/>
			)}

			{stage['file_duration_mode'] === 'relative_duration' && (
				<TextField
					label='Duration (Days)'
					type='number'
					value={stage['file_duration_days']?.toString()}
					onChange={(v) => updateStage('file_duration_days' as any, parseInt(v))}
					floating
				/>
			)}

			<div
				style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}
			>
				<TextField
					label='Included Revisions'
					type='number'
					value={stage.file_revisions_allowed?.toString() || '0'}
					onChange={(v) => updateStage('file_revisions_allowed', parseInt(v))}
					floating
				/>
			</div>
		</div>
	);
}
