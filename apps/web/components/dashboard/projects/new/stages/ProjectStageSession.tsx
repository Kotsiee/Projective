import { TextField } from '@projective/fields';
import { UIStage } from '../ProjectStages.tsx';

export default function ProjectStageSession(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
			<TextField
				label='Duration (Minutes)'
				type='number'
				value={stage.session_duration_minutes?.toString() || '60'}
				onChange={(v) => updateStage('session_duration_minutes', parseInt(v))}
				floating
			/>
			{/* Session Count was not in new DB schema, might need to be added or stored in config JSONB */}
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
