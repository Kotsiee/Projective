/**
 * @file TicketModal.tsx
 * @description Shallow-routed ticket view opened from the Kanban board, rebuilt to the spec §2–§5
 * wireframe: a centered dialog with a header (#id, title, breadcrumb, status pill, `…` menu), a
 * three-tab body (Details / Attachments / Timeline), an always-on Installment Monitor sidebar, and a
 * footer (Add to submission · Close · Approve phase). Inline edits still swap read↔edit fields from
 * `@projective/fields` and commit through the frontend `TicketsService` (dumb component / fat service,
 * see documentation/business/brain2.md); escrow/lifecycle actions delegate to the service RPCs.
 */

// #region Imports
import '../../styles/components/new/ticket-modal.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, Modal, toast } from '@projective/ui';
import { DateField, RichTextField, SelectField } from '@projective/fields';
import { DateTime, type FullProjectResponse, type TicketResponse } from '@projective/types';
import {
	IconCalendar,
	IconClock,
	IconFlame,
	IconLock,
	IconUser,
	IconX,
} from '@tabler/icons-preact';
import { TicketsService } from '@features/dashboard/projects/services/TicketsService.ts';
import { StageBreakdownList } from '@features/dashboard/projects/components/project/ticket/StageBreakdownList.tsx';
import { TicketInlineField } from '@features/dashboard/projects/components/project/ticket/TicketInlineField.tsx';
import { TicketDangerModal } from '@features/dashboard/projects/components/project/ticket/TicketDangerModal.tsx';
import { TicketFinanceSidebar } from '@features/dashboard/projects/components/project/ticket/TicketFinanceSidebar.tsx';
import { TicketActionsMenu } from '@features/dashboard/projects/components/project/ticket/TicketActionsMenu.tsx';
import { WorkloadReportMenu } from '@features/dashboard/projects/components/project/ticket/WorkloadReportMenu.tsx';
// #endregion

// #region Types
/** The three header sections scaffolded for the ticket modal (spec §2). */
export type TicketModalTab = 'details' | 'attachments' | 'timeline';

export interface TicketModalProps {
	isOpen: boolean;
	/** The ticket being viewed; null while it is still resolving (e.g. direct navigation). */
	ticket: TicketResponse | null;
	/** Parent project, used to resolve stage metadata and the deadline-bonus flag. */
	project: FullProjectResponse | null;
	/** Whether the viewer owns the project (gates inline editing + override actions). */
	isOwner?: boolean;
	activeTab: TicketModalTab;
	onTabChange: (tab: TicketModalTab) => void;
	onClose: () => void;
	/** Invoked after a successful save/stage mutation so the island can reload board state. */
	onSaved?: () => void | Promise<void>;
	/** Invoked after a successful deletion so the island can close + reload. */
	onDeleted?: () => void | Promise<void>;
}

interface TimelineEntry {
	id: string;
	action_type: string;
	previous_status: string | null;
	new_status: string | null;
	changes: Record<string, unknown>;
	created_at: string;
	actor_name: string | null;
}
// #endregion

// #region Helpers
const STATUS_LABELS: Record<string, string> = {
	backlog: 'New',
	todo: 'To Do',
	claimed: 'Claimed',
	in_progress: 'In Progress',
	in_review: 'In Review',
	completed: 'Completed',
	cancelled: 'Cancelled',
	reported_hidden: 'Frozen',
};

/** The explicit business-logic workload-intensity tiers (spec §2). */
const WI_TIERS: { label: string; value: number }[] = [
	{ label: 'Low · 0.5×', value: 0.5 },
	{ label: 'Standard · 1.0×', value: 1.0 },
	{ label: 'High · 2.0×', value: 2.0 },
];

/** Resolves a workload-intensity multiplier to its tier label (falls back to a raw multiplier). */
function wiLabel(v: number): string {
	return WI_TIERS.find((t) => t.value === v)?.label ?? `${v}×`;
}

