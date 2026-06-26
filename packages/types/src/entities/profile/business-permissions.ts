/*
 * @file permissions.ts
 * @description Zod schemas and TypeScript types for Projective's RBAC system.
 * This acts as the Single Source of Truth (SSOT) reflecting the Postgres ENUMs.
 */

// #region Imports
import { z } from 'zod';
// #endregion

// #region Business Permissions
/**
 * @constant BusinessPermissionSchema
 * @description Zod schema for business-level permissions. Matches `org.business_permission` in Postgres.
 */
export const BusinessPermissionSchema = z.enum([
	'manage_profile',
	'manage_members',
	'manage_roles',
	'manage_hiring',
	'manage_projects',
	'manage_billing',
	'manage_escrow',
]);

/**
 * @typedef BusinessPermission
 * @description Inferred TypeScript type for a single business permission.
 */
export type BusinessPermission = z.infer<typeof BusinessPermissionSchema>;

/**
 * @constant ALL_BUSINESS_PERMISSIONS
 * @description Convenience array containing all business permissions, typically used to assign 'Admin' roles.
 */
export const ALL_BUSINESS_PERMISSIONS: BusinessPermission[] = [
	'manage_profile',
	'manage_members',
	'manage_roles',
	'manage_hiring',
	'manage_projects',
	'manage_billing',
	'manage_escrow',
];
// #endregion

// #region RBAC Roles
/**
 * @constant BusinessRoleSchema
 * @description Base validation schema for a Business Role payload.
 */
export const BusinessRoleSchema = z.object({
	id: z.uuid(),
	business_profile_id: z.uuid(),
	name: z.string().min(1).max(50),
	permissions: z.array(BusinessPermissionSchema),
	is_system: z.boolean(),
});

export type BusinessRole = z.infer<typeof BusinessRoleSchema>;
// #endregion
