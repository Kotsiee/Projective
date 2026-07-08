/**
 * @file _validation.ts
 * @description Zod schema for the Business Profile Management settings card (US-008 AC2). A partial
 * of the create schema — a business admin edits its display + legal name and billing email; the
 * administrative logo is handled out-of-band as a multipart file (uploaded through the files
 * pipeline, stored as `logo_file_id`).
 */

import { z } from 'zod';

export const UpdateBusinessSettingsSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	legal_name: z.string().min(2).max(150).optional(),
	billing_email: z.string().email().optional(),
});

export type UpdateBusinessSettingsInput = z.infer<typeof UpdateBusinessSettingsSchema>;
