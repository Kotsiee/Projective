# UI Component: Splitter

A flexible, resizable layout component that allows users to adjust the size of multiple panes. It
supports both horizontal and vertical orientations, keyboard navigation, touch interactions, and
pane collapsing.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── splitter/
│   │       ├── index.ts              # Entry point
│   │       ├── Splitter.tsx          # Main container logic
│   │       ├── SplitterPane.tsx      # Individual pane wrapper
│   │       └── SplitterGutter.tsx    # Resizable handle/gutter
│   ├── hooks/
│   │   └── useSplitter.ts            # Resize and collapse logic
│   ├── styles/
│   │   └── components/
│   │       └── splitter.css          # Layout and handle styling
│   └── types/
│       └── components/
│           └── splitter.ts           # TypeScript interfaces
```

## 🚀 Usage

### Horizontal Splitter (Default)

The Splitter defaults to a horizontal layout. Panes can be constrained using `minSize` and `maxSize`
(percentages).

```tsx
import { Splitter, SplitterPane } from '@projective/ui';

export default function Layout() {
	return (
		<div style={{ height: '400px' }}>
			<Splitter direction='horizontal' initialSizes={[30, 70]}>
				<SplitterPane minSize={20}>
					<div className='p-4'>Sidebar Content</div>
				</SplitterPane>
				<SplitterPane>
					<div className='p-4'>Main Content Area</div>
				</SplitterPane>
			</Splitter>
		</div>
	);
}
```

### Collapsible Panes

Enable `collapsible` on a pane to allow it to be collapsed to 0% width/height. This can be triggered
by double-clicking the gutter or using the `Enter` key.

```tsx
<Splitter direction='horizontal'>
	<SplitterPane collapsible defaultCollapsed minSize={15}>
		<aside>Navigation</aside>
	</SplitterPane>
	<SplitterPane>
		<main>Dashboard</main>
	</SplitterPane>
</Splitter>;
```

## ⚙️ API Reference

### Splitter (Root)

Coordinates the layout and resizing of its child panes.

| Prop           | Type                         | Default        | Description                                                      |
| :------------- | :--------------------------- | :------------- | :--------------------------------------------------------------- |
| `direction`    | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the split.                                    |
| `initialSizes` | `number[]`                   | -              | Array of percentage values for initial pane widths/heights.      |
| `minPaneSize`  | `number`                     | `10`           | Global minimum percentage size for any pane.                     |
| `breakpoint`   | `number`                     | `0`            | Container width (px) below which the splitter stacks vertically. |
| `onResizeEnd`  | `(sizes: number[]) => void`  | -              | Callback triggered when the user stops resizing.                 |

### SplitterPane

A wrapper for individual sections within the splitter.

| Prop               | Type      | Description                                      |
| :----------------- | :-------- | :----------------------------------------------- |
| `minSize`          | `number`  | Minimum percentage size for this specific pane.  |
| `maxSize`          | `number`  | Maximum percentage size for this specific pane.  |
| `collapsible`      | `boolean` | Allows the pane to be collapsed to 0% size.      |
| `defaultCollapsed` | `boolean` | If true, the pane starts in its collapsed state. |

## 🕹️ Interaction & Accessibility

The Splitter is designed for high-precision control across all input methods:

- **Keyboard**: Focus the gutter and use `ArrowKeys` to resize (2% steps). Use `Shift + ArrowKeys`
  for larger adjustments (10% steps). Press `Enter` or `Space` to toggle collapse on supported
  panes.
- **Touch Support**: Includes an invisible "hitbox" around gutters to make them easier to grab on
  mobile devices.
- **Roles**: Gutters use `role="separator"` and manage `aria-orientation` and `aria-controls` for
  assistive technology.

## 🎨 Styling

Styles are defined in `splitter.css`:

- **Gutter Feedback**: The gutter changes color (`var(--primary-500)`) on hover, focus, or active
  drag to provide visual feedback.
- **Responsive Stack**: When the `breakpoint` is reached, the splitter removes the interactive
  gutters and converts to a simple vertical divider.
- **Resizing Cursor**: The `body` cursor is globally managed during drag operations to maintain the
  correct resize icon even if the mouse leaves the gutter.
