import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useRipple } from '../hooks/useRipple.ts';
import '../styles/wrappers/effect-wrapper.css';

interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[]; // To allow wrapping content if needed, though usually it's an overlay
}

export function EffectWrapper(props: EffectWrapperProps) {
	const isFocused = props.focused instanceof Signal ? props.focused.value : props.focused;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { ripples } = useRipple();

	if (isDisabled) return null;

	// We attach the click listener to the parent in the Field component usually,
	// but here we just render the visual effects.
	// The consumer of EffectWrapper should call addRipple.
	// Actually, to make it self-contained, we might need to attach to parent,
	// but for now let's expose the ripple mechanism or assume the parent handles the click
	// and we just render the ripples.

	// Wait, the requirement says "Handle Ripple effects".
	// Usually this is an overlay that captures clicks or is absolutely positioned.
	// Let's make it an overlay that passes through clicks but registers ripples.

	return (
		<>
			<div
				className={`field-focus-ring ${isFocused ? 'field-focus-ring--active' : ''}`}
			/>
			<div
				className='field-ripple-container'
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					overflow: 'hidden',
					pointerEvents: 'none',
					borderRadius: 'inherit',
				}}
			>
				{ripples.value.map((r) => (
					<span
						key={r.id}
						className='field-ripple'
						style={{ left: r.x, top: r.y }}
					/>
				))}
			</div>
		</>
	);
}

// We also need to export the hook so components can use it if they want manual control
export { useRipple };
