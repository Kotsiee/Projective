# Data Hook: useVirtual

The `useVirtual` hook is the low-level engine that powers high-performance rendering for large
datasets in the Projective platform. It calculates which items should be visible based on the
current scroll position and manages the lifecycle of the `Virtualizer` instance, supporting both
fixed and variable-height rows.

## 📂 Project Structure

```text
packages/data/
├── src/
│   ├── hooks/
│   │   └── useVirtual.ts         # Hook interface and scroll listeners
│   └── core/
│       └── virtualizer.ts        # Core math, measurements, and ResizeObserver logic
```

## 🚀 Usage

### Manual Virtualization

While `DataDisplay` handles this automatically, you can use `useVirtual` to build custom
high-performance components.

```tsx
import { useVirtual } from '@projective/data';

export function CustomVirtualList({ items }) {
	const { parentRef, getItems, getTotalSize } = useVirtual({
		count: items.length,
		estimateSize: () => 60, // Estimated px height
		overscan: 5, // Buffer items to render outside viewport
	});

	const virtualItems = getItems();

	return (
		<div
			ref={parentRef}
			style={{ height: '500px', overflow: 'auto', position: 'relative' }}
		>
			<div style={{ height: `${getTotalSize()}px`, width: '100%' }}>
				{virtualItems.map((virtualRow) => (
					<div
						key={virtualRow.index}
						ref={virtualRow.measureElement} // Dynamic height tracking
						style={{
							position: 'absolute',
							top: 0,
							transform: `translateY(${virtualRow.start}px)`,
							width: '100%',
						}}
					>
						{items[virtualRow.index].content}
					</div>
				))}
			</div>
		</div>
	);
}
```

## ⚙️ API Reference

### useVirtual Options

Extends the core `VirtualizerOptions`.

| Option                  | Type              | Default | Description                                         |
| :---------------------- | :---------------- | :------ | :-------------------------------------------------- |
| `count`                 | `number`          | -       | Total number of items in the dataset.               |
| `estimateSize`          | `(idx) => number` | -       | Returns the estimated height of an item.            |
| `overscan`              | `number`          | `1`     | Number of items to render above/below the viewport. |
| `useWindowScroll`       | `boolean`         | `false` | Attach listeners to window instead of `parentRef`.  |
| `initialScrollToBottom` | `boolean`         | `false` | Auto-scroll to end on mount (for chat).             |
| `fixedItemHeight`       | `number`          | -       | Optimization if all rows are identical height.      |

### Hook Return Values

| Value            | Type                  | Description                                      |
| :--------------- | :-------------------- | :----------------------------------------------- |
| `parentRef`      | `RefObject`           | Attach to the scrollable container element.      |
| `getItems()`     | `() => VirtualItem[]` | Returns the subset of items currently in view.   |
| `getTotalSize()` | `() => number`        | Returns the total calculated height of the list. |
| `virtualizer`    | `Virtualizer`         | Direct access to the underlying class instance.  |

## 🕹️ Logic & Performance

- **Dynamic Measurement**: Every `VirtualItem` provides a `measureElement` ref. When attached to a
  DOM node, it uses a `ResizeObserver` to report the exact `borderBoxSize` back to the engine,
  updating the layout without manual intervention.
- **Window Scroll Mapping**: When `useWindowScroll` is enabled, the hook calculates the relative
  offset of the `parentRef` to ensure the virtualizer understands where the list starts on the page.
- **Scroll Debouncing**: Scroll updates trigger a lightweight re-render via a signal-like
  force-update mechanism, ensuring minimal latency during rapid scrolling.
- **Size Caching**: The `Virtualizer` caches measured heights and total size calculations to prevent
  expensive O(n) loops on every frame.

## 🎨 Styling Requirements

- **Relative Container**: The inner shim (the element with `getTotalSize()`) must have
  `position: relative` or `absolute` to allow the items to be positioned correctly via `translateY`.
- **Absolute Items**: Virtualized rows must be `position: absolute` with `top: 0` and `left: 0` for
  the math to remain consistent across different viewports.
