/**
 * @file BusinessSettings.island.tsx
 * @description Business Profile Management (US-008 AC2). A functional settings card that lets a
 * business admin update its display + legal name, billing email and administrative logo. Reads the
 * current profile from `GET /api/v1/dashboard/business/:id` and submits a multipart `PATCH` (JSON
 * payload + optional logo) through the same quarantine→scan file pipeline as business creation.
 *
 * AC4 (Stripe credit-card attachments) is explicitly deferred — payment intents sit outside the
 * internal-wallet demo path — and surfaced here as a clearly blocked, non-interactive section.
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Button, toast } from '@projective/ui';
import { FileDrop, TextField } from '@projective/fields';
import { getCsrfToken } from '@projective/utils';
import { IconBuildingBank, IconCreditCardOff, IconLock } from '@tabler/icons-preact';
import type { FileWithMeta } from '@projective/types';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import type { BusinessAdminProfile } from '../contracts/settings/Settings.ts';
import '../styles/business-settings.css';

type Status = 'loading' | 'ready' | 'error' | 'no-business';

export default function BusinessSettings() {
	const { user, isLoading } = useUserContext();

	const status = useSignal<Status>('loading');
	const saving = useSignal(false);
	const canManage = useSignal(true);
	const currentLogoUrl = useSignal<string | null>(null);

	const name = useSignal('');
	const legalName = useSignal('');
	const billingEmail = useSignal('');
	const logo = useSignal<FileWithMeta[]>([]);

	const profile = user.value;
	const businessId = profile?.activeProfileType === 'business' ? profile.activeProfileId : null;

	const load = async () => {
		if (!businessId) {
			status.value = profile ? 'no-business' : 'loading';
			return;
		}
		status.value = 'loading';
		try {
			const res = await fetch(`/api/v1/dashboard/business/${businessId}`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error(`profile ${res.status}`);
			const data = await res.json() as BusinessAdminProfile;
			name.value = data.name ?? '';
			legalName.value = data.legal_name ?? '';
			billingEmail.value = data.billing_email ?? '';
			currentLogoUrl.value = data.logoUrl ?? null;
			canManage.value = data.can_manage;
			status.value = 'ready';
		} catch (err) {
			console.error('Settings load failed:', err);
			status.value = 'error';
		}
	};

	useEffect(() => {
		if (isLoading.value) return;
		load();
	}, [businessId, isLoading.value]);

	const save = () => {
		if (!businessId) return;
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

				const res = await fetch(`/api/v1/dashboard/business/${businessId}`, {
					method: 'PATCH',
					headers: { 'X-CSRF': csrf },
					body: formData,
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error?.message || 'Failed to save changes');

				logo.value = [];
				await load();
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

	// #region Non-ready states
	if ((isLoading.value && status.value === 'loading') || status.value === 'loading') {
		return (
			<div class='bsettings bsettings--center'>
				<div class='bsettings-spinner' aria-label='Loading settings' />
			</div>
		);
	}
	if (status.value === 'no-business') {
		return (
			<div class='bsettings bsettings--center'>
				<div class='bsettings-prompt'>
					<h1 class='bsettings-prompt__title'>No active business</h1>
					<p class='bsettings-prompt__text'>Switch to a business persona to manage its profile.</p>
					<Button variant='primary' href='/business'>Go to businesses</Button>
				</div>
			</div>
		);
	}
	if (status.value === 'error') {
		return (
			<div class='bsettings bsettings--center'>
				<div class='bsettings-prompt'>
					<h1 class='bsettings-prompt__title'>Couldn't load settings</h1>
					<Button variant='primary' onClick={load}>Retry</Button>
				</div>
			</div>
		);
	}
	// #endregion

	return (
		<div class='bsettings'>
			<header class='bsettings-header'>
				<span class='bsettings-header__eyebrow'>Business administration</span>
				<h1 class='bsettings-header__title'>Profile settings</h1>
				<p class='bsettings-header__subtitle'>
					Manage your business identity, billing contact and administrative logo.
				</p>
			</header>

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
						{currentLogoUrl.value
							? <img src={currentLogoUrl.value} alt='Current logo' />
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
							disabled={!canManage.value}
						/>
					</div>
				</div>

				<div class='bsettings-fields'>
					<TextField
						label='Business name'
						value={name}
						placeholder='Acme Studio'
						required
						disabled={!canManage.value}
					/>
					<TextField
						label='Legal entity name'
						value={legalName}
						placeholder='Acme Studio Ltd.'
						hint='The registered legal name used on invoices.'
						disabled={!canManage.value}
					/>
					<TextField
						label='Billing email'
						type='email'
						value={billingEmail}
						placeholder='billing@acme.co'
						required
						disabled={!canManage.value}
					/>
				</div>

				<footer class='bsettings-card__footer'>
					{!canManage.value && (
						<span class='bsettings-note'>
							<IconLock size={14} stroke={2} /> Only owners or admins can edit these details.
						</span>
					)}
					<Button
						variant='primary'
						onClick={save}
						loading={saving.value}
						disabled={!canManage.value}
					>
						Save changes
					</Button>
				</footer>
			</section>

			{/* AC4 — explicitly deferred / blocked. */}
			<section class='bsettings-card bsettings-card--blocked' aria-disabled='true'>
				<header class='bsettings-card__header'>
					<span class='bsettings-card__icon bsettings-card__icon--muted'>
						<IconCreditCardOff size={18} stroke={2} />
					</span>
					<div>
						<h2 class='bsettings-card__title'>Card payment methods</h2>
						<p class='bsettings-card__subtitle'>
							Attach a credit card via Stripe for external top-ups.
						</p>
					</div>
					<span class='bsettings-badge'>Coming soon</span>
				</header>
				<p class='bsettings-blocked__text'>
					Card attachments are deferred — Projective settles work through the internal wallet, so
					Stripe payment intents sit outside the current demo path.
				</p>
			</section>
		</div>
	);
}
