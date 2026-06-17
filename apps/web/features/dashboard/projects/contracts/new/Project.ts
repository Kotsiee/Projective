import {
	CurrencyDefinition,
	DateTime,
	FileWithMeta,
	IPOptionMode,
	PortfolioDisplayRights,
	ProjectFormat,
	TimelinePreset,
	Visibility,
} from '@projective/types';
import { QuillDelta } from '@projective/utils';
import { Stage } from './Stage.ts';

// #region 1. Sub-Interfaces
export interface LegalAndScreening {
	ip_ownership_mode: IPOptionMode;
	nda_required: boolean;
	portfolio_display_rights: PortfolioDisplayRights;
	screening_questions: string[]; // Stored as JSONB array
	location_restriction: string[];
	language_requirement: string[];
}
// #endregion

// #region 2. Main Contract
export interface Project {
	// Details
	title: string;
	description: string | QuillDelta;
	industry_category_id?: string; // UUID
	visibility: Visibility;
	global_attachments?: string[] | FileWithMeta[];
	currency: string | CurrencyDefinition;

	// Workflow Format
	format: ProjectFormat;

	// Timeline High-level
	timeline_preset?: TimelinePreset;
	target_project_start_date?: string | Date | DateTime;
	soft_deadline?: string | Date | DateTime;

	// Extracted Interface
	legal_and_screening?: LegalAndScreening;

	// The Stages List
	stages?: Stage[];
}
// #endregion
