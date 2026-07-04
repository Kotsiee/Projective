import '../styles/fields/toolbar-controls.css';
import { JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconCheck, IconChevronDown } from '@tabler/icons-preact';

/** A single choice in a {@link MenuSelect}. */
export interface MenuSelectOption<T extends string = string> {
	label: string;
	value: T;
}

export interface MenuSelectProps<T extends string = string> {
	/** Currently selected value. */
	value: T;
	/** Available choices. */
	options: MenuSelectOption<T>[];
	/** Fired with the newly picked value. */
	onChange: (value: T) => void;
	/** Optional muted prefix rendered before the value (e.g. `Sort by`). */
	prefix?: string;
	/** Optional leading icon (e.g. a sort glyph). */
	icon?: JSX.Element;
	/** Align the popover to the trigger's right edge instead of its left. */
	align?: 'left' | 'right';
	className?: string;
	'aria-label'?: string;
}

/**
 * @function MenuSelect
 * @description A minimal, chrome-light dropdown selector — a trigger showing the
 * current value with a down-chevron, opening a small popover of options. Built
 * for toolbars (e.g. `Sort by · Recent`), not forms; for full form semantics use
 * {@link SelectField}.
 */
export function MenuSelect<T extends string = string>(
	{ value, options, onChange, prefix, icon, align = 'left', className, ...rest }: MenuSelectProps<
		T
	>,
): JSX.Element {
	const open = useSignal(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selected = options.find((o) => o.value === value);
	const selectedLabel = selected?.label ?? String(value);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				open.value = false;
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const pick = (val: T) => {
		onChange(val);
		open.value = false;
	};

	return (
		<div class={`menu-select ${className || ''}`} ref={containerRef}>
			<button
				type='button'
				class='menu-select__trigger'
				aria-haspopup='listbox'
				aria-expanded={open.value}
				aria-label={rest['aria-label']}
				onClick={() => (open.value = !open.value)}
			>
				{icon && <span class='menu-select__lead'>{icon}</span>}
				{prefix && <span class='menu-select__prefix'>{prefix}</span>}
				<span class='menu-select__value'>{selectedLabel}</span>
				<span class={`menu-select__chevron ${open.value ? 'menu-select__chevron--open' : ''}`}>
					<IconChevronDown size={16} />
				</span>
			</button>

			{open.value && (
				<div
					class={`menu-select__menu ${align === 'right' ? 'menu-select__menu--right' : ''}`}
					role='listbox'
				>
					{options.map((opt) => {
						const isSelected = opt.value === value;
						return (
							<button
								key={opt.value}
								type='button'
								role='option'
								aria-selected={isSelected}
								class={`menu-select__option ${isSelected ? 'menu-select__option--selected' : ''}`}
								onClick={() => pick(opt.value)}
							>
								<span>{opt.label}</span>
								{isSelected && (
									<span class='menu-select__check'>
										<IconCheck size={15} />
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
