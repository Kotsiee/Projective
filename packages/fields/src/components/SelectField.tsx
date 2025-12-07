import '../styles/fields/select-field.css';
import { computed, Signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { SelectFieldProps, SelectOption } from '../types/components/select-field.ts';
import { FlatOption, useSelectState } from '../hooks/useSelectState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper, useRipple } from '../wrappers/EffectWrapper.tsx';

export function SelectField<T = string>(props: SelectFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		multiple,
		searchable,
		clearable,
		loading,
		displayMode = 'chips-inside',
		enableSelectAll,
		groupSelectMode = 'value',
		icons,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const { ripples, addRipple } = useRipple();

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	} = useSelectState({
		options,
		value,
		onChange,
		multiple,
		disabled: !!isDisabled,
		groupSelectMode,
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			if (containerRef.current.classList.contains('field-select--up')) {
				if (spaceBelow > 250) containerRef.current.classList.remove('field-select--up');
			} else {
				if (spaceBelow < 250) containerRef.current.classList.add('field-select--up');
			}

			if (searchable && inputRef.current) {
				inputRef.current.focus();
			}

			if (listRef.current && highlightedIndex.value >= 0) {
				const highlightedEl = listRef.current.children[highlightedIndex.value] as HTMLElement;
				if (highlightedEl) {
					highlightedEl.scrollIntoView({ block: 'nearest' });
				}
			}
		}
	}, [isOpen.value, highlightedIndex.value]);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// --- Render Helpers ---

	// Find the label for a value by searching the flattened list
	// We construct a temporary map or search on fly.
	// For performance in large lists, a map is better, but here we scan.
	const getLabelForValue = (val: T) => {
		const findInTree = (opts: SelectOption<T>[]): SelectOption<T> | undefined => {
			for (const o of opts) {
				if (o.value === val) return o;
				if (o.options) {
					const found = findInTree(o.options);
					if (found) return found;
				}
			}
			return undefined;
		};
		const opt = findInTree(options);
		return opt ? opt.label : String(val);
	};

	const renderStatusIcon = () => {
		if (loading) return icons?.loading || <IconLoader2 className='field-select__spin' size={18} />;
		if (errorMessage) return icons?.invalid;
		if (isOpen.value) return icons?.arrowOpen || <IconChevronDown size={18} />;
		return icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.value.map((val) => {
			const label = getLabelForValue(val);
			return (
				<span key={String(val)} className='field-select__chip'>
					{label}
					<span
						className='field-select__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						{icons?.remove || <IconX size={14} />}
					</span>
				</span>
			);
		});
	};

	const renderValue = () => {
		if (displayMode === 'count' && selectedValues.value.length > 0) {
			return <span className='field-select__summary'>{selectedValues.value.length} selected</span>;
		}

		if (multiple && displayMode === 'chips-inside') {
			return renderChips();
		}

		if (!multiple && selectedValues.value.length > 0) {
			const val = selectedValues.value[0];
			const label = getLabelForValue(val);
			// Find object for icon/avatar
			// Simple flatten for lookup
			// const opt = ... (Optimization: useSelectState could expose a value map)

			if (searchable && searchQuery.value) return null;
			return (
				<div className='field-select__single'>
					{label}
				</div>
			);
		}

		return null;
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		if (searchable && isOpen.value && e.target === inputRef.current) return;

		addRipple(e);
		toggleOpen();
		if (!isOpen.value) interaction.handleFocus(e);
	};

	return (
		<div
			className={`field-select ${className || ''}`}
			style={style}
			ref={containerRef}
		>
			<LabelWrapper
				id={id}
				label={label}
				active={isOpen.value || selectedValues.value.length > 0 || !!placeholder ||
					!!searchQuery.value}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<div
				className={[
					'field-select__container',
					isOpen.value && 'field-select__container--open',
					interaction.focused.value && 'field-select__container--focused',
					errorMessage && 'field-select__container--error',
					isDisabled && 'field-select__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
				onMouseDown={(e) => {
					if (e.target !== inputRef.current) e.preventDefault();
				}}
			>
				<EffectWrapper focused={interaction.focused} disabled={isDisabled} />

				<div
					className='field-ripple-container'
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'hidden',
						pointerEvents: 'none',
						borderRadius: 'inherit',
					}}
				>
					{ripples.value.map((r) => (
						<span key={r.id} className='field-ripple' style={{ left: r.x, top: r.y }} />
					))}
				</div>

				<div className='field-select__content'>
					{renderValue()}

					{(searchable || (selectedValues.value.length === 0 && placeholder)) && (
						<input
							ref={inputRef}
							className='field-select__input'
							value={searchQuery.value}
							placeholder={selectedValues.value.length === 0
								? (placeholder || (floating ? '' : 'Select...'))
								: ''}
							onInput={(e) => searchQuery.value = e.currentTarget.value}
							onKeyDown={handleKeyDown}
							onFocus={interaction.handleFocus}
							onBlur={() => {
								setTimeout(() => interaction.handleBlur(), 100);
							}}
							disabled={!!isDisabled}
							readOnly={!searchable}
						/>
					)}
				</div>

				{clearable && !loading && selectedValues.value.length > 0 && (
					<div
						className='field-select__clear'
						onClick={(e) => {
							e.stopPropagation();
							if (multiple) {
								if (value instanceof Signal) value.value = [];
								onChange?.([]);
							} else {
								if (value instanceof Signal) value.value = undefined as any;
								onChange?.(undefined as any);
							}
						}}
					>
						<IconX size={16} />
					</div>
				)}

				<div className={`field-select__arrow ${isOpen.value ? 'field-select__arrow--flip' : ''}`}>
					{renderStatusIcon()}
				</div>

				{/* Dropdown Menu */}
				<div
					className={`field-select__menu ${isOpen.value ? 'field-select__menu--open' : ''}`}
					ref={listRef}
				>
					{multiple && enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='field-select__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>Select All</span>
						</div>
					)}

					{filteredOptions.value.length === 0
						? <div className='field-select__no-options'>No options found</div>
						: (
							filteredOptions.value.map((option, index) => {
								const isHighlighted = index === highlightedIndex.value;

								// Selection Check Logic
								let isSelected = false;
								if (option.isGroup && groupSelectMode === 'members' && multiple) {
									// Group is selected if all descendants are selected
									isSelected = option.descendantValues.length > 0 &&
										option.descendantValues.every((v) => selectedValues.value.includes(v));
								} else {
									isSelected = selectedValues.value.includes(option.value);
								}

								return (
									<div
										key={String(option.value) + index}
										className={[
											'field-select__option',
											isSelected && 'field-select__option--selected',
											isHighlighted && 'field-select__option--highlighted',
											option.disabled && 'field-select__option--disabled',
											option.isGroup && 'field-select__option--group',
										].filter(Boolean).join(' ')}
										style={{ paddingLeft: `${(option.depth * 12) + 12}px` }} // Indentation
										onClick={(e) => {
											e.stopPropagation();
											selectOption(option);
										}}
										onMouseEnter={() => highlightedIndex.value = index}
									>
										{option.icon && (
											<span className='field-select__option-icon'>{option.icon}</span>
										)}
										{option.avatarUrl && (
											<img src={option.avatarUrl} className='field-select__avatar' />
										)}

										<span className='field-select__option-label'>{option.label}</span>

										{isSelected && (
											<span className='field-select__check'>
												{icons?.check || <IconCheck size={16} />}
											</span>
										)}
									</div>
								);
							})
						)}
				</div>
			</div>

			{/* Chips Below Mode */}
			{multiple && displayMode === 'chips-below' && selectedValues.value.length > 0 && (
				<div className='field-select__chips-external'>
					{renderChips()}
				</div>
			)}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
