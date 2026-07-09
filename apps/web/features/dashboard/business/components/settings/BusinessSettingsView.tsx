/**
 * @file BusinessSettingsView.tsx
 * @description Server-rendered composition of Business Profile Management (US-008 AC2). The page
 * header and the deferred "Card payment methods" (AC4) section render on the server; only the
 * editable company-profile card hydrates, as the atomic `BusinessProfileForm` island seeded with
 * the profile the route resolved.
 */

import { Button } from '@projective/ui';
import { IconCreditCardOff } from '@tabler/icons-preact';
import type { BusinessAdminProfile } from '../../contracts/settings/Settings.ts';
import BusinessProfileForm from '../../islands/BusinessProfileForm.island.tsx';

export interface BusinessSettingsViewProps {
	businessId: string;
	profile: BusinessAdminProfile;
}

export function BusinessSettingsView({ businessId, profile }: BusinessSettingsViewProps) {
	return (
		<div class='bsettings'>
			<header class='bsettings-header'>
				<span class='bsettings-header__eyebrow'>Business administration</span>
				<h1 class='bsettings-header__title'>Profile settings</h1>
				<p class='bsettings-header__subtitle'>
					Manage your business identity, billing contact and administrative logo.
				</p>
			</header>

			<BusinessProfileForm
				businessId={businessId}
				name={profile.name ?? ''}
				legalName={profile.legal_name ?? ''}
				billingEmail={profile.billing_email ?? ''}
				logoUrl={profile.logoUrl}
				canManage={profile.can_manage}
			/>

			{/* AC4 — explicitly deferred / blocked. Static, non-interactive. */}
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

/** Access denied / not found — the business is missing or the user can't administer it. */
export function BusinessSettingsError({ message }: { message?: string }) {
	return (
		<div class='bsettings bsettings--center'>
			<div class='bsettings-prompt'>
				<h1 class='bsettings-prompt__title'>Couldn't load settings</h1>
				<p class='bsettings-prompt__text'>
					{message ?? "This business doesn't exist, or you don't have access to manage it."}
				</p>
				<Button variant='primary' href='/business'>Go to businesses</Button>
			</div>
		</div>
	);
}
