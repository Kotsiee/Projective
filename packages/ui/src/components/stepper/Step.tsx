import { IconCheck, IconExclamationCircle } from '@tabler/icons-preact';
import { useStepperContext } from './Stepper.tsx';
import { StepProps } from '../../types/components/stepper.ts';

export function Step({
	label,
	description,
	icon,
	error,
	disabled,
	optional,
	index = 0,
	isLast,
	className,
	style,
}: StepProps) {
	const { activeStep, goTo, linear, stepErrors, variant } = useStepperContext();

	const isActive = activeStep.value === index;
	const isCompleted = activeStep.value > index;
	const hasError = error || stepErrors.value.has(index);
	const isClickable = !disabled && (!linear || index <= activeStep.value + 1);

	const handleClick = () => {
		if (isClickable) goTo(index);
	};

	// --- Icon Logic ---
	let statusIcon = icon;

	// If variant is 'dot', we don't render numbers inside, just specific icons for states
	if (variant === 'dot') {
		if (hasError) statusIcon = <IconExclamationCircle size={14} />;
		else if (isCompleted) statusIcon = <IconCheck size={12} />;
		else statusIcon = null; // Just a dot
	} else {
		// Standard 'circle' variant
		if (!statusIcon) {
			if (hasError) statusIcon = <IconExclamationCircle size={20} />;
			else if (isCompleted) statusIcon = <IconCheck size={18} />;
			else statusIcon = <span className='stepper__step-number'>{index + 1}</span>;
		}
	}

	const classes = [
		'stepper__step',
		isActive && 'stepper__step--active',
		isCompleted && 'stepper__step--completed',
		hasError && 'stepper__step--error',
		disabled && 'stepper__step--disabled',
		isClickable && 'stepper__step--clickable',
		className,
	].filter(Boolean).join(' ');

	return (
		<div className={classes} style={style} onClick={handleClick}>
			<div className='stepper__step-indicator'>
				{statusIcon}
			</div>

			<div className='stepper__step-content'>
				<div className='stepper__step-title'>
					{label}
					{optional && <span className='stepper__step-optional'>(Optional)</span>}
				</div>
				{description && <div className='stepper__step-desc'>{description}</div>}
			</div>

			{!isLast && (
				<div className={`stepper__connector ${isCompleted ? 'stepper__connector--active' : ''}`} />
			)}
		</div>
	);
}
