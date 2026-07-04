/* #region Imports */
import { JSX } from 'preact';
import type { SubmissionStatus } from '../../../../contracts/Submissions.ts';
/* #endregion */

/* #region Status pill */
const STATUS_META: Record<SubmissionStatus, { label: string; tone: string }> = {
	draft: { label: 'Draft', tone: 'neutral' },
	pending_review: { label: 'Pending review', tone: 'warning' },
	accepted: { label: 'Accepted', tone: 'success' },
	revisions_requested: { label: 'Revisions requested', tone: 'danger' },
};

/** A colour-coded submission status pill, shared across the surface. */
export function SubmissionStatusPill({ status }: { status: SubmissionStatus }): JSX.Element {
	const meta = STATUS_META[status];
	return (
		<span class={`submission-status submission-status--${meta.tone}`}>
			{meta.label}
		</span>
	);
}
/* #endregion */
