/*
 * @file permissions.ts
 * @description Zod schemas and TypeScript types for Projective's RBAC system.
 * This acts as the Single Source of Truth (SSOT) reflecting the Postgres ENUMs.
 */

// #region Imports
import { z } from 'zod';
// #endregion

// #region Team Permissions
/**
 * @constant TeamPermissionSchema
 * @description Zod schema for team-level permissions. Matches `org.team_permission` in Postgres.
 */
export const TeamPermissionSchema = z.enum([
	'manage_profile',
	'manage_portfolio',
	'manage_members',
	'manage_roles',
	'manage_services',
	'manage_projects',
	'send_messages',
	'manage_finances',
]);

/**
 * @typedef TeamPermission
 * @description Inferred TypeScript type for a single team permission.
 */
export type TeamPermission = z.infer<typeof TeamPermissionSchema>;

/**
 * @constant ALL_TEAM_PERMISSIONS
 * @description Convenience array containing all team permissions, typically used to assign 'Admin' roles.
 */
export const ALL_TEAM_PERMISSIONS: TeamPermission[] = [
	'manage_profile',
	'manage_portfolio',
	'manage_members',
	'manage_roles',
	'manage_services',
	'manage_projects',
	'send_messages',
	'manage_finances',
];
// #endregion

/**
 * @constant TeamRoleSchema
 * @description Base validation schema for a Team Role payload.
 */
export const TeamRoleSchema = z.object({
	id: z.uuid(),
	team_id: z.uuid(),
	name: z.string().min(1).max(50),
	permissions: z.array(TeamPermissionSchema),
	is_system: z.boolean(),
});

export type TeamRole = z.infer<typeof TeamRoleSchema>;