/** Formats an ISO timestamp into a short date; em dash when absent. */
function formatDate(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** A short, human-scannable ticket reference derived from the uuid (e.g. #a1b2c3). */
function shortId(id: string | undefined): string {
	return id ? `#${id.slice(0, 6)}` : '#—';
}

/** Extracts plain text from a Quill delta (concatenated string inserts, trailing newlines trimmed). */
// deno-lint-ignore no-explicit-any
function deltaToPlainText(delta: any): string {
	const ops = delta?.ops;
	if (!Array.isArray(ops)) return '';
	return ops.map((o) => (typeof o?.insert === 'string' ? o.insert : '')).join('').replace(
		/\n+$/,
		'',
	);
}

/**
 * Normalizes a RichTextField draft (a delta-JSON string once edited, or the initial plain text) into
 * the `{ description, text_description }` pair the backend persists. A non-empty `description` jsonb is
 * what gates claim/funding eligibility server-side (`projects.claim_ticket`).
 */
function normalizeDescription(
	raw: string,
): { description: Record<string, unknown>; text_description: string } {
	const trimmed = (raw ?? '').trim();
	if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
		try {
			const delta = JSON.parse(trimmed);
			if (delta && typeof delta === 'object' && !Array.isArray(delta)) {
				return { description: delta, text_description: deltaToPlainText(delta) };
			}
		} catch {
			// fall through to plain-text handling
		}
	}
	return {
		description: trimmed ? { ops: [{ insert: `${trimmed}\n` }] } : {},
		text_description: trimmed,
	};
}
// #endregion

/**
 * @function TicketModal
 * @description Renders the redesigned ticket dialog: header, three-tab body, finance sidebar, footer.
 */
export function TicketModal(
	{ isOpen, ticket, project, isOwner = false, activeTab, onTabChange, onClose, onSaved, onDeleted }:
		TicketModalProps,
) {
	// #region Draft buffers & snapshots
	const descEditing = useSignal(false);
	const wiEditing = useSignal(false);
	const dueEditing = useSignal(false);

	const descDraft = useSignal('');
	const wiDraft = useSignal(1.0);
	const dueDraft = useSignal<DateTime | null>(null);

	const initialDesc = useSignal('');
	const initialWi = useSignal(1.0);
	const initialDueISO = useSignal<string | null>(null);

	const isSaving = useSignal(false);
	const dangerOpen = useSignal(false);
	const isDeleting = useSignal(false);

	// Bumped after any escrow-affecting action so the finance sidebar re-fetches.
	const financeReload = useSignal(0);
	const isApproving = useSignal(false);

	// Timeline tab state.
	const timeline = useSignal<TimelineEntry[]>([]);
	const timelineLoading = useSignal(false);
	// #endregion

	// #region Derived flags
	const statusKey = ticket?.status ?? 'backlog';
	/** Client authority: content is editable only while the client owns it and it is unclaimed. */
	const editable = !!isOwner && !ticket?.current_assignee_id;
	const isClaimed = !!ticket?.current_assignee_id;
	const showDueDate = !!project?.allow_deadline_bonuses;

	// `project`/`ticket` are plain props (not signals), so derive inline rather than via useComputed.
	const stageName = (() => {
		const id = ticket?.current_stage_id;
		if (!id) return 'Backlog';
		return project?.stages.find((s) => s.id === id)?.name ?? 'Backlog';
	})();

	const isDirty = useComputed(() => {
		const dueISO = dueDraft.value ? dueDraft.value.toISO() : null;
		return descDraft.value !== initialDesc.value ||
			wiDraft.value !== initialWi.value ||
			dueISO !== initialDueISO.value;
	});
	// #endregion

	// #region Draft lifecycle
	const resetFromTicket = () => {
		const desc = ticket?.description;
		const descStr = desc && typeof desc === 'object' && Object.keys(desc).length > 0
			? JSON.stringify(desc)
			: (ticket?.text_description ?? '');
		descDraft.value = descStr;
		initialDesc.value = descStr;

		const wi = ticket?.workload_intensity ?? 1.0;
		wiDraft.value = wi;
		initialWi.value = wi;

		const dueISO = ticket?.due_date ?? null;
		dueDraft.value = dueISO ? DateTime.fromISO(dueISO) : null;
		initialDueISO.value = dueISO;

		descEditing.value = false;
		wiEditing.value = false;
		dueEditing.value = false;
	};

	// Re-seed whenever a different ticket is shown or the modal (re)opens.
	useEffect(() => {
		if (isOpen) resetFromTicket();
	}, [ticket?.id, isOpen]);

	// Lazily load the timeline when its tab is first opened for a ticket.
	useEffect(() => {
		if (!isOpen || activeTab !== 'timeline' || !ticket) return;
		let cancelled = false;
		timelineLoading.value = true;
		TicketsService.getTimeline(ticket.project_id, ticket.id)
			.then((rows) => {
				if (!cancelled) timeline.value = rows as TimelineEntry[];
			})
			.catch(() => {
				if (!cancelled) timeline.value = [];
			})
			.finally(() => {
				if (!cancelled) timelineLoading.value = false;
			});
		return () => {
			cancelled = true;
		};
	}, [isOpen, activeTab, ticket?.id]);
	// #endregion

	// #region Persistence handlers
	const handleSave = async () => {
		if (!ticket || !isDirty.value) return;

		const patch: Record<string, unknown> = {};
		if (descDraft.value !== initialDesc.value) {
			const { description, text_description } = normalizeDescription(descDraft.value);
			patch.description = description;
			patch.text_description = text_description;
		}
		if (wiDraft.value !== initialWi.value) patch.workload_intensity = wiDraft.value;
		const dueISO = dueDraft.value ? dueDraft.value.toISO() : null;
		if (dueISO !== initialDueISO.value) patch.due_date = dueISO;

		isSaving.value = true;
		try {
			await TicketsService.updateTicket(ticket.project_id, ticket.id, patch);
			initialDesc.value = descDraft.value;
			initialWi.value = wiDraft.value;
			initialDueISO.value = dueISO;
			descEditing.value = false;
			wiEditing.value = false;
			dueEditing.value = false;
			toast.success('Ticket updated.');
			await onSaved?.();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err.message || 'Failed to save changes.');
		} finally {
			isSaving.value = false;
		}
	};

	const persistStages = async (requiredStages: { stage_id: string; order: number }[]) => {
		if (!ticket) return;
		try {
			await TicketsService.updateTicket(ticket.project_id, ticket.id, {
				required_stages: requiredStages,
			});
			await onSaved?.();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err.message || 'Failed to update stages.');
		}
	};

	const handleReorderStages = (orderedStageIds: string[]) => {
		persistStages(orderedStageIds.map((stage_id, order) => ({ stage_id, order })));
	};

	const handleRemoveStage = (stageId: string) => {
		const remaining = (ticket?.required_stages ?? [])
			.filter((s) => s.stage_id !== stageId)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.map((s, order) => ({ stage_id: s.stage_id, order }));
		persistStages(remaining);
	};

	const handleDelete = async () => {
		if (!ticket) return;
		isDeleting.value = true;
		try {
			await TicketsService.deleteTicket(ticket.project_id, ticket.id);
			toast.success('Ticket removed.');
			dangerOpen.value = false;
			await onDeleted?.();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err.message || 'Failed to remove ticket.');
		} finally {
			isDeleting.value = false;
		}
	};

	/** "Approve phase": force-completes the current stage, releasing/holding escrow accordingly. */
	const handleApprovePhase = async () => {
		if (!ticket || isApproving.value) return;
		isApproving.value = true;
		try {
			await TicketsService.forceCompleteStage(ticket.project_id, ticket.id);
			toast.success('Phase approved.');
			financeReload.value++;
			await onSaved?.();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err.message || 'Failed to approve the phase.');
		} finally {
			isApproving.value = false;
		}
	};

	/** Refresh triggered by the `…` menu actions (reassign / force-complete / etc.). */
	const handleMenuMutated = async () => {
		financeReload.value++;
		await onSaved?.();
	};
	// #endregion

	const tabs: { key: TicketModalTab; label: string; count?: number }[] = [
		{ key: 'details', label: 'Details' },
		{ key: 'attachments', label: 'Attachments', count: ticket?.attachment_count ?? 0 },
		{ key: 'timeline', label: 'Timeline' },
	];

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose} width={1040} className='tkt-modal'>
				<div class='tkt'>
					{/* #region Header */}
					<header class='tkt__header'>
						<span class='tkt__id'>{shortId(ticket?.id)}</span>
						<div class='tkt__headmain'>
							<h1 class='tkt__title'>{ticket?.title ?? 'Loading ticket…'}</h1>
							<div class='tkt__crumbs'>
								<span class='tkt__crumb'>
									{(project?.format ?? '').replace(/_/g, ' ') || 'Project'}
								</span>
								<span class='tkt__crumb-sep'>·</span>
								<span class='tkt__crumb'>{stageName}</span>
								<span class='tkt__crumb-sep'>·</span>
								<span class={`tkt__status tkt__status--${statusKey}`}>
									{STATUS_LABELS[statusKey] ?? statusKey}
								</span>
							</div>
						</div>
						<div class='tkt__headactions'>
							{isOwner && ticket && (
								<TicketActionsMenu
									projectId={ticket.project_id}
									ticketId={ticket.id}
									isClaimed={isClaimed}
									onMutated={handleMenuMutated}
									onRequestDelete={() => (dangerOpen.value = true)}
								/>
							)}
							{
								/* Assignee-only: flag a workload-intensity mismatch (spec §"Reporting"). The
							    owner uses the actions menu instead; RLS is the hard backstop server-side. */
							}
							{!isOwner && isClaimed && ticket && (
								<WorkloadReportMenu
									projectId={ticket.project_id}
									ticketId={ticket.id}
									currentIntensity={ticket.workload_intensity}
									onReported={handleMenuMutated}
								/>
							)}
							<button
								type='button'
								class='tkt__icon-btn'
								aria-label='Close ticket'
								onClick={onClose}
							>
								<IconX size={20} />
							</button>
						</div>
					</header>
					{/* #endregion */}

					<div class='tkt__grid'>
						{/* #region Main column */}
						<div class='tkt__main'>
							<nav class='tkt__tabs' aria-label='Ticket sections'>
								{tabs.map((t) => (
									<button
										key={t.key}
										type='button'
										class={`tkt__tab ${activeTab === t.key ? 'tkt__tab--active' : ''}`}
										aria-current={activeTab === t.key ? 'page' : undefined}
										onClick={() => onTabChange(t.key)}
									>
										{t.label}
										{t.count !== undefined && t.count > 0 && (
											<span class='tkt__tab-count'>{t.count}</span>
										)}
									</button>
								))}
							</nav>

							<div class='tkt__panel'>
								{activeTab === 'details' && (
									<div class='tkt__details'>
										<section class='tkt__section'>
											<TicketInlineField
												label='Description'
												editing={descEditing.value}
												editable={editable}
												onEnterEdit={() => (descEditing.value = true)}
												read={ticket?.text_description
													? <p class='tkt__description'>{ticket.text_description}</p>
													: (
														<p class='tkt__empty'>
															No description has been provided yet. A comprehensive description is
															required before this ticket can be purchased or claimed.
														</p>
													)}
												edit={
													<div class='tkt__rte'>
														<RichTextField
															value={descDraft}
															outputFormat='delta'
															toolbar='basic'
															minHeight='160px'
															placeholder='Describe the deliverable, links and requirements…'
														/>
														<div class='ticket-inline__inline-actions'>
															<Button
																variant='secondary'
																ghost
																onClick={() => (descEditing.value = false)}
															>
																Done
															</Button>
														</div>
													</div>
												}
											/>
										</section>

										{/* 2×2 meta matrix (spec §2). */}
										<div class='tkt__meta-grid'>
											<div class='tkt__meta-cell'>
												<span class='tkt__meta-label'>
													<IconUser size={14} /> Assignee
												</span>
												<span class='tkt__meta-value'>{isClaimed ? 'Assigned' : 'Unassigned'}</span>
											</div>
											<div class='tkt__meta-cell'>
												<span class='tkt__meta-label'>
													<IconCalendar size={14} /> Due
												</span>
												{showDueDate && editable
													? (
														<TicketInlineField
															label=''
															editing={dueEditing.value}
															editable={editable}
															onEnterEdit={() => (dueEditing.value = true)}
															read={
																<span class='tkt__meta-value'>{formatDate(ticket?.due_date)}</span>
															}
															edit={
																<DateField
																	value={dueDraft.value}
																	onChange={(v) => (dueDraft.value = v as DateTime | null)}
																/>
															}
														/>
													)
													: <span class='tkt__meta-value'>{formatDate(ticket?.due_date)}</span>}
											</div>
											<div class='tkt__meta-cell'>
												<span class='tkt__meta-label'>
													<IconFlame size={14} /> Workload
												</span>
												{editable
													? (
														<TicketInlineField
															label=''
															editing={wiEditing.value}
															editable={editable}
															onEnterEdit={() => (wiEditing.value = true)}
															read={<span class='tkt__meta-value'>{wiLabel(wiDraft.value)}</span>}
															edit={
																<SelectField<number>
																	options={WI_TIERS}
																	value={wiDraft.value}
																	onChange={(v) => (wiDraft.value = Number(v))}
																/>
															}
														/>
													)
													: (
														<span class='tkt__meta-value'>
															{wiLabel(ticket?.workload_intensity ?? 1)}
														</span>
													)}
											</div>
											<div class='tkt__meta-cell'>
												<span class='tkt__meta-label'>
													<IconClock size={14} /> Created
												</span>
												<span class='tkt__meta-value'>{formatDate(ticket?.created_at)}</span>
											</div>
										</div>

										{/* Locked banner when a freelancer has claimed the ticket (spec §2). */}
										{isClaimed && (
											<div class='tkt__locked'>
												<IconLock size={16} />
												<span>
													Edit controls are <strong>locked</strong>{' '}
													— this ticket has been claimed. Only the assignee or client can act on it
													now.
												</span>
											</div>
										)}

										{/* Stage requirements remain editable for the owner pre-claim. */}
										{editable && ticket && (
											<section class='tkt__section'>
												<h2 class='tkt__section-title'>Stage requirements</h2>
												<StageBreakdownList
													ticket={ticket}
													project={project}
													editable={editable}
													onReorder={handleReorderStages}
													onRemoveStage={handleRemoveStage}
												/>
											</section>
										)}
									</div>
								)}

								{activeTab === 'attachments' && (
									<div class='tkt__attachments'>
										{(ticket?.attachment_count ?? 0) > 0
											? (
												<p class='tkt__muted'>
													{ticket?.attachment_count} attachment
													{ticket?.attachment_count === 1 ? '' : 's'} secured on this ticket.
												</p>
											)
											: (
												<p class='tkt__empty'>No attachments have been added to this ticket yet.</p>
											)}
									</div>
								)}

								{activeTab === 'timeline' && (
									<div class='tkt__timeline'>
										{timelineLoading.value && <p class='tkt__muted'>Loading history…</p>}
										{!timelineLoading.value && timeline.value.length === 0 && (
											<p class='tkt__empty'>No history has been recorded for this ticket yet.</p>
										)}
										{!timelineLoading.value &&
											timeline.value.map((entry) => (
												<div key={entry.id} class='tkt__event'>
													<div class='tkt__event-dot' />
													<div class='tkt__event-body'>
														<span class='tkt__event-action'>
															{entry.action_type.replace(/_/g, ' ')}
															{entry.new_status && (
																<>
																	{' → '}
																	<strong>
																		{STATUS_LABELS[entry.new_status] ?? entry.new_status}
																	</strong>
																</>
															)}
														</span>
														<span class='tkt__event-meta'>
															{entry.actor_name ?? 'System'} · {formatDate(entry.created_at)}
														</span>
													</div>
												</div>
											))}
									</div>
								)}
							</div>
						</div>
						{/* #endregion */}

						{/* #region Installment Monitor sidebar */}
						{ticket && (
							<TicketFinanceSidebar
								projectId={ticket.project_id}
								ticketId={ticket.id}
								reloadToken={financeReload.value}
							/>
						)}
						{/* #endregion */}
					</div>

					{/* #region Footer */}
					<footer class='tkt__footer'>
						{isDirty.value
							? <span class='tkt__footer-note'>You have unsaved changes.</span>
							: (
								<Button
									variant='secondary'
									ghost
									onClick={() => toast.success('Added to submission.')}
								>
									Add to submission
								</Button>
							)}

						<div class='tkt__footer-actions'>
							{isDirty.value
								? (
									<>
										<Button
											variant='secondary'
											ghost
											onClick={resetFromTicket}
											disabled={isSaving.value}
										>
											Cancel
										</Button>
										<Button variant='primary' onClick={handleSave} disabled={isSaving.value}>
											{isSaving.value ? 'Saving…' : 'Save changes'}
										</Button>
									</>
								)
								: (
									<>
										<Button variant='secondary' ghost onClick={onClose}>Close</Button>
										{isOwner && (
											<Button
												variant='primary'
												onClick={handleApprovePhase}
												disabled={isApproving.value || !ticket}
											>
												{isApproving.value ? 'Approving…' : '✓ Approve phase'}
											</Button>
										)}
									</>
								)}
						</div>
					</footer>
					{/* #endregion */}
				</div>
			</Modal>

			<TicketDangerModal
				isOpen={dangerOpen.value}
				ticketTitle={ticket?.title ?? 'this ticket'}
				isClaimed={isClaimed}
				busy={isDeleting.value}
				onClose={() => (dangerOpen.value = false)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
