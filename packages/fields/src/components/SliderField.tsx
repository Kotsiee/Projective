import '../styles/fields/slider-field.css';
import { Signal } from '@preact/signals';
import { SliderFieldProps, SliderMark } from '../types/components/slider-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useSliderState } from '../hooks/useSliderState.ts';
import { valueToPercent, valueToPercentLog } from '@projective/utils';

export function SliderField(props: SliderFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		error,
		range,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	} = props;

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	// Unwrap signal value if present, or use raw value
	const rawValue = value instanceof Signal ? value.value : (value ?? defaultValue);

	const {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	} = useSliderState({
		value: rawValue,
		onChange: (val) => {
			if (value instanceof Signal) {
				(value as Signal<number | number[]>).value = val;
			}
			onChange?.(val);
		},
		min,
		max,
		step,
		range,
		disabled: !!isDisabled,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	});

	const renderMarks = () => {
		if (!marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(marks)) {
			points = marks.map((m) => (typeof m === 'number' ? { value: m } : m));
		} else if (marks === true) {
			if (scale === 'logarithmic') return null;
			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) points.push({ value: i });
		}

		return (
			<div className='field-slider__marks'>
				{points.map((mark, i) => {
					const pct = scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);
					if (pct < 0 || pct > 100) return null;

					const style = vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					return (
						<div key={i} className='field-slider__mark' style={style}>
							<div className='field-slider__mark-tick'></div>
							{mark.label && <div className='field-slider__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const containerClasses = [
		'field-slider',
		className,
		isDisabled ? 'field-slider--disabled' : '',
		range ? 'field-slider--range' : '',
		marks ? 'field-slider--has-marks' : '',
		vertical ? 'field-slider--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				// FIX: Default to 'never' for sliders so label is static above
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/>

			{/* Control Wrapper */}
			<div className='field-slider__control' style={wrapperStyle}>
				<div
					className='field-slider__container'
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='field-slider__track' ref={trackRef}>
						{/* Fill */}
						<div className='field-slider__fill' style={trackFillStyle.value}></div>

						{/* Marks */}
						{renderMarks()}

						{/* Handles */}
						{handleStyles.value.map((style, index) => {
							const isActive = activeHandleIdx.value === index;
							const val = internalValues.value[index];

							return (
								<div
									key={index}
									className={`field-slider__thumb ${isActive ? 'field-slider__thumb--active' : ''}`}
									style={style}
									tabIndex={isDisabled ? -1 : 0}
									role='slider'
									aria-orientation={vertical ? 'vertical' : 'horizontal'}
									aria-valuemin={min}
									aria-valuemax={max}
									aria-valuenow={val}
									onPointerDown={(e) => handlePointerDown(index, e)}
									onPointerMove={handlePointerMove}
									onPointerUp={handlePointerUp}
									onContextMenu={(e) => e.preventDefault()}
								>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<MessageWrapper error={errorMessage} hint={hint} warning={warning} info={info} />
		</div>
	);
}
