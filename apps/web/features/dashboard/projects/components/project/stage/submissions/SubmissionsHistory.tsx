/* #region Imports */
import { JSX } from 'preact';
import { formatShortDate } from '@projective/data';
import { Button } from '@projective/ui';
import { IconFileText, IconMessage2, IconPaperclip, IconPlus } from '@tabler/icons-preact';
import type { StageTicket, Submission } from '../../../../contracts/Submissions.ts';
import { SubmissionStatusPill } from './SubmissionBits.tsx';
/* #endregion */

/* #region Interfaces */
export interface SubmissionsHistoryProps {
	submissions: Submission[];
	tickets: StageTicket[];
	/** Starts the freelancer submission compilation flow. */
	onCreate: () => void;
	/** Opens a past submission (e.g. to read review feedback). */
	onOpen: (submission: Submission) => void;
}
/* #endregion */

/* #region Component */
/**
 * @function SubmissionsHistory
 * @description The freelancer's Submissions canvas: a chronological list of past
 * submissions with status, ticket, deliverable counts and feedback affordance,
 * plus the primary "Create New Submission" trigger (also mirrored in the nav
 * footer via setMiddleNav).
 */
export function SubmissionsHistory(
	{ submissions, tickets, onCreate, onOpen }: SubmissionsHistoryProps,
): JSX.Element {
	const ticketTitle = (id: string | null) =>
		tickets.find((t) => t.id === id)?.title ?? 'Unassigned';

	return (
		<div class='submissions-history'>
			<header class='submissions-history__head'>
				<div>
					<h2 class='submissions-history__title'>Submissions</h2>
					<p class='submissions-history__subtitle'>
						Compile deliverables and send them for review.
					</p>
				</div>
				<Button variant='primary' startIcon={<IconPlus size={18} />} onClick={onCreate}>
					Create New Submission
				</Button>
			</header>

			{submissions.length === 0
				? (
					<div class='submissions-history__empty'>
						<IconFileText size={40} opacity={0.5} />
						<p>No submissions yet. Create your first one to get started.</p>
					</div>
				)
				: (
					<ul class='submissions-history__list'>
						{submissions.map((s) => (
							<li key={s.id}>
								<button
									type='button'
									class='submission-row'
									onClick={() => onOpen(s)}
								>
									<div class='submission-row__main'>
										<span class='submission-row__title'>{s.title}</span>
										<span class='submission-row__ticket'>{ticketTitle(s.ticketId)}</span>
									</div>
									<div class='submission-row__meta'>
										<span class='submission-row__stat'>
											<IconPaperclip size={14} /> {s.files.length}
										</span>
										{s.feedback && (
											<span class='submission-row__stat submission-row__stat--flag'>
												<IconMessage2 size={14} /> Feedback
											</span>
										)}
										<span class='submission-row__date'>{formatShortDate(s.submittedAt)}</span>
										<SubmissionStatusPill status={s.status} />
									</div>
								</button>
							</li>
						))}
					</ul>
				)}
		</div>
	);
}
/* #endregion */
