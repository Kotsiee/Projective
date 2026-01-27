# Field Component: DateField

A comprehensive date selection component that supports single dates, multiple dates, and date
ranges. It utilizes a custom-built calendar system and integrates with a Popover for a seamless user
experience.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   ├── DateField.tsx         # Main component logic
│   │   └── datetime/
│   │       └── Calendar.tsx      # Core calendar grid and navigation
│   ├── styles/
│   │   ├── fields/
│   │   │   └── date-field.css    # Layout for the field container
│   │   └── components/
│   │       └── calendar.css      # Grid and cell styling
│   └── types/
│       └── components/
│           └── date-field.ts     # Selection modes and value types
```

## 🚀 Usage

### Single Date Picker (Default)

Standard date selection using a popup calendar.

```tsx
import { DateField } from '@projective/fields';
import { DateTime } from '@projective/types';

export default function MyForm() {
	return (
		<DateField
			label='Deadline'
			placeholder='YYYY-MM-DD'
			defaultValue={new DateTime()}
			onChange={(date) => console.log('Selected:', date)}
		/>
	);
}
```

### Date Range Selection

Allows users to select a start and end date with a visual hover preview.

```tsx
<DateField
	label='Project Duration'
	selectionMode='range'
	format='dd MMM yyyy'
	hint='Select the start and end dates for your project.'
/>;
```

### Inline Variant

Renders the calendar directly in the page flow rather than in a popup.

```tsx
<DateField
	label='Pick a Date'
	variant='inline'
	selectionMode='multiple'
/>;
```

## ⚙️ API Reference

### DateField Props

Extends `ValueFieldProps<DateValue>` and `AdornmentProps`.

| Prop            | Type                                | Default        | Description                                      |
| :-------------- | :---------------------------------- | :------------- | :----------------------------------------------- |
| `selectionMode` | `'single' \| 'multiple' \| 'range'` | `'single'`     | The type of selection behavior.                  |
| `variant`       | `'popup' \| 'inline' \| 'input'`    | `'popup'`      | Visual behavior of the component.                |
| `format`        | `string`                            | `'yyyy-MM-dd'` | Date display format in the input field.          |
| `minDate`       | `DateTime`                          | -              | Earliest selectable date.                        |
| `maxDate`       | `DateTime`                          | -              | Latest selectable date.                          |
| `modifiers`     | `DateModifiers`                     | `{}`           | Custom logic to style or disable specific dates. |

## 🕹️ Logic & Calendar Features

- **Calendar Views**: Supports day, month, and year selection modes for fast navigation across large
  time ranges.
- **Range Preview**: In `range` mode, the calendar provides a visual "middle" state during hover to
  help users visualize the selected span before finalizing.
- **Localization**: weekday labels are generated based on the `startOfWeek` prop (defaulting to
  Monday/1).
- **State Syncing**: The `useFieldState` hook ensures that `DateTime` objects are correctly
  synchronized between the UI and the parent application's signals.

## 🎨 Styling

Styles are defined in `date-field.css` and `calendar.css`:

- **Cell States**: Distinct styles for `--today`, `--selected`, `--range-start`, `--range-end`, and
  `--range-middle`.
- **Muted Days**: Days outside the current viewing month are rendered with a "muted" opacity to
  maintain focus.
- **Accessibility**: Calendar buttons use `type="button"` to prevent accidental form submissions
  when navigating months.
