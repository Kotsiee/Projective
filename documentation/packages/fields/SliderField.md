# Field Component: SliderField

A highly customizable slider component for selecting single values or ranges. It supports linear and
logarithmic scales, snapping to custom marks, and vertical or horizontal orientations.

## 📂 Project Structure

```text
./packages/fields/
├── src/
│   ├── components/
│   │   └── SliderField.tsx       # Main slider component logic
│   ├── hooks/
│   │   └── useSliderState.ts     # Range logic, pointer math, and collision
│   ├── styles/
│   │   └── fields/
│   │       └── slider-field.css  # Track, fill, and thumb styling
│   └── types/
│       └── components/
│           └── slider-field.ts   # Mark definitions and field props
```

## 🚀 Usage

### Single Value Slider

A basic slider with defined min/max and step increments.

```tsx
import { SliderField } from '@projective/fields';

export default function VolumeControl() {
	return (
		<SliderField
			label='Volume'
			min={0}
			max={100}
			step={5}
			defaultValue={50}
		/>
	);
}
```

### Range Slider with Marks

Selecting a numeric span with visual indicators and snapping logic.

```tsx
<SliderField
	label='Price Range'
	range
	min={0}
	max={1000}
	defaultValue={[200, 800]}
	marks={[
		{ value: 0, label: '$0' },
		{ value: 500, label: '$500' },
		{ value: 1000, label: '$1k' },
	]}
	snapToMarks
/>;
```

### Vertical Orientation

A vertical slider with a logarithmic scale, useful for technical or scientific inputs.

```tsx
<SliderField
	label='Frequency'
	vertical
	height='300px'
	scale='logarithmic'
	min={20}
	max={20000}
/>;
```

## ⚙️ API Reference

### SliderField Props

Extends `ValueFieldProps<number | number[]>`.

| Prop          | Type                        | Default     | Description                                     |
| :------------ | :-------------------------- | :---------- | :---------------------------------------------- |
| `min` / `max` | `number`                    | `0` / `100` | The boundary values of the slider.              |
| `step`        | `number`                    | `1`         | The increment value for the handles.            |
| `range`       | `boolean`                   | `false`     | Enables dual handles for selecting a span.      |
| `vertical`    | `boolean`                   | `false`     | Flips the layout to a vertical axis.            |
| `marks`       | `boolean \| SliderMark[]`   | -           | Visual ticks and labels along the track.        |
| `snapToMarks` | `boolean`                   | `false`     | Forces handles to jump to the nearest mark.     |
| `scale`       | `'linear' \| 'logarithmic'` | `'linear'`  | Changes the distribution logic of the track.    |
| `minDistance` | `number`                    | `0`         | The minimum required gap between range handles. |
| `passthrough` | `boolean`                   | `false`     | Allows range handles to cross over each other.  |

## 🕹️ Logic & Physics

- **Precision Pointer Math**: The `useSliderState` hook calculates percentage values based on
  `getBoundingClientRect` to ensure handles track the pointer accurately across different screen
  sizes.
- **Collision Detection**: Unless `passthrough` is enabled, the state engine enforces `minDistance`
  constraints to prevent handles from overlapping or reversing order.
- **Logarithmic Scaling**: Converts linear track percentages to logarithmic values (and vice-versa)
  using utility functions to provide better resolution at the lower end of wide ranges.
- **Keyboard Support**: Handles include standard ARIA roles and can be navigated via arrow keys for
  accessibility.

## 🎨 Styling

Styles are defined in `slider-field.css`:

- **Dynamic Fill**: The highlighted track portion (fill) is calculated as a separate absolute
  element based on handle positions.
- **Thumb Feedback**: Thumb handles use `transform: scale()` on hover and active states to provide
  tactile visual feedback.
- **Vertical Layout**: When the `vertical` flag is present, flex directions and absolute positioning
  (e.g., `bottom` vs `left`) are automatically swapped.
