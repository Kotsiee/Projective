import '../styles/fields/toolbar-controls.css';
import { JSX } from 'preact';

/** A single selectable filter bubble. */
export interface FilterTagOption<T extends string = string> {
	label: string;
	value: T;
}

export interface FilterTagsProps<T extends string = string> {
	/** Currently active value. */
	value: T;
	/** Available filter buckets. */
	options: FilterTagOption<T>[];
	/** Fired with the newly activated value. */
	onChange: (value: T) => void;
	className?: string;
	'aria-label'?: string;
}

/**
 * @function FilterTags
 * @description A row of inline pill buttons acting as a single-select filter
 * (e.g. `All` / `Images` / `Docs`). The active pill carries a subtle tinted
 * background; the rest stay ghosted until hovered.
 */
export function FilterTags<T extends string = string>(
	{ value, options, onChange, className, ...rest }: FilterTagsProps<T>,
): JSX.Element {
	return (
		<div class={`filter-tags ${className || ''}`} role='group' aria-label={rest['aria-label']}>
			{options.map((opt) => {
				const isActive = opt.value === value;
				return (
					<button
						key={opt.value}
						type='button'
						aria-pressed={isActive}
						class={`filter-tag ${isActive ? 'filter-tag--active' : ''}`}
						onClick={() => onChange(opt.value)}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}
