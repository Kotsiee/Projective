import { IconDeviceFloppy, IconRocket } from '@tabler/icons-preact';
import { Button, toast } from '@projective/ui';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';
import { getCsrfToken } from '@projective/shared';
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

	const handlePublish = async () => {
		if (!state.title.value) {
			toast.error('Project title is required');
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
					description: state.description.value,
					industry_category_id: state.category.value,
					visibility: state.visibility.value,
					currency: state.currency.value,
					timeline_preset: state.timelinePreset.value,
					target_project_start_date: state.targetStartDate.value,

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

					stages: state.stages.value,
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

				const res = await fetch('/api/v1/dashboard/projects/publish', {
					method: 'POST',
					headers: { 'X-CSRF': csrf },
					body: formData,
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error?.message || 'Failed to publish project');

				setTimeout(() => window.location.href = data.redirectTo, 1000);
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
		<Button
			variant='primary'
			startIcon={<IconRocket size={18} />}
			onClick={handlePublish}
			loading={isLoading}
		>
			Publish Project
		</Button>
	);
}
