import '@styles/components/dashboard/projects/new-project-stages.css';

import { computed, effect, Signal, useComputed, useSignal } from '@preact/signals';
import {
	IconBrowser,
	IconCheck,
	IconCircle,
	IconCode,
	IconLayoutSidebar,
	IconTerminal,
} from '@tabler/icons-preact';

// Components
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	DateField,
	MoneyField,
	SelectField,
	Splitter,
	SplitterPane,
	TextField,
} from '@projective/fields';
import ProjectDetailsAttachments from './ProjectDetailsAttachments.tsx';
import { DateTime, FileWithMeta, SelectOption } from '@projective/types';

interface Stage {
	title: string;
	status: string;
	brief?: string;
	attachments: Signal<FileWithMeta[]>;
	type: string;
}

export default function ProjectStages() {
	const stages = useSignal<Stage[]>([
		{
			title: '',
			status: '',
			brief: '',
			type: 'file',
			attachments: new Signal([]),
		},
	]);

	const getStatusIcon = (status: Stage['status']) => {
		if (status.toLowerCase() === 'completed') return <IconCheck size={18} color='var(--success)' />;
		if (status.toLowerCase() === 'in-progress') {
			return <IconCircle size={18} color='var(--primary-500)' fill='currentColor' />;
		}
		return <IconCircle size={18} color='var(--gray-400)' />;
	};

	const addStage = () => {
		stages.value = [...stages.value, {
			title: '',
			status: '',
			brief: '',
			type: 'file',
			attachments: new Signal([]),
		}];
	};

	return (
		<div className='new-project__stages'>
			<div className='stages-section'>
				<h2>Stages</h2>
				<Accordion type='multiple' variant='outlined' defaultValue={['s2']}>
					{stages.value.map((stage, index) => (
						<AccordionItem key={index.toString()} value={index.toString()}>
							<AccordionTrigger
								startIcon={getStatusIcon(stage.status)}
								subtitle={stage.status.replace('-', ' ')}
							>
								{stage.title.length > 0 ? stage.title : `New Stage`}
							</AccordionTrigger>
							<AccordionContent>
								<ProjectStage id={index} stages={stages} />
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
				<button type='button' onClick={() => addStage()}>Add Stage</button>
			</div>
		</div>
	);
}

export function ProjectStage({ id, stages }: { id: number; stages: Signal<Stage[]> }) {
	const stageTypes: SelectOption<string>[] = [
		{ label: 'File Based', value: 'file' },
		{ label: 'Session Based', value: 'session' },
		{ label: 'Management Based', value: 'management' },
		{ label: 'Maintenance Based', value: 'maintenance' },
	];

	const renderStageType = (stageType: string) => {
		switch (stageType) {
			case 'file':
				return <ProjectStageFile />;
			case 'session':
				return <ProjectStageSession />;
			case 'management':
				return <ProjectStageManagement />;
			case 'maintenance':
				return <ProjectStageMaintenance />;
		}
	};

	return (
		<div className='new-project__stage'>
			<div>
				<h4>Details</h4>
				<TextField
					label='Title'
					value={stages.value[id].title}
					onChange={(v) =>
						stages.value = stages.value.map((e, i) => {
							if (i === id) {
								e.title = v;
							}

							return e;
						})}
					showCount
					maxLength={120}
					floating
					required
				/>

				<TextField
					label='Brief'
					className='brief'
					value={stages.value[id].brief}
					onChange={(v) =>
						stages.value = stages.value.map((e, i) => {
							if (i === id) {
								e.brief = v;
							}

							return e;
						})}
					multiline
					rows={4}
					floating
				/>

				<ProjectDetailsAttachments
					files={stages.value[id].attachments}
				/>
			</div>
			<hr />
			<div>
				<h4>Format</h4>
				<SelectField
					name='stage-type'
					label='Stage Type'
					options={stageTypes}
					searchable={false}
					multiple={false}
					value={stages.value[id].type}
					onChange={(v) =>
						stages.value = stages.value.map((e, i) => {
							if (i === id) {
								e.type = v as string;
							}

							return e;
						})}
					floating
				/>

				{renderStageType(stages.value[id].type)}
			</div>
			<hr />
			<div>
				<h4>Staffing</h4>
				<SelectField
					name='stage-type'
					label='Stage Type'
					options={stageTypes}
					searchable={false}
					multiple={false}
					floating
				/>
			</div>
		</div>
	);
}

export function ProjectStageFile() {
	return (
		<div>
			<TextField
				label='Included Revisions'
				type='number'
				defaultValue='1'
				floating
				required
			/>
			<MoneyField
				label='Revision Budget'
				floating
			/>
			<div>
				<DateField
					label='Due Date'
					minDate={new DateTime().add(7, 'days')}
					format='dd/MM/yyyy'
				/>
			</div>

			<SelectField
				name='allowed-file-types'
				label='Allowed File Types'
				options={[]}
				searchable
				multiple
				floating
			/>
		</div>
	);
}

export function ProjectStageSession() {
	return (
		<div>
		</div>
	);
}

export function ProjectStageManagement() {
	return (
		<div>
		</div>
	);
}

export function ProjectStageMaintenance() {
	return (
		<div>
		</div>
	);
}
