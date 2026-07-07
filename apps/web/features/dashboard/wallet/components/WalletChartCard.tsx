/**
 * @file WalletChartCard.tsx
 * @description A framed chart panel with a header and an "expand" affordance that lifts the chart
 * into the shared `ChartFocusModal` (maximized focus frame + optional config panel). The inline
 * chart and the maximized chart can differ (the modal usually renders a taller variant), so both
 * are passed explicitly. Owns its own open-state signal — island-friendly.
 */

import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { IconArrowsMaximize } from '@tabler/icons-preact';
import { ChartFocusModal } from '@projective/charts/finance';

export interface WalletChartCardProps {
	title: string;
	subtitle?: string;
	/** Inline (in-card) chart. */
	children: ComponentChildren;
	/** Maximized chart for the focus modal. Defaults to the inline chart. */
	expanded?: ComponentChildren;
	/** Config panel rendered alongside the maximized chart. */
	controls?: ComponentChildren;
	/** Extra header content (legend, toggles) shown inline. */
	headerExtra?: ComponentChildren;
}

export function WalletChartCard(props: WalletChartCardProps) {
	const { title, subtitle, children, expanded, controls, headerExtra } = props;
	const open = useSignal(false);

	return (
		<section class='wallet-chart-card'>
			<header class='wallet-chart-card__header'>
				<div class='wallet-chart-card__heading'>
					<h3 class='wallet-chart-card__title'>{title}</h3>
					{subtitle && <p class='wallet-chart-card__subtitle'>{subtitle}</p>}
				</div>
				<div class='wallet-chart-card__actions'>
					{headerExtra}
					<button
						type='button'
						class='wallet-chart-card__expand'
						onClick={() => (open.value = true)}
						aria-label={`Expand ${title}`}
					>
						<IconArrowsMaximize size={16} stroke={2} />
					</button>
				</div>
			</header>

			<div class='wallet-chart-card__body'>{children}</div>

			<ChartFocusModal
				open={open}
				title={title}
				subtitle={subtitle}
				onClose={() => (open.value = false)}
				controls={controls}
			>
				{expanded ?? children}
			</ChartFocusModal>
		</section>
	);
}
