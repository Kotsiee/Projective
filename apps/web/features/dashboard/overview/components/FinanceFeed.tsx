/**
 * @file FinanceFeed.tsx
 * @description The live finance hub (US-008 AC3): a premium Area/Line chart of wallet volume +
 * spending history over the top of the high-fidelity Transaction Ledger — both reading straight
 * from the Postgres ledger engine (`org.get_business_finance`). A refresh control re-pulls the
 * snapshot so the numbers move as escrow is held or released.
 */

import { useMemo } from 'preact/hooks';
import { AreaLineChart } from '@projective/charts';
import { Button, TransactionLedger } from '@projective/ui';
import { IconRefresh, IconTrendingUp } from '@tabler/icons-preact';
import type { BusinessFinancePayload } from '../contracts/Overview.ts';
import { buildFinanceSeries } from '../data/financeSeries.ts';
import { formatMoney } from '../data/format.ts';

export interface FinanceFeedProps {
	finance: BusinessFinancePayload;
	onRefresh: () => void;
	refreshing?: boolean;
}

export function FinanceFeed({ finance, onRefresh, refreshing }: FinanceFeedProps) {
	const { currency, transactions } = finance;
	const series = useMemo(() => buildFinanceSeries(transactions), [transactions]);
	const format = (c: number) => formatMoney(c, currency);

	return (
		<section class='overview-finance'>
			<div class='overview-card overview-finance__chart'>
				<header class='overview-card__header'>
					<div class='overview-card__heading'>
						<span class='overview-card__icon' aria-hidden='true'>
							<IconTrendingUp size={17} stroke={2} />
						</span>
						<div>
							<h2 class='overview-card__title'>Financial volume</h2>
							<p class='overview-card__subtitle'>Wallet balance &amp; cumulative spend</p>
						</div>
					</div>
					<Button
						variant='secondary'
						outlined
						size='small'
						loading={refreshing}
						onClick={onRefresh}
						startIcon={<IconRefresh size={15} stroke={2} />}
					>
						Refresh
					</Button>
				</header>

				<div class='overview-finance__chart-body'>
					{series.length > 0
						? (
							<AreaLineChart
								series={series}
								currency={currency}
								height={260}
								idPrefix='overview-vol'
							/>
						)
						: (
							<p class='overview-empty'>
								No ledger activity yet. Fund a project stage to see live volume here.
							</p>
						)}
				</div>
			</div>

			<div class='overview-card overview-finance__ledger'>
				<TransactionLedger
					rows={transactions}
					format={format}
					title='Transaction ledger'
					showBalance
					maxHeight='340px'
					emptyLabel='No transactions yet — fund a stage to begin.'
				/>
			</div>
		</section>
	);
}
