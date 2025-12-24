import { IconDeviceFloppy, IconRocket } from '@tabler/icons-preact';
import { toast } from '@projective/fields';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';
import { CreateProjectSchema } from '@contracts/dashboard/projects/new/_validation.ts';
import { getCsrfToken } from '@projective/shared';

export function SaveDraftButton() {
	const state = useNewProjectContext();

	const handleSave = async () => {
		// Prepare description: If string, wrap in Delta format. If object, keep as is.
		const rawDesc = state.description.value;
		const description = typeof rawDesc === 'string'
			? { ops: [{ insert: rawDesc + '\n' }] }
			: rawDesc;

		const payload = {
			title: state.title.value,
			description,
			// Allow partial/invalid data for drafts
		};

		const saveRequest = fetch('/api/v1/dashboard/projects/new/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		}).then(async (res) => {
			if (!res.ok) throw new Error('Failed to save');
			return await res.json();
		});

		toast.promise(saveRequest, {
			loading: 'Saving draft...',
			success: 'Draft saved successfully',
			error: 'Failed to save draft',
		});
	};

	return (
		<button type='button' className='btn btn--secondary btn-save' onClick={handleSave}>
			<IconDeviceFloppy size={18} /> <span>Save Draft</span>
		</button>
	);
}

export function PublishButton() {
	const state = useNewProjectContext();

	const handlePublish = async () => {
		const rawDesc = state.description.value;
		const description = typeof rawDesc === 'string'
			? { ops: [{ insert: rawDesc + '\n' }] }
			: rawDesc;

		// Clean Screening Questions (Remove empty lines)
		const screening_questions = state.screeningQuestions.value
			.map((q) => q.trim())
			.filter((q) => q.length > 0);

		// Clean Stages (Remove empty roles/seats)
		const stages = state.stages.value.map((stage) => ({
			...stage,
			// Ensure date is a native Date object for validation
			fixed_start_date: stage.fixed_start_date
				? new Date(stage.fixed_start_date.toString())
				: undefined,
			// Filter out roles with no title
			staffing_roles: stage.staffing_roles.filter((r) => r.role_title.trim().length > 0),
			// Filter out seats with no description
			open_seats: stage.open_seats.filter((s) => s.description_of_need.trim().length > 0),
		}));

		const payload = {
			title: state.title.value,
			description,
			industry_category_id: state.category.value, // Zod checks UUID
			visibility: state.visibility.value,
			currency: state.currency.value,
			timeline_preset: state.timelinePreset.value,
			// Convert DateTime object to native JS Date
			target_project_start_date: state.targetStartDate.value,

			legal_and_screening: {
				ip_ownership_mode: state.ipMode.value,
				nda_required: state.ndaRequired.value === 'true',
				portfolio_display_rights: state.portfolioRights.value,
				screening_questions,
				location_restriction: state.locationRestriction.value
					? [state.locationRestriction.value]
					: [],
				language_requirement: state.languageRequirement.value
					? [state.languageRequirement.value]
					: [],
			},
			stages,
			tags: state.tags.value,
		};

		// 2. Client-side Validation
		const validation = CreateProjectSchema.safeParse(payload);

		if (!validation.success) {
			console.error('Validation Fail:', validation.error);

			// Show specific error messages based on path
			const firstError = validation.error;
			let msg = firstError.message;

			// Customizing messages for better UX
			if (firstError.stack?.includes('industry_category_id')) {
				msg = 'Please select an Industry Category in Step 1.';
			} else if (firstError.stack?.includes('description')) {
				msg = 'Project description is invalid.';
			}

			toast.error(msg, { duration: 5000 });
			return;
		}

		// 3. Submit
		const publishRequest = async () => {
			const csrf = getCsrfToken();
			if (!csrf) return;

			const res = await fetch('/api/v1/dashboard/projects/new/publish', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'X-CSRF': csrf,
				},
				body: JSON.stringify(validation.data),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error?.message || 'Failed to publish');
			return data;
		};

		toast.promise(publishRequest, {
			loading: 'Publishing project...',
			success: (data) => {
				if (data.redirectTo) {
					// Use a small timeout to let the toast show success briefly
					setTimeout(() => window.location.href = data.redirectTo, 1000);
				}
				return 'Project published successfully!';
			},
			error: (err) => `Publish failed: ${err.message}`,
		});
	};

	return (
		<button type='button' className='btn btn--primary btn-publish' onClick={handlePublish}>
			<IconRocket size={18} /> <span>Publish Project</span>
		</button>
	);
}
