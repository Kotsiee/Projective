/**
 * @file TicketFinanceSidebar.tsx
 * @description The ticket modal's always-on "Installment Monitor" (spec §2). Renders the escrow
 * breakdown (Total / Paid to date / Locked in escrow / Remaining), an inline colour-coded segmented
 * gauge, and the installment-path narrative — all fed by `projects.get_ticket_finance` through the
 * frontend {@link TicketsService}. Dumb component: it only reads, never mutates.
 */

// #region Imports
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { TicketsService } from '@features/dashboard/projects/services/TicketsService.ts';
// #endregion

// #region Types
export type InstallmentState = 'paid' | 'escrowed' | 'pending';

export interface TicketInstallment {
	stage_id: string;
	label: string;
	amount_cents: number;
	state: InstallmentState;
}

export interface TicketFinance {
	total_cost_cents: number;
	paid_to_date_cents: number;
	locked_escrow_cents: number;
	remaining_cents: number;
	currency: string;
	installments: TicketInstallment[];
}

interface TicketFinanceSidebarProps {
	projectId: string;
	ticketId: string;
	/** Bump to force a re-fetch (e.g. after "Approve phase" releases/holds escrow). */
	reloadToken?: number;
}
// #endregion

// #region Helpers
const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€' };

/** Formats integer minor units into a major-unit currency string (e.g. 12000 → £120). */
function formatMoney(cents: number, currency: string): string {
	const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
	const major = (cents ?? 0) / 100;
	// Whole amounts render without decimals to match the design's compact figures.
	const body = Number.isInteger(major) ? major.toLocaleString() : major.toFixed(2);
	return `${symbol}${body}`;
}

/** Safe percentage of `part` over `total`, clamped to [0, 100]. */
function pct(part: number, total: number): number {
	if (!total || total <= 0) return 0;
	return Math.max(0, Math.min(100, (part / total) * 100));
}
// #endregion

export function TicketFinanceSidebar(
	{ projectId, ticketId, reloadToken = 0 }: TicketFinanceSidebarProps,
) {
	const finance = useSignal<TicketFinance | null>(null);
	const isLoading = useSignal(true);
	const error = useSignal<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		isLoading.value = true;
		error.value = null;
		TicketsService.getFinance(projectId, ticketId)
			.then((data) => {
				if (!cancelled) finance.value = data as TicketFinance;
			})
			.catch((err) => {
				if (!cancelled) error.value = err?.message || 'Unable to load finance breakdown.';
			})
			.finally(() => {
				if (!cancelled) isLoading.value = false;
			});
		return () => {
			cancelled = true;
		};
	}, [projectId, ticketId, reloadToken]);

	if (isLoading.value && !finance.value) {
		return (
			<aside class='tkt-finance'>
				<h2 class='tkt-finance__title'>Installment Monitor</h2>
				<p class='tkt-finance__muted'>Loading…</p>
			</aside>
		);
	}

	if (error.value || !finance.value) {
		return (
			<aside class='tkt-finance'>
				<h2 class='tkt-finance__title'>Installment Monitor</h2>
				<p class='tkt-finance__muted'>{error.value ?? 'No financial data available.'}</p>
			</aside>
		);
	}

	const f = finance.value;
	const cur = f.currency;
	const rows = [
		{ key: 'total', label: 'Total cost of ticket', value: f.total_cost_cents, tone: 'strong' },
		{ key: 'paid', label: 'Paid to date', value: f.paid_to_date_cents, tone: 'paid' },
		{ key: 'escrow', label: 'Locked in escrow', value: f.locked_escrow_cents, tone: 'escrow' },
		{ key: 'remaining', label: 'Remaining balance', value: f.remaining_cents, tone: 'strong' },
	];

	// The next release is the currently-held installment, else the first still-pending one.
	const nextRelease = f.installments.find((i) => i.state === 'escrowed') ??
		f.installments.find((i) => i.state === 'pending');
	const installmentCount = f.installments.length;

	return (
		<aside class='tkt-finance'>
			<h2 class='tkt-finance__title'>Installment Monitor</h2>

			<div class='tkt-finance__rows'>
				{rows.map((r) => (
					<div key={r.key} class='tkt-finance__row'>
						<span class='tkt-finance__row-label'>{r.label}</span>
						<span class={`tkt-finance__row-value tkt-finance__row-value--${r.tone}`}>
							{formatMoney(r.value, cur)}
						</span>
					</div>
				))}
			</div>

			{/* Inline colour-coded segmented gauge (paid | escrow | remaining). */}
			<div class='tkt-finance__gauge' role='img' aria-label='Payment progress'>
				<span
					class='tkt-finance__seg tkt-finance__seg--paid'
					style={{ width: `${pct(f.paid_to_date_cents, f.total_cost_cents)}%` }}
				/>
				<span
					class='tkt-finance__seg tkt-finance__seg--escrow'
					style={{ width: `${pct(f.locked_escrow_cents, f.total_cost_cents)}%` }}
				/>
				<span
					class='tkt-finance__seg tkt-finance__seg--remaining'
					style={{ width: `${pct(f.remaining_cents, f.total_cost_cents)}%` }}
				/>
			</div>
			<div class='tkt-finance__legend'>
				<span class='tkt-finance__legend-item tkt-finance__legend-item--paid'>Paid</span>
				<span class='tkt-finance__legend-item tkt-finance__legend-item--escrow'>Escrowed</span>
				<span class='tkt-finance__legend-item tkt-finance__legend-item--remaining'>Remaining</span>
			</div>

			<h3 class='tkt-finance__subtitle'>Installment Path</h3>
			<p class='tkt-finance__narrative'>
				Paid in <strong>{installmentCount} installment{installmentCount === 1 ? '' : 's'}</strong>
				{' '}
				against phase completion, not a lump sum.
				{nextRelease && (
					<>
						{' '}The next release of{' '}
						<strong class='tkt-finance__accent'>
							{formatMoney(nextRelease.amount_cents, cur)}
						</strong>{' '}
						unlocks when <strong>{nextRelease.label}</strong> is approved.
					</>
				)}
			</p>
		</aside>
	);
}
