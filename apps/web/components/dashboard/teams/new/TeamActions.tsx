import { IconDeviceFloppy, IconRocket } from '@tabler/icons-preact';
import { toast } from '@projective/ui';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';
import { getCsrfToken } from '@projective/shared';

export function SaveDraftButton() {
	// Placeholder: Teams usually don't have "drafts" in the same way,
	// but keeping this for UI consistency if you want to save progress.
	const handleSave = () => {
		toast.success('Draft saved (Local state only for MVP)');
	};

	return (
		<button type='button' className='btn btn--secondary btn-save' onClick={handleSave}>
			<IconDeviceFloppy size={18} /> <span>Save Draft</span>
		</button>
	);
}

export function CreateTeamButton() {
	const state = useNewTeamContext();

	const handleCreate = async () => {
		// 1. Prepare Payload
		const rawDesc = state.description.value;
		const description = typeof rawDesc === 'string'
			? { ops: [{ insert: rawDesc + '\n' }] }
			: rawDesc;

		const payload = {
			name: state.name.value,
			slug: state.slug.value,
			description,
			visibility: state.visibility.value,
			payout_model: state.payoutModel.value,
			// Default settings based on model
			default_payout_settings: state.payoutModel.value === 'smart_split'
				? { treasury_percent: state.treasuryPercent.value }
				: {},
			invites: state.invites.value.filter((i) => i.email.trim().length > 0),
		};

		// 2. Validate (Basic)
		if (!payload.name || !payload.slug) {
			toast.error('Team Name and Handle are required.');
			return;
		}

		// 3. Submit
		const request = async () => {
			const csrf = getCsrfToken();
			if (!csrf) throw new Error('Missing CSRF token');

			const res = await fetch('/api/v1/dashboard/teams', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF': csrf,
				},
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error?.message || 'Failed to create team');
			return data;
		};

		toast.promise(request(), {
			loading: 'Creating team...',
			success: (data) => {
				if (data.redirectTo) {
					setTimeout(() => globalThis.location.href = data.redirectTo, 1000);
				}
				return 'Team created successfully!';
			},
			error: (err) => `Failed: ${err.message}`,
		});
	};

	return (
		<button type='button' className='btn btn--primary btn-publish' onClick={handleCreate}>
			<IconRocket size={18} /> <span>Create Team</span>
		</button>
	);
}
