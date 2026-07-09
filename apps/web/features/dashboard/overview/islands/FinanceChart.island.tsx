/**
 * @file FinanceChart.island.tsx
 * @description Atomic island (US-008 AC3). The only client-hydrated piece of the finance hub: the
 * Area/Line volume chart, whose canvas/DOM measurement (`useElementSize`) and hover-scrub state
 * can't render on the server. The series is computed server-side (`buildFinanceSeries`) and passed
 * in as a serialisable prop — the island never fetches. Everything around it (headers, ledger,
 * KPIs) stays server-rendered.
 */

import { AreaLineChart, type AreaLineSeries } from '@projective/charts';

export interface FinanceChartProps {
	series: AreaLineSeries[];
	currency: string;
}

export default function FinanceChart({ series, currency }: FinanceChartProps) {
	return (
		<AreaLineChart
			series={series}
			currency={currency}
			height={260}
			idPrefix='overview-vol'
		/>
	);
}
