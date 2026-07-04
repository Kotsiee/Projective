/* #region Imports */
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import { Button, IconButton, Overlay } from '@projective/ui';
import { IconAlertTriangle, IconRotateClockwise, IconX } from '@tabler/icons-preact';
import {
	computeRevisionCost,
	formatMoney,
	type RevisionPolicy,
	type StageTicket,
	type Submission,
	type SubmissionFeedback,
} from '../../../../contracts/Submissions.ts';
import { SubmissionDetails } from './SubmissionDetails.tsx';
import { SubmissionFilePane } from './SubmissionFilePane.tsx';
import { DETAILS_KEY, SubmissionAssetList } from './SubmissionAssetList.tsx';
import { RevisionCostWidget } from './RevisionCostWidget.tsx';
/* #endregion */

/* #region Interfaces */
export interface RequestRevisionModalProps {
	isOpen: boolean;
	submission: Submission | null;
	tickets: StageTicket[];
	policy: RevisionPolicy;
	onSubmit: (feedback: SubmissionFeedback) => void;
	onClose: () => void;
}
/* #endregion */

/* #region Component */
/**
 * @function RequestRevisionModal
 * @description Dual-pane revision request. Same asset-list structure as the accept
 * modal, but each file pane carries a feedback field and the details pane holds
 * the global comment. A high-visibility cost banner + line-item widget make the
 * financial overhead of the iteration explicit.
 */
export function RequestRevisionModal(
	{ isOpen, submission, tickets, policy, onSubmit, onClose }: RequestRevisionModalProps,
): JSX.Element {
	const selectedKey = useSignal<string>(DETAILS_KEY);
	const globalComment = useSignal('');
	const perFile = useSignal<Record<string, string>>({});

	const files = submission?.files ?? [];
	const hasFiles = files.length > 0;
	const activeFile = files.find((f) => f.id === selectedKey.value) ?? null;
	const cost = computeRevisionCost(policy);
	const flagged = Object.entries(perFile.value).filter(([, v]) => v.trim()).map(([k]) => k);

	const setFileNote = (id: string, value: string) => {
		perFile.value = { ...perFile.value, [id]: value };
	};

	const submit = () => {
		const cleaned: Record<string, string> = {};
		for (const [k, v] of Object.entries(perFile.value)) {
			if (v.trim()) cleaned[k] = v.trim();
		}
		onSubmit({
			global: globalComment.value.trim(),
			perFile: cleaned,
			createdAt: new Date().toISOString(),
		});
	};

	const canSubmit = globalComment.value.trim().length > 0 || flagged.length > 0;

	return (
		<Overlay
			type='modal'
			isOpen={isOpen}
			onClose={onClose}
			width={960}
			height={720}
			className='submission-modal'
		>
			{submission && (
				<div class='submission-modal__frame'>
					<header class='submission-modal__head'>
						<div class='submission-modal__head-text'>
							<span class='submission-modal__eyebrow'>Request revision</span>
							<h2 class='submission-modal__title'>{submission.title}</h2>
						</div>
						<IconButton ghost rounded aria-label='Close' onClick={onClose}>
							<IconX size={20} />
						</IconButton>
					</header>

					{/* High-visibility financial overhead notice. */}
					<div class={`revision-banner${cost.isFree ? ' revision-banner--free' : ''}`}>
						<IconAlertTriangle size={20} />
						<div class='revision-banner__text'>
							{cost.isFree
								? (
									<>
										This uses <strong>1 of your included revisions</strong> ({cost.remainingFree}
										{' '}
										will remain). Further iterations beyond your allowance are billed at{' '}
										{formatMoney(policy.perRevisionCents, policy.currency)}.
									</>
								)
								: (
									<>
										Your included revisions are used up. Requesting this revision adds{' '}
										<strong>{formatMoney(cost.totalCents, cost.currency)}</strong>{' '}
										to the project cost.
									</>
								)}
						</div>
					</div>

					<div class={`submission-modal__body${hasFiles ? '' : ' submission-modal__body--solo'}`}>
						{hasFiles && (
							<div class='submission-modal__nav'>
								<SubmissionAssetList
									files={files}
									selectedKey={selectedKey.value}
									onSelect={(k) => (selectedKey.value = k)}
									flaggedFileIds={flagged}
								/>
							</div>
						)}

						<div class='submission-modal__pane'>
							{selectedKey.value === DETAILS_KEY || !activeFile
								? (
									<div class='submission-revise-details'>
										<SubmissionDetails submission={submission} tickets={tickets} />
										<div class='submission-revise-block'>
											<label class='submission-form__label' for='revise-global'>
												Overall feedback
											</label>
											<textarea
												id='revise-global'
												class='submission-textarea'
												placeholder='Summarise what needs to change across the submission…'
												value={globalComment.value}
												onInput={(e) => (globalComment.value = e.currentTarget.value)}
											/>
										</div>
										<RevisionCostWidget policy={policy} cost={cost} />
									</div>
								)
								: (
									<SubmissionFilePane file={activeFile}>
										<div class='submission-revise-block'>
											<label class='submission-form__label' for={`note-${activeFile.id}`}>
												Feedback for this file
											</label>
											<textarea
												id={`note-${activeFile.id}`}
												class='submission-textarea'
												placeholder='What should change about this file?'
												value={perFile.value[activeFile.id] ?? ''}
												onInput={(e) => setFileNote(activeFile.id, e.currentTarget.value)}
											/>
										</div>
									</SubmissionFilePane>
								)}
						</div>
					</div>

					<footer class='submission-modal__footer'>
						<Button variant='secondary' onClick={onClose}>Cancel</Button>
						<Button
							variant='primary'
							startIcon={<IconRotateClockwise size={18} />}
							onClick={submit}
							disabled={!canSubmit}
						>
							Send revision request
						</Button>
					</footer>
				</div>
			)}
		</Overlay>
	);
}
/* #endregion */
