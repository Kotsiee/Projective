// deno-lint-ignore-file no-explicit-any
import { IconBug, IconDeviceFloppy, IconRocket } from '@tabler/icons-preact';
import { Button, toast } from '@projective/ui';
import {
	isProjectFormValid,
	useNewProjectContext,
	validateProjectStep,
} from '../../contexts/NewProjectContext.tsx';
import { getCsrfToken } from '@projective/utils';
import { useSignal } from '@preact/signals';

export function SaveDraftButton() {
	const handleSave = () => {
		toast.success('Draft saved (Local state only for MVP)');
	};

	return (
		<Button
			variant='secondary'
			startIcon={<IconDeviceFloppy size={18} />}
			onClick={handleSave}
		>
			Save Draft
		</Button>
	);
}

export function PublishButton() {
	const state = useNewProjectContext();
	const isLoading = useSignal(false);

	const isValid = isProjectFormValid(state);

	const handleDebug = () => {
		console.log('=== FORM VALIDATION DEBUG ===');
		let hasErrors = false;

		for (let i = 0; i <= 4; i++) {
			const errors = validateProjectStep(i, state);
			if (errors.length > 0) {
				hasErrors = true;
				console.error(`Step ${i + 1} Errors:`, errors);
				errors.forEach((err) => toast.error(`Step ${i + 1}: ${err}`));
			} else {
				console.log(`Step ${i + 1}: OK`);
			}
		}

		if (!hasErrors) {
			console.log('✅ All steps are valid.');
			toast.success('All steps are perfectly valid!');
		}

		console.log('=============================');
	};

	const handlePublish = async () => {
		if (!isValid) {
			toast.error('Please complete all required fields before publishing.');
			return;
		}

		if (state.attachments.value.length > 10) {
			toast.error('You can only upload a maximum of 10 attachments.');
			return;
		}

		isLoading.value = true;

		const request = async () => {
			try {
				const csrf = getCsrfToken();
				if (!csrf) throw new Error('Missing CSRF token');

				const payload = {
					title: state.title.value,
					description: typeof state.description.value === 'string'
						? JSON.parse(state.description.value)
						: state.description.value,
					industry_category_id: state.category.value,
					visibility: state.visibility.value,
					currency: state.currency.value,
					timeline_preset: state.timelinePreset.value || 'sequential',

					target_project_start_date: (state.targetStartDate.value as any)?.toISO
						? (state.targetStartDate.value as any).toISO()
						: state.targetStartDate.value,

					legal_and_screening: {
						ip_ownership_mode: state.ipMode.value,
						nda_required: state.ndaRequired.value === 'true',
						portfolio_display_rights: state.portfolioRights.value,
						location_restriction: state.locationRestriction.value
							? [state.locationRestriction.value]
							: [],
						language_requirement: state.languageRequirement.value
							? [state.languageRequirement.value]
							: [],
						screening_questions: state.screeningQuestions.value.filter((q) => q.trim().length > 0),
					},

					stages: state.stages.value.map((stage) => {
						const cleanStage: any = { ...stage };

						// FIX: Wipe out the ghost data from whichever staffing model is NOT actively selected
						if (cleanStage._ui_model_type === 'defined_roles') {
							cleanStage.open_seats = [];
						} else if (cleanStage._ui_model_type === 'open_seats') {
							cleanStage.staffing_roles = [];
						}

						delete cleanStage._ui_model_type;
						delete cleanStage._attachments_temp;

						if (cleanStage.fixed_start_date?.toISO) {
							cleanStage.fixed_start_date = cleanStage.fixed_start_date.toISO();
						}
						if (cleanStage.file_due_date?.toISO) {
							cleanStage.file_due_date = cleanStage.file_due_date.toISO();
						}
						if (cleanStage.session_end_date?.toISO) {
							cleanStage.session_end_date = cleanStage.session_end_date.toISO();
						}

						return cleanStage;
					}),

					tags: state.tags.value,
					global_attachments: [],
				};

				const formData = new FormData();
				formData.append('payload', JSON.stringify(payload));

				if (state.thumbnail.value?.file) {
					formData.append('thumbnail', state.thumbnail.value.file);
				}

				state.attachments.value.forEach((fileWithMeta) => {
					if (fileWithMeta.file) {
						formData.append('attachments', fileWithMeta.file);
					}
				});

				const res = await fetch('/api/v1/dashboard/projects/new/publish', {
					method: 'POST',
					headers: { 'X-CSRF': csrf },
					body: formData,
				});

				const data = await res.json();

				if (!res.ok) {
					if (data.error?.details) {
						console.error('Zod Validation Failed:', data.error.details);
					}
					throw new Error(data.error?.message || 'Failed to publish project');
				}

				setTimeout(() => globalThis.location.href = data.redirectTo, 1000);
				return 'Project published successfully!';
			} finally {
				isLoading.value = false;
			}
		};

		toast.promise(request(), {
			loading: 'Publishing project...',
			success: (msg) => msg,
			error: (err) => `Failed: ${err.message}`,
		});
	};

	return (
		<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
			<Button variant='secondary' startIcon={<IconBug size={18} />} onClick={handleDebug}>
				Debug Validation
			</Button>

			<Button
				variant='primary'
				startIcon={<IconRocket size={18} />}
				onClick={handlePublish}
				loading={isLoading}
				disabled={!isValid}
			>
				Publish Project
			</Button>
		</div>
	);
}
