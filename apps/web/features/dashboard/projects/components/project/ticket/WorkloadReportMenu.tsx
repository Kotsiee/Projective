/**
 * @file WorkloadReportMenu.tsx
 * @description The freelancer-facing "Flag workload mismatch" micro-interaction (spec §"Workload
 * Intensity Reporting"). A premium Popover the ticket's *assignee* uses to dispute an unfair
 * Workload Intensity (W_i). Filing routes through {@link TicketsService.reportTicketWorkload} →
 * `projects.file_workload_report` (mig 0310), whose AFTER-INSERT trigger hides the ticket and opens
 * the 48-hour resolution window. The client either raises W_i (work resumes) or is penalized on expiry.
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { Popover, toast } from '@projective/ui';
import { IconAlertTriangle, IconFlag } from '@tabler/icons-preact';
import { TicketsService } from '@features/dashboard/projects/services/TicketsService.ts';
// #endregion

interface WorkloadReportMenuProps {
	projectId: string;
	ticketId: string;
	/** The ticket's current W_i, shown as the "claimed" baseline the freelancer disputes against. */
	currentIntensity?: number;
	/** Called after a report is filed so the board can refresh (the ticket becomes hidden/evicted). */
	onReported?: () => void | Promise<void>;
}

/** Proposed-intensity presets (spec §2 difficulty multipliers), offered as an optional refinement. */
const INTENSITY_PRESETS: { label: string; value: number }[] = [
	{ label: 'Low', value: 0.5 },
	{ label: 'Standard', value: 1.0 },
	{ label: 'High', value: 2.0 },
	{ label: 'Very High', value: 3.0 },
];

export function WorkloadReportMenu({
	projectId,
	ticketId,
	currentIntensity,
	onReported,
}: WorkloadReportMenuProps) {
	const isOpen = useSignal(false);
	const reason = useSignal('');
	const suggested = useSignal<number | null>(null);
	const busy = useSignal(false);

	const close = () => {
		isOpen.value = false;
		reason.value = '';
		suggested.value = null;
	};

	const submit = async () => {
		if (busy.value || reason.value.trim().length === 0) return;
		busy.value = true;
		try {
			await TicketsService.reportTicketWorkload(
				projectId,
				ticketId,
				reason.value.trim(),
				suggested.value ?? undefined,
			);
			toast.success('Workload report filed. The client has 48 hours to respond.');
			await onReported?.();
			close();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err?.message || 'Could not file the report.');
		} finally {
			busy.value = false;
		}
	};

	const panel = (
		<div class='wl-report'>
			<div class='wl-report__head'>
				<span class='wl-report__icon'>
					<IconAlertTriangle size={16} />
				</span>
				<div>
					<p class='wl-report__title'>Report workload mismatch</p>
					<p class='wl-report__sub'>
						{currentIntensity != null
							? `Assigned intensity is ${currentIntensity}× — flag it if the real effort differs.`
							: 'Flag this ticket if its intensity does not match the real effort.'}
					</p>
				</div>
			</div>

			<label class='wl-report__label' for='wl-report-reason'>Why is the intensity wrong?</label>
			<textarea
				id='wl-report-reason'
				class='wl-report__textarea'
				rows={3}
				placeholder='e.g. This is a full rebuild, not a tweak — the scope is far above a standard task.'
				value={reason.value}
				onInput={(e) => (reason.value = (e.target as HTMLTextAreaElement).value)}
			/>

			<span class='wl-report__label'>Suggested intensity (optional)</span>
			<div class='wl-report__presets' role='group' aria-label='Suggested intensity'>
				{INTENSITY_PRESETS.map((p) => (
					<button
						key={p.value}
						type='button'
						class={`wl-report__preset${
							suggested.value === p.value ? ' wl-report__preset--active' : ''
						}`}
						aria-pressed={suggested.value === p.value}
						onClick={() => (suggested.value = suggested.value === p.value ? null : p.value)}
					>
						{p.label}
						<span class='wl-report__preset-x'>{p.value}×</span>
					</button>
				))}
			</div>

			<div class='wl-report__actions'>
				<button type='button' class='wl-report__btn' onClick={close} disabled={busy.value}>
					Cancel
				</button>
				<button
					type='button'
					class='wl-report__btn wl-report__btn--danger'
					onClick={submit}
					disabled={busy.value || reason.value.trim().length === 0}
				>
					{busy.value ? 'Filing…' : 'File report'}
				</button>
			</div>
		</div>
	);

	return (
		<Popover
			isOpen={isOpen.value}
			onClose={close}
			position='bottom-right'
			trigger={
				<button
					type='button'
					class='tkt__icon-btn tkt__icon-btn--flag'
					aria-label='Flag workload mismatch'
					aria-haspopup='dialog'
					onClick={() => (isOpen.value = !isOpen.value)}
				>
					<IconFlag size={18} />
				</button>
			}
			content={panel}
		/>
	);
}
