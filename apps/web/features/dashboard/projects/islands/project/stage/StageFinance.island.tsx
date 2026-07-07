/**
 * @file StageFinance.island.tsx
 * @description The stage Finance tab (US-005 Stage Escrow Funding + US-007 Approval & Smart Payouts).
 * Reads the stage escrow/settlement summary from `projects.get_stage_finance` and lets the client
 * fund the stage, give final approval (release payout), or trigger a fair-exit cancellation. All
 * transactions run against pre-loaded wallet balances — no Stripe.
 *
 * Boundary (apps/web/CLAUDE.md): the island talks only to internal API routes via StagesService;
 * primary actions are dispatched to the stage nav footer via setMiddleNav (the StageSubmissions
 * pattern), never a local footer.
 */

// deno-lint-ignore-file no-explicit-any
import '../../../styles/components/project/stage/finance/finance.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, toast } from '@projective/ui';
import { IconArrowBackUp, IconCheck, IconCoin } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { StagesService } from '../../../services/StagesService.ts';

// #region Types & helpers
interface StageFinanceTicket {
	ticket_id: string;
	title: string;
	amount_cents: number | null;
	payment_status: string;
	assignee_id: string | null;
}

interface StageFinanceSplit {
	member_user_id: string;
	amount_cents: number;
	name: string | null;
}

interface StageFinanceData {
	stage_id: string;
	stage_status: string;
	currency: string;
	assignment: { type: string; name: string | null } | null;
	total_escrowed_cents: number;
	total_released_cents: number;
	platform_fee_cents: number;
	tickets: StageFinanceTicket[];
	splits: StageFinanceSplit[];
	fundable: boolean;
}

function fmt(cents: number | null | undefined, currency: string): string {
	const value = (cents ?? 0) / 100;
	try {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' })
			.format(value);
	} catch {
		return `${currency || 'USD'} ${value.toFixed(2)}`;
	}
}

const label = (s: string) => s.replaceAll('_', ' ');
// #endregion

