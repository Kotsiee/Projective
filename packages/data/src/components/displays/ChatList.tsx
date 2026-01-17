import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { DataSource } from '../../core/datasource.ts';
import { useVirtual } from '../../hooks/useVirtual.ts';
import { useScrollAnchoring } from '../../hooks/useScrollAnchoring.ts';
import { ScrollPane } from '../ScrollPane.tsx';

interface ChatListProps<T> {
	dataSource: DataSource<T>;
	renderItem: (item: T) => preact.VNode;
	estimateHeight?: number;
	pageSize?: number;
}

export function ChatList<T>({
	dataSource,
	renderItem,
	estimateHeight = 80,
	pageSize = 20,
}: ChatListProps<T>) {
	const items = useSignal<T[]>([]);
	const [totalAvailable, setTotalAvailable] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [cursor, setCursor] = useState(0);

	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		const init = async () => {
			setIsLoading(true);

			// @ts-ignore
			const meta = await dataSource.getMeta();
			setTotalAvailable(meta.totalCount);

			const start = Math.max(0, meta.totalCount - pageSize);
			const result = await dataSource.fetch({ start, length: pageSize });

			items.value = result.items as T[];
			setCursor(start);
			setIsLoading(false);
		};
		init();
	}, [dataSource]);

	const loadMore = async () => {
		if (isLoading || cursor === 0) return;

		setIsLoading(true);

		const amountToFetch = Math.min(pageSize, cursor);
		const start = cursor - amountToFetch;

		const result = await dataSource.fetch({ start, length: amountToFetch });

		items.value = [...result.items, ...items.value] as T[];
		setCursor(start);
		setIsLoading(false);
	};

	const { parentRef, virtualizer, getItems, getTotalSize } = useVirtual({
		count: items.value.length,
		estimateSize: () => estimateHeight,
		overscan: 5,
		useWindowScroll: true,
		initialScrollToBottom: false,
		onChange: () => forceUpdate(0),
	});

	useScrollAnchoring(parentRef, true, [items.value, getTotalSize()]);

	const virtualItems = getItems();

	useEffect(() => {
		if (!isLoading && virtualItems.length > 0 && cursor > 0) {
			const firstVisibleIndex = virtualItems[0].index;

			if (firstVisibleIndex < 5) {
				loadMore();
			}
		}
	}, [virtualItems, isLoading, cursor]);

	const hasJumped = useRef(false);
	useLayoutEffect(() => {
		if (!hasJumped.current && items.value.length > 0) {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
			hasJumped.current = true;
		}
	}, [items.value.length]);

	if (items.value.length === 0 && isLoading) {
		return <div class='p-4 text-center text-gray-400'>Loading chat...</div>;
	}

	return (
		<ScrollPane ref={parentRef} mode='window'>
			<div
				style={{
					height: `${getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{/* Since we load early, we might not need this spinner often, but keep it for slow networks */}
				{cursor > 0 && isLoading && (
					<div
						style={{
							position: 'absolute',
							top: '-40px',
							width: '100%',
							textAlign: 'center',
							padding: '10px',
							color: '#888',
						}}
					>
						Loading history...
					</div>
				)}

				{virtualItems.map((virtualRow) => {
					const item = items.value[virtualRow.index];
					if (!item) return null;

					return (
						<div
							// @ts-ignore
							key={item.id || virtualRow.index}
							ref={virtualRow.measureElement}
							data-index={virtualRow.index}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							{renderItem(item)}
						</div>
					);
				})}
			</div>
		</ScrollPane>
	);
}
