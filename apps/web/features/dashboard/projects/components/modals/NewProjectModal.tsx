/**
 * @file NewProjectModal.tsx
 * @description Modal component for creating a new project with an iterative, draft-first approach.
 */

// #region Imports
// deno-lint-ignore-file no-explicit-any
import { useSignal } from '@preact/signals';
import { useMemo } from 'preact/hooks';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	Modal,
	ModalLayout,
	toast,
} from '@projective/ui';
import { FileDrop, RichTextField, SelectField, SelectOption, TextField } from '@projective/fields';
import {
	currencyCategories,
	FileWithMeta,
	IPOptionMode,
	PortfolioDisplayRights,
	ProjectFormat,
	Visibility,
} from '@projective/types';
import { ProjectsService } from '@/features/dashboard/projects/services/ProjectsService.ts';
// #endregion

// #region Interfaces
export interface NewProjectModalProps {
	/** Controls the visibility of the modal. */
	isOpen: boolean;
	/** Callback fired when the modal should be closed. */
	onClose: () => void;
}
// #endregion

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
	// #region State
	const title = useSignal('');
	const description = useSignal('');
	const attachments = useSignal<FileWithMeta[]>([]);
	const format = useSignal<ProjectFormat>(ProjectFormat.Pipeline);
	const visibility = useSignal<Visibility>(Visibility.Public);

	// Advanced options
	const ipMode = useSignal<IPOptionMode>(IPOptionMode.ExclusiveTransfer);
	const ndaRequired = useSignal<string>('false');
	const portfolioRights = useSignal<PortfolioDisplayRights>(PortfolioDisplayRights.Allowed);
	const locationRestriction = useSignal('');
	const languageRequirement = useSignal('');
	const currency = useSignal('USD');

	const isLoading = useSignal(false);
	// #endregion

	// #region Options
	const formatOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Pipeline (Multiple ongoing stages/tickets)', value: ProjectFormat.Pipeline },
		{ label: 'One-Off Project (Single clear objective)', value: ProjectFormat.OneOff },
	], []);

	const visibilityOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Public - Visible on Marketplace', value: Visibility.Public },
		{ label: 'Invite Only - Hidden from searches', value: Visibility.InviteOnly },
		{ label: 'Unlisted - Anyone with link can view', value: Visibility.Unlisted },
	], []);

	const ipOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Exclusive Transfer', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Licensed Use', value: IPOptionMode.LicensedUse },
		{ label: 'Shared Ownership', value: IPOptionMode.SharedOwnership },
		{ label: 'Projective Partner', value: IPOptionMode.ProjectivePartner },
	], []);

	const portfolioOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Allowed', value: PortfolioDisplayRights.Allowed },
		{ label: 'Forbidden', value: PortfolioDisplayRights.Forbidden },
		{ label: 'Embargoed', value: PortfolioDisplayRights.Embargoed },
	], []);

	const booleanOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Yes, require NDA', value: 'true' },
		{ label: 'No NDA required', value: 'false' },
	], []);

	const currencyOptions: SelectOption<string>[] = useMemo(() => {
		const options: SelectOption<string>[] = [];
		for (const [_, currencies] of Object.entries(currencyCategories)) {
			for (const curr of currencies) {
				options.push({
					label: `${curr.code} (${curr.symbol}) - ${curr.name}`,
					value: curr.code,
				});
			}
		}
		return options;
	}, []);
	// #endregion

	// #region Handlers
	const handleSubmit = async () => {
		if (title.value.trim().length < 5) {
			toast.error('Title must be at least 5 characters.');
			return;
		}

		isLoading.value = true;

		try {
			const payload = {
				title: title.value,
				format: format.value,
				description: description.value,
				visibility: visibility.value,
				currency: currency.value,
				legal_and_screening: {
					ip_ownership_mode: ipMode.value,
					nda_required: ndaRequired.value === 'true',
					portfolio_display_rights: portfolioRights.value,
					location_restriction: locationRestriction.value ? [locationRestriction.value] : [],
					language_requirement: languageRequirement.value ? [languageRequirement.value] : [],
					screening_questions: [],
				},
			};

			const files = attachments.value.length > 0
				? { attachments: attachments.value.map((a) => a.file).filter(Boolean) as File[] }
				: undefined;

			const res = await ProjectsService.createProject(payload, files);

			toast.success('Project draft created successfully!');
			setTimeout(() => {
				onClose();
				globalThis.location.href = `/projects/${res.project_id}`;
			}, 1000);
		} catch (err: any) {
			toast.error(err.message || 'An unexpected error occurred while creating the project.');
		} finally {
			isLoading.value = false;
		}
	};
	// #endregion

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Create New Project'
			style={{ width: '600px', maxWidth: '100%' }}
		>
			<ModalLayout
				footer={
					<div
						style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}
					>
						<Button variant='secondary' onClick={onClose} disabled={isLoading.value}>Cancel</Button>
						<Button variant='primary' onClick={handleSubmit} loading={isLoading.value}>
							Create Project
						</Button>
					</div>
				}
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
					<TextField
						label='Project Title'
						value={title}
						onChange={(v) => title.value = v}
						placeholder='Enter project title'
						required
						floating
					/>

					<RichTextField
						label='Description'
						value={description}
						onChange={(v) => description.value = v as string}
						minHeight='120px'
						variant='framed'
						outputFormat='delta'
						placeholder='Describe your project...'
					/>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
						<SelectField
							name='format'
							label='Format'
							options={formatOptions}
							value={format.value}
							onChange={(v) => format.value = v as ProjectFormat}
							multiple={false}
							searchable={false}
							floating
						/>
						<SelectField
							name='visibility'
							label='Visibility'
							options={visibilityOptions}
							value={visibility.value}
							onChange={(v) => visibility.value = v as Visibility}
							multiple={false}
							searchable={false}
							floating
						/>
					</div>

					<FileDrop
						id='project-attachments'
						label='Attachments'
						value={attachments}
						onChange={(files) => attachments.value = files}
						variant='split'
						multiple
						maxFiles={10}
					/>

					<Accordion type='single' collapsible>
						<AccordionItem value='advanced'>
							<AccordionTrigger>Advanced Options</AccordionTrigger>
							<AccordionContent>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '1rem',
										paddingTop: '1rem',
									}}
								>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<SelectField
											name='ipMode'
											label='IP & Privacy'
											options={ipOptions}
											value={ipMode.value}
											onChange={(v) => ipMode.value = v as IPOptionMode}
											multiple={false}
											searchable={false}
											floating
										/>
										<SelectField
											name='ndaRequired'
											label='NDA Required'
											options={booleanOptions}
											value={ndaRequired.value}
											onChange={(v) => ndaRequired.value = v as string}
											multiple={false}
											searchable={false}
											floating
										/>
									</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<SelectField
											name='portfolioRights'
											label='Portfolio Rights'
											options={portfolioOptions}
											value={portfolioRights.value}
											onChange={(v) => portfolioRights.value = v as PortfolioDisplayRights}
											multiple={false}
											searchable={false}
											floating
										/>
										<SelectField
											name='currency'
											label='Currency'
											options={currencyOptions}
											value={currency.value}
											onChange={(v) => currency.value = v as string}
											multiple={false}
											searchable
											floating
										/>
									</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<TextField
											label='Location Restriction'
											value={locationRestriction}
											onChange={(v) => locationRestriction.value = v}
											placeholder='e.g. US Only'
											floating
										/>
										<TextField
											label='Language Requirement'
											value={languageRequirement}
											onChange={(v) => languageRequirement.value = v}
											placeholder='e.g. English'
											floating
										/>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</ModalLayout>
		</Modal>
	);
}
