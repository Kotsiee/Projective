// #region Imports
import { useViewContext } from '../../contexts/ViewContext.tsx';
import { Skeleton } from '@projective/ui';
import {
	formatMetaValue,
	getMetaSchemaForEntity,
	MetaFieldDefinition,
	metaIcons,
} from './meta.tsx';
import '../../styles/components/view/view-meta.css';
// #endregion

/**
 * @function ViewMeta
 * @description Renders a sticky sidebar pane displaying structured metadata
 * mapped dynamically based on the current entity type.
 */
export default function ViewMeta() {
	const { entityType, data, isLoading } = useViewContext();

	// #region 1. Data Extraction
	const schema = getMetaSchemaForEntity(entityType.value);

	/**
	 * Extracts the raw value from the entity payload using either the custom `getValue`
	 * function or traversing the object via the string `key`.
	 */
	// deno-lint-ignore no-explicit-any
	const extractValue = (def: MetaFieldDefinition, payload: any) => {
		if (def.getValue) return def.getValue(payload);
		if (!def.key || !payload) return null;

		// Handle basic dot notation for nested keys (e.g., 'metadata.hourly_rate')
		return def.key.split('.').reduce((acc, curr) => (acc ? acc[curr] : null), payload);
	};
	// #endregion

	// #region 2. Loading State
	if (isLoading.value) {
		return (
			<div className='view-meta'>
				<h4 className='view-meta__title'>
					<Skeleton variant='text' width='100px' height='1.25rem' />
				</h4>
				<ul className='view-meta__list'>
					{[1, 2, 3, 4, 5].map((i) => (
						<li key={i} className='view-meta__item'>
							<div className='view-meta__item-icon'>
								<Skeleton
									variant='avatar'
									width='24px'
									height='24px'
									style={{ borderRadius: '4px' }}
								/>
							</div>
							<div className='view-meta__item-content'>
								<Skeleton
									variant='text'
									width='80px'
									height='0.75rem'
									style={{ marginBottom: '4px' }}
								/>
								<Skeleton variant='text' width='140px' height='1rem' />
							</div>
						</li>
					))}
				</ul>
			</div>
		);
	}
	// #endregion

	// #region 3. Empty Guard
	if (schema.length === 0 || !data.value) {
		return null;
	}
	// #endregion

	return (
		<div className='view-meta'>
			<ul className='view-meta__list'>
				{schema.map((def) => {
					const rawValue = extractValue(def, data.value);

					// Skip rendering if value is completely absent and no fallback is provided
					if ((rawValue === null || rawValue === undefined || rawValue === '') && !def.fallback) {
						return null;
					}

					const displayValue = (rawValue !== null && rawValue !== undefined && rawValue !== '')
						? formatMetaValue(rawValue, def.type)
						: def.fallback;

					return (
						<li key={def.id} className='view-meta__item'>
							{def.icon && metaIcons[def.icon] && (
								<div className='view-meta__item-icon' aria-hidden='true'>
									{metaIcons[def.icon]}
								</div>
							)}
							<div className='view-meta__item-content'>
								<span className='view-meta__item-label'>{def.label}</span>
								<span className='view-meta__item-value'>{displayValue}</span>
							</div>
						</li>
					);
				})}
			</ul>

			<div className='view-meta__actions'>
				{/* Reserved area for secondary actions (e.g. Report Listing) */}
			</div>
		</div>
	);
}
