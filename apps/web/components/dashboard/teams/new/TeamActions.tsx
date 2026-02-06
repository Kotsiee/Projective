import { IconDeviceFloppy, IconRocket } from '@tabler/icons-preact';
import { Button, toast } from '@projective/ui';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';
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

export function CreateTeamButton() {
	const state = useNewTeamContext();
	const isLoading = useSignal(false);

	const handleCreate = async () => {
		// 1. Basic Validation
		if (!state.name.value || !state.slug.value) {
			toast.error('Team Name and Handle are required.');
			return;
		}

		isLoading.value = true;

		const createProcess = async () => {
			const csrf = getCsrfToken();
			if (!csrf) throw new Error('Missing CSRF token');

			// 2. Prepare Payload (JSON part)
			const rawDesc = state.description.value;
			const description = typeof rawDesc === 'string'
				? { ops: [{ insert: rawDesc + '\n' }] }
				: rawDesc;

			const payload = {
				name: state.name.value,
				slug: state.slug.value,
				headline: state.headline.value,
				description,
				visibility: state.visibility.value,
				payout_model: state.payoutModel.value,
				default_payout_settings: state.payoutModel.value === 'smart_split'
					? { treasury_percent: state.treasuryPercent.value }
					: {},
				invites: state.invites.value.filter((i) => i.email.trim().length > 0),
			};

			// 3. Construct FormData
			const formData = new FormData();
			formData.append('payload', JSON.stringify(payload));

			if (state.avatar.value) {
				formData.append('avatar', state.avatar.value.file);
			}

			if (state.banner.value) {
				formData.append('banner', state.banner.value.file);
			}

			// 4. Send Single Request
			const res = await fetch('/api/v1/dashboard/teams', {
				method: 'POST',
				headers: {
					'X-CSRF': csrf,
					// Note: Content-Type is auto-set by browser for FormData
				},
				body: formData,
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error?.message || 'Failed to create team');

			if (data.redirectTo) {
				setTimeout(() => globalThis.location.href = data.redirectTo, 1000);
			}
			return 'Team created successfully!';
		};

		toast.promise(createProcess(), {
			loading: 'Establishing agency...',
			success: (msg) => msg,
			error: (err) => `Failed: ${err.message}`,
		});

		isLoading.value = false;
	};

	return (
		<Button
			variant='primary'
			startIcon={<IconRocket size={18} />}
			onClick={handleCreate}
			loading={isLoading}
		>
			Create Team
		</Button>
	);
}
