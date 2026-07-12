/**
 * @file ServiceAnalyticsPanel.tsx
 * @description The ultra-luxury analytics sub-section of the Services suite: a KPI rail (page views,
 * conversion, active pipeline value, engagement) with inline sparklines, a monetary pipeline-vs-won
 * trend (AreaLineChart), and a per-listing performance scatter (PipelineFlowChart). All refined
 * visualizations come from `@projective/charts`.
 */

import { useSignal } from '@preact/signals';
import { MetricCard } from '@projective/ui';
import { AreaLineChart, PipelineFlowChart } from '@projective/charts/finance';
import { IconChartHistogram, IconTrendingDown, IconTrendingUp } from '@tabler/icons-preact';
import type { ServiceAnalytics, ServiceKpi } from '../contracts/services.ts';

/** A tiny inline sparkline (pure SVG), normalised into a 0–1 band. Mirrors the home InsightsPanel. */
function Sparkline({ points }: { points: number[] }) {
	if (points.length < 2) return null;
	const w = 96;
	const h = 26;
	const min = Math.min(...points);
	const max = Math.max(...points);
	const span = max - min || 1;
	const step = w / (points.length - 1);
	const d = points
		.map((v, i) =>
			`${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`
		)
		.join(' ');
	return (
		<svg class='svc-spark' width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden='true'>
			<path
				d={d}
				fill='none'
				stroke='currentColor'
				stroke-width='1.5'
				stroke-linecap='round'
				stroke-linejoin='round'
			/>
		</svg>
	);
}

function KpiCard({ kpi }: { kpi: ServiceKpi }) {
	const dir = kpi.delta > 0 ? 'up' : kpi.delta < 0 ? 'down' : 'flat';
	return (
		<MetricCard
			label={kpi.label}
			value={kpi.value}
			sublabel={kpi.sublabel}
			accent={kpi.accent}
			delta={{
				label: `${kpi.delta > 0 ? '+' : ''}${kpi.delta}%`,
				direction: dir,
				tone: dir === 'up' ? 'success' : dir === 'down' ? 'danger' : 'neutral',
			}}
			icon={dir === 'down' ? <IconTrendingDown size={16} /> : <IconTrendingUp size={16} />}
			footer={<Sparkline points={kpi.spark} />}
		/>
	);
}

export default function ServiceAnalyticsPanel({ analytics }: { analytics: ServiceAnalytics }) {
	const focused = useSignal<string | null>(null);

	return (
		<section class='svc-analytics'>
			<header class='svc-section__head'>
				<div>
					<span class='svc-section__eyebrow'>Performance</span>
					<h2 class='svc-section__title'>Service analytics</h2>
				</div>
				<span class='svc-section__hint'>
					<IconChartHistogram size={15} /> Trailing 10 weeks
				</span>
			</header>

			<div class='svc-kpis'>
				{analytics.kpis.map((k) => <KpiCard key={k.key} kpi={k} />)}
			</div>

			<div class='svc-charts'>
				<article class='svc-chart-card'>
					<div class='svc-chart-card__head'>
						<h3 class='svc-chart-card__title'>Pipeline vs. won</h3>
						<div class='svc-chart-card__legend'>
							{analytics.pipelineSeries.map((s) => (
								<span key={s.id} class='svc-legend'>
									<i style={{ background: s.color }} /> {s.label}
								</span>
							))}
						</div>
					</div>
					<AreaLineChart
						series={analytics.pipelineSeries}
						currency={analytics.currency}
						height={240}
						idPrefix='svc-pipeline'
					/>
				</article>

				<article class='svc-chart-card'>
					<div class='svc-chart-card__head'>
						<h3 class='svc-chart-card__title'>Service performance</h3>
						<span class='svc-chart-card__sub'>Velocity × conversion, sized by pipeline</span>
					</div>
					<PipelineFlowChart
						points={analytics.performance}
						categories={analytics.categories}
						currency={analytics.currency}
						height={260}
						showTrendLine
						onPointSelect={(p) => (focused.value = p?.label ?? null)}
					/>
					{focused.value && <p class='svc-chart-card__focus'>Focused: {focused.value}</p>}
				</article>
			</div>
		</section>
	);
}
