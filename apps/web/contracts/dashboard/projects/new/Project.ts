import { DateTime } from 'packages/types/src/core/datetime.ts';
import { CurrencyDefinition } from 'packages/types/src/finance/currency.ts';
import { FileWithMeta } from 'packages/types/src/files/model.ts';
import { Stage } from './Stage.ts';
import { QuillDelta } from '@projective/utils';
import {
	IPOptionMode,
	PortfolioDisplayRights,
	TimelinePreset,
	Visibility,
} from '@projective/types';

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
