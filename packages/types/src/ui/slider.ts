import { BaseFieldProps } from './form.ts';

export interface SliderMark {
	value: number;
	label?: string;
}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'inside';
export type TooltipVisibility = 'hover' | 'always' | 'active';

export interface SliderFieldProps extends BaseFieldProps<number | number[]> {
	min?: number;
	max?: number;
	step?: number;
	range?: boolean;

	// --- Physics ---
	// Allow handles to cross each other.
	// If true, value can be [80, 20] instead of strictly [20, 80].
	passthrough?: boolean;
	minDistance?: number;
	scale?: 'linear' | 'logarithmic';

	// --- Visuals ---
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	height?: string;

	// --- Tooltips / Labels ---
	// If true, uses defaults. Or pass config object.
	tooltip?: boolean | {
		format?: (val: number) => string;
		position?: TooltipPosition;
		visibility?: TooltipVisibility;
	};

	jumpOnClick?: boolean;
}
