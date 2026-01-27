# Data Component: DataDisplay

The `DataDisplay` component is the primary interface for rendering large datasets in the Projective
platform. It acts as a high-level orchestrator that connects a data source to a virtualization
engine, allowing the user to switch between List, Grid, and Table layouts seamlessly while
maintaining state and performance.

## 📂 Project Structure

```text
packages/data/
├── src/
│   ├── components/
│   │   ├── DataDisplay.tsx       # Main orchestrator component
│   │   ├── ScrollPane.tsx        # Scroll container abstraction
│   │   ├── displays/             # Specific layout implementations
│   │   └── table/                # Table-specific sub-components
│   └── styles/
│       └── base.css              # Core layout and loader styles
```

## 🚀 Usage

### Basic List Mode

Standard vertical list with remote data fetching and item selection.

```tsx
import { DataDisplay } from '@projective/data';

export default function UserList({ userSource }) {
	return (
		<DataDisplay
			dataSource={userSource}
			mode='list'
			estimateHeight={64}
			selectionMode='single'
			renderItem={(user) => (
				<div className='p-4 border-b'>
					<h3>{user.name}</h3>
					<p>{user.email}</p>
				</div>
			)}
		/>
	);
}
```

### Responsive Grid Mode

Rendering items in a multi-column grid that handles its own virtualization offsets.

```tsx
<DataDisplay
	dataSource={projectSource}
	mode='grid'
	gridColumns={3}
	estimateHeight={200}
	renderItem={(project) => <ProjectCard project={project} />}
/>;
```

### Advanced Table Mode

A structured data table with sortable and resizable columns.

```tsx
<DataDisplay
	dataSource={invoiceSource}
	mode='table'
	columns={[
		{ id: 'id', field: 'invoice_no', label: 'Invoice #', width: 100 },
		{ id: 'date', field: 'created_at', label: 'Date', sortable: true },
		{ id: 'amount', field: (item) => `$${item.total}`, label: 'Amount', align: 'right' },
	]}
	renderItem={(invoice) => <span>{invoice.status}</span>}
/>;
```

## ⚙️ API Reference

### DataDisplay Props

All props are defined in `DataDisplayProps.ts`.

| Prop             | Type                            | Default       | Description                                 |
| :--------------- | :------------------------------ | :------------ | :------------------------------------------ |
| `dataSource`     | `DataSource \| TOut[]`          | -             | The source of data (remote or local array). |
| `mode`           | `'list' \| 'grid' \| 'table'`   | `'list'`      | The visual layout used for rendering.       |
| `scrollMode`     | `'container' \| 'window'`       | `'container'` | Whether the component or the body scrolls.  |
| `estimateHeight` | `number`                        | `50`          | Average item height for virtualizer math.   |
| `gridColumns`    | `number`                        | `3`           | Columns to use specifically in `grid` mode. |
| `selectionMode`  | `'none' \| 'single' \| 'multi'` | `'single'`    | Behavior for item clicks.                   |
| `scrollToBottom` | `boolean`                       | `false`       | Initial scroll position (useful for chat).  |

## 🕹️ Logic & Integration

- **DataManager Lifecycle**: The component uses `useDataManager` to track visible ranges and trigger
  fetches only when the user scrolls near "gaps" in the data.
- **Layout-Specific Virtualization**:
  - In `list` and `table` modes, one virtual row equals one data item.
  - In `grid` mode, the virtualizer treats a group of items (based on `gridColumns`) as a single
    virtual row to maintain layout integrity.
- **Dynamic Table State**: In `table` mode, the component manages a local `TableState` to track
  column widths and sort directions, which can trigger local or remote re-sorting.
- **Window Scroll Support**: If `scrollMode` is set to `window`, the component attaches listeners to
  `globalThis` and uses `getBoundingClientRect` to calculate the relative viewport offset for the
  virtualizer.

## 🎨 Styling

Styles are modularly loaded based on the active mode:

- **Base Layout**: `base.css` defines the core `.data-display` container and the absolute-positioned
  loader.
- **Scroll Abstraction**: `scroll-pane.css` handles the difference between internal container
  scrolling and window-level overflow.
- **Theme-Awareness**: Leverages CSS variables from `theme.css` (e.g., `--bg-selection`) to ensure
  selection highlights match the platform's visual identity.
