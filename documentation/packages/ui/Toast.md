# UI Component: Stepper

A versatile component for navigating through a multi-step process. It supports horizontal and
vertical orientations, linear or non-linear progression, and visual feedback for active, completed,
or erroneous states.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── stepper/
│   │       ├── index.ts              # Entry point
│   │       ├── Stepper.tsx           # Provider and root container
│   │       ├── StepperHeader.tsx     # Step indicator container
│   │       ├── Step.tsx              # Individual step indicator
│   │       ├── StepperContent.tsx    # Panel container
│   │       ├── StepperPanel.tsx      # Individual step content panel
│   │       └── StepperFooter.tsx     # Navigation buttons
│   ├── hooks/
│   │   └── useStepper.ts             # Progression and validation logic
│   ├── styles/
│   │   └── components/
│   │       └── stepper.css           # Component layout and transitions
│   └── types/
│       └── components/
│           └── stepper.ts            # TypeScript interfaces
```

## 🚀 Usage

### Basic Linear Stepper

The stepper defaults to a linear progression, meaning users must complete Step 1 before moving to
Step 2.

```tsx
import {
	Step,
	Stepper,
	StepperContent,
	StepperFooter,
	StepperHeader,
	StepperPanel,
} from '@projective/ui';

export default function SignupFlow() {
	return (
		<Stepper linear defaultActiveStep={0} responsive>
			<StepperHeader>
				<Step label='Account' description='Set up credentials' />
				<Step label='Profile' description='About you' />
				<Step label='Finish' />
			</StepperHeader>

			<StepperContent>
				<StepperPanel>Credential Form...</StepperPanel>
				<StepperPanel>Profile Details...</StepperPanel>
				<StepperPanel>Review & Submit...</StepperPanel>
			</StepperContent>

			<StepperFooter />
		</Stepper>
	);
}
```

### Async Validation

Use the `beforeStepChange` prop to validate the current step (e.g., API calls) before allowing the
user to proceed.

```tsx
<Stepper
	beforeStepChange={async (next, current) => {
		if (current === 0) {
			const ok = await validateAccount();
			return ok; // Return false to block progression
		}
		return true;
	}}
>
	{/* Steps... */}
</Stepper>;
```

## ⚙️ API Reference

### Stepper (Root)

Manages the shared state and configuration for the entire flow.

| Prop               | Type                                    | Default        | Description                                              |
| :----------------- | :-------------------------------------- | :------------- | :------------------------------------------------------- |
| `orientation`      | `'horizontal' \| 'vertical'`            | `'horizontal'` | Layout direction of the stepper.                         |
| `variant`          | `'circle' \| 'dot'`                     | `'circle'`     | Visual style of the indicators.                          |
| `linear`           | `boolean`                               | `true`         | Enforces sequential step completion.                     |
| `responsive`       | `number \| boolean`                     | -              | Width (px) to switch to vertical layout. `true` = 600px. |
| `beforeStepChange` | `(next, current) => boolean \| Promise` | -              | Sync or Async guard for navigation.                      |

### Step

The individual indicator within the `StepperHeader`.

| Prop          | Type                | Description                                       |
| :------------ | :------------------ | :------------------------------------------------ |
| `label`       | `string`            | Primary text for the step.                        |
| `description` | `string`            | Optional supporting text.                         |
| `optional`    | `boolean`           | Adds an "(Optional)" tag to the label.            |
| `icon`        | `ComponentChildren` | Custom icon to override the default number/check. |

## 🕹️ Interaction & Accessibility

- **State Management**: Uses Preact Signals (`activeStep`, `isLoading`, `stepErrors`) to ensure UI
  updates are reactive and efficient.
- **Responsive Stacking**: When `responsive` is enabled, the stepper utilizes a `ResizeObserver` to
  automatically flip between horizontal and vertical layouts based on container width.
- **Loading States**: The `StepperFooter` buttons automatically disable and show a spinner when
  `beforeStepChange` returns a pending promise.

## 🎨 Styling

Styles are defined in `stepper.css`:

- **Transitions**: Panels use a subtle fade-in and slide-up animation when activated
  (`stepperFadeIn`).
- **Connectors**: The lines between steps transition their background color from
  `var(--field-border)` to `var(--primary-500)` upon completion.
