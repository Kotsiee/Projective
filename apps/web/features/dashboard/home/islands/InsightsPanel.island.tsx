/**
 * @file InsightsPanel.island.tsx
 * @description The personal-insights column (feed column 1): a profile-glance header, a radial
 * visibility dial, light micro-analytics with inline sparklines, and an earnings/spending micro-graph
 * rendered with the shared `@projective/charts` area chart. It is an island because the area chart
 * measures its container (DOM) and the sparklines paint after hydration; all data is seeded via props.
 */

import type { HomeInsightMetric, HomeInsights, Persona } from '@projective/types';
import { ProgressMeter } from '@projective/ui';
import { AreaLineChart } from '@projective/charts/finance';
import { IconChevronRight, IconTrendingDown, IconTrendingUp } from '@tabler/icons-preact';

interface InsightsPanelProps {
	insights: HomeInsights;
	displayName: string | null;
	avatarUrl: string | null;
	persona: Persona;
	profileHref: string;
}

/** A tiny inline sparkline (pure SVG). Normalises the series into a 0–1 band. */
function Sparkline({ points }: { points: number[] }) {
	if (points.length < 2) return null;
	const w = 72;
	const h = 22;
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
		<svg
			class='home-insights__spark'
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			aria-hidden='true'
		>
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

function MetricRow({ metric }: { metric: HomeInsightMetric }) {
	const delta = metric.delta ?? 0;
	const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
	return (
		<li class='home-insights__metric'>
			<div class='home-insights__metric-head'>
				<span class='home-insights__metric-label'>{metric.label}</span>
				<span class='home-insights__metric-value'>{metric.value}</span>
			</div>
			<div class='home-insights__metric-foot'>
				{metric.spark && metric.spark.length > 1 && <Sparkline points={metric.spark} />}
				{delta !== 0 && (
					<span class={`home-insights__delta home-insights__delta--${dir}`}>
						{dir === 'up'
							? <IconTrendingUp size={13} stroke={2} />
							: <IconTrendingDown size={13} stroke={2} />}
						{Math.abs(delta)}%
					</span>
				)}
			</div>
		</li>
	);
}

export default function InsightsPanel(
	{ insights, displayName, avatarUrl, persona, profileHref }: InsightsPanelProps,
) {
	const initial = (displayName?.trim()?.[0] ?? '?').toUpperCase();
	const personaLabel = persona === 'freelancer' ? 'Freelancer' : 'Client';

	return (
		<aside class='home-insights'>
			<a class='home-insights__glance' href={profileHref}>
				<span class='home-insights__avatar' aria-hidden='true'>
					{avatarUrl ? <img src={avatarUrl} alt='' /> : <span>{initial}</span>}
				</span>
				<span class='home-insights__glance-meta'>
					<span class='home-insights__name'>{displayName ?? 'Your profile'}</span>
					<span class='home-insights__persona'>{personaLabel}</span>
				</span>
				<IconChevronRight size={16} class='home-insights__glance-chev' />
			</a>

			<div class='home-insights__dial'>
				<ProgressMeter variant='radial' value={insights.visibilityPercent} size={104} tone='gold' />
				<div class='home-insights__dial-meta'>
					<span class='home-insights__dial-label'>{insights.visibilityLabel}</span>
					<span class='home-insights__dial-hint'>{insights.headline}</span>
				</div>
			</div>

			<ul class='home-insights__metrics'>
				{insights.metrics.map((m) => <MetricRow key={m.key} metric={m} />)}
			</ul>

			{insights.cashSeries && insights.cashSeries.length > 1 && (
				<div class='home-insights__cash'>
					<span class='home-insights__cash-label'>{insights.cashLabel}</span>
					<AreaLineChart
						height={140}
						currency={insights.cashCurrency ?? 'USD'}
						yTickCount={3}
						series={[
							{
								id: 'cash',
								label: insights.cashLabel ?? 'Cash',
								color: 'var(--gold)',
								points: insights.cashSeries,
							},
						]}
					/>
				</div>
			)}
		</aside>
	);
}
