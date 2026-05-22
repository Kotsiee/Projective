// #region Imports
import { JSX } from 'preact';
import {
	IconBriefcase,
	IconCalendar,
	IconClock,
	IconCoin,
	IconFileCertificate,
	IconGlobe,
	IconLanguage,
	IconMapPin,
	IconStack,
	IconTag,
} from '@tabler/icons-preact';
import { ViewEntityType } from '../../contexts/ViewContext.tsx';
import { DateTime } from '@projective/types';
import { StringModifier } from '@projective/utils';
// #endregion

// #region 1. Types & Interfaces

/**
 * Supported data types for metadata rendering.
 */
export type MetaDataType =
	| 'string'
	| 'number'
	| 'currency'
	| 'date'
	| 'daterange'
	| 'time'
	| 'tags'
	| 'boolean'
	| 'custom';

/**
 * Defines how a specific piece of metadata should be extracted, formatted, and displayed.
 */
export interface MetaFieldDefinition {
	/** Unique identifier for the meta field */
	id: string;
	/** The human-readable label */
	label: string;
	/** The key mapping to the icon registry */
	icon?: keyof typeof metaIcons;
	/** The data type used to determine formatting */
	type: MetaDataType;
	/** * The direct object key to extract from the data payload.
	 * Overridden by `getValue` if both are provided.
	 */
	key?: string;
	/** * A custom extraction function for complex or derived values
	 * (e.g., combining start and end dates).
	 */
	// deno-lint-ignore no-explicit-any
	getValue?: (data: any) => any;
	/** Fallback text if the value is null or undefined */
	fallback?: string;
}

// #endregion

// #region 2. Icons & Assets

export const metaIcons: Record<string, JSX.Element> = {
	location: <IconMapPin size={18} />,
	language: <IconLanguage size={18} />,
	currency: <IconCoin size={18} />,
	time: <IconClock size={18} />,
	date: <IconCalendar size={18} />,
	stage: <IconStack size={18} />,
	stageType: <IconBriefcase size={18} />,
	project: <IconBriefcase size={18} />,
	projectType: <IconBriefcase size={18} />,
	tags: <IconTag size={18} />,
	globe: <IconGlobe size={18} />,
	certificate: <IconFileCertificate size={18} />,
};

// #endregion

// #region 3. Formatters

/**
 * Formats a raw value based on its designated MetaDataType.
 * @param value The raw value extracted from the entity data.
 * @param type The target formatting type.
 * @returns A string or JSX element ready for rendering.
 */
// deno-lint-ignore no-explicit-any
export function formatMetaValue(value: any, type: MetaDataType): string | JSX.Element {
	if (value === null || value === undefined || value === '') {
		return 'Not specified';
	}

	switch (type) {
		case 'currency': {
			const amount = typeof value === 'number' ? value : parseFloat(value);
			if (isNaN(amount)) return String(value);
			// Assuming cents mapping if it's a backend value, adjust if dealing in dollars natively
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount > 1000 ? amount / 100 : amount);
			return formatted;
		}

		case 'date': {
			try {
				return DateTime.fromISO(String(value)).toFormat('D MMM, yyyy');
			} catch {
				return String(value);
			}
		}

		case 'daterange': {
			// Expects value to be an array or object containing start/end
			const start = value.start || value[0];
			const end = value.end || value[1];

			if (!start && !end) return 'TBD';

			const formattedStart = start ? formatMetaValue(start, 'date') : 'TBD';
			const formattedEnd = end ? formatMetaValue(end, 'date') : 'TBD';

			return `${formattedStart} — ${formattedEnd}`;
		}

		case 'tags': {
			if (!Array.isArray(value)) return StringModifier.titleCase(String(value));
			return value.map((v) => StringModifier.titleCase(String(v))).join(', ');
		}

		case 'boolean': {
			return value ? 'Yes' : 'No';
		}

		case 'string':
			// Automatically fix snake_case enum values and apply Title Case
			return StringModifier.titleCase(String(value).replace(/_/g, ' '));

		case 'number':
		default:
			return String(value);
	}
}

// #endregion

// #region 4. Entity Schemas

/**
 * Central registry mapping ViewEntityTypes to their respective metadata schemas.
 */
export const entityMetaSchemas: Record<string, MetaFieldDefinition[]> = {
	project: [
		{
			id: 'status',
			label: 'Status',
			icon: 'project',
			type: 'string',
			key: 'status',
			// getValue removed as the formatMetaValue 'string' handler natively fixes the casing
		},
		{
			id: 'format',
			label: 'Project Format',
			icon: 'projectType',
			type: 'string',
			key: 'format',
		},
		{
			id: 'timeline',
			label: 'Target Timeline',
			icon: 'date',
			type: 'daterange',
			getValue: (data) => ({
				start: data.target_project_start_date,
				end: data.target_project_end_date,
			}),
		},
		{
			id: 'location',
			label: 'Location Restrictions',
			icon: 'location',
			type: 'tags',
			key: 'locations',
			fallback: 'Global / Remote',
		},
		{
			id: 'language',
			label: 'Languages',
			icon: 'language',
			type: 'tags',
			key: 'languages',
		},
		{
			id: 'ip_ownership',
			label: 'IP Ownership Mode',
			icon: 'certificate',
			type: 'string',
			key: 'ip_ownership_mode',
		},
		{
			id: 'nda',
			label: 'NDA Required',
			icon: 'certificate',
			type: 'boolean',
			key: 'nda_required',
		},
	],
	person: [
		{
			id: 'location',
			label: 'Location',
			icon: 'location',
			type: 'string',
			key: 'location',
		},
		{
			id: 'hourly_rate',
			label: 'Hourly Rate',
			icon: 'currency',
			type: 'currency',
			key: 'metadata.hourly_rate',
		},
		{
			id: 'language',
			label: 'Languages',
			icon: 'language',
			type: 'tags',
			key: 'metadata.languages',
		},
	],
};

/**
 * Retrieves the defined schema for a given entity type.
 */
export function getMetaSchemaForEntity(type: ViewEntityType | null): MetaFieldDefinition[] {
	if (!type) return [];
	return entityMetaSchemas[type] || [];
}

// #endregion
