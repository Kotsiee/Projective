/**
 * @file DashboardOverview.island.tsx
 * @description The Business Administration dashboard (US-008 AC1/AC3/AC5). Resolves the active
 * business from the shared `UserContext`, then hydrates a live finance snapshot + member roster
 * from the REST layer (which reads straight from the Postgres ledger engine). Escrow hold/release
 * moves the numbers on refresh. Non-business personas get a graceful switch prompt.
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Button } from '@projective/ui';
import { IconBuildingSkyscraper, IconRefresh } from '@tabler/icons-preact';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import '../styles/overview.css';
import type { BusinessFinancePayload, BusinessMember } from '../contracts/Overview.ts';
import { KpiRow } from '../components/KpiRow.tsx';
import { QuickActions } from '../components/QuickActions.tsx';
import { FinanceFeed } from '../components/FinanceFeed.tsx';
import { MemberVisibilityList } from '../components/MemberVisibilityList.tsx';
import { EscrowPanel } from '../components/EscrowPanel.tsx';

type Status = 'loading' | 'ready' | 'error' | 'no-business';

export default function DashboardOverview() {
	const { user, isLoading } = useUserContext();

	const status = useSignal<Status>('loading');
	const refreshing = useSignal(false);
	const finance = useSignal<BusinessFinancePayload | null>(null);
	const members = useSignal<BusinessMember[]>([]);

	const profile = user.value;
	const businessId = profile?.activeProfileType === 'business' ? profile.activeProfileId : null;
	const businessName = profile?.businesses.find((b) => b.id === businessId)?.name ??
		profile?.displayName ?? 'Your business';
	const settingsHref = businessId ? `/business/${businessId}/settings` : '/business';

	const load = async (silent = false) => {
		if (!businessId) {
			status.value = profile ? 'no-business' : 'loading';
			return;
		}
		if (silent) refreshing.value = true;
		else status.value = 'loading';

		try {
			const [fRes, mRes] = await Promise.all([
				fetch(`/api/v1/dashboard/business/${businessId}/finance`, { credentials: 'include' }),
				fetch(`/api/v1/dashboard/business/${businessId}/memebers`, { credentials: 'include' }),
			]);

			if (!fRes.ok) throw new Error(`finance ${fRes.status}`);
			finance.value = await fRes.json();
			members.value = mRes.ok ? await mRes.json() : [];
			status.value = 'ready';
		} catch (err) {
			console.error('Dashboard load failed:', err);
			status.value = 'error';
		} finally {
			refreshing.value = false;
		}
	};

	// Reload whenever the active business (or auth) resolves/changes.
	useEffect(() => {
		if (isLoading.value) return;
		load(false);
	}, [businessId, isLoading.value]);

	// #region Non-ready states
	if ((isLoading.value && !finance.value) || status.value === 'loading') {
		return (
			<div class='overview overview--center'>
				<div class='overview-spinner' aria-label='Loading dashboard' />
			</div>
		);
	}

	if (status.value === 'no-business') {
		return (
			<div class='overview overview--center'>
				<div class='overview-prompt'>
					<span class='overview-prompt__icon'>
						<IconBuildingSkyscraper size={28} stroke={1.6} />
					</span>
					<h1 class='overview-prompt__title'>No active business</h1>
					<p class='overview-prompt__text'>
						Switch to a business persona to open its administrative dashboard, or establish a new
						one.
					</p>
					<Button variant='primary' href='/business'>Go to businesses</Button>
				</div>
			</div>
		);
	}

	if (status.value === 'error' || !finance.value) {
		return (
			<div class='overview overview--center'>
				<div class='overview-prompt'>
					<h1 class='overview-prompt__title'>Couldn't load your dashboard</h1>
					<p class='overview-prompt__text'>Something went wrong reading your finance data.</p>
					<Button variant='primary' onClick={() => load(false)}>Retry</Button>
				</div>
			</div>
		);
	}
	// #endregion

	const data = finance.value;

	return (
		<div class='overview'>
			<header class='overview-header'>
				<div class='overview-header__heading'>
					<span class='overview-header__eyebrow'>Business administration</span>
					<h1 class='overview-header__title'>{businessName}</h1>
				</div>
				<Button
					variant='secondary'
					outlined
					size='small'
					loading={refreshing.value}
					onClick={() => load(true)}
					startIcon={<IconRefresh size={15} stroke={2} />}
				>
					Refresh
				</Button>
			</header>

			<QuickActions settingsHref={settingsHref} />
			<KpiRow finance={data} settingsHref={settingsHref} />
			<FinanceFeed finance={data} onRefresh={() => load(true)} refreshing={refreshing.value} />

			<div class='overview-lower'>
				<MemberVisibilityList members={members.value} />
				<EscrowPanel escrows={data.escrows} currency={data.currency} />
			</div>
		</div>
	);
}
