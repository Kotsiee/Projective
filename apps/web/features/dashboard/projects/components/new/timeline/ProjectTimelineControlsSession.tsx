import { DateField, SelectField, SelectOption, TextField } from '@projective/fields';
import { DateTime } from '@projective/types';
import { UIStage } from '../ProjectStages.tsx';

interface Props {
	stage: UIStage;
	index: number;
	// deno-lint-ignore no-explicit-any
	updateStage: (field: string, value: any) => void; // Using string to allow custom dynamic fields
}

export default function ProjectTimelineControlsSession({ stage, index, updateStage }: Props) {
	const daysOptions: SelectOption<string>[] = [
		{ label: 'Monday', value: 'monday' },
		{ label: 'Tuesday', value: 'tuesday' },
		{ label: 'Wednesday', value: 'wednesday' },
		{ label: 'Thursday', value: 'thursday' },
		{ label: 'Friday', value: 'friday' },
		{ label: 'Saturday', value: 'saturday' },
		{ label: 'Sunday', value: 'sunday' },
	];

	const hasPreferredDays = stage.session_preferred_days && stage.session_preferred_days.length > 0;

	return (
		<>
			<SelectField
				name={`preferred-days-${index}`}
				label='Preferred Days (Optional)'
				options={daysOptions}
				value={stage.session_preferred_days || []}
				onChange={(v) => updateStage('session_preferred_days', v)}
				multiple
				searchable={false}
				floating
				hint='If selected, sessions will automatically map to these days on the timeline.'
			/>

			<TextField
				label='Session Count'
				type='number'
				value={stage.session_count?.toString() || '1'}
				onChange={(v) => updateStage('session_count', parseInt(v))}
				floating
				hint='How many sessions are included in this stage.'
			/>

			{!hasPreferredDays && (
				<DateField
					label='Target End Date'
					// @ts-ignore - dynamic extension of stage state for timeline logic
					value={stage.session_end_date as DateTime}
					onChange={(v) => updateStage('session_end_date', v)}
					floating
					hint='Since no specific days are set, define when all sessions must be completed by.'
				/>
			)}
		</>
	);
}
