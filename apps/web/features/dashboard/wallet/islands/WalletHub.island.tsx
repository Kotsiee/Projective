/**
 * @file WalletHub.island.tsx
 * @description The primary Financial Overview dashboard (`/wallet`). Composes the balance hero,
 * the two D3 visualization engines (Pipeline Flow — Canvas; Predictive Runway — SVG) each in an
 * expandable `WalletChartCard` with a live config panel, the escrow allocation panel, and a recent
 * activity ledger preview. All figures track the active persona + display currency via context.
 */

import '../styles/wallet-hub.css';
import { useSignal } from '@preact/signals';
import {
	ForecastRunwayChart,
	type PipelineCategoryStyle,
	PipelineFlowChart,
	type RunwayTimeframe,
} from '@projective/charts/finance';
import { useWalletContext } from '../contexts/WalletContext.tsx';
import { BalanceSummary } from '../components/BalanceSummary.tsx';
import { WalletChartCard } from '../components/WalletChartCard.tsx';
import { EscrowAllocationList } from '../components/EscrowAllocationList.tsx';
import { LedgerView } from '../components/LedgerView.tsx';

const CATS: PipelineCategoryStyle[] = [
	{ category: 'Design', label: 'Design', color: 'var(--mint)' },
	{ category: 'Development', label: 'Development', color: 'var(--violet)' },
	{ category: 'Marketing', label: 'Marketing', color: 'var(--amber)' },
	{ category: 'Consulting', label: 'Consulting', color: 'var(--primary)' },
	{ category: 'Content', label: 'Content', color: 'var(--success)' },
];

const TIMEFRAMES: { key: RunwayTimeframe; label: string; points: number }[] = [
	{ key: '1d', label: '1D', points: 2 },
	{ key: '1w', label: '1W', points: 3 },
	{ key: '1m', label: '1M', points: 5 },
	{ key: '3m', label: '3M', points: 8 },
	{ key: '6m', label: '6M', points: 14 },
	{ key: '1y', label: '1Y', points: 26 },
];

export default function WalletHubIsland() {
	const { wallet, pipeline, forecast, ledger, currency } = useWalletContext();

	// Pipeline config
	const activeCats = useSignal<string[]>(CATS.map((c) => c.category));
	const showTrend = useSignal(true);
	// Forecast config
	const timeframe = useSignal<RunwayTimeframe>('1y');
	const showBand = useSignal(true);

	const toggleCat = (cat: string) => {
		const set = new Set(activeCats.value);
		set.has(cat) ? set.delete(cat) : set.add(cat);
		activeCats.value = [...set];
	};

	const tfPoints = TIMEFRAMES.find((t) => t.key === timeframe.value)?.points ?? 26;
	const forecastSlice = forecast.value.slice(0, tfPoints);
	const recent = ledger.value.slice(0, 8);

	// #region Config panels (rendered inside the focus modals)
	const pipelineControls = (
		<div class='wallet-config'>
			<h4 class='wallet-config__title'>Categories</h4>
			<div class='wallet-config__chips'>
				{CATS.map((c) => (
					<button
						type='button'
						key={c.category}
						class={`wallet-config__chip${
							activeCats.value.includes(c.category) ? ' wallet-config__chip--on' : ''
						}`}
						onClick={() => toggleCat(c.category)}
					>
						<span class='wallet-config__dot' style={{ background: c.color }} />
						{c.label}
					</button>
				))}
			</div>
			<label class='wallet-config__switch'>
				<input
					type='checkbox'
					checked={showTrend.value}
					onChange={(e) => (showTrend.value = (e.currentTarget as HTMLInputElement).checked)}
				/>
				<span>Trend line</span>
			</label>
		</div>
	);

	const forecastControls = (
		<div class='wallet-config'>
			<h4 class='wallet-config__title'>Projection horizon</h4>
			<div class='wallet-config__segment'>
				{TIMEFRAMES.map((t) => (
					<button
						type='button'
						key={t.key}
						class={`wallet-config__seg${
							timeframe.value === t.key ? ' wallet-config__seg--on' : ''
						}`}
						onClick={() => (timeframe.value = t.key)}
					>
						{t.label}
					</button>
				))}
			</div>
			<label class='wallet-config__switch'>
				<input
					type='checkbox'
					checked={showBand.value}
					onChange={(e) => (showBand.value = (e.currentTarget as HTMLInputElement).checked)}
				/>
				<span>Confidence band</span>
			</label>
		</div>
	);
	// #endregion

	const legend = (
		<div class='wallet-hub__legend'>
			{CATS.map((c) => (
				<span key={c.category} class='wallet-hub__legend-item'>
					<span class='wallet-hub__legend-dot' style={{ background: c.color }} />
					{c.label}
				</span>
			))}
		</div>
	);

	return (
		<div class='wallet-hub'>
			<header class='wallet-hub__header'>
				<div>
					<h1 class='wallet-hub__title'>Financial Overview</h1>
					<p class='wallet-hub__subtitle'>
						{wallet.value.persona.displayName} · settled in {currency.value}
					</p>
				</div>
			</header>

			<BalanceSummary />

			<div class='wallet-hub__charts'>
				<WalletChartCard
					title='Pipeline Flow'
					subtitle='Velocity vs. ROI — node area ∝ deal value'
					headerExtra={legend}
					controls={pipelineControls}
					expanded={
						<PipelineFlowChart
							points={pipeline.value}
							categories={CATS}
							activeCategories={activeCats.value}
							showTrendLine={showTrend.value}
							currency={currency.value}
							height={440}
						/>
					}
				>
					<PipelineFlowChart
						points={pipeline.value}
						categories={CATS}
						activeCategories={activeCats.value}
						showTrendLine={showTrend.value}
						currency={currency.value}
						height={300}
					/>
				</WalletChartCard>

				<WalletChartCard
					title='Predictive Runway'
					subtitle='Projected potential revenue with confidence band'
					controls={forecastControls}
					expanded={
						<ForecastRunwayChart
							series={forecastSlice}
							showBand={showBand.value}
							currency={currency.value}
							height={420}
						/>
					}
				>
					<ForecastRunwayChart
						series={forecastSlice}
						showBand={showBand.value}
						currency={currency.value}
						height={300}
					/>
				</WalletChartCard>
			</div>

			<div class='wallet-hub__lower'>
				<EscrowAllocationList />

				<section class='wallet-hub__recent'>
					<header class='wallet-hub__recent-header'>
						<h3 class='wallet-hub__recent-title'>Recent activity</h3>
						<a class='wallet-hub__recent-link' href='/wallet/ledger'>View full ledger →</a>
					</header>
					<LedgerView rows={recent} dense showBalance={false} />
				</section>
			</div>
		</div>
	);
}
