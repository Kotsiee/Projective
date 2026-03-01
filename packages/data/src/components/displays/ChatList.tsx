import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { DataSource } from '../../core/datasource.ts';
import { useVirtual } from '../../hooks/useVirtual.ts';
import { useScrollAnchoring } from '../../hooks/useScrollAnchoring.ts';
import { ScrollPane } from '../ScrollPane.tsx';

interface RealtimeDataSource<T> extends DataSource<T> {
	getMeta(): Promise<{ totalCount: number }>;
	subscribe?: (cb: (event: any) => void) => () => void;
}

interface ChatListProps<T> {
	dataSource: RealtimeDataSource<T>;
	renderItem: (item: T) => preact.VNode;
	estimateHeight?: number;
	pageSize?: number;
	optimisticItems?: T[];
	scrollMode?: 'container' | 'window';
}

export function ChatList<T extends { id: string; tempId?: string }>({
	dataSource,
	renderItem,
	estimateHeight = 80,
	pageSize = 20,
	optimisticItems = [],
	scrollMode = 'container',
}: ChatListProps<T>) {
	const items = useSignal<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [cursor, setCursor] = useState(0);

	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		const init = async () => {
			setIsLoading(true);
			const meta = await dataSource.getMeta();
			const start = Math.max(0, meta.totalCount - pageSize);
			const result = await dataSource.fetch({ start, length: pageSize });

			items.value = result.items as T[];
			setCursor(start);
			setIsLoading(false);

			if (dataSource.subscribe) {
				console.log('[ChatList] Attaching to dataSource.subscribe()');
				unsubscribe = dataSource.subscribe((event: any) => {
					const { type, data } = event;
					const eventType = type || 'INSERT';
					const msgData = type ? data : event;

					console.log(`[ChatList] Processing ${eventType} event for ID: ${msgData.id}`);

					items.value = [...items.value];
					const currentItems = items.value;

					if (eventType === 'INSERT') {
						if (!currentItems.some((i: any) => i.id === msgData.id)) {
							console.log(`[ChatList] Injecting new message ${msgData.id} into list.`);
							items.value = [...currentItems, msgData];
							requestAnimationFrame(() => {
								if (parentRef.current) {
									parentRef.current.scrollTo({
										top: parentRef.current.scrollHeight,
										behavior: 'smooth',
									});
								}
							});
						} else {
							console.log(`[ChatList] Ignoring message ${msgData.id} (already exists).`);
						}
					} else if (eventType === 'UPDATE') {
						console.log(`[ChatList] Updating message ${msgData.id}.`);
						items.value = currentItems.map((i: any) =>
							i.id === msgData.id ? { ...i, ...msgData } : i
						);
					} else if (eventType === 'DELETE') {
						console.log(`[ChatList] Deleting message ${msgData.id}.`);
						items.value = currentItems.filter((i: any) => i.id !== msgData.id);
					}
				});
			}
		};

		init();
		return () => {
			if (unsubscribe) {
				console.log('[ChatList] Unmounting, cleaning up subscription.');
				unsubscribe();
			}
		};
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

	const combinedItems = useMemo(() => {
		if (!optimisticItems || optimisticItems.length === 0) return items.value;

		const realIds = new Set(items.value.map((i: any) => i.id));

		const filteredOpt = optimisticItems.filter((opt: any) =>
			!realIds.has(opt.id) && !realIds.has(opt.tempId)
		);

		if (filteredOpt.length > 0) {
			console.log('[ChatList] Appending Optimistic messages:', filteredOpt.length);
		}

		return [...items.value, ...filteredOpt];
	}, [items.value, optimisticItems]);

	const { parentRef, virtualizer: _, getItems, getTotalSize } = useVirtual({
		count: combinedItems.length,
		estimateSize: () => estimateHeight,
		overscan: 5,
		useWindowScroll: scrollMode === 'window',
		initialScrollToBottom: true,
		onChange: () => forceUpdate(0),
	});

	useScrollAnchoring(parentRef, true, [combinedItems, getTotalSize()]);

	const virtualItems = getItems();

	useEffect(() => {
		if (!isLoading && virtualItems.length > 0 && cursor > 0) {
			if (virtualItems[0].index < 5) loadMore();
		}
	}, [virtualItems, isLoading, cursor]);

	const hasJumped = useRef(false);
	useLayoutEffect(() => {
		if (!hasJumped.current && items.value.length > 0) {
			if (parentRef.current) {
				parentRef.current.scrollTo({ top: parentRef.current.scrollHeight, behavior: 'instant' });
			}
			hasJumped.current = true;
		}
	}, [items.value.length]);

	if (items.value.length === 0 && isLoading) {
		return <div class='p-4 text-center text-gray-400'>Loading chat...</div>;
	}

	return (
		<ScrollPane ref={parentRef} mode={scrollMode} style={{ height: '100%', overflowY: 'auto' }}>
			<div style={{ height: `${getTotalSize()}px`, width: '100%', position: 'relative' }}>
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
					const item = combinedItems[virtualRow.index];
					if (!item) {
						return null;
					}

					return (
						<div
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
