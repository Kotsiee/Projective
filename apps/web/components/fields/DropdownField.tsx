import '@styles/components/fields/DropdownField.css';
import { Icon, IconChevronDown, IconX } from '@tabler/icons-preact';
import { Signal } from '@preact/signals';

export interface IDropdownItem {
	icon?: Icon | string;
	value: string;
	displayName?: string;
	label?: string;
}

export interface IDropdownFieldOptions {
	multiselect?: boolean;
	searchable?: boolean;
}

export interface IDropdownField {
	values: IDropdownItem[];
	defaultValues?: IDropdownItem[];
	selected?: Signal<IDropdownItem[]>;
	placeholder?: string;
	name?: string;
	options?: IDropdownFieldOptions;
}

export default function DropdownField(
	{ values, placeholder, selected, name, defaultValues, options }: IDropdownField,
) {
	const testClick = () => {
		console.log('dropdown-field__button click');
	};

	const testClick2 = () => {
		console.log('dropdown-field__selected__item__close click');
	};

	return (
		<div class='dropdown-field__container'>
			<div class='dropdown-field__input'>
				{
					/* <div class='dropdown-field__input__selected'>
					<div class='dropdown-field__input__selected__item'>
						<span>Value</span>
						<button
							type='button'
							class='dropdown-field__input__selected__item__close'
							onClick={() => testClick2()}
						>
							<IconX />
						</button>
					</div>
				</div> */
				}

				<button type='button' class='dropdown-field__input__button' onClick={() => testClick()}>
					{options?.searchable
						? (
							<input
								type='text'
								class='dropdown-field__input__button__input'
								placeholder={placeholder}
							/>
						)
						: <span class='dropdown-field__input__button__span'>{placeholder}</span>}

					<IconChevronDown />
				</button>
			</div>

			<div class='dropdown-field__selected__container'>
				<div class='dropdown-field__selected'>
					<div class='dropdown-field__selected__item'>
						<span>Value</span>
						<button
							type='button'
							class='dropdown-field__selected__item__close'
							onClick={() => testClick2()}
						>
							<IconX />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
