# UI Component: Accordion

A vertically stacked set of interactive headings that each reveal an associated section of content.
Built with Preact and Preact Signals for high-performance state management within the Deno Fresh
framework.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── accordion/
│   │       ├── index.ts              # Entry point
│   │       ├── Accordion.tsx         # Root container & logic
│   │       ├── AccordionItem.tsx     # Item wrapper & context
│   │       ├── AccordionTrigger.tsx  # Header & toggle button
│   │       └── AccordionContent.tsx  # Collapsible panel
│   ├── hooks/
│   │   └── useAccordion.ts           # State & interaction logic
│   ├── styles/
│   │   └── components/
│   │       └── accordion.css         # Component styling
│   └── types/
│       └── components/
│           └── accordion.ts          # TypeScript interfaces
```

## 🚀 Usage

### Single Expansion (Default)

In `single` mode, only one item can be expanded at a time. Expanding another item automatically
collapses the current one.

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@projective/ui';

export default function MyAccordion() {
	return (
		<Accordion type='single' collapsible defaultValue='item-1'>
			<AccordionItem value='item-1'>
				<AccordionTrigger subtitle='Platform vision and goals'>
					What is Projective?
				</AccordionTrigger>
				<AccordionContent>
					Projective is a collaborative freelancing platform designed for teams and businesses.
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value='item-2'>
				<AccordionTrigger>How do I start a team?</AccordionTrigger>
				<AccordionContent>
					You can create a team from your freelancer dashboard and invite collaborators.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
```

## ⚙️ API Reference

### Accordion (Root)

The main container that coordinates the state between items.

| Prop            | Type                                  | Default      | Description                                          |
| :-------------- | :------------------------------------ | :----------- | :--------------------------------------------------- |
| `type`          | `'single' \| 'multiple'`              | `'single'`   | Determines if one or many items can be open.         |
| `variant`       | `'outlined' \| 'filled' \| 'ghost'`   | `'outlined'` | Visual style of the accordion.                       |
| `density`       | `'compact' \| 'normal' \| 'spacious'` | `'normal'`   | Controls vertical padding.                           |
| `collapsible`   | `boolean`                             | `false`      | In `single` mode, allows the open item to be closed. |
| `value`         | `string \| string[]`                  | -            | Controlled expansion state.                          |
| `defaultValue`  | `string \| string[]`                  | -            | Initial expansion state for uncontrolled mode.       |
| `onValueChange` | `(val: string \| string[]) => void`   | -            | Callback triggered on item toggle.                   |

### AccordionTrigger

The interactive header element.

| Prop        | Type                | Description                                                        |
| :---------- | :------------------ | :----------------------------------------------------------------- |
| `subtitle`  | `ComponentChildren` | Optional text displayed below the main title.                      |
| `startIcon` | `ComponentChildren` | Icon displayed at the beginning of the header.                     |
| `icon`      | `ComponentChildren` | Overrides the default chevron icon.                                |
| `actions`   | `ComponentChildren` | Interactive elements (e.g., buttons) that don't trigger expansion. |

## ⌨️ Accessibility

The Accordion component implements WAI-ARIA patterns for accessible disclosure widgets:

- **Keyboard Navigation**: Use `ArrowDown` and `ArrowUp` to move focus between triggers. `Home` and
  `End` jump to the first and last triggers respectively.
- **Aria Attributes**: Automatically manages `aria-expanded` and `aria-controls` for screen readers.
- **Roles**: Content panels use `role="region"` for better landmarks.

## 🎨 Styling

Styles are defined in `accordion.css` and use CSS variables for theme-aware customization:

- `--accordion-radius`: Border radius of the container.
- `--accordion-border-color`: Color used for outlines and separators.
- `--accordion-padding-y`: Vertical spacing based on `density`.
