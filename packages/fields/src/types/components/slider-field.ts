import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * SliderField specific props.
 */
export interface SliderMark {
	value: number;
	label?: string;
}

/**
 * SliderField specific props.
 */
export interface SliderFieldProps
	extends
		ValueFieldProps<number | number[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: number;
	max?: number;
	step?: number;
	marks?: boolean | number[] | SliderMark[];
	range?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	snapToMarks?: boolean;
	height?: string;
	passthrough?: boolean;
}
