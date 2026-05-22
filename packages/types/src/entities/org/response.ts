import { Identifiable, Timestamped } from '../core/base-response.ts';
import { BookmarkEntityType } from './enums.ts';

// #region 1. USER PREFERENCES
/**
 * @interface UserUISettings
 * @description Strongly typed structure for the JSONB ui_settings column.
 */
export interface UserUISettings {
	primary_color?: string;
	density?: 'compact' | 'normal' | 'spacious';
	sidebar_collapsed?: boolean;
}

/**
 * @interface UserPreferencesResponse
 * @description User configuration settings including dynamic UI elements.
 */
export interface UserPreferencesResponse {
	user_id: string;
	theme: 'light' | 'dark' | 'system';
	notification_email: boolean;
	notification_push: boolean;
	locale: string;
	ui_settings: UserUISettings;
}
// #endregion

// #region 2. BOOKMARKS
/**
 * @interface BookmarkResponse
 * @description Represents an item saved by the user for later reference.
 */
export interface BookmarkResponse extends Identifiable, Timestamped {
	user_id: string;
	entity_type: BookmarkEntityType;
	entity_id: string;
}
// #endregion
