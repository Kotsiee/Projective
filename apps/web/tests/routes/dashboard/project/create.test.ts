import { CreateProjectInput } from '@contracts/dashboard/projects/new/_validation.ts';
import { createProject } from '@server/dashboard/projects/create.ts';
import { createMockSupabase } from '../../../_helpers/mocks.ts';
import { assertEquals, assertMatch } from '../../../_helpers/asserts.ts';

// Minimal Valid Input for Testing
const validPayload: CreateProjectInput = {
	title: 'Test Project',
	description: { ops: [{ insert: 'Test' }] },
	industry_category_id: '123e4567-e89b-12d3-a456-426614174000',
	visibility: 'public',
	currency: 'USD',
	timeline_preset: 'sequential',
	target_project_start_date: new Date(),
	legal_and_screening: {
		ip_ownership_mode: 'exclusive_transfer',
		nda_required: false,
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
} as any; // Cast as any if Typescript is strict about Enums vs Strings in tests

Deno.test('createProject - Success (Draft)', async () => {
	const mockSb = createMockSupabase();

	const res = await createProject(validPayload, 'draft', {
		getClient: () => Promise.resolve(mockSb),
	});

	assertEquals(res.ok, true);
	if (res.ok) {
		assertEquals(res.data.projectId, 'test-project-id');
	}
});

Deno.test('createProject - Success (Publish/Active)', async () => {
	const mockSb = createMockSupabase();

	const res = await createProject(validPayload, 'active', {
		getClient: () => Promise.resolve(mockSb),
	});

	assertEquals(res.ok, true);
	if (res.ok) {
		assertEquals(res.data.projectId, 'test-project-id');
	}
});

Deno.test('createProject - Fail: Unauthorized', async () => {
	const mockSb = createMockSupabase({ user: null }); // No user

	const res = await createProject(validPayload, 'draft', {
		getClient: () => Promise.resolve(mockSb),
	});

	assertEquals(res.ok, false);
	if (!res.ok) {
		assertEquals(res.error.code, 'unauthorized');
		assertEquals(res.error.status, 401);
	}
});

Deno.test('createProject - Fail: RPC Error', async () => {
	const mockSb = createMockSupabase({
		rpcError: { code: 'PGRST100', message: 'DB Error', details: '', hint: '' },
	});

	const res = await createProject(validPayload, 'draft', {
		getClient: () => Promise.resolve(mockSb),
	});

	assertEquals(res.ok, false);
	if (!res.ok) {
		assertEquals(res.error.message, 'DB Error');
	}
});

Deno.test('createProject - Fail: Update Status Error (Partial Fail)', async () => {
	const mockSb = createMockSupabase({
		updateError: { code: 'PGRST100', message: 'Update Failed', details: '', hint: '' },
	});

	const res = await createProject(validPayload, 'active', {
		getClient: () => Promise.resolve(mockSb),
	});

	assertEquals(res.ok, false);
	if (!res.ok) {
		assertEquals(res.error.code, 'partial_error');
		assertMatch(res.error.message, /Project saved but failed to publish/);
	}
});
