/**
 * @file base-response.ts
 * @description Core interfaces implementing Interface Segregation for API responses.
 */

// #region 1. BASE TRAITS
export type EntityType = 'project' | 'team' | 'person' | 'business' | 'service' | 'product';
export type ProfileType = 'team' | 'user' | 'business' | 'freelancer';

export interface Identifiable {
	id: string;
}

export interface Timestamped {
	created_at: string;
	updated_at?: string;
}

export interface Ratable {
	rating_average: number;
	rating_count: number;
}

export interface Ownable {
	owner_id: string;
	owner_type: ProfileType;
}

// NEW: Represents the JSON dictionary stored in files.items metadata
export interface ImageVariants {
	original: string | null;
	sm?: string | null;
	md?: string | null;
	lg?: string | null;
}
// #endregion

// #region 2. NORMALIZED PARTIAL RESPONSE (For Explore/Lists)
export interface PartialEntityResponse extends Identifiable, Timestamped, Ratable, Ownable {
	entity_type: EntityType;
	display_title: string;
	display_description: string | null;
	display_image: ImageVariants | null; // Swapped from display_image_url
	tags: string[];
}
// #endregion

// #region 3. SHARED SUB-ENTITIES
export interface BaseOwner {
	id: string;
	type: ProfileType;
	name: string;
	username_or_slug: string;
	avatar: ImageVariants | null; // Swapped from avatar_url
	banner: ImageVariants | null; // Swapped from banner_url
}
// #endregion
