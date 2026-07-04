import '../styles/fields/toolbar-controls.css';
import { JSX } from 'preact';
import { IconLayoutGrid, IconLayoutList } from '@tabler/icons-preact';

/** The two layouts a {@link ViewToggle} switches between. */
export type ViewMode = 'grid' | 'list';

export interface ViewToggleProps {
	/** Active layout. */
	value: ViewMode;
	/** Fired when the user picks a different layout. */
	onChange: (value: ViewMode) => void;
	className?: string;
}

/**
 * @function ViewToggle
 * @description A compact two-button group for hot-swapping between Grid and List
 * layouts, typically pinned to the top-right of a toolbar. The active layout's
 * button is tinted with the primary surface colour.
 */
export function ViewToggle(
	{ value, onChange, className }: ViewToggleProps,
): JSX.Element {
	const buttons: { mode: ViewMode; icon: JSX.Element; label: string }[] = [
		{ mode: 'list', icon: <IconLayoutList size={17} />, label: 'List view' },
		{ mode: 'grid', icon: <IconLayoutGrid size={17} />, label: 'Grid view' },
	];

	return (
		<div class={`view-toggle ${className || ''}`} role='group' aria-label='View layout'>
			{buttons.map(({ mode, icon, label }) => (
				<button
					key={mode}
					type='button'
					aria-label={label}
					aria-pressed={value === mode}
					class={`view-toggle__btn ${value === mode ? 'view-toggle__btn--active' : ''}`}
					onClick={() => onChange(mode)}
				>
					{icon}
				</button>
			))}
		</div>
	);
}
