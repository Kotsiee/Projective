// packages/lib/search/explore/explore-filters.ts
// Explore-specific filter models (no request/response shapes here).

// ---- Filter atoms ----

export interface PriceRangeFilter {
	minPriceCents?: number;
	maxPriceCents?: number;
	currency?: string; // 'GBP', 'USD', etc.
}

export interface HourlyRateFilter {
	minHourlyRateCents?: number;
	maxHourlyRateCents?: number;
	currency?: string;
}

export interface RatingFilter {
	minRating?: number; // 1–5
	maxRating?: number; // rarely used but available
}

export interface LocationFilter {
	countries?: string[]; // ISO codes or canonical names
	timezones?: string[]; // 'Europe/London', etc.
	remoteOnly?: boolean;
}

export interface LanguageFilter {
	languages?: string[]; // matches your text[] language fields
}

export interface SkillsFilter {
	skills?: string[]; // skill slugs/ids
	minSkillScore?: number; // optional if you ever store skill proficiency
}

export interface AvailabilityFilter {
	availability?:
		| 'immediate'
		| 'thisWeek'
		| 'nextWeek'
		| 'scheduled';
}

export interface MetaFilter {
	minCompletedProjects?: number;
	minSales?: number;
}

export interface BudgetRangeFilter {
	minBudgetCents?: number;
	maxBudgetCents?: number;
	currency?: string;
}

// ---- Work (services / freelancers / teams) ----

export interface WorkBaseFilters
	extends
		PriceRangeFilter,
		RatingFilter,
		LocationFilter,
		LanguageFilter,
		SkillsFilter,
		AvailabilityFilter,
		MetaFilter {
	topics?: string[]; // 'design', 'marketing', etc.
}

export interface ServicesFilters extends WorkBaseFilters {
	serviceCategoryIds?: string[]; // taxonomy table / search topics
	durationMinutesMax?: number; // for calls / sessions
}

export interface FreelancerFilters extends WorkBaseFilters {
	minHourlyRateCents?: number;
	maxHourlyRateCents?: number;
	minPortfolioItems?: number;
}

export interface TeamFilters extends WorkBaseFilters {
	minTeamSize?: number;
	maxTeamSize?: number;
	requireMultipleRoles?: boolean;
}

// ---- Resources (templates / products / articles / courses) ----

export interface ResourceBaseFilters extends PriceRangeFilter, RatingFilter, LanguageFilter {
	topics?: string[];
	formats?: string[]; // 'figma', 'pdf', 'notion', 'video', etc.
}

export interface TemplatesFilters extends ResourceBaseFilters {
	templateType?: string[]; // 'landing-page', 'saas-ui', ...
	requiresCode?: boolean;
}

export interface ProductsFilters extends ResourceBaseFilters {
	productType?: string[]; // 'theme', 'component-library', etc.
	licenseType?: string[]; // 'full_rights', 'template_only', ...
	digitalOnly?: boolean;
}

export interface ArticlesFilters extends ResourceBaseFilters {
	readTimeMinutesMax?: number;
	publishedAfter?: string; // ISO date
	publishedBefore?: string; // ISO date
}

export interface CoursesFilters extends ResourceBaseFilters {
	level?: ('beginner' | 'intermediate' | 'advanced')[];
	minLessons?: number;
	maxLessons?: number;
}

// ---- Projects ----

export type ProjectStatus = 'draft' | 'active' | 'on_hold';

export interface ProjectsFilters extends BudgetRangeFilter, LocationFilter, LanguageFilter {
	status?: ProjectStatus[];
	stageTypes?: string[]; // filter by presence of certain stage types
}
