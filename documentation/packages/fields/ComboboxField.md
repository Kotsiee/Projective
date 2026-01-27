# Field Component: ComboboxField

A hybrid input component that combines the flexibility of a text field with the structured selection
of a dropdown. It is ideal for large lists where users need to filter options via typing while
maintaining the ability to select from a predefined set.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── ComboboxField.tsx     # Hybrid input and filtering logic
│   ├── styles/
│   │   └── fields/
│   │       └── combobox-field.css # Dropdown menu and layout styling
│   └── types/
│       └── components/
│           └── combobox-field.ts # Interface extending SelectFieldProps
```

## 🚀 Usage

### Searchable Selection

A standard combobox that filters options as the user types.

```tsx
import { ComboboxField } from '@projective/fields';

const languages = [
	{ label: 'TypeScript', value: 'ts' },
	{ label: 'Rust', value: 'rs' },
	{ label: 'Go', value: 'go' },
	{ label: 'Python', value: 'py' },
];

export default function TechStack() {
	return (
		<ComboboxField
			label='Primary Language'
			options={languages}
			placeholder='Start typing a language...'
		/>
	);
}
```

## ⚙️ API Reference

### ComboboxField Props

Extends `SelectFieldProps<T>`.

| Prop          | Type               | Default | Description                                    |
| :------------ | :----------------- | :------ | :--------------------------------------------- |
| `options`     | `SelectOption[]`   | `[]`    | The list of searchable options.                |
| `value`       | `T \| Signal<T>`   | -       | The currently selected value.                  |
| `onChange`    | `(val: T) => void` | -       | Callback triggered when an option is selected. |
| `placeholder` | `string`           | -       | Text shown in the input when empty.            |
| `disabled`    | `boolean`          | `false` | Prevents user interaction and dims the UI.     |

## 🕹️ Logic & Behavior

- **Fuzzy Filtering**: The component uses a `computed` signal to filter the `options` array in
  real-time based on the current input value, ignoring case sensitivity.
- **Automatic Positioning**: Upon opening, the component calculates available viewport space; if the
  bottom clearance is less than 250px, the menu automatically flips to open upwards.
- **Interaction States**: Utilizes the `useInteraction` hook to track focus and blur states,
  ensuring the floating label and focus rings respond correctly to user input.
- **Selection Sync**: Selecting an option automatically updates the internal `inputValue` to match
  the option's label and closes the menu.

## 🎨 Styling

Styles are defined in `combobox-field.css`:

- **Menu Transitions**: The dropdown menu uses a subtle vertical translation (`translateY`) and
  opacity fade during the open/close cycle.
- **Layout Consistency**: Reuses `LabelWrapper`, `MessageWrapper`, and `EffectWrapper` to ensure
  visual parity with other field components.
- **Upward Variant**: Includes dedicated CSS logic for the `.field-combobox--up` class to adjust
  shadows and transform origins when the menu is flipped.
