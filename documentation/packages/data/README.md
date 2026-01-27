# Data Display Library: @projective/data

The `@projective/data` package is a high-performance, virtualization-first data management and
display library built for the Projective platform. It provides a unified architecture for handling
large-scale datasets, from standard administration tables to real-time chat interfaces, ensuring
smooth interactions even with thousands of records.

## 📦 Package Overview

```text
packages/data/
├── mod.ts                # Global entry point and public API
├── deno.json             # Deno configuration and metadata
├── src/
│   ├── components/       # Core display components (DataDisplay, ChatList)
│   ├── core/             # Business logic (DataManager, DataSource, Virtualizer)
│   ├── hooks/            # Reactive hooks for virtualization and state
│   └── styles/           # Theme-aware CSS and mode-specific layouts
```

## 🚀 Key Features

- **Unified Display Controller**: A single `DataDisplay` component that can toggle between `list`,
  `grid`, and `table` modes without losing state.
- **Virtualization Engine**: A custom `Virtualizer` that supports variable-height items via
  `ResizeObserver`, keeping the DOM footprint minimal.
- **Intelligent Loading**: A `DataManager` that detects "gaps" in the current view and executes
  precise range-based fetches.
- **Advanced Chat Support**: Specialized `ChatList` with reverse-infinite scrolling and scroll
  anchoring to handle incoming real-time messages without visual jumps.
- **DataSource Abstraction**: Modular sources for REST, Local, and Realtime data with integrated
  normalization and global caching.

## 🧩 Core Architecture

The library is built on a "Decoupled Data" philosophy:

1. **DataSource**: Defines _where_ the data comes from and _how_ to map it.
2. **DataManager**: Orchestrates _when_ to fetch data and manages the local `Dataset` signal.
3. **Virtualizer**: Calculates _what_ is visible based on the scroll offset and item heights.
4. **Display Component**: Decides _how_ to render the visible items (e.g., as a Table row or a Grid
   card).

## 🛠 Usage Example

```tsx
import { DataDisplay, RestDataSource } from '@projective/data';

// 1. Define the source
const projectSource = new RestDataSource({
	url: '/api/projects',
	keyExtractor: (item) => item.id,
});

// 2. Render the display
export function ProjectBrowser() {
	return (
		<DataDisplay
			dataSource={projectSource}
			mode='grid'
			gridColumns={3}
			estimateHeight={200}
			renderItem={(project) => <ProjectCard data={project} />}
		/>
	);
}
```

## 🎨 Design System Integration

The library utilizes a centralized `theme.css` that maps platform-level tokens to data-specific
variables:

- **Selection**: Uses `--bg-selection` for high-contrast row/card highlighting.
- **Skeletons**: Integrated pulsing animations for items that are in a "pending" fetch state.
- **Dark Mode**: Full support for dark theme overrides via the `[data-theme='dark']` selector.
