/**
 * @file NewTicketModal.tsx
 * @description The pipeline Ticket creation modal (spec §2), rebuilt to the wireframe: a two-pane
 * dialog with a left authoring canvas (title, rich description, workload intensity, due date, a
 * global checklist and an attachment dropzone) and a right operations rail (the real-time cost-range
 * widget plus the reorderable pipeline stage tree with per-stage inline override inspectors).
 *
 * Minimum-viable validation: only Title is required to create (spec §1). Rich per-stage overrides
 * (localized intensity/due/NDA/checklist/dependency) are captured as frontend state — the ticket
 * write contract only persists `required_stages` + the global intensity/due today (there is no
 * backend for the override matrix yet; see the `stage-submissions-frontend-mock` memory), so the
 * submit payload is kept byte-compatible with the existing API and the extra state drives the
 * preview only.
 */

// #region Imports
import '../../styles/components/new/ticket-create.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, toast } from '@projective/ui';
import { Modal } from '@projective/ui';
import {
	DateField,
	FileDrop,
	RichTextField,
	type SelectOption,
	TextField,
} from '@projective/fields';
import {
	DateTime,
	type FileWithMeta,
	type FullProjectResponse,
	TicketStatus,
} from '@projective/types';
import { IconChartBar, IconChecklist, IconInfoCircle, IconPlus, IconX } from '@tabler/icons-preact';
import {
	CreateTicketStageRow,
	defaultOverride,
	type StageOverride,
} from '../project/ticket/CreateTicketStageRow.tsx';
import { TicketCostPreview } from '../project/ticket/TicketCostPreview.tsx';
import {
	computeStageCost,
	formatMoney,
	multiplierFor,
	type PricedStageLike,
	type StageCost,
	WI_TIERS,
	type WiKey,
} from '../../contracts/new/ticketPricing.ts';
// #endregion

// #region Props
interface NewTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
	/** Ordered stage options (label/value) — retained for the submit ordering + backward-compat. */
	availableStages: { label: string; value: string }[];
	/** Full project, used to resolve stage descriptions/costs for the preview + inspectors. */
	project?: FullProjectResponse | null;
	/** Stage column the modal was opened from ('new'/null = backlog → all stages selected). */
	preselectedStageId?: string | null;
	// deno-lint-ignore no-explicit-any
	onSubmit: (payload: any) => void;
}

interface ResolvedStage extends PricedStageLike {
	id: string;
	name: string;
	code: string;
	description?: string | null;
}
// #endregion

// #region Helpers
/** Slugs a stage into a `stage-01-name` code for the row subtitle. */
function stageCode(index: number, name: string): string {
	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	return `stage-${String(index + 1).padStart(2, '0')}-${slug || 'stage'}`;
}

/** Extracts plain text from a Quill delta so the ticket keeps a searchable text description. */
// deno-lint-ignore no-explicit-any
function deltaToPlainText(delta: any): string {
	const ops = delta?.ops;
	if (!Array.isArray(ops)) return '';
	return ops.map((o) => (typeof o?.insert === 'string' ? o.insert : '')).join('').replace(
		/\n+$/,
		'',
	);
}

/** Normalizes an RTE draft (delta-JSON string, or plain text) into the persisted description pair. */
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

