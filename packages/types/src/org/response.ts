import { z } from 'zod';
import { BookmarkEntityType } from './enums.ts';
import { IdentifiableSchema, TimestampedSchema } from '../core/base-response.ts';

export const UserUISettingsSchema = z.object({
	primary_color: z.string().optional(),
	density: z.enum(['compact', 'normal', 'spacious']).optional(),
	sidebar_collapsed: z.boolean().optional(),
});
export type UserUISettings = z.infer<typeof UserUISettingsSchema>;

export const UserPreferencesResponseSchema = z.object({
	user_id: z.uuid(),
	theme: z.enum(['light', 'dark', 'system']),
	notification_email: z.boolean(),
	notification_push: z.boolean(),
	locale: z.string().min(1),
	ui_settings: UserUISettingsSchema,
});
export type UserPreferencesResponse = z.infer<typeof UserPreferencesResponseSchema>;

export const BookmarkResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		user_id: z.uuid(),
		entity_type: z.enum(Object.values(BookmarkEntityType) as [string, ...string[]]),
		entity_id: z.uuid(),
	});
export type BookmarkResponse = z.infer<typeof BookmarkResponseSchema>;
