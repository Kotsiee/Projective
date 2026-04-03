import { useEffect, useRef } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttManager } from '../../core/gantt/gantt-manager.ts';
import { generateHeaderBlocks, getHeaderTier } from '../../core/gantt/header-utils.ts';
import { DateTime } from '@projective/types';
import { GanttTooltip } from './GanttTooltip.tsx';
import '../../styles/gantt/gantt-timeline.css';

interface GanttTimelineProps {
	store: GanttStore;
}

export function GanttTimeline({ store }: GanttTimelineProps) {
	const canvasRootRef = useRef<HTMLDivElement>(null);
	const ganttManager = useRef<GanttManager | null>(null);

	useEffect(() => {
		if (canvasRootRef.current && !ganttManager.current) {
			ganttManager.current = new GanttManager(canvasRootRef.current, store);
		}

		return () => {
			ganttManager.current?.destroy();
			ganttManager.current = null;
		};
	}, []);

	const dynamicHeaders = useComputed(() => {
		const currentX = store.scrollX.value;
		const width = store.containerWidth.value;
		const days = store.visibleDays.value;

		const buffer = 2000;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days, width);
		const dateToX = (t: number) => store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(
			startDate,
			endDate,
			tier.bottom,
			tier.bottomStep,
			dateToX,
		);

		return {
			topRows,
			bottomRows,
			tier,
		};
	});

	// deno-lint-ignore no-explicit-any
	const renderBlock = (block: any, content: string, isTop: boolean) => {
		// Hardware-accelerated GPU translation instead of expanding the DOM width
		const screenX = block.x + store.scrollX.value;

		return (
			<div
				key={block.key}
				class='gantt-time-block'
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					height: '100%',
					width: `${block.width}px`,
					transform: `translateX(${screenX}px)`,
					willChange: 'transform',
				}}
			>
				<span class={isTop ? 'gantt-sticky-label' : 'gantt-centered-label'}>
					{content}
				</span>
			</div>
		);
	};

	const header = dynamicHeaders.value;

	return (
		<section
			class='gantt-timeline'
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				minWidth: 0,
				width: '100%',
				overflow: 'hidden',
			}}
		>
			<div
				class='gantt-timeline__header'
				style={{ overflow: 'hidden', width: '100%', position: 'relative' }}
			>
				<div
					class='gantt-header-content'
					style={{ width: '100%', position: 'relative', height: '100%' }}
				>
					{/* CRITICAL FIX: Removed conflicting inline relative positioning */}
					<div class='gantt-header-row top'>
						{header.topRows.map((block) =>
							renderBlock(
								block,
								header.tier.formatTop(block.date),
								true,
							)
						)}
					</div>

					<div class='gantt-header-row bottom'>
						{header.bottomRows.map((block) =>
							renderBlock(
								block,
								header.tier.formatBottom(block.date),
								false,
							)
						)}
					</div>
				</div>
			</div>

			<div
				class='gantt-timeline__viewport'
				style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%' }}
			>
				<div
					class='gantt-timeline__canvas'
					ref={canvasRootRef}
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
				/>
				<GanttTooltip store={store} />
			</div>
		</section>
	);
}
