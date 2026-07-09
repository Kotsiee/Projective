/**
 * @file DashboardView.tsx
 * @description Server-rendered composition of the Business Administration dashboard (US-008
 * AC1/AC3/AC5). Every structural and presentational element here renders on the server from the
 * finance snapshot + member roster resolved by the route controller; the only client-hydrated
 * pieces are the atomic `RefreshButton` and `FinanceChart` islands nested deeper in the tree.
 */

import { Button } from '@projective/ui';
import { IconBuildingSkyscraper } from '@tabler/icons-preact';
import type { BusinessFinancePayload, BusinessMember } from '../contracts/Overview.ts';
import { KpiRow } from './KpiRow.tsx';
import { QuickActions } from './QuickActions.tsx';
import { FinanceFeed } from './FinanceFeed.tsx';
import { MemberVisibilityList } from './MemberVisibilityList.tsx';
import { EscrowPanel } from './EscrowPanel.tsx';
import RefreshButton from '../islands/RefreshButton.island.tsx';

export interface DashboardViewProps {
	finance: BusinessFinancePayload;
	members: BusinessMember[];
	businessName: string;
	settingsHref: string;
}

export function DashboardView(
	{ finance, members, businessName, settingsHref }: DashboardViewProps,
) {
	return (
		<div class='overview'>
			<header class='overview-header'>
				<div class='overview-header__heading'>
					<span class='overview-header__eyebrow'>Business administration</span>
					<h1 class='overview-header__title'>{businessName}</h1>
				</div>
				<RefreshButton />
			</header>

			<QuickActions settingsHref={settingsHref} />
			<KpiRow finance={finance} settingsHref={settingsHref} />
			<FinanceFeed finance={finance} />

			<div class='overview-lower'>
				<MemberVisibilityList members={members} />
				<EscrowPanel escrows={finance.escrows} currency={finance.currency} />
			</div>
		</div>
	);
}

/** Non-business personas get a graceful prompt to switch into a business context. */
export function DashboardEmpty() {
	return (
		<div class='overview overview--center'>
			<div class='overview-prompt'>
				<span class='overview-prompt__icon'>
					<IconBuildingSkyscraper size={28} stroke={1.6} />
				</span>
				<h1 class='overview-prompt__title'>No active business</h1>
				<p class='overview-prompt__text'>
					Switch to a business persona to open its administrative dashboard, or establish a new one.
				</p>
				<Button variant='primary' href='/business'>Go to businesses</Button>
			</div>
		</div>
	);
}

/** Finance load failed — the retry re-runs the route via a Fresh Partial. */
export function DashboardError() {
	return (
		<div class='overview overview--center'>
			<div class='overview-prompt'>
				<h1 class='overview-prompt__title'>Couldn't load your dashboard</h1>
				<p class='overview-prompt__text'>Something went wrong reading your finance data.</p>
				<Button variant='primary' href='/dashboard' {...{ 'f-partial': '/dashboard' }}>
					Retry
				</Button>
			</div>
		</div>
	);
}
