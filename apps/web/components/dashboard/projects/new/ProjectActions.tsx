import { IconDeviceFloppy, IconRocket } from '@tabler/icons-preact';
import { Button, toast } from '@projective/ui';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';
import { getCsrfToken } from '@projective/shared';
import { useSignal } from '@preact/signals';

export function SaveDraftButton() {
	const state = useNewProjectContext();
	const isLoading = useSignal(false);

	const handleSave = async () => {
		isLoading.value = true;
		// Mock delay for UI feedback
		await new Promise((r) => setTimeout(r, 800));
		toast.success('Draft saved locally');
		isLoading.value = false;
	};

	return (
		<Button
			variant='secondary'
			startIcon={<IconDeviceFloppy size={18} />}
			onClick={handleSave}
			loading={isLoading}
		>
			Save Draft
		</Button>
	);
}

export function PublishButton() {
	const state = useNewProjectContext();
	const isLoading = useSignal(false);

	const handlePublish = async () => {
		// 1. Validation Logic
		if (!state.title.value) {
			toast.error('Project title is required');
			return;
		}

		isLoading.value = true;

		// 2. Submit Logic
		const request = async () => {
			try {
				const csrf = getCsrfToken();
				if (!csrf) throw new Error('Missing CSRF token');

				// Mock API call
				await new Promise((r) => setTimeout(r, 1500));

				// Actual fetch would go here
				// const res = await fetch(...)

				setTimeout(() => window.location.href = '/projects', 1000);
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
