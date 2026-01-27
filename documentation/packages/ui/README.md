# UI Library: @projective/ui

A high-performance, edge-ready UI component library built for the Projective platform. This package
leverages **Deno Fresh**, **Preact**, and **Preact Signals** to provide a seamless,
partially-hydrated user experience.

## 📦 Package Overview

```text
packages/ui/
├── mod.ts                # Global entry point
├── deno.json             # Package configuration
├── src/
│   ├── components/       # Preact components
│   ├── core/             # Framework-agnostic logic (e.g., Toast engine)
│   ├── hooks/            # Reusable state machines
│   ├── styles/           # Component-specific CSS
│   └── types/            # TypeScript definitions
└── wrappers/             # Global providers and theme logic
```

## 🚀 Key Features

- **Edge-First Performance**: Optimized for Deno Deploy and Fresh's island architecture, ensuring
  minimal client-side JavaScript.
- **Reactive State**: Uses Preact Signals for granular updates without unnecessary re-renders.
- **Themeable**: Built-in dark/light mode support with persistent state via `ThemeSwitcher`.
- **Accessible**: Implements WAI-ARIA standards for complex components like Accordions and
  Splitters.
- **Responsive**: Adaptive layouts with `ResizeObserver` integration in Steppers and Splitters.

## 🧩 Component Directory

| Component     | Description                                                | Docs                        |
| :------------ | :--------------------------------------------------------- | :-------------------------- |
| **Accordion** | Collapsible content panels with single/multiple expansion. | [View Docs](./accordion.md) |
| **Splitter**  | Resizable layout panes with collapse and keyboard support. | [View Docs](./splitter.md)  |
| **Stepper**   | Multi-step process navigator with async validation.        | [View Docs](./stepper.md)   |
| **Toast**     | Non-blocking notification system with promise handling.    | [View Docs](./toast.md)     |
| **Popover**   | Contextual floating panels with auto-flip logic.           | [Coming Soon]               |

## 🛠 Installation & Setup

Ensure your `deno.json` or `import_map.json` includes the library reference:

```json
{
	"imports": {
		"@projective/ui": "./packages/ui/mod.ts"
	}
}
```

### Global Styling

Import the theme switcher and base styles in your main layout to enable dark mode and component
styling:

```ts
import { theme } from '@projective/ui';
// The library automatically applies [data-theme] to the document root.
```

## 🎨 Styling Architecture

The library uses a "Component-Local CSS" strategy. Each component imports its own CSS file, which
utilizes global CSS variables defined in the platform's core theme (e.g., `--primary-500`,
`--field-radius`).