export default function StageFinanceIsland() {
	const { stage_id, stage, refresh: refreshStage } = useStageContext();
	const { setMiddleNav } = useNavigationContext();

	const finance = useSignal<StageFinanceData | null>(null);
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);
	const busy = useSignal(false);
	const tier = useSignal<number>(50);

	const projectId = stage.value?.project_id;
	const stageId = stage_id.value;
	const isClient = useComputed(() => stage.value?.viewer_context?.role !== 'assignee');

	// #region Load
	const load = async () => {
		if (!projectId || !stageId) return;
		isLoading.value = true;
		error.value = null;
		try {
			finance.value = await StagesService.getStageFinance(projectId, stageId);
		} catch (err: any) {
			error.value = err?.message || 'Failed to load stage finance';
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		load();
	}, [projectId, stageId]);
	// #endregion

	// #region Actions
	const runAction = async (fn: () => Promise<any>, okMsg: string) => {
		if (busy.value || !projectId || !stageId) return;
		busy.value = true;
		try {
			await fn();
			toast.success(okMsg);
			await load();
			refreshStage();
		} catch (err: any) {
			toast.error(err?.message || 'Action failed');
		} finally {
			busy.value = false;
		}
	};

	const onFund = () =>
		runAction(
			() => StagesService.fundStage(projectId!, stageId!),
			'Stage funded — escrow secured.',
		);
	const onApprove = () =>
		runAction(
			() => StagesService.approveStage(projectId!, stageId!),
			'Stage approved — payout released.',
		);
	const onCancel = () =>
		runAction(
			() => StagesService.cancelStageFairExit(projectId!, stageId!, tier.value),
			`Stage cancelled — ${tier.value}% released to the freelancer.`,
		);
	// #endregion

	// #region Footer action bar (client only)
	useEffect(() => {
		const f = finance.value;
		if (!isClient.value || !f) {
			setMiddleNav({ footerHeight: '0px', footerContent: null });
			return;
		}
		const hasHeld = f.total_escrowed_cents > 0;
		setMiddleNav({
			footerHeight: '72px',
			footerContent: (
				<div class='stage-finance-bar'>
					<div class='stage-finance-bar__exit'>
						<select
							class='stage-finance-bar__tier'
							value={String(tier.value)}
							onChange={(e) => (tier.value = Number((e.target as HTMLSelectElement).value))}
							disabled={!hasHeld || busy.value}
							aria-label='Fair-exit payout tier'
						>
							<option value='25'>25%</option>
							<option value='50'>50%</option>
							<option value='75'>75%</option>
						</select>
						<Button
							variant='secondary'
							startIcon={<IconArrowBackUp size={18} />}
							onClick={onCancel}
							disabled={!hasHeld || busy.value}
						>
							Fair-exit cancel
						</Button>
					</div>
					<div class='stage-finance-bar__primary'>
						<Button
							variant='secondary'
							startIcon={<IconCoin size={18} />}
							onClick={onFund}
							disabled={!f.fundable || busy.value}
						>
							Fund Stage
						</Button>
						<Button
							variant='primary'
							startIcon={<IconCheck size={18} />}
							onClick={onApprove}
							disabled={!hasHeld || busy.value}
						>
							Final Approval
						</Button>
					</div>
				</div>
			),
		});
		return () => setMiddleNav({ footerHeight: '0px', footerContent: null });
	}, [finance.value, isClient.value, tier.value, busy.value]);
	// #endregion

	// #region Render
	if (isLoading.value && !finance.value) {
		return (
			<div class='stage-finance stage-finance--loading'>
				<p>Loading finance…</p>
			</div>
		);
	}
	if (error.value) {
		return (
			<div class='stage-finance stage-finance--error'>
				<p>{error.value}</p>
			</div>
		);
	}
	const f = finance.value;
	if (!f) return <div class='stage-finance' />;

	return (
		<div class='stage-finance'>
			<header class='stage-finance__header'>
				<div>
					<h2 class='stage-finance__title'>Stage escrow</h2>
					<p class='stage-finance__sub'>
						{f.assignment
							? `${f.assignment.type === 'team' ? 'Team' : 'Freelancer'} · ${
								f.assignment.name ?? 'Unnamed'
							}`
							: 'No accepted assignment yet'}
					</p>
				</div>
				<span class={`stage-finance__status stage-finance__status--${f.stage_status}`}>
					{label(f.stage_status)}
				</span>
			</header>

			<div class='stage-finance__stats'>
				<div class='stage-finance__stat'>
					<span class='stage-finance__stat-label'>In escrow</span>
					<span class='stage-finance__stat-value'>{fmt(f.total_escrowed_cents, f.currency)}</span>
				</div>
				<div class='stage-finance__stat'>
					<span class='stage-finance__stat-label'>Released</span>
					<span class='stage-finance__stat-value'>{fmt(f.total_released_cents, f.currency)}</span>
				</div>
				<div class='stage-finance__stat'>
					<span class='stage-finance__stat-label'>Platform fee (5%)</span>
					<span class='stage-finance__stat-value'>{fmt(f.platform_fee_cents, f.currency)}</span>
				</div>
			</div>

			<section class='stage-finance__section'>
				<h3 class='stage-finance__section-title'>Tickets</h3>
				{f.tickets.length === 0
					? <p class='stage-finance__empty'>No tickets in this stage yet.</p>
					: (
						<ul class='stage-finance__list'>
							{f.tickets.map((t) => (
								<li key={t.ticket_id} class='stage-finance__row'>
									<span class='stage-finance__row-title'>{t.title}</span>
									<span class={`stage-finance__badge stage-finance__badge--${t.payment_status}`}>
										{label(t.payment_status)}
									</span>
									<span class='stage-finance__row-amount'>{fmt(t.amount_cents, f.currency)}</span>
								</li>
							))}
						</ul>
					)}
			</section>

			{f.splits.length > 0 && (
				<section class='stage-finance__section'>
					<h3 class='stage-finance__section-title'>Team payout splits</h3>
					<ul class='stage-finance__list'>
						{f.splits.map((s, i) => (
							<li key={`${s.member_user_id}-${i}`} class='stage-finance__row'>
								<span class='stage-finance__row-title'>{s.name ?? s.member_user_id}</span>
								<span class='stage-finance__row-amount'>{fmt(s.amount_cents, f.currency)}</span>
							</li>
						))}
					</ul>
				</section>
			)}

			{!isClient.value && (
				<p class='stage-finance__note'>Funding and approval are managed by the client.</p>
			)}
		</div>
	);
	// #endregion
}
