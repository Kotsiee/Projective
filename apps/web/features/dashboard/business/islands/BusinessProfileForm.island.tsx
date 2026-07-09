/**
 * @file BusinessProfileForm.island.tsx
 * @description Atomic island for Business Profile Management (US-008 AC2): the editable company
 * profile card (display + legal name, billing email, administrative logo). Initial values are
 * resolved on the server by the settings route and passed in as props — the island never fetches on
 * mount (apps/web/CLAUDE.md). It owns only the form's client state and the multipart `PATCH` submit,
 * which travels through the same quarantine→scan pipeline as business creation. The page header and
 * the deferred "Card payment methods" section stay server-rendered.
 */

import { useSignal } from '@preact/signals';
import { Button, toast } from '@projective/ui';
import { FileDrop, TextField } from '@projective/fields';
import { getCsrfToken } from '@projective/utils';
import { IconBuildingBank, IconLock } from '@tabler/icons-preact';
import type { FileWithMeta } from '@projective/types';

export interface BusinessProfileFormProps {
	businessId: string;
	name: string;
	legalName: string;
	billingEmail: string;
	logoUrl: string | null;
	canManage: boolean;
}

export default function BusinessProfileForm(props: BusinessProfileFormProps) {
	const saving = useSignal(false);
	const name = useSignal(props.name);
	const legalName = useSignal(props.legalName);
	const billingEmail = useSignal(props.billingEmail);
	const logo = useSignal<FileWithMeta[]>([]);

	const save = () => {
		if (!name.value.trim() || !billingEmail.value.trim()) {
			toast.error('Business name and billing email are required.');
			return;
		}
		saving.value = true;

		const request = async () => {
			try {
				const csrf = getCsrfToken();
				if (!csrf) throw new Error('Missing CSRF token');

				const payload = {
					name: name.value.trim(),
					legal_name: legalName.value.trim(),
					billing_email: billingEmail.value.trim(),
				};
				const formData = new FormData();
				formData.append('payload', JSON.stringify(payload));
				if (logo.value[0]) formData.append('logo', logo.value[0].file);

				const res = await fetch(`/api/v1/dashboard/business/${props.businessId}`, {
					method: 'PATCH',
					headers: { 'X-CSRF': csrf },
					body: formData,
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error?.message || 'Failed to save changes');

				// Re-render authoritative server state (e.g. a freshly-scanned logo URL).
				globalThis.location?.reload();
				return 'Business profile updated';
			} finally {
				saving.value = false;
			}
		};

		toast.promise(request(), {
			loading: 'Saving profile…',
			success: (m) => m as string,
			error: (e) => `Failed: ${e.message}`,
		});
	};

	return (
		<section class='bsettings-card'>
			<header class='bsettings-card__header'>
				<span class='bsettings-card__icon'>
					<IconBuildingBank size={18} stroke={2} />
				</span>
				<div>
					<h2 class='bsettings-card__title'>Company profile</h2>
					<p class='bsettings-card__subtitle'>
						These details appear on invoices and the internal ledger.
					</p>
				</div>
			</header>

			<div class='bsettings-logo'>
				<div class='bsettings-logo__preview'>
					{props.logoUrl
						? <img src={props.logoUrl} alt='Current logo' />
						: (
							<span class='bsettings-logo__placeholder'>
								<IconBuildingBank size={26} stroke={1.6} />
							</span>
						)}
				</div>
				<div class='bsettings-logo__drop'>
					<FileDrop
						label='Administrative logo'
						value={logo}
						accept='.png,.jpg,.jpeg,.webp'
						maxFiles={1}
						variant='single'
						disabled={!props.canManage}
					/>
				</div>
			</div>

			<div class='bsettings-fields'>
				<TextField
					label='Business name'
					value={name}
					placeholder='Acme Studio'
					required
					disabled={!props.canManage}
				/>
				<TextField
					label='Legal entity name'
					value={legalName}
					placeholder='Acme Studio Ltd.'
					hint='The registered legal name used on invoices.'
					disabled={!props.canManage}
				/>
				<TextField
					label='Billing email'
					type='email'
					value={billingEmail}
					placeholder='billing@acme.co'
					required
					disabled={!props.canManage}
				/>
			</div>

			<footer class='bsettings-card__footer'>
				{!props.canManage && (
					<span class='bsettings-note'>
						<IconLock size={14} stroke={2} /> Only owners or admins can edit these details.
					</span>
				)}
				<Button
					variant='primary'
					onClick={save}
					loading={saving.value}
					disabled={!props.canManage}
				>
					Save changes
				</Button>
			</footer>
		</section>
	);
}
