/**
 * @file KpiRow.tsx
 * @description The admin dashboard's headline KPI strip (US-008 AC1): real-time wallet balances +
 * live active-project / member counts, each rendered as an interactive `MetricCard` from
 * `@projective/ui` that doubles as a quick-navigation shortcut to the relevant admin surface.
 */

import { MetricCard } from '@projective/ui';
import { IconBriefcase, IconLock, IconUsersGroup, IconWallet } from '@tabler/icons-preact';
import type { BusinessFinancePayload } from '../contracts/Overview.ts';
import { formatMoney } from '../data/format.ts';

export interface KpiRowProps {
	finance: BusinessFinancePayload;
	/** `/business/:id/settings` — where the members card points. */
	settingsHref: string;
}

export function KpiRow({ finance, settingsHref }: KpiRowProps) {
	const { balances, stats, currency } = finance;
	const money = (c: number) => formatMoney(c, currency);

	return (
		<div class='overview-kpis'>
			<MetricCard
				accent='primary'
				icon={<IconWallet size={18} stroke={2} />}
				label='Available balance'
				value={money(balances.available_cents)}
				sublabel='Internal wallet credit'
				href='/wallet'
			/>
			<MetricCard
				accent='amber'
				icon={<IconLock size={18} stroke={2} />}
				label='In escrow'
				value={money(balances.in_escrow_cents)}
				sublabel={`${stats.active_escrow_count} active hold${
					stats.active_escrow_count === 1 ? '' : 's'
				}`}
				href='/wallet/ledger'
			/>
			<MetricCard
				accent='violet'
				icon={<IconBriefcase size={18} stroke={2} />}
				label='Active projects'
				value={String(stats.active_project_count)}
				sublabel={`${stats.total_project_count} total`}
				href='/projects'
			/>
			<MetricCard
				accent='mint'
				icon={<IconUsersGroup size={18} stroke={2} />}
				label='Team members'
				value={String(stats.member_count)}
				sublabel='Manage roles & seats'
				href={settingsHref}
			/>
		</div>
	);
}
