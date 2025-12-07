import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import '../styles/wrappers/field-array-wrapper.css';

interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}

export function FieldArrayWrapper<T>(props: FieldArrayWrapperProps<T>) {
	const items = props.items instanceof Signal ? props.items.value : props.items;

	return (
		<div className={`field-array ${props.className || ''}`}>
			{items.map((item, index) => (
				<div key={index} className='field-array__item'>
					<div style={{ flex: 1 }}>
						{props.renderItem(item, index)}
					</div>
					{props.onRemove && (
						<div className='field-array__action'>
							{props.renderRemoveButton
								? (
									props.renderRemoveButton(() => props.onRemove!(index))
								)
								: (
									<button
										type='button'
										onClick={() => props.onRemove!(index)}
										className='field-array__remove-btn'
										aria-label='Remove item'
									>
										&times;
									</button>
								)}
						</div>
					)}
				</div>
			))}

			{props.onAdd &&
				(!props.maxItems || items.length < props.maxItems) && (
				<div className='field-array__add'>
					{props.renderAddButton
						? (
							props.renderAddButton(props.onAdd)
						)
						: (
							<button
								type='button'
								onClick={props.onAdd}
								className='field-array__add-btn'
							>
								+ Add Item
							</button>
						)}
				</div>
			)}
		</div>
	);
}
