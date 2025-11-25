import { ExploreSubcategory } from './IExploreCategories.ts';
import { ProjectStatus } from './IExploreFilters.ts';

export interface ExploreUploader {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	profileSlug?: string;
}

// ---- Common item base ----

export interface ExploreItemBase {
	id: string;
	slug?: string;
	subcategory: ExploreSubcategory;
	name: string; // item name/title
	imageUrl: string | null;
	uploader: ExploreUploader;
}

// ---- Meta building blocks ----

export interface RatingMeta {
	rating: number | null; // 0–5 , null if no ratings yet
	ratingCount: number;
}

export interface PriceMeta extends RatingMeta {
	priceCents: number;
	currency: string; // 'GBP', 'USD', etc.
	originalPriceCents?: number; // for discounts
	isDiscounted?: boolean;
}

export interface TemplateMeta extends RatingMeta {
	description: string;
}

export interface ArticleMeta extends RatingMeta {
	estimatedReadTimeMinutes: number;
}

export interface ProjectMeta {
	durationDays: number;
	status: ProjectStatus;
}

export interface FreelancerTeamMeta extends RatingMeta {
	serviceCount: number;
	productCount: number;
	headline: string;
}

// ---- Items per subcategory ----

// Services: rating, number of ratings, price
export interface ServiceExploreItem extends ExploreItemBase {
	subcategory: 'services';
	meta: PriceMeta;
}

// Products: rating, number of ratings, price
export interface ProductExploreItem extends ExploreItemBase {
	subcategory: 'products';
	meta: PriceMeta;
}

// Courses: rating, number of ratings, price
export interface CourseExploreItem extends ExploreItemBase {
	subcategory: 'courses';
	meta: PriceMeta;
}

// Templates: rating, number of ratings, description
export interface TemplateExploreItem extends ExploreItemBase {
	subcategory: 'templates';
	meta: TemplateMeta;
}

// Articles: rating, number of ratings, estimated read time
export interface ArticleExploreItem extends ExploreItemBase {
	subcategory: 'articles';
	meta: ArticleMeta;
}

// Projects: duration and status
export interface ProjectExploreItem extends ExploreItemBase {
	subcategory: 'projects';
	meta: ProjectMeta;
}

// Freelancers: rating, number of ratings, number of services, number of products, headline
export interface FreelancerExploreItem extends ExploreItemBase {
	subcategory: 'freelancers';
	meta: FreelancerTeamMeta;
}

// Teams: rating, number of ratings, number of services, number of products, headline
export interface TeamExploreItem extends ExploreItemBase {
	subcategory: 'teams';
	meta: FreelancerTeamMeta;
}

// Union of all possible explore items
export type ExploreItem =
	| ServiceExploreItem
	| ProductExploreItem
	| CourseExploreItem
	| TemplateExploreItem
	| ArticleExploreItem
	| ProjectExploreItem
	| FreelancerExploreItem
	| TeamExploreItem;
