import '@styles/components/fields/SelectField.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { useSelectState } from '@hooks/fields/useSelectState.ts';
import { BaseFieldProps, SelectFieldConfig, SelectOption } from '@projective/types';

interface SelectFieldProps extends BaseFieldProps, SelectFieldConfig {
	options: SelectOption[];
}

export default function SelectField(props: SelectFieldProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [menuPosition, setMenuPosition] = useState<'down' | 'up'>('down');

	const sortedOptions = useMemo(() => {
		return [...props.options].sort((a, b) => {
			if (!a.group && !b.group) return 0;
			if (!a.group) return -1;
			if (!b.group) return 1;
			return a.group.localeCompare(b.group);
		});
	}, [props.options]);

	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		selectedValues,
		toggleSelectAll,
		selectOption,
		removeValue,
		handleKeyDown,
		toggleOpen,
	} = useSelectState({
		options: sortedOptions,
		value: props.value,
		onChange: props.onChange,
		multiple: props.multiple,
		disabled: props.disabled,
	});

	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = globalThis.innerHeight - rect.bottom;
			setMenuPosition(spaceBelow < 250 ? 'up' : 'down');

			if (inputRef.current) inputRef.current.focus();

			if (listRef.current) {
				const selectedEl = listRef.current.querySelector(
					'.select-field__option--selected, .select-field__option--highlighted',
				);
				if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
			}
		}
	}, [isOpen.value, highlightedIndex.value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [toggleOpen]);

	const getStatusIcon = () => {
		if (props.loading) {
			return props.icons?.loading || <IconLoader2 size={18} className='select-field__spin' />;
		}
		if (props.error && props.icons?.invalid) return props.icons.invalid;
		if (props.success && props.icons?.valid) return props.icons.valid;
		if (isOpen.value) return props.icons?.arrowOpen || <IconChevronDown size={18} />;
		return props.icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.map((val) => {
			const opt = props.options.find((o) => o.value === val);
			if (!opt) return null;
			return (
				<span key={val} className='select-field__chip'>
					{opt.label}
					<span
						className='select-field__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						<IconX size={14} />
					</span>
				</span>
			);
		});
	};

	const renderSelectionContent = () => {
		if (props.displayMode === 'count' && selectedValues.length > 0) {
			return <span className='select-field__summary'>{selectedValues.length} selected</span>;
		}

		if (props.multiple && (!props.displayMode || props.displayMode === 'chips-inside')) {
			return <>{renderChips()}</>;
		}

		if (!props.multiple && selectedValues.length > 0 && searchQuery.value === '') {
			const opt = props.options.find((o) => o.value === selectedValues[0]);
			return opt ? <div className='select-field__single-value'>{opt.label}</div> : null;
		}

		return null;
	};

	const renderDropdownContent = () => {
		if (filteredOptions.value.length === 0) {
			return <div className='select-field__no-options'>No options found</div>;
		}

		let lastGroup: string | undefined = undefined;

		return filteredOptions.value.map((option, index) => {
			const isSelected = selectedValues.includes(option.value);
			const isHighlighted = index === highlightedIndex.value;
			const showHeader = option.group !== lastGroup;
			lastGroup = option.group;

			return (
				<div key={option.value}>
					{showHeader && option.group && (
						<div className='select-field__group-label'>{option.group}</div>
					)}

					<div
						role='option'
						aria-selected={isSelected}
						className={`select-field__option 
                 ${isSelected ? 'select-field__option--selected' : ''} 
                 ${isHighlighted ? 'select-field__option--highlighted' : ''}
                 ${option.disabled ? 'select-field__option--disabled' : ''}
               `}
						onClick={(e) => {
							e.stopPropagation();
							selectOption(option);
						}}
						onMouseEnter={() => highlightedIndex.value = index}
					>
						<div className='select-field__opt-content'>
							{option.icon && <span className='select-field__icon'>{option.icon}</span>}
							{option.avatarUrl && <img src={option.avatarUrl} className='select-field__avatar' />}
							<span>{option.label}</span>
						</div>
						{isSelected && <IconCheck size={16} className='select-field__check' />}
					</div>
				</div>
			);
		});
	};

	const containerClasses = [
		'select-field',
		props.className,
		isOpen.value ? 'select-field--open' : '',
		props.disabled ? 'select-field--disabled' : '',
		props.error ? 'select-field--error' : '',
		props.success ? 'select-field--success' : '',
		`select-field--pos-${menuPosition}`,
	].filter(Boolean).join(' ');

	// --- FIX: Logic to determine if "All Enabled" are selected ---
	const areAllEnabledSelected = (() => {
		if (!props.multiple) return false;
		const enabledOptions = filteredOptions.value.filter((o) => !o.disabled);
		if (enabledOptions.length === 0) return false;
		return enabledOptions.every((o) => selectedValues.includes(o.value));
	})();

	return (
		<div className={containerClasses} ref={containerRef}>
			{props.label && (
				<label className='select-field__label' htmlFor={props.id}>
					{props.label} {props.required && <span className='select-field__req'>*</span>}
				</label>
			)}

			<div
				className='select-field__wrapper'
				onMouseDown={(e) => {
					if (e.target !== inputRef.current) {
						e.preventDefault();
						toggleOpen();
					}
				}}
			>
				<div className='select-field__content'>
					{renderSelectionContent()}

					<input
						ref={inputRef}
						id={props.id}
						className='select-field__input'
						type='text'
						value={searchQuery.value}
						placeholder={selectedValues.length === 0 ? props.placeholder : ''}
						onInput={(e) => setSearchQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
						onClick={() => toggleOpen(true)}
						onFocus={() => toggleOpen(true)}
						disabled={props.disabled}
						readOnly={!props.searchable}
						style={{
							opacity: (!props.multiple && selectedValues.length > 0 && !searchQuery.value) ? 0 : 1,
						}}
					/>
				</div>

				<div className='select-field__indicators'>
					{!props.loading && props.clearable && selectedValues.length > 0 && (
						<button
							type='button'
							className='select-field__clear'
							onMouseDown={(e) => {
								e.stopPropagation();
								props.onChange?.(props.multiple ? [] : null);
							}}
						>
							<IconX size={16} />
						</button>
					)}

					<div
						className={`select-field__arrow ${
							isOpen.value && !props.loading ? 'select-field__arrow--flip' : ''
						}`}
					>
						{getStatusIcon()}
					</div>
				</div>
			</div>

			{props.multiple && props.displayMode === 'chips-below' && selectedValues.length > 0 && (
				<div className='select-field__chips-external'>
					{renderChips()}
				</div>
			)}

			{isOpen.value && !props.disabled && (
				<div
					className='select-field__menu'
					ref={listRef}
					role='listbox'
					onMouseDown={(e) => e.preventDefault()}
				>
					{props.multiple && props.enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='select-field__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>
								{areAllEnabledSelected ? 'Deselect All' : 'Select All'}
							</span>
						</div>
					)}

					{renderDropdownContent()}
				</div>
			)}

			{props.error && <div className='select-field__msg-error'>{props.error}</div>}
		</div>
	);
}
