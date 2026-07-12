/**
 * @file mod.ts
 * @description Public entry point for `@projective/types`. Schemas are partitioned by database
 * schema domain (core, org, projects, finance, security, ...) and re-exported here so consumers
 * import everything from the package root — never a deep path.
 */

// Core utilities
export * from './src/core/datetime.ts';
export * from './src/core/enums.ts';
export * from './src/core/base-response.ts';

// Auth & permissions (cross-cutting RBAC)
export * from './src/auth/permissions.ts';

// Domain: org
export * from './src/org/enums.ts';
export * from './src/org/response.ts';

// Domain: profile
// Note: `BusinessPermission` is intentionally not re-exported here — the canonical name belongs to
// the RBAC enum in ./src/auth/permissions.ts. The Zod-derived permission list stays available via
// BusinessPermissionSchema / ALL_BUSINESS_PERMISSIONS.
export * from './src/profile/response.ts';
export {
	ALL_BUSINESS_PERMISSIONS,
	BusinessPermissionSchema,
	type BusinessRole,
	BusinessRoleSchema,
} from './src/profile/business-permissions.ts';
export * from './src/profile/teams-permissions.ts';

// Domain: projects
export * from './src/projects/index.ts';

// Domain: session
export * from './src/session/enums.ts';
export * from './src/session/response.ts';

// Domain: marketplace
export * from './src/marketplace/response.ts';
export * from './src/marketplace/discovery.ts';
export * from './src/marketplace/cards.ts';
export * from './src/marketplace/home.ts';

// Domain: reviews
export * from './src/reviews/response.ts';

// Domain: finance
export * from './src/finance/index.ts';

// Domain: security
export * from './src/security/index.ts';

// Files
export * from './src/files/index.ts';
