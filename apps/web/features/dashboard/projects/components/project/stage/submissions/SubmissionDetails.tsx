/* #region Imports */
import { JSX } from 'preact';
import { formatShortDate } from '@projective/data';
import { IconCheck, IconMinus } from '@tabler/icons-preact';
import { type StageTicket, stripHtml, type Submission } from '../../../../contracts/Submissions.ts';
import { SubmissionStatusPill } from './SubmissionBits.tsx';
/* #endregion */

/* #region Interfaces */
export interface SubmissionDetailsProps {
	submission: Submission;
	tickets: StageTicket[];
}
/* #endregion */

/* #region Component */
/**
 * @function SubmissionDetails
 * @description The submission's text metadata view — ticket, author, checklist
 * outcome, the rich-text work description, and any review feedback. Reused by the
 * client review workspace (no-files case) and both action modals.
 */
export function SubmissionDetails({ submission, tickets }: SubmissionDetailsProps): JSX.Element {
	const ticket = tickets.find((t) => t.id === submission.ticketId) ?? null;
	const hasDescription = stripHtml(submission.description).length > 0;

	return (
		<div class='submission-details'>
			<header class='submission-details__head'>
				<h2 class='submission-details__title'>{submission.title}</h2>
				<SubmissionStatusPill status={submission.status} />
			</header>

			<dl class='submission-details__meta'>
				<div>
					<dt>Ticket</dt>
					<dd>{ticket?.title ?? 'Unassigned'}</dd>
				</div>
				<div>
					<dt>Submitted by</dt>
					<dd>{submission.authorName}</dd>
				</div>
				<div>
					<dt>Submitted</dt>
					<dd>{formatShortDate(submission.submittedAt)}</dd>
				</div>
				<div>
					<dt>Files</dt>
					<dd>{submission.files.length}</dd>
				</div>
			</dl>

			{ticket && ticket.checklist.length > 0 && (
				<section class='submission-details__section'>
					<h3 class='submission-details__h3'>Checklist</h3>
					<ul class='submission-details__checklist'>
						{ticket.checklist.map((item) => {
							const done = submission.checkedItemIds.includes(item.id);
							return (
								<li key={item.id} class={done ? 'is-done' : 'is-open'}>
									<span class='submission-details__tick'>
										{done ? <IconCheck size={14} /> : <IconMinus size={14} />}
									</span>
									{item.label}
								</li>
							);
						})}
					</ul>
				</section>
			)}

			<section class='submission-details__section'>
				<h3 class='submission-details__h3'>Work description</h3>
				{hasDescription
					? (
						<div
							class='submission-details__prose'
							// Rich text authored in-app via the Quill editor (same pattern as
							// the profile/explore description bodies).
							// deno-lint-ignore react-no-danger
							dangerouslySetInnerHTML={{ __html: submission.description }}
						/>
					)
					: <p class='submission-details__muted'>No description provided.</p>}
			</section>

			{submission.feedback && (
				<section class='submission-details__section submission-details__feedback'>
					<h3 class='submission-details__h3'>Review feedback</h3>
					<p class='submission-details__prose'>{submission.feedback.global}</p>
				</section>
			)}
		</div>
	);
}
/* #endregion */
