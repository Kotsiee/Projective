import { useEffect, useRef } from 'preact/hooks';
import { effect, useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttManager } from '../../core/gantt/gantt-manager.ts';
import { generateHeaderBlocks, getHeaderTier } from '../../core/gantt/header-utils.ts';
import { DateTime } from '@projective/types';
import '../../styles/gantt/gantt-timeline.css';

interface GanttTimelineProps {
	store: GanttStore;
}

const VIRTUAL_OFFSET = 5000000;

export function GanttTimeline({ store }: GanttTimelineProps) {
	const canvasRootRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);
	const ganttManager = useRef<GanttManager | null>(null);

	useEffect(() => {
		if (canvasRootRef.current && !ganttManager.current) {
			ganttManager.current = new GanttManager(canvasRootRef.current, store);
		}

		const dispose = effect(() => {
			const x = store.scrollX.value;

			const targetLeft = VIRTUAL_OFFSET - x;

			if (headerScrollRef.current) {
				if (Math.abs(headerScrollRef.current.scrollLeft - targetLeft) > 1) {
					headerScrollRef.current.scrollLeft = targetLeft;
				}
			}
		});

		return () => {
			dispose();
			ganttManager.current?.destroy();
			ganttManager.current = null;
		};
	}, []);

	const onScroll = (e: Event) => {
		const target = e.target as HTMLDivElement;

		const newX = VIRTUAL_OFFSET - target.scrollLeft;

		if (Math.abs(store.scrollX.value - newX) > 1) {
			store.scrollX.value = newX;
		}
	};

	const dynamicHeaders = useComputed(() => {
		const currentX = store.scrollX.value;
		const width = store.containerWidth.value;
		const days = store.visibleDays.value;

		const buffer = 2000;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days);
		const dateToX = (t: number) => store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, dateToX);
		const bottomRows = generateHeaderBlocks(startDate, endDate, tier.bottom, dateToX);

		return {
			topRows,
			bottomRows,
			tier,

			totalWidth: VIRTUAL_OFFSET * 2,
		};
	});

	const renderBlock = (block: any, content: string, isTop: boolean) => {
		const domLeft = VIRTUAL_OFFSET + block.x;

		return (
			<div
				key={block.key}
				class='gantt-time-block'
				style={{
					left: `${domLeft}px`,
					width: `${block.width}px`,
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
		<section class='gantt-timeline'>
			<div
				class='gantt-timeline__header'
				ref={headerScrollRef}
				onScroll={onScroll}
			>
				<div
					class='gantt-header-content'
					style={{ width: `${header.totalWidth}px` }}
				>
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

			<div class='gantt-timeline__viewport'>
				<div
					class='gantt-timeline__canvas'
					ref={canvasRootRef}
				/>
			</div>
		</section>
	);
}
