import { DateTime } from 'packages/types/DateTime.ts';
import {
	BudgetType,
	IPOptionMode,
	PortfolioDisplayRights,
	TimelinePreset,
} from '@enums/project.ts';
import { CurrencyDefinition } from 'packages/types/currency.ts';
import { FileWithMeta } from 'packages/types/file.ts';
import { Stage } from './Stage.ts';
import { Visibility } from '@enums/core.ts';
import { QuillDelta } from '@projective/utils';

export interface LegalAndScreening {
	ip_ownership_mode: IPOptionMode;
	nda_required: boolean;
	portfolio_display_rights: PortfolioDisplayRights;
	screening_questions: string[]; // Stored as JSONB array
	location_restriction: string[];
	language_requirement: string[];
}

export interface Project {
	// Details
	title: string;
	description: string | QuillDelta;
	industry_category_id: string; // UUID
	visibility: Visibility;
	global_attachments?: string[] | FileWithMeta[];
	currency: string | CurrencyDefinition;

	// Timeline High-level
	timeline_preset: TimelinePreset;
	target_project_start_date: string | Date | DateTime;

	// Extracted Interface
	legal_and_screening: LegalAndScreening;

	// The Stages List
	stages: Stage[];
}
