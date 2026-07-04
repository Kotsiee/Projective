/* #region Imports */
import { JSX } from 'preact';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconInbox } from '@tabler/icons-preact';
import {
	type StageTicket,
	type Submission,
	type SubmissionFile,
	type SubmissionTreeNode,
} from '../../../../contracts/Submissions.ts';
import { SubmissionTree } from './SubmissionTree.tsx';
import { SubmissionDetails } from './SubmissionDetails.tsx';
import { SubmissionStatusPill } from './SubmissionBits.tsx';
import {
	SubmissionFileGrid,
	SubmissionFileInspector,
	SubmissionFilePreview,
} from './SubmissionFileGrid.tsx';
/* #endregion */

/* #region Interfaces */
export interface SubmissionReviewWorkspaceProps {
	tree: SubmissionTreeNode[];
	submissions: Submission[];
	tickets: StageTicket[];
	/** Shared with the island so the nav-footer CTAs target the right submission. */
	activeSubmissionId: Signal<string | null>;
}
/* #endregion */

/* #region Component */
/**
 * @function SubmissionReviewWorkspace
 * @description The client's Submissions canvas. Far-left role-based tree, an
 * adaptive center (file grid when the submission has deliverables, otherwise the
 * full-width submission details), and a slide-out file inspector + full-view modal.
 */
export function SubmissionReviewWorkspace(
	{ tree, submissions, tickets, activeSubmissionId }: SubmissionReviewWorkspaceProps,
): JSX.Element {
	const selectedNodeId = useSignal<string | null>(null);
	const directoryScope = useSignal<string | null>(null);
	const activeFileId = useSignal<string | null>(null);
	const previewFile = useSignal<SubmissionFile | null>(null);
	const clickTimer = useRef<number | null>(null);

	// Default to the newest submission on first render.
	useEffect(() => {
		if (!activeSubmissionId.value && submissions.length > 0) {
			activeSubmissionId.value = submissions[0].id;
			selectedNodeId.value = submissions[0].id;
		}
	}, []);

	const currentSubmission = useComputed(() =>
		submissions.find((s) => s.id === activeSubmissionId.value) ?? submissions[0] ?? null
	);

	const scopedFiles = useComputed<SubmissionFile[]>(() => {
		const s = currentSubmission.value;
		if (!s) return [];
		return directoryScope.value
			? s.files.filter((f) => f.directory === directoryScope.value)
			: s.files;
	});

	const activeFile = useComputed(() =>
		scopedFiles.value.find((f) => f.id === activeFileId.value) ?? null
	);

	const handleTreeSelect = (node: SubmissionTreeNode) => {
		selectedNodeId.value = node.id;
		directoryScope.value = node.directory ?? null;
		activeFileId.value = null;
		if (node.submissionId) activeSubmissionId.value = node.submissionId;
	};

	const openPreview = (file: SubmissionFile) => {
		if (clickTimer.current) {
			clearTimeout(clickTimer.current);
			clickTimer.current = null;
		}
		previewFile.value = file;
	};

	const selectFile = (file: SubmissionFile, e: MouseEvent) => {
		if (e.detail > 1) return;
		if (clickTimer.current) clearTimeout(clickTimer.current);
		clickTimer.current = setTimeout(() => {
			activeFileId.value = file.id;
			clickTimer.current = null;
		}, 200);
	};

	const submission = currentSubmission.value;
	const files = scopedFiles.value;
	const hasFiles = files.length > 0;

	return (
		<div class='submission-workspace'>
			<aside class='submission-workspace__tree'>
				<div class='submission-workspace__tree-head'>Submissions</div>
				<SubmissionTree
					nodes={tree}
					selectedId={selectedNodeId.value}
					onSelect={handleTreeSelect}
				/>
			</aside>

			<section class='submission-workspace__center'>
				{!submission
					? (
						<div class='submission-workspace__empty'>
							<IconInbox size={40} opacity={0.5} />
							<p>No submissions to review yet.</p>
						</div>
					)
					: hasFiles
					? (
						<div class='submission-workspace__with-files'>
							<div class='submission-workspace__canvas'>
								<header class='submission-workspace__summary'>
									<div>
										<h2 class='submission-workspace__summary-title'>{submission.title}</h2>
										<span class='submission-workspace__summary-sub'>
											{submission.authorName}
											{directoryScope.value ? ` · ${directoryScope.value}` : ''}
											{` · ${files.length} file${files.length === 1 ? '' : 's'}`}
										</span>
									</div>
									<SubmissionStatusPill status={submission.status} />
								</header>

								<SubmissionFileGrid
									files={files}
									activeId={activeFileId.value}
									onSelect={selectFile}
									onOpen={openPreview}
								/>
							</div>

							{activeFile.value && (
								<aside class='submission-workspace__inspector'>
									<SubmissionFileInspector
										file={activeFile.value}
										onOpenFull={openPreview}
										onClose={() => (activeFileId.value = null)}
									/>
								</aside>
							)}
						</div>
					)
					: (
						// No deliverables → the submission details take the full center.
						<div class='submission-workspace__details-full'>
							<SubmissionDetails submission={submission} tickets={tickets} />
						</div>
					)}
			</section>

			<SubmissionFilePreview
				file={previewFile.value}
				onClose={() => (previewFile.value = null)}
			/>
		</div>
	);
}
/* #endregion */
