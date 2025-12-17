import { assertEquals } from '@std/assert';
import { createMockContext, createMockSupabase } from '../../../_helpers/mocks.ts';
import { handler } from '../../../../routes/api/v1/dashboard/projects/new/publish.ts';

Deno.test('POST /publish - Success', async () => {
	// 1. Setup Mock DB
	// We expect the RPC to return a project ID, which createMockSupabase does by default
	const mockSb = createMockSupabase({
		rpcData: 'test-project-id',
	});

	const body = {
		title: 'Ready to Publish',
		description: { ops: [{ insert: 'Content' }] },
		industry_category_id: '123e4567-e89b-12d3-a456-426614174000',
		visibility: 'public',
		currency: 'USD',
		timeline_preset: 'sequential',
		target_project_start_date: new Date().toISOString(),
		legal_and_screening: {
			ip_ownership_mode: 'exclusive_transfer',
			nda_required: true,
			portfolio_display_rights: 'allowed',
			screening_questions: ['Q1'],
			location_restriction: [],
			language_requirement: [],
		},
		stages: [
			{
				title: 'Stage 1',
				description: 'Desc',
				stage_type: 'file_based',
				status: 'open',
				order: 0,
				start_trigger_type: 'on_project_start',
				staffing_roles: [],
				open_seats: [],
			},
		],
	};

	// 2. Inject Mock via Context State
	const ctx = createMockContext(body, { supabaseClient: mockSb });

	const res = await handler.POST(ctx);

	// 3. Assertions
	assertEquals(res.status, 200);

	const json = await res.json();
	assertEquals(json.ok, true);
	assertEquals(json.projectId, 'test-project-id');
	assertEquals(json.redirectTo, '/dashboard/projects/test-project-id');
});

Deno.test('POST /publish - Validation Error (Empty Stages)', async () => {
	const body = {
		title: 'No Stages Project',
		description: { ops: [] },
		industry_category_id: '123e4567-e89b-12d3-a456-426614174000',
		visibility: 'public',
		currency: 'USD',
		timeline_preset: 'sequential',
		target_project_start_date: new Date().toISOString(),
		legal_and_screening: {
			ip_ownership_mode: 'exclusive_transfer',
			nda_required: false,
			portfolio_display_rights: 'allowed',
			screening_questions: [],
			location_restriction: [],
			language_requirement: [],
		},
		stages: [], // Invalid: min(1)
	};

	const ctx = createMockContext(body);
	const res = await handler.POST(ctx);
	const json = await res.json();

	assertEquals(res.status, 400);
	assertEquals(json.error.code, 'validation_error');
});
