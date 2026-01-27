# Field Component: SelectField

A robust selection component supporting single and multi-select modes, searchability, hierarchical
grouping, and custom display formats. It leverages Preact Signals for high-performance dropdown
interactions and state management.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── SelectField.tsx       # Main component and dropdown logic
│   ├── hooks/
│   │   ├── useSelectState.ts     # Flattening logic and selection state
│   │   └── useInteraction.ts     # Field focus and hover tracking
│   ├── styles/
│   │   └── fields/
│   │       └── select-field.css  # Dropdown and chip styling
│   └── types/
│       └── components/
│           └── select-field.ts   # SelectOption and Prop definitions
```

## 🚀 Usage

### Single Select (Standard)

Standard selection with a clearable value and custom icons.

```tsx
import { SelectField } from '@projective/fields';

const options = [
	{ label: 'Design', value: 'design' },
	{ label: 'Development', value: 'dev' },
	{ label: 'Marketing', value: 'marketing' },
];

export default function MyForm() {
	return (
		<SelectField
			label='Category'
			options={options}
			clearable
			placeholder='Select a category'
		/>
	);
}
```

### Multi-Select with Chips

Allows picking multiple values, displayed as removable chips within the field.

```tsx
<SelectField
	label='Skills'
	options={skillsOptions}
	multiple
	displayMode='chips-inside'
	searchable
	placeholder='Search skills...'
/>;
```

### Hierarchical Grouping

Supports nested options with different selection behaviors for parent groups.

```tsx
const groupedOptions = [
	{
		label: 'Frontend',
		value: 'fe-group',
		options: [
			{ label: 'React', value: 'react' },
			{ label: 'Preact', value: 'preact' },
		],
	},
];

// 'members' mode: Clicking a group selects all children
<SelectField
	label='Stack'
	options={groupedOptions}
	multiple
	groupSelectMode='members'
/>;
```

## ⚙️ API Reference

### SelectField Props

Extends `ValueFieldProps<T | T[]>` and `AdornmentProps`.

| Prop              | Type                   | Default          | Description                                                                  |
| :---------------- | :--------------------- | :--------------- | :--------------------------------------------------------------------------- |
| `options`         | `SelectOption[]`       | `[]`             | Array of label/value objects or nested groups.                               |
| `multiple`        | `boolean`              | `false`          | Enables multiple value selection.                                            |
| `searchable`      | `boolean`              | `false`          | Filters options based on user input.                                         |
| `displayMode`     | `SelectDisplayMode`    | `'chips-inside'` | How selected values appear (`chips-inside`, `chips-below`, `count`, `text`). |
| `groupSelectMode` | `'value' \| 'members'` | `'value'`        | Whether clicking a group selects the group value or its children.            |
| `loading`         | `boolean`              | `false`          | Shows a spinner in place of the chevron.                                     |
| `clearable`       | `boolean`              | `false`          | Shows an 'X' to reset the value.                                             |

## 🕹️ Interaction & Logic

- **Smart Positioning**: The dropdown automatically flips upward if there is insufficient space
  below the field (minimum 250px).
- **Flattening Engine**: The `useSelectState` hook flattens nested option trees into a linear list
  for keyboard navigation while maintaining depth metadata for indentation.
- **Keyboard Navigation**: Supports `ArrowDown`/`ArrowUp` for highlighting, `Enter` for selection,
  and `Backspace` to remove the last chip when the search query is empty.
- **Ripple Effects**: Integrated with `useRipple` to provide tactile feedback on container clicks.

## 🎨 Styling

Styles are defined in `select-field.css`:

- **Chip Variants**: Chips feature a removable 'X' and adaptive background colors based on the
  theme.
- **Dropdown Depth**: Indentation for nested items is calculated dynamically:
  `paddingLeft: (depth * 12) + 12 + 'px'`.
- **Focus States**: High-contrast border and focus ring application via `EffectWrapper`.
