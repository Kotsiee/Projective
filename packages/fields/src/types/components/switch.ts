/**
 * Switch (toggle) primitive props. A controlled on/off toggle — the binary sibling of Checkbox —
 * used for settings, visibility and enable/disable affordances. Renders a track + sliding thumb;
 * the thumb travels on the spring curve (`--motion-micro`) and the track re-tints to the active
 * status accent. Use Switch for immediate on/off state; use Checkbox for selection within a set.
 */
export interface SwitchProps {
	/** Controlled on/off state. */
	checked: boolean;
	/** Fired with the next checked value when toggled. */
	onChange?: (checked: boolean) => void;
	/** Visible label beside the track. Omit for a bare switch. */
	label?: string;
	/** Optional secondary line under the label. */
	description?: string;
	disabled?: boolean;
	/** Track size. Defaults to 'md'. */
	size?: 'sm' | 'md';
	/** Accent tone applied to the ON track. Defaults to 'primary'. */
	tone?: 'primary' | 'success' | 'danger';
	/** Corner style. 'pill' (default, idiomatic) or 'square' (the 4px `--radius-control` tier). */
	shape?: 'pill' | 'square';
	/** Accessible label when no visible `label` is provided. */
	ariaLabel?: string;
	name?: string;
	className?: string;
}
