import { SelectField, SelectOption, TextField } from '@projective/fields';
import { UIStage } from '../ProjectStages.tsx';

export default function ProjectStageSession(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	const daysOptions: SelectOption<string>[] = [
		{ label: 'Monday', value: 'monday' },
		{ label: 'Tuesday', value: 'tuesday' },
		{ label: 'Wednesday', value: 'wednesday' },
		{ label: 'Thursday', value: 'thursday' },
		{ label: 'Friday', value: 'friday' },
		{ label: 'Saturday', value: 'saturday' },
		{ label: 'Sunday', value: 'sunday' },
	];

	return (
		<div className='form-grid'>
			<TextField
				label='Duration (Minutes)'
				type='number'
				value={stage.session_duration_minutes?.toString() || '60'}
				onChange={(v) => updateStage('session_duration_minutes', parseInt(v))}
				floating
				hint='Length of each individual session.'
			/>
			<TextField
				label='Session Count'
				type='number'
				value={stage['session_count']?.toString() || '1'}
				onChange={(v) => updateStage('session_count' as any, parseInt(v))}
				floating
				hint='How many sessions are included in this stage.'
			/>

			<div className='form-grid--span-full'>
				<SelectField
					name='preferred-days'
					label='Preferred Days'
					options={daysOptions}
					value={stage.session_preferred_days || []}
					onChange={(v) => updateStage('session_preferred_days', v)}
					multiple
					searchable={false}
					floating
					hint='What days work best for these sessions? Talent will try to match this.'
				/>
			</div>
		</div>
	);
}
