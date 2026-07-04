/**
 * @file CreateTicketStageRow.tsx
 * @description One selectable, reorderable, expandable stage node inside the New Ticket modal
 * (spec §2B). Collapsed it shows the selection checkbox, drag handle, name/code, an optional
 * deadline-bonus pill and the intensity-adjusted cost. Expanded (inline accordion) it exposes the
 * localized overrides: workload intensity, start dependency, a localized due date (with a premium
 * warning), a stage-specific checklist, an NDA toggle and a files-required flag.
 *
 * Purely controlled/presentational — all state lives in the parent modal (dumb component / fat
 * orchestrator, see documentation/business/brain2.md). Drag wiring mirrors StageNodeRow.
 */

// #region Imports
import { Avatar, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { DateField, SelectField, type SelectOption } from '@projective/fields';
import { DateTime } from '@projective/types';
import {
	IconAlertTriangle,
	IconChevronDown,
	IconGripVertical,
	IconHash,
	IconPlus,
	IconTrophy,
	IconX,
} from '@tabler/icons-preact';
import { ToggleSwitch } from '../../common/ToggleSwitch.tsx';
import { formatMoney, type StageCost, type WiKey } from '../../../contracts/new/ticketPricing.ts';
// #endregion

// #region Override model
/** The per-stage localized overrides captured in the ticket modal (frontend state, spec §2B). */
export interface StageOverride {
	/** 'Inherit' folds back to the global ticket intensity. */
	intensity: 'Inherit' | WiKey;
	dueDate: DateTime | null;
	/** 'auto' = after previous stage; 'fixed' = explicit start date; else a predecessor stage id. */
	startDependency: string;
	startDate: DateTime | null;
	checklist: string[];
	nda: boolean;
	filesRequired: boolean;
}

/** A fresh override with inherit-everything defaults. */
export function defaultOverride(): StageOverride {
	return {
		intensity: 'Inherit',
		dueDate: null,
		startDependency: 'auto',
		startDate: null,
		checklist: [],
		nda: false,
		filesRequired: false,
	};
}
// #endregion

export interface CreateTicketStageRowProps {
	stageId: string;
	name: string;
	/** Slugged identifier shown under the name, e.g. `stage-01-discovery`. */
	code: string;
	description?: string | null;
	selected: boolean;
	expanded: boolean;
	/** Resolved cost bundle at the effective (global or overridden) intensity. */
	cost: StageCost;
	/** Effective intensity label shown in the "Cost at … intensity" row. */
	effectiveIntensityLabel: string;
	currency: string;
	override: StageOverride;
	/** Predecessor options for the start-dependency select. */
	dependencyOptions: SelectOption<string>[];
	/** Disables the checkbox (e.g. the last remaining selected stage cannot be unchecked). */
	lockSelection: boolean;
	dragging: boolean;
	onToggleSelect: () => void;
	onToggleExpand: () => void;
	onOverrideChange: (patch: Partial<StageOverride>) => void;
	onDragStart: (e: DragEvent) => void;
	onDragOver: (e: DragEvent) => void;
	onDragEnd: (e: DragEvent) => void;
	onDrop: (e: DragEvent) => void;
}

export function CreateTicketStageRow(props: CreateTicketStageRowProps) {
	const { override, cost, currency } = props;
	const hasBonus = cost.bonusCents > 0;
	const premiumDue = override.dueDate !== null; // A localized deadline introduces premium scheduling.

	const setChecklistAt = (i: number, value: string) => {
		const next = [...override.checklist];
		next[i] = value;
		props.onOverrideChange({ checklist: next });
	};
	const removeChecklistAt = (i: number) => {
		props.onOverrideChange({ checklist: override.checklist.filter((_, idx) => idx !== i) });
	};
	const addChecklistItem = () => {
		props.onOverrideChange({ checklist: [...override.checklist, ''] });
	};

	return (
		<div
			class={`tc-stage ${props.selected ? '' : 'tc-stage--off'} ${
				props.expanded ? 'tc-stage--open' : ''
			} ${props.dragging ? 'tc-stage--dragging' : ''}`}
			data-stage-id={props.stageId}
		>
			{/* #region Collapsed header row */}
			<div class='tc-stage__row'>
				<span
					class='tc-stage__handle'
					aria-hidden='true'
					title='Drag to reorder'
					draggable
					onDragStart={props.onDragStart}
					onDragOver={props.onDragOver}
					onDragEnd={props.onDragEnd}
					onDrop={props.onDrop}
				>
					<IconGripVertical size={16} />
				</span>

				<input
					type='checkbox'
					class='tc-stage__check'
					checked={props.selected}
					disabled={props.lockSelection && props.selected}
					title={props.lockSelection && props.selected
						? 'At least one stage must stay selected'
						: undefined}
					onChange={props.onToggleSelect}
				/>

				<button type='button' class='tc-stage__summary' onClick={props.onToggleExpand}>
					<span class='tc-stage__idicon'>
						<IconHash size={14} />
					</span>
					<span class='tc-stage__titles'>
						<span class='tc-stage__name'>{props.name}</span>
						<span class='tc-stage__code'>{props.code}</span>
					</span>
				</button>

				<div class='tc-stage__trailing'>
					{hasBonus && (
						<span class='tc-stage__bonus' title='Deadline bonus'>
							<IconTrophy size={13} />
							+{formatMoney(cost.bonusCents, currency)}
						</span>
					)}
					<span class='tc-stage__cost'>{formatMoney(cost.adjustedCents, currency)}</span>
					<button
						type='button'
						class={`tc-stage__chevron ${props.expanded ? 'tc-stage__chevron--open' : ''}`}
						aria-label={props.expanded ? 'Collapse stage' : 'Expand stage'}
						onClick={props.onToggleExpand}
					>
						<IconChevronDown size={16} />
					</button>
				</div>
			</div>
			{/* #endregion */}

			{/* #region Inline inspector accordion */}
			{props.expanded && (
				<div class='tc-stage__body'>
					<div class='tc-stage__desc-row'>
						<p class='tc-stage__desc'>
							{props.description || 'No description provided for this stage.'}
						</p>
						<div class='tc-stage__members'>
							<Avatar name={props.name} size={26} />
							<button type='button' class='tc-stage__member-add' aria-label='Add member'>
								<IconPlus size={14} />
							</button>
						</div>
					</div>

					<div class='tc-stage__cost-line'>
						<span>
							Cost at <strong>{props.effectiveIntensityLabel}</strong> intensity
						</span>
						<span class='tc-stage__cost-line-value'>
							{formatMoney(cost.adjustedCents, currency)}
						</span>
					</div>

					{hasBonus && (
						<div class='tc-stage__bonus-line'>
							<IconTrophy size={14} />
							Deadline bonus + {formatMoney(cost.bonusCents, currency)} on early delivery
						</div>
					)}

					<div class='tc-stage__grid'>
						<div class='tc-stage__field'>
							<label class='tc-stage__field-label'>Local workload override</label>
							<ToggleButtonGroup
								value={override.intensity}
								onChange={(v) =>
									props.onOverrideChange({ intensity: v as StageOverride['intensity'] })}
								optional={false}
								size='small'
							>
								<ToggleButton value='Inherit'>Inherit</ToggleButton>
								<ToggleButton value='Low'>Low</ToggleButton>
								<ToggleButton value='Medium'>Medium</ToggleButton>
								<ToggleButton value='High'>High</ToggleButton>
							</ToggleButtonGroup>
						</div>

						<div class='tc-stage__field'>
							<label class='tc-stage__field-label'>Start dependency</label>
							<SelectField<string>
								options={props.dependencyOptions}
								value={override.startDependency}
								onChange={(v) => props.onOverrideChange({ startDependency: v as string })}
								multiple={false}
								searchable={false}
							/>
						</div>
					</div>

					{override.startDependency === 'fixed' && (
						<div class='tc-stage__field'>
							<label class='tc-stage__field-label'>Localized start date</label>
							<DateField
								value={override.startDate}
								onChange={(v) => props.onOverrideChange({ startDate: v as DateTime | null })}
							/>
						</div>
					)}

					<div class='tc-stage__field'>
						<label class='tc-stage__field-label'>Localized due date</label>
						<DateField
							value={override.dueDate}
							onChange={(v) => props.onOverrideChange({ dueDate: v as DateTime | null })}
						/>
						{premiumDue && (
							<p class='tc-stage__warn'>
								<IconAlertTriangle size={14} />
								A tighter localized deadline may incur premium scheduling costs.
							</p>
						)}
					</div>

					<div class='tc-stage__field'>
						<label class='tc-stage__field-label'>Stage-specific checklist</label>
						<div class='tc-stage__checklist'>
							{override.checklist.map((item, i) => (
								<div class='tc-stage__task' key={i}>
									<input
										type='text'
										class='tc-stage__task-input'
										value={item}
										placeholder='Task description…'
										onInput={(e) => setChecklistAt(i, e.currentTarget.value)}
									/>
									<button
										type='button'
										class='tc-stage__task-remove'
										aria-label='Remove task'
										onClick={() => removeChecklistAt(i)}
									>
										<IconX size={14} />
									</button>
								</div>
							))}
							<button type='button' class='tc-stage__task-add' onClick={addChecklistItem}>
								<IconPlus size={14} /> Add task
							</button>
						</div>
					</div>

					<ToggleSwitch
						checked={override.nda}
						onChange={(v) => props.onOverrideChange({ nda: v })}
						label='NDA required for this stage'
						description='Overrides the blueprint default'
					/>

					<label class='tc-stage__flag'>
						<input
							type='checkbox'
							checked={override.filesRequired}
							onChange={(e) => props.onOverrideChange({ filesRequired: e.currentTarget.checked })}
						/>
						<span>Files required to clear this stage</span>
					</label>
				</div>
			)}
			{/* #endregion */}
		</div>
	);
}
