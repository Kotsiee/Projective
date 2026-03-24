import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useRipple } from '@projective/ui';
import '../styles/wrappers/effect-wrapper.css';

interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

export function EffectWrapper(props: EffectWrapperProps) {
	const isFocused = props.focused instanceof Signal ? props.focused.value : props.focused;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { ripples } = useRipple();

	if (isDisabled) return null;
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
