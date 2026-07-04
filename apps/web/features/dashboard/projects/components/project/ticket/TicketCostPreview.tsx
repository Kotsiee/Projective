/**
 * @file TicketCostPreview.tsx
 * @description The highly-visible real-time cost-range widget (spec §2A). Renders the standard→max
 * estimate range, a proportional two-segment gauge (standard vs. revision overhead), the itemized
 * rows, and a contextual warning strip. Shared by the pipeline Ticket modal and the one-off Stage
 * modal (which carries the full range on its single stage).
 */

import '../../../styles/components/new/cost-preview.css';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-preact';
import { formatMoney, type TicketCostSummary } from '../../../contracts/new/ticketPricing.ts';

export interface TicketCostPreviewProps {
	summary: TicketCostSummary;
	/** 3-letter ISO currency code (defaults to GBP). */
	currency?: string;
	/** Active workload-intensity label (e.g. "Medium"). */
	intensityLabel: string;
	/** When true, renders the one-off framing ("this single stage carries the full range"). */
	oneOff?: boolean;
}

export function TicketCostPreview(
	{ summary, currency = 'GBP', intensityLabel, oneOff = false }: TicketCostPreviewProps,
) {
	const { standardCents, revisionOverheadCents, maxCents, stageCount } = summary;

	// Gauge proportions — guard the zero-total case so the bar collapses cleanly.
	const standardPct = maxCents > 0 ? (standardCents / maxCents) * 100 : 0;
	const overheadPct = maxCents > 0 ? (revisionOverheadCents / maxCents) * 100 : 0;

	return (
		<div class='cost-preview'>
			<header class='cost-preview__head'>
				<span class='cost-preview__eyebrow'>Cost preview</span>
				<button type='button' class='cost-preview__info' aria-label='How costs are estimated'>
					<IconInfoCircle size={16} />
				</button>
			</header>

			<div class='cost-preview__range'>
				<span class='cost-preview__low'>{formatMoney(standardCents, currency)}</span>
				<span class='cost-preview__dash'>–</span>
				<span class='cost-preview__high'>{formatMoney(maxCents, currency)}</span>
			</div>

			<div class='cost-preview__gauge' role='img' aria-label='Standard versus maximum cost'>
				<span
					class='cost-preview__seg cost-preview__seg--standard'
					style={{ width: `${standardPct}%` }}
				/>
				<span
					class='cost-preview__seg cost-preview__seg--overhead'
					style={{ width: `${overheadPct}%` }}
				/>
			</div>

			<dl class='cost-preview__rows'>
				<div class='cost-preview__row'>
					<dt class='cost-preview__row-label'>
						<span class='cost-preview__dot cost-preview__dot--standard' />
						Standard cost
					</dt>
					<dd class='cost-preview__row-value cost-preview__row-value--standard'>
						{formatMoney(standardCents, currency)}
					</dd>
				</div>
				<div class='cost-preview__row'>
					<dt class='cost-preview__row-label'>
						<span class='cost-preview__dot cost-preview__dot--overhead' />
						Max revision overhead
					</dt>
					<dd class='cost-preview__row-value cost-preview__row-value--overhead'>
						+{formatMoney(revisionOverheadCents, currency)}
					</dd>
				</div>
			</dl>

			<div class='cost-preview__note'>
				<IconAlertTriangle size={15} />
				<span>
					{oneOff ? 'One-off project — this single stage carries the full cost range.' : (
						<>
							Range spans <strong>{stageCount}</strong> active stage{stageCount === 1 ? '' : 's'} at
							{' '}
							{intensityLabel} intensity.
						</>
					)}
				</span>
			</div>
		</div>
	);
}
