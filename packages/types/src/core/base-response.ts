import { z } from 'zod';

// #region 1. BASE TRAITS & ENUMS

export const EntityTypeSchema = z.enum([
	'project',
	'team',
	'person',
	'business',
	'service',
	'product',
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const ProfileTypeSchema = z.enum(['team', 'user', 'business', 'freelancer']);
export type ProfileType = z.infer<typeof ProfileTypeSchema>;

export const IdentifiableSchema = z.object({
	id: z.uuid(),
});
export type Identifiable = z.infer<typeof IdentifiableSchema>;

export const TimestampedSchema = z.object({
	created_at: z.string().datetime({}),
	updated_at: z.string().datetime({}).optional(),
});
export type Timestamped = z.infer<typeof TimestampedSchema>;

export const RatableSchema = z.object({
	rating_average: z.number().min(0).max(5),
	rating_count: z.number().int().nonnegative(),
});
export type Ratable = z.infer<typeof RatableSchema>;

export const OwnableSchema = z.object({
	owner_id: z.uuid(),
	owner_type: ProfileTypeSchema,
});
export type Ownable = z.infer<typeof OwnableSchema>;

export const ImageVariantsSchema = z.object({
	original: z.string().url().nullable(),
	sm: z.string().url().nullable().optional(),
	md: z.string().url().nullable().optional(),
	lg: z.string().url().nullable().optional(),
});
export type ImageVariants = z.infer<typeof ImageVariantsSchema>;

export const BaseOwnerSchema = z.object({
	profile_id: z.uuid(),
	display_name: z.string().min(1),
	avatar_image: ImageVariantsSchema.nullable(),
});
export type BaseOwner = z.infer<typeof BaseOwnerSchema>;

// #endregion

// #region 2. NORMALIZED PARTIAL RESPONSE (For Explore/Lists)

export const PartialEntityResponseSchema = IdentifiableSchema
	.merge(TimestampedSchema)
	.merge(RatableSchema)
	.merge(OwnableSchema)
	.extend({
		entity_type: EntityTypeSchema,
		display_title: z.string().min(1),
		display_description: z.string().nullable(),
		display_image: ImageVariantsSchema.nullable(),
		tags: z.array(z.string()).default([]),
	});
export type PartialEntityResponse = z.infer<typeof PartialEntityResponseSchema>;

// #endregion
