/**
 * Checkbox primitive props. A small, controlled checkbox used by checklist and file-library
 * sub-components across the app so the tick affordance stays visually unified.
 */
export interface CheckboxProps {
	/** Controlled checked state. */
	checked: boolean;
	/** Fired with the next checked value when toggled. */
	onChange?: (checked: boolean) => void;
	/** Visible label beside the box. Omit for a bare checkbox. */
	label?: string;
	/** Optional secondary line under the label. */
	description?: string;
	/** Tri-state: render a dash instead of a tick (e.g. "some children selected"). */
	indeterminate?: boolean;
	disabled?: boolean;
	/** Box size. Defaults to 'md'. */
	size?: 'sm' | 'md';
	/** Accent tone. Defaults to 'primary'. */
	tone?: 'primary' | 'success';
	/** Accessible label when no visible `label` is provided. */
	ariaLabel?: string;
	name?: string;
	className?: string;
}