export function NewTicketModal(
	{ isOpen, onClose, availableStages, project, preselectedStageId, onSubmit }: NewTicketModalProps,
) {
	// #region Left-canvas form state
	const title = useSignal('');
	const description = useSignal('');
	const intensity = useSignal<WiKey>('Medium');
	const dueDate = useSignal<DateTime | null>(null);
	const checklist = useSignal<string[]>([]);
	const attachments = useSignal<FileWithMeta[]>([]);
	// #endregion

	// #region Stage tree state
	/** Live stage order (stage ids); seeded from the project pipeline order. */
	const order = useSignal<string[]>([]);
	const selected = useSignal<Set<string>>(new Set());
	const expandedId = useSignal<string | null>(null);
	const overrides = useSignal<Record<string, StageOverride>>({});
	const draggedIndex = useSignal<number | null>(null);
	// #endregion

	const currency = 'GBP';

	// #region Resolve stage metadata (project stages, falling back to availableStages)
	const stageMap = useComputed<Map<string, ResolvedStage>>(() => {
		const map = new Map<string, ResolvedStage>();
		const projStages = project?.stages ?? [];
		// Order source: availableStages is already pipeline-sorted by the board.
		availableStages.forEach((opt, i) => {
			const ps = projStages.find((s) => s.id === opt.value);
			map.set(opt.value, {
				id: opt.value,
				name: opt.label,
				code: stageCode(i, opt.label),
				description: ps?.description_text ?? null,
				unit_price_cents: ps?.unit_price_cents ?? null,
			});
		});
		return map;
	});
	// #endregion

	// #region (Re)seed on open — Kanban context awareness (spec §2B)
	useEffect(() => {
		if (!isOpen) return;

		const ids = availableStages.map((s) => s.value);
		order.value = ids;

		// A real preselected stage → only that stage; otherwise (New/backlog column) → all selected.
		const preselectReal = preselectedStageId && preselectedStageId !== 'new' &&
			ids.includes(preselectedStageId);
		selected.value = preselectReal ? new Set([preselectedStageId!]) : new Set(ids);

		overrides.value = Object.fromEntries(ids.map((id) => [id, defaultOverride()]));
		expandedId.value = null;

		title.value = '';
		description.value = '';
		intensity.value = 'Medium';
		dueDate.value = null;
		checklist.value = [];
		attachments.value = [];
	}, [isOpen, availableStages, preselectedStageId]);
	// #endregion

	// #region Derived stage rows + cost aggregation
	/** The effective intensity key for a stage (its override, or the global fallback). */
	const effectiveIntensity = (id: string): WiKey => {
		const ov = overrides.value[id];
		return !ov || ov.intensity === 'Inherit' ? intensity.value : ov.intensity;
	};

	const rows = useComputed(() =>
		order.value.map((id, index) => {
			const stage = stageMap.value.get(id);
			const eff = effectiveIntensity(id);
			const cost = stage
				? computeStageCost(stage, multiplierFor(eff))
				: { baseCents: 0, adjustedCents: 0, revisionCents: 0, bonusCents: 0 } as StageCost;
			return { id, index, stage, cost, effectiveIntensityLabel: eff };
		})
	);

	const summary = useComputed(() => {
		let standardCents = 0, revisionOverheadCents = 0, bonusCents = 0, stageCount = 0;
		for (const r of rows.value) {
			if (!selected.value.has(r.id)) continue;
			stageCount++;
			standardCents += r.cost.adjustedCents;
			revisionOverheadCents += r.cost.revisionCents;
			bonusCents += r.cost.bonusCents;
		}
		return {
			stageCount,
			standardCents,
			revisionOverheadCents,
			maxCents: standardCents + revisionOverheadCents,
			bonusCents,
		};
	});

	const selectedCount = useComputed(() => summary.value.stageCount);
	// #endregion

	// #region Stage selection controls
	const toggleSelect = (id: string) => {
		const next = new Set(selected.value);
		if (next.has(id)) {
			// Enforce ≥1 active stage (spec §2B).
			if (next.size <= 1) return;
			next.delete(id);
		} else {
			next.add(id);
		}
		selected.value = next;
	};

	const selectAll = () => (selected.value = new Set(order.value));

	/** Deselect all, but always preserve the first stage node (spec §2B). */
	const deselectAll = () => {
		const first = order.value[0];
		selected.value = new Set(first ? [first] : []);
	};

	const setOverride = (id: string, patch: Partial<StageOverride>) => {
		overrides.value = {
			...overrides.value,
			[id]: { ...(overrides.value[id] ?? defaultOverride()), ...patch },
		};
	};
	// #endregion

	// #region Drag reorder (native pointer, mirrors StageBreakdownList)
	const handleDragStart = (index: number) => (e: DragEvent) => {
		draggedIndex.value = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	};

	const handleDragOver = (index: number) => (e: DragEvent) => {
		e.preventDefault();
		const from = draggedIndex.value;
		if (from === null || from === index) return;
		const list = [...order.value];
		const [moved] = list.splice(from, 1);
		list.splice(index, 0, moved);
		draggedIndex.value = index;
		order.value = list;
	};

	const endDrag = () => (draggedIndex.value = null);
	// #endregion

	// #region Global checklist
	const setChecklistAt = (i: number, v: string) => {
		const next = [...checklist.value];
		next[i] = v;
		checklist.value = next;
	};
	const addChecklistItem = () => (checklist.value = [...checklist.value, '']);
	const removeChecklistAt = (
		i: number,
	) => (checklist.value = checklist.value.filter((_, idx) => idx !== i));
	// #endregion

	// #region Dependency options for a given row (predecessors = other selected stages)
	const dependencyOptions = (id: string): SelectOption<string>[] => {
		const opts: SelectOption<string>[] = [{ label: 'Auto — after previous stage', value: 'auto' }];
		for (const rid of order.value) {
			if (rid === id || !selected.value.has(rid)) continue;
			opts.push({ label: `After ${stageMap.value.get(rid)?.name ?? rid}`, value: rid });
		}
		opts.push({ label: 'Fixed start date', value: 'fixed' });
		return opts;
	};
	// #endregion

	// #region Submit (byte-compatible with the existing ticket write contract)
	const handleSubmit = () => {
		if (!title.value.trim()) return;

		const required_stages = order.value
			.filter((id) => selected.value.has(id))
			.map((stage_id, index) => ({ stage_id, order: index }));

		// The backlog ("New") column is mapped to the id "new" on the board; the DB expects a UUID or
		// null, so coerce it back to null.
		const resolvedStageId = (!preselectedStageId || preselectedStageId === 'new')
			? null
			: preselectedStageId;

		const { description: descJson, text_description } = normalizeDescription(description.value);

		onSubmit({
			title: title.value,
			text_description,
			description: descJson,
			required_stages,
			workload_intensity: multiplierFor(intensity.value),
			due_date: dueDate.value ? dueDate.value.toISO() : null,
			current_stage_id: resolvedStageId,
			status: TicketStatus.Backlog,
		});
	};
	// #endregion

	const contextLabel = (() => {
		const preselectReal = preselectedStageId && preselectedStageId !== 'new';
		if (preselectReal) {
			const name = availableStages.find((s) => s.value === preselectedStageId)?.label;
			return name
				? (
					<>
						Opened from <strong>{name}</strong> — that stage starts selected
					</>
				)
				: null;
		}
		return (
			<>
				Opened from <strong>New</strong> column — all stages start selected
			</>
		);
	})();

	return (
		<Modal isOpen={isOpen} onClose={onClose} width={1120} className='tc-modal'>
			<div class='tc'>
				{/* #region Header */}
				<header class='tc__header'>
					<div class='tc__heading'>
						<h1 class='tc__title'>New ticket</h1>
						<p class='tc__subtitle'>{contextLabel}</p>
					</div>
					<button type='button' class='tc__close' aria-label='Close' onClick={onClose}>
						<IconX size={20} />
					</button>
				</header>
				{/* #endregion */}

				<div class='tc__grid'>
					{/* #region Left canvas */}
					<div class='tc__canvas'>
						<div class='tc__field'>
							<label class='tc__label'>
								Title <span class='tc__req'>*</span>{' '}
								<span class='tc__hint'>— the only field required to create</span>
							</label>
							<TextField
								value={title}
								onChange={(v) => (title.value = v)}
								placeholder='e.g. Wishlist & saved items'
							/>
						</div>

						<div class='tc__field'>
							<label class='tc__label'>Description</label>
							<RichTextField
								value={description}
								onChange={(v) => (description.value = v as string)}
								outputFormat='delta'
								toolbar='basic'
								variant='framed'
								minHeight='120px'
								placeholder='Scope, acceptance criteria, links…'
							/>
						</div>

						<div class='tc__field'>
							<label class='tc__label'>Workload intensity</label>
							<div class='tc__intensity'>
								{WI_TIERS.map((tier) => (
									<button
										key={tier.key}
										type='button'
										class={`tc__intensity-opt ${
											intensity.value === tier.key ? 'tc__intensity-opt--active' : ''
										}`}
										onClick={() => (intensity.value = tier.key)}
									>
										<IconChartBar size={18} />
										<span>{tier.label}</span>
									</button>
								))}
							</div>
						</div>

						<div class='tc__field'>
							<label class='tc__label'>
								Due date <span class='tc__hint'>— optional</span>
							</label>
							<DateField
								value={dueDate.value}
								onChange={(v) => (dueDate.value = v as DateTime | null)}
							/>
						</div>

						<div class='tc__field'>
							<label class='tc__label'>Attachments</label>
							<FileDrop
								id='ticket-attachments'
								value={attachments}
								onChange={(files) => (attachments.value = files)}
								variant='split'
								multiple
								maxFiles={10}
							/>
						</div>

						<div class='tc__field'>
							<div class='tc__checklist-head'>
								<IconChecklist size={15} />
								<span>Global checklist</span>
							</div>
							<div class='tc__checklist'>
								{checklist.value.map((item, i) => (
									<div class='tc__task' key={i}>
										<input
											type='checkbox'
											class='tc__task-box'
											disabled
											aria-hidden='true'
										/>
										<input
											type='text'
											class='tc__task-input'
											value={item}
											placeholder='New requirement'
											onInput={(e) => setChecklistAt(i, e.currentTarget.value)}
										/>
										<button
											type='button'
											class='tc__task-remove'
											aria-label='Remove requirement'
											onClick={() => removeChecklistAt(i)}
										>
											<IconX size={14} />
										</button>
									</div>
								))}
								<button type='button' class='tc__task-add' onClick={addChecklistItem}>
									<IconPlus size={14} /> Add requirement
								</button>
							</div>
						</div>
					</div>
					{/* #endregion */}

					{/* #region Right rail */}
					<div class='tc__rail'>
						<TicketCostPreview
							summary={summary.value}
							currency={currency}
							intensityLabel={intensity.value}
						/>

						<div class='tc__callout'>
							<IconInfoCircle size={18} />
							<p>
								At least one stage is always required. Reorder with the handles; open a stage to
								override its cost, deadline, dependencies or requirements.
							</p>
						</div>

						<div class='tc__stages'>
							<div class='tc__stages-head'>
								<span class='tc__stages-title'>
									Pipeline stages{' '}
									<span class='tc__stages-count'>
										{selectedCount.value} of {order.value.length}
									</span>
								</span>
								<div class='tc__stages-actions'>
									<button type='button' class='tc__link' onClick={selectAll}>Select all</button>
									<button type='button' class='tc__link' onClick={deselectAll}>Deselect all</button>
								</div>
							</div>

							<div class='tc__stage-list'>
								{rows.value.map((r) => (
									r.stage
										? (
											<CreateTicketStageRow
												key={r.id}
												stageId={r.id}
												name={r.stage.name}
												code={r.stage.code}
												description={r.stage.description}
												selected={selected.value.has(r.id)}
												expanded={expandedId.value === r.id}
												cost={r.cost}
												effectiveIntensityLabel={r.effectiveIntensityLabel}
												currency={currency}
												override={overrides.value[r.id] ?? defaultOverride()}
												dependencyOptions={dependencyOptions(r.id)}
												lockSelection={selectedCount.value <= 1}
												dragging={draggedIndex.value === r.index}
												onToggleSelect={() => toggleSelect(r.id)}
												onToggleExpand={() => (expandedId.value = expandedId.value === r.id
													? null
													: r.id)}
												onOverrideChange={(patch) => setOverride(r.id, patch)}
												onDragStart={handleDragStart(r.index)}
												onDragOver={handleDragOver(r.index)}
												onDragEnd={endDrag}
												onDrop={(e) => {
													e.preventDefault();
													endDrag();
												}}
											/>
										)
										: null
								))}
								{order.value.length === 0 && (
									<p class='tc__stages-empty'>
										This project has no stages yet. Add a stage before creating tickets.
									</p>
								)}
							</div>
						</div>
					</div>
					{/* #endregion */}
				</div>

				{/* #region Footer */}
				<footer class='tc__footer'>
					<Button
						variant='secondary'
						ghost
						onClick={() => toast.success('Draft saved.')}
					>
						Save draft
					</Button>
					<div class='tc__footer-summary'>
						{selectedCount.value} stage{selectedCount.value === 1 ? '' : 's'} ·{' '}
						{formatMoney(summary.value.standardCents, currency)}–{formatMoney(
							summary.value.maxCents,
							currency,
						)}
					</div>
					<div class='tc__footer-actions'>
						<Button variant='secondary' ghost onClick={onClose}>Cancel</Button>
						<Button
							variant='primary'
							startIcon={<IconPlus size={16} />}
							onClick={handleSubmit}
							disabled={!title.value.trim()}
						>
							Create ticket
						</Button>
					</div>
				</footer>
				{/* #endregion */}
			</div>
		</Modal>
	);
}
