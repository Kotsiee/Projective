/**
 * @file CreateTeamModal.tsx
 * @description Low-friction team creation dialog. Only a display Name and a unique
 * `@handle` are required — the team is created instantly as a Draft/Unverified record and
 * members, financials and branding are deferred to the team settings page. Islands are
 * "dumb": this posts to `/api/v1/dashboard/teams` and never touches the DB directly.
 */

import { useSignal } from '@preact/signals';
import { Button, Modal, ModalLayout, RippleSurface, toast } from '@projective/ui';
import { HandleField, sanitizeHandle, TextField } from '@projective/fields';
import { getCsrfToken } from '@projective/utils';
import { IconUsers } from '@tabler/icons-preact';

export interface CreateTeamModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
	const name = useSignal('');
	const slug = useSignal('');
	const handleTouched = useSignal(false);
	const error = useSignal('');
	const isLoading = useSignal(false);

	const onNameChange = (v: string) => {
		name.value = v;
		if (!handleTouched.value) slug.value = sanitizeHandle(v);
	};

	const onHandleChange = (v: string) => {
		handleTouched.value = true;
		slug.value = v;
	};

	const submit = async () => {
		error.value = '';
		if (name.value.trim().length < 3) {
			error.value = 'Give your team a name (at least 3 characters).';
			return;
		}
		if (slug.value.length < 3) {
			error.value = 'Pick a handle of at least 3 characters.';
			return;
		}

		isLoading.value = true;
		const request = async () => {
			const csrf = getCsrfToken();
			const res = await fetch('/api/v1/dashboard/teams', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF': csrf } : {}) },
				body: JSON.stringify({ name: name.value.trim(), slug: slug.value }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error?.message || data?.error || 'Could not create team');
			}
			setTimeout(() => {
				globalThis.location.href = data.redirectTo ?? `/teams/${data.teamSlug ?? slug.value}`;
			}, 600);
			return 'Team drafted — let’s finish setup.';
		};

		try {
			await toast.promise(request(), {
				loading: 'Reserving your handle…',
				success: (m) => m as string,
				error: (e) => (e as Error).message,
			});
		} catch {
			// toast surfaced it
		} finally {
			isLoading.value = false;
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='New team'
			style={{ width: '460px', maxWidth: '100%' }}
		>
			<ModalLayout
				footer={
					<div
						style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', width: '100%' }}
					>
						<Button variant='secondary' ghost onClick={onClose} disabled={isLoading.value}>
							Cancel
						</Button>
						<RippleSurface
							as='button'
							premium
							type='button'
							onClick={submit}
							class='create-entity-cta'
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '0.5rem',
								padding: '0.6rem 1.15rem',
								borderRadius: '12px',
								border: 'none',
								cursor: isLoading.value ? 'wait' : 'pointer',
								color: '#fff',
								fontWeight: 650,
								background:
									'var(--grad-premium-diag, linear-gradient(135deg, var(--primary), var(--violet)))',
								opacity: isLoading.value ? 0.7 : 1,
							}}
						>
							<IconUsers size={17} stroke={2} />
							Create team
						</RippleSurface>
					</div>
				}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '1.1rem',
						padding: '0.25rem 0 0.5rem',
					}}
				>
					<p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
						Stake your agency’s handle now — invite members, set payouts and branding later. It
						starts as a <strong>Draft</strong> until you complete setup.
					</p>

					<TextField
						name='team-name'
						label='Team name'
						value={name}
						onChange={onNameChange}
						placeholder='Northwind Collective'
						floating={false}
						required
						nextField='team-handle'
					/>

					<HandleField
						name='team-handle'
						label='Handle'
						value={slug}
						onChange={onHandleChange}
						placeholder='northwind'
						hint='Your unique, lowercase handle. Letters, numbers and hyphens.'
					/>

					{error.value && (
						<div style={{ fontSize: '0.8rem', color: 'var(--danger, hsl(0,72%,55%))' }}>
							{error.value}
						</div>
					)}
				</div>
			</ModalLayout>
		</Modal>
	);
}
