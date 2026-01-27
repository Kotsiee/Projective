# Field Component: TimeField

A precise time selection component that utilizes an interactive analog-style clock interface. It
supports single and multiple time selections, custom intervals, and integration with the platform's
Popover system.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   ├── TimeField.tsx         # Main component logic
│   │   └── datetime/
│   │       └── TimeClock.tsx     # Analog clock face and pointer logic
│   ├── styles/
│   │   ├── fields/
│   │   │   └── date-field.css    # Shared container layout
│   │   └── components/
│   │       └── time-clock.css    # Clock face and digital header styling
│   └── types/
│       └── components/
│           └── time-field.ts     # Selection modes and value types
```

## 🚀 Usage

### Single Time Picker (Default)

Standard time selection using a popup analog clock.

```tsx
import { TimeField } from '@projective/fields';
import { DateTime } from '@projective/types';

export default function MyForm() {
	return (
		<TimeField
			label='Start Time'
			placeholder='HH:MM'
			onChange={(time) => console.log('Selected:', time)}
		/>
	);
}
```

### Multiple Time Selection

Allows users to pick several distinct timestamps, useful for scheduling availability slots.

```tsx
<TimeField
	label='Available Slots'
	selectionMode='multiple'
	variant='popup'
/>;
```

### Inline Variant

Renders the `TimeClock` directly in the layout without a popup wrapper.

```tsx
<TimeField
	label='Select Time'
	variant='inline'
	defaultValue={new DateTime()}
/>;
```

## ⚙️ API Reference

### TimeField Props

Extends `ValueFieldProps<TimeValue>` and `AdornmentProps`.

| Prop            | Type                             | Default    | Description                                    |
| :-------------- | :------------------------------- | :--------- | :--------------------------------------------- |
| `selectionMode` | `'single' \| 'multiple'`         | `'single'` | Determines if one or many times can be picked. |
| `variant`       | `'popup' \| 'inline' \| 'input'` | `'popup'`  | Controls the display mode of the clock.        |
| `value`         | `DateTime \| DateTime[]`         | -          | Controlled time value(s).                      |
| `onChange`      | `(val: TimeValue) => void`       | -          | Callback triggered on time update.             |
| `placeholder`   | `string`                         | `'HH:MM'`  | Text shown when no time is selected.           |

## 🕹️ Logic & Clock Features

- **Analog Interaction**: The `TimeClock` component uses pointer events to calculate angles relative
  to the center, mapping coordinates to 12-hour or 60-minute segments.
- **Auto-Switching**: In `single` selection mode, the clock automatically transitions from 'hours'
  to 'minutes' view after a valid hour is selected to streamline the user flow.
- **AM/PM Context**: A dedicated digital header allows users to toggle between AM and PM, which
  updates the internal `DateTime` object's hour value (0-23) accordingly.
- **Multi-Select Toggle**: In `multiple` mode, clicking an existing time on the clock face removes
  it (toggles), while clicking a new segment adds it to the value array.

## 🎨 Styling

Styles are defined in `time-clock.css`:

- **Clock Hand**: A visual hand points to the currently active segment, with a smooth rotation
  calculated via `Math.atan2`.
- **Digital Display**: The header features a large digital readout that acts as a switch between
  hour and minute edit modes.
- **Active States**: Selected segments are highlighted with `--bg-brand-solid`, while multi-selected
  segments use a subtle `--bg-brand-subtle` to differentiate from the primary selection.
