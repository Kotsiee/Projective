# Field Component: TextField

The foundational input component for the Projective platform. It supports single-line text,
passwords, emails, and multi-line textareas with integrated label floating, validation messaging,
and icon adornments.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── TextField.tsx         # Main component logic
│   ├── hooks/
│   │   ├── useFieldState.ts      # Validation and signal syncing
│   │   └── useInteraction.ts     # Focus and hover state tracking
│   ├── styles/
│   │   └── fields/
│   │       └── text-field.css    # Layout and visual states
│   └── types/
│       └── components/
│           └── text-field.ts     # TypeScript interfaces
```

## 🚀 Usage

### Basic Input

Standard text input with a floating label and a help tooltip.

```tsx
import { TextField } from '@projective/fields';
import { useSignal } from '@preact/signals';

export default function MyForm() {
	const name = useSignal('');

	return (
		<TextField
			id='user-name'
			label='Full Name'
			value={name}
			placeholder='e.g. John Doe'
			help='Enter your name exactly as it appears on your ID.'
			required
		/>
	);
}
```

### Multiline & Character Count

Auto-scaling textarea with character limit feedback.

```tsx
<TextField
	label='Bio'
	multiline
	rows={4}
	maxLength={200}
	showCount
	placeholder='Tell us about your experience...'
/>;
```

### Adornments & Password Toggle

Adding icons or text to the start or end of the field.

```tsx
import { IconEye, IconLock } from '@tabler/icons-preact';

<TextField
	type='password'
	label='Password'
	prefix={<IconLock size={18} />}
	suffix={<IconEye size={18} />}
	onSuffixClick={() => console.log('Toggle visibility')}
/>;
```

## ⚙️ API Reference

### TextField Props

Extends `ValueFieldProps<string>` and `AdornmentProps`.

| Prop           | Type            | Default    | Description                                          |
| :------------- | :-------------- | :--------- | :--------------------------------------------------- |
| `type`         | `TextType`      | `'text'`   | Input type (email, password, tel, etc.).             |
| `multiline`    | `boolean`       | `false`    | Renders a `textarea` instead of an `input`.          |
| `rows`         | `number`        | `3`        | Initial rows for multiline mode.                     |
| `floating`     | `boolean`       | `true`     | Whether the label should float into the border.      |
| `help`         | `string \| JSX` | -          | Contextual help content for the tooltip.             |
| `helpPosition` | `HelpPosition`  | `'inline'` | Position of the help icon (inline, top-right, etc.). |
| `prefix`       | `JSX \| string` | -          | Adornment placed before the input.                   |
| `suffix`       | `JSX \| string` | -          | Adornment placed after the input.                    |
| `showCount`    | `boolean`       | `false`    | Displays the current/max character count.            |

## 🕹️ Interaction & Validation

- **Floating Labels**: The label automatically transitions from a placeholder position to the top
  border when the field is focused or has a value.
- **Automatic Validation**: Validation (e.g., `required` check) is triggered on `blur` if the field
  has been "touched".
- **Signal Syncing**: Supports two-way binding with Preact Signals. If a non-signal value is passed,
  the component maintains an internal signal to ensure reactive UI updates.

## 🎨 Styling

Styles are defined in `text-field.css` and use semantic CSS variables:

- **States**: High-contrast borders are applied for `--focused`, `--error`, and `--disabled` states.
- **Focus Ring**: Utilizes the `EffectWrapper` to provide a non-destructive glow/ring effect around
  the field container.
- **Transitions**: Smooth 150ms transitions for border colors and label scaling.
