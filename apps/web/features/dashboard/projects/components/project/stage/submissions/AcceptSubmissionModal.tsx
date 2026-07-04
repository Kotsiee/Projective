/* #region Imports */
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import { Button, IconButton, Overlay } from '@projective/ui';
import { IconCircleCheck, IconX } from '@tabler/icons-preact';
import type { StageTicket, Submission } from '../../../../contracts/Submissions.ts';
import { SubmissionDetails } from './SubmissionDetails.tsx';
import { SubmissionFilePane } from './SubmissionFilePane.tsx';
import { DETAILS_KEY, SubmissionAssetList } from './SubmissionAssetList.tsx';
/* #endregion */

/* #region Interfaces */
export interface AcceptSubmissionModalProps {
	isOpen: boolean;
	submission: Submission | null;
	tickets: StageTicket[];
	onConfirm: () => void;
	onClose: () => void;
}
/* #endregion */

/* #region Component */
/**
 * @function AcceptSubmissionModal
 * @description Dual-pane acceptance review. Left = asset list with the isolated
 * "Submission Details" node on top and each deliverable beneath; right = the
 * selected asset. If the submission has no files, the left pane is hidden and the
 * details span the full width.
 */
export function AcceptSubmissionModal(
	{ isOpen, submission, tickets, onConfirm, onClose }: AcceptSubmissionModalProps,
): JSX.Element {
	const selectedKey = useSignal<string>(DETAILS_KEY);

	const files = submission?.files ?? [];
	const hasFiles = files.length > 0;
	const activeFile = files.find((f) => f.id === selectedKey.value) ?? null;

	return (
		<Overlay
			type='modal'
			isOpen={isOpen}
			onClose={onClose}
			width={960}
			height={680}
			className='submission-modal'
		>
			{submission && (
				<div class='submission-modal__frame'>
					<header class='submission-modal__head'>
						<div class='submission-modal__head-text'>
							<span class='submission-modal__eyebrow'>Accept submission</span>
							<h2 class='submission-modal__title'>{submission.title}</h2>
						</div>
						<IconButton ghost rounded aria-label='Close' onClick={onClose}>
							<IconX size={20} />
						</IconButton>
					</header>

					<div class={`submission-modal__body${hasFiles ? '' : ' submission-modal__body--solo'}`}>
						{hasFiles && (
							<div class='submission-modal__nav'>
								<SubmissionAssetList
									files={files}
									selectedKey={selectedKey.value}
									onSelect={(k) => (selectedKey.value = k)}
								/>
							</div>
						)}

						<div class='submission-modal__pane'>
							{selectedKey.value === DETAILS_KEY || !activeFile
								? <SubmissionDetails submission={submission} tickets={tickets} />
								: <SubmissionFilePane file={activeFile} />}
						</div>
					</div>

					<footer class='submission-modal__footer'>
						<Button variant='secondary' onClick={onClose}>Cancel</Button>
						<Button
							variant='primary'
							startIcon={<IconCircleCheck size={18} />}
							onClick={onConfirm}
						>
							Confirm acceptance
						</Button>
					</footer>
				</div>
			)}
		</Overlay>
	);
}
/* #endregion */
