import '@styles/components/fields/SliderField.css';
import { valueToPercent, valueToPercentLog } from '@projective/utils';
import { useSliderState } from '@hooks/fields/useSliderState.ts';
import {
	SliderFieldProps,
	SliderMark,
	TooltipPosition,
	TooltipVisibility,
} from '@projective/types';

export default function SliderField(props: SliderFieldProps) {
	const min = props.min ?? 0;
	const max = props.max ?? 100;
	const step = props.step ?? 1;

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
		value: props.value,
		onChange: props.onChange,
		min,
		max,
		step,
		range: props.range,
		disabled: props.disabled,
		marks: props.marks,
		snapToMarks: props.snapToMarks,
		vertical: props.vertical,
		scale: props.scale,
		minDistance: props.minDistance,
		passthrough: props.passthrough, // Pass to hook
	});

	// --- Tooltip Config Resolution ---
	const tooltipConfig = props.tooltip
		? {
			enabled: true,
			format: (typeof props.tooltip === 'object' && props.tooltip.format)
				? props.tooltip.format
				: (val: number) => val.toFixed(step % 1 !== 0 ? 1 : 0),
			position: (typeof props.tooltip === 'object' && props.tooltip.position)
				? props.tooltip.position
				: (props.vertical ? 'right' : 'top') as TooltipPosition,
			visibility: (typeof props.tooltip === 'object' && props.tooltip.visibility)
				? props.tooltip.visibility
				: 'hover' as TooltipVisibility,
		}
		: { enabled: false, format: (v: number) => '', position: 'top', visibility: 'hover' };

	const renderMarks = () => {
		if (!props.marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(props.marks)) {
			points = props.marks.map((m) => typeof m === 'number' ? { value: m } : m);
		} else if (props.marks === true) {
			if (props.scale === 'logarithmic') return null;
			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) points.push({ value: i });
		}

		return (
			<div className='slider-field__marks'>
				{points.map((mark, i) => {
					const pct = props.scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);
					if (pct < 0 || pct > 100) return null;

					const style = props.vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					return (
						<div key={i} className='slider-field__mark' style={style}>
							<div className='slider-field__mark-tick'></div>
							{mark.label && <div className='slider-field__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const containerClasses = [
		'slider-field',
		props.className,
		props.disabled ? 'slider-field--disabled' : '',
		props.range ? 'slider-field--range' : '',
		props.marks ? 'slider-field--has-marks' : '',
		props.vertical ? 'slider-field--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = props.vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses}>
			{props.label && (
				<div className='slider-field__header'>
					<label className='slider-field__label' htmlFor={props.id}>
						{props.label} {props.required && <span className='slider-field__req'>*</span>}
					</label>
				</div>
			)}

			<div className='slider-field__control' style={wrapperStyle}>
				<div
					className='slider-field__track-container'
					ref={trackRef}
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='slider-field__rail'></div>
					<div className='slider-field__track' style={trackFillStyle.value}></div>

					{renderMarks()}

					{handleStyles.value.map((style, index) => {
						const isActive = activeHandleIdx.value === index;
						const val = internalValues.value[index];

						return (
							<div
								key={index}
								className={`slider-field__handle ${isActive ? 'slider-field__handle--active' : ''}`}
								style={style}
								tabIndex={props.disabled ? -1 : 0}
								role='slider'
								aria-orientation={props.vertical ? 'vertical' : 'horizontal'}
								aria-valuemin={min}
								aria-valuemax={max}
								aria-valuenow={val}
								onPointerDown={(e) => handlePointerDown(index, e)}
								onPointerMove={handlePointerMove}
								onPointerUp={handlePointerUp}
								onContextMenu={(e) => e.preventDefault()}
							>
								<div className='slider-field__handle-knob'></div>

								{tooltipConfig.enabled && (
									<div
										className={`
                      slider-field__tooltip 
                      slider-field__tooltip--${tooltipConfig.position}
                      slider-field__tooltip--${tooltipConfig.visibility}
                    `}
									>
										{tooltipConfig.format(val)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{props.error && <div className='slider-field__msg-error'>{props.error}</div>}
			{props.hint && !props.error && <div className='slider-field__msg-hint'>{props.hint}</div>}
		</div>
	);
}
