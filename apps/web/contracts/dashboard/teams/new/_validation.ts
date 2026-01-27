import { z } from 'zod';
import { Visibility } from '@projective/types';

const QuillDeltaSchema = z.object({
	ops: z.array(
		z.object({
			insert: z.union([
				z.string(),
				z.record(z.string(), z.any()),
			]),
			attributes: z.record(z.string(), z.any()).optional(),
		}),
	),
});

const TeamInviteSchema = z.object({
	email: z.string().email('Invalid email address'),
	role: z.enum(['admin', 'member', 'observer']),
});

export const CreateTeamSchema = z.object({
	name: z.string()
		.min(3, 'Team name must be at least 3 characters')
		.max(100, 'Team name is too long'),

	slug: z.string()
		.min(3, 'Handle must be at least 3 characters')
		.max(50, 'Handle is too long')
		.regex(/^[a-z0-9-]+$/, 'Handle can only contain lowercase letters, numbers, and hyphens'),

	description: QuillDeltaSchema.optional(),

	avatar_url: z.string().url().optional().or(z.literal('')),

	visibility: z.nativeEnum(Visibility).default(Visibility.InviteOnly),

	payout_model: z.enum(['manager_discretion', 'smart_split'])
		.default('manager_discretion'),

	default_payout_settings: z.record(z.string(), z.any()).optional(),

	invites: z.array(TeamInviteSchema).optional().default([]),
});

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type TeamInviteInput = z.infer<typeof TeamInviteSchema>;
