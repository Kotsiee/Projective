/**
 * @file ProjectStageFile.tsx
 * @description Advanced settings specifically for File-Based (CREATE/RUN) stages.
 */
import { UIStage } from '../ProjectStages.tsx';
import { SelectField, SelectOption, TagInput, TextField } from '@projective/fields';

export default function ProjectStageFile(
	{ stage, updateStage }: { stage: UIStage; updateStage: (f: keyof UIStage, v: any) => void },
) {
	const durationModes: SelectOption<string>[] = [
		{ label: 'Relative Duration (Days to complete once started)', value: 'relative_duration' },
		{ label: 'Fixed Deadline (Hard calendar date)', value: 'fixed_deadline' },
		{ label: 'No Due Date', value: 'no_due_date' },
	];

	return (
		<div className='form-grid'>
			<SelectField
				name='duration-mode'
				label='Timeline Execution Mode'
				options={durationModes}
				value={stage['file_duration_mode'] || 'relative_duration'}
				onChange={(v) => updateStage('file_duration_mode' as any, v as string)}
				searchable={false}
				multiple={false}
				floating
				required
			/>

			{stage['file_duration_mode'] === 'relative_duration' && (
				<TextField
					label='Target Duration (Days)'
					type='number'
					value={stage['file_duration_days']?.toString() || '7'}
					onChange={(v) => updateStage('file_duration_days' as any, parseInt(v))}
					floating
					hint='How many days they have to complete this once the stage starts.'
					required
				/>
			)}

			<TextField
				label='Included Revisions'
				type='number'
				value={stage.file_revisions_allowed?.toString() || '1'}
				onChange={(v) => updateStage('file_revisions_allowed', parseInt(v))}
				floating
				hint='Number of revision rounds included in the initial contract.'
			/>

			<div
				className='form-grid--span-full'
				style={{
					borderTop: '1px solid var(--border-color)',
					paddingTop: '1.25rem',
					marginTop: '0.5rem',
				}}
			>
				<p
					style={{
						fontSize: '0.75rem',
						fontWeight: 600,
						color: 'var(--text-main)',
						marginBottom: '1rem',
						textTransform: 'uppercase',
					}}
				>
					Deliverable Constraints
				</p>
				<div className='form-grid'>
					<div className='form-grid--span-full'>
						<TagInput
							name='allowed-extensions'
							label='Allowed File Types (Optional)'
							value={stage.file_extensions_allowed || []}
							onChange={(v) => updateStage('file_extensions_allowed', v)}
							placeholder='e.g. .pdf, .fig, .png'
							floating
							hint='Leave blank to allow any file type.'
						/>
					</div>

					<TextField
						label='Max File Size (MB)'
						type='number'
						value={stage.file_max_size_mb?.toString() || '2048'}
						onChange={(v) => updateStage('file_max_size_mb', parseInt(v))}
						floating
						hint='Maximum size allowed per individual file.'
					/>

					<TextField
						label='Max File Count'
						type='number'
						value={stage.file_max_count?.toString() || '20'}
						onChange={(v) => updateStage('file_max_count', parseInt(v))}
						floating
						hint='Maximum number of files per final submission.'
					/>
				</div>
			</div>
		</div>
	);
}
