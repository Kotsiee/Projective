/**
 * @file financeSeries.ts
 * @description Derives the Area/Line chart series (financial volume + spending history) from the
 * live transaction ledger. The `Balance` series plots the running wallet balance after each
 * movement; the `Spending` series plots cumulative gross outflow. Both share the same per-movement
 * timeline so the chart (which aligns series by index) lines them up.
 */

import type { AreaLineSeries } from '@projective/charts';
import type { TransactionLedgerItem } from '@projective/types';

export function buildFinanceSeries(transactions: TransactionLedgerItem[]): AreaLineSeries[] {
	if (transactions.length === 0) return [];

	// The RPC returns newest-first; the chart timeline reads oldest→newest.
	const chron = [...transactions].reverse();

	let cumulativeSpend = 0;
	const balancePoints = chron.map((t) => ({ t: t.date, value_cents: t.balance_after_cents }));
	const spendPoints = chron.map((t) => {
		if (t.direction === 'debit') cumulativeSpend += t.gross_cents;
		return { t: t.date, value_cents: cumulativeSpend };
	});

	return [
		{ id: 'balance', label: 'Wallet balance', color: 'var(--primary)', points: balancePoints },
		{ id: 'spend', label: 'Cumulative spend', color: 'var(--violet)', points: spendPoints },
	];
}
