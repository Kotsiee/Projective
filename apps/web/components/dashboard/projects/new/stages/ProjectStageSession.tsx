import { TextField } from '@projective/fields';
import { UIStage } from '../ProjectStages.tsx';

export default function ProjectStageSession(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	return (
		<div className='form-grid'>
			<TextField
				label='Duration (Minutes)'
				type='number'
				value={stage.session_duration_minutes?.toString() || '60'}
				onChange={(v) => updateStage('session_duration_minutes', parseInt(v))}
				floating
			/>
			<TextField
				label='Session Count'
				type='number'
				value={stage['session_count']?.toString() || '1'}
				onChange={(v) => updateStage('session_count' as any, parseInt(v))}
				floating
			/>
		</div>
	);
}
