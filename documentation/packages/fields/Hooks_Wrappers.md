# Fields Library: Hooks & Wrappers

This document outlines the internal logic and utility wrappers that power `@projective/fields`.
These modules are designed to be composable, allowing developers to build custom field components
that maintain visual and functional consistency with the rest of the platform.

---

## 🪝 Core Hooks

Hooks in this package manage state, interaction, and complex formatting logic.

### `useFieldState<T>`

The primary state machine for any value-holding field. It handles signal normalization,
dirty/touched tracking, and basic required-field validation.

```ts
const { value, error, setValue, validate } = useFieldState({
	value: props.value,
	defaultValue: props.defaultValue,
	required: props.required,
	onChange: props.onChange,
});
```

- **Signal Normalization**: Automatically converts raw values or signals into a unified signal for
  internal use.
- **Validation**: Provides a `validate()` method that checks `required` constraints and updates the
  `error` signal.

### `useInteraction`

Tracks the physical state of a field (focus, hover, active) to drive CSS classes and floating label
logic.

- **Methods**: Includes `handleFocus`, `handleBlur`, `handleMouseEnter`, and `handleMouseLeave`.
- **Signals**: Returns `focused`, `hovered`, and `touched` signals.

### `useCurrencyMask`

Specialized logic for the `MoneyField` to handle locale-aware formatting and numeric parsing.

- **Formatting**: Converts a numeric signal into a formatted string (e.g., `1200` → `$1,200.00`).
- **Parsing**: Strips non-numeric characters on input to sync the raw number back to the state.

---

## 🏗️ Utility Wrappers

Wrappers provide the consistent "shell" for all fields. They handle labels, error messages, and
visual effects.

### `LabelWrapper`

Manages the positioning and animation of the field label.

```tsx
<LabelWrapper
	id='my-field'
	label='Email Address'
	active={isFocused || !!val}
	error={!!error}
	floatingRule='auto'
	help="We'll never share your email."
/>;
```

- **Floating Logic**: When `floatingRule` is `auto`, the label scales and moves to the border if
  `active` is true.
- **Help Tooltips**: Integrated support for `help` text and `helpLink` via a standardized tooltip
  icon.

### `MessageWrapper`

A specialized container for field feedback, following a strict priority order.

- **Priority**: Displays `error` > `warning` > `info` > `hint` in that specific order.
- **ARIA**: Automatically applies `role="alert"` for error messages to assist screen readers.

### `EffectWrapper`

The visual "polish" layer for field containers.

- **Focus Ring**: Renders a non-destructive glow (`box-shadow`) around the field when focused.
- **Ripple Support**: Provides the container and logic for CSS-based ripple animations on user
  click.

---

## 🛠️ Advanced: `FieldArrayWrapper`

Used for creating dynamic lists of fields (e.g., adding multiple links or phone numbers).

```tsx
<FieldArrayWrapper
	items={links}
	onAdd={() => links.value = [...links.value, '']}
	onRemove={(idx) => links.value = links.value.filter((_, i) => i !== idx)}
	renderItem={(item, idx) => <TextField value={item} label={`Link #${idx + 1}`} />}
/>;
```

| Prop         | Description                                              |
| :----------- | :------------------------------------------------------- |
| `items`      | A signal or array of data objects to iterate over.       |
| `renderItem` | A function returning the JSX for each individual row.    |
| `maxItems`   | Optional limit to disable the "Add" button once reached. |
