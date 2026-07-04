/* #region Imports */
import { JSX } from 'preact';
import {
	formatMoney,
	type RevisionCostBreakdown,
	type RevisionPolicy,
} from '../../../../contracts/Submissions.ts';
/* #endregion */

/* #region Interfaces */
export interface RevisionCostWidgetProps {
	policy: RevisionPolicy;
	cost: RevisionCostBreakdown;
}
/* #endregion */

/* #region Component */
/**
 * @function RevisionCostWidget
 * @description Line-item metrics widget showing the client exactly what this
 * revision iteration costs under the stage contract — free allowance consumed,
 * the per-iteration fee, and the resulting total.
 */
export function RevisionCostWidget({ policy, cost }: RevisionCostWidgetProps): JSX.Element {
	return (
		<div class='revision-cost'>
			<div class='revision-cost__row'>
				<span>Included revisions</span>
				<span>{policy.freeRevisions}</span>
			</div>
			<div class='revision-cost__row'>
				<span>Used so far</span>
				<span>{policy.usedRevisions}</span>
			</div>
			<div class='revision-cost__row'>
				<span>This iteration</span>
				<span>
					{cost.isFree
						? <em class='revision-cost__free'>Free ({cost.remainingFree} left)</em>
						: formatMoney(cost.feeCents, cost.currency)}
				</span>
			</div>
			<div class='revision-cost__row revision-cost__row--total'>
				<span>Charge for this revision</span>
				<span>{cost.totalCents === 0 ? '—' : formatMoney(cost.totalCents, cost.currency)}</span>
			</div>
		</div>
	);
}
/* #endregion */
